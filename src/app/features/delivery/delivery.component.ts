import { Component, ElementRef, ViewChild } from '@angular/core';
import { GoogleMapsModule } from '@angular/google-maps';
import { AuthService } from '../../core/services/auth.service';
import { OrderService } from '../../core/services/order.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-delivery',
  imports: [GoogleMapsModule, CommonModule],
  templateUrl: './delivery.component.html',
  styleUrl: './delivery.component.scss'
})
export class DeliveryComponent {
  google: any;
  user: any;
  orders: any[] = [];
  lastSevenDayDate: string = '';
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;

  map!: google.maps.Map;

  center: google.maps.LatLngLiteral = {
    lat: 34.01629713107095,
    lng: -118.21773892171963
  };
  userLocation!: google.maps.LatLngLiteral;
  deliveryLocation: google.maps.LatLngLiteral = { lat: 34.01629713107095, lng: -118.21773892171963 };
  totalDistance: string = '';
  totalDuration: string = '';


  constructor(
    public authService: AuthService,
    public orderService: OrderService,
    private toastr: ToastrService
  ) {
    const today = new Date();
    today.setDate(today.getDate() - 6);
    this.lastSevenDayDate = today.toISOString().split('T')[0];
  }

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      this.user = user;
      if (this.user && this.user.id) {
        this.orderService.getAllOrders(this.user?.id, this.lastSevenDayDate).subscribe({
          next: (res) => {
            this.orders = res?.response?.dataSet || [];
            this.orders.sort((a, b) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime());
            if (this.orders.length > 0) {
              const deliveryStops: google.maps.LatLngLiteral[] = [];
              this.orders.forEach(order => {
                if (order?.address) {
                  this.geocodeAddress(order?.address).then(coords => {
                    if (coords) deliveryStops.push(coords);
                    if (deliveryStops.length === this.orders.length) {
                      this.getUserLocationAndLoadMap(deliveryStops);
                    }
                  });
                }
              });
              if (deliveryStops.length > 0 && deliveryStops.length === this.orders.length) {
                this.getUserLocationAndLoadMap(deliveryStops);
              }
            } else {
                this.getUserLocationAndLoadMap([]);
            }
          },
          error: () => {
            this.toastr.error('Failed to fetch orders. Please try again later.', 'Error');
          }
        });
      }
    });
  }

  loadFallbackMap() {
    this.map = new google.maps.Map(this.mapContainer.nativeElement, {
      center: this.center,
      zoom: 14,
      mapId: 'ea16df23bdf1068b82987400',
      gestureHandling: 'cooperative',
      zoomControl: true,
      fullscreenControl: false,
      streetViewControl: false
    });
  }

  // get user location first, then draw map
  getUserLocationAndLoadMap(deliveryStops: google.maps.LatLngLiteral[]) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        this.userLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        this.loadMapAndRoute(this.userLocation, deliveryStops);
      }, () => {
        this.userLocation = { lat: 34.01629713107095, lng: -118.21773892171963 };
        this.loadMapAndRoute(this.userLocation, deliveryStops);
      });
    } else {
      console.error('Geolocation not supported by this browser.');
      this.userLocation = { lat: 34.01629713107095, lng: -118.21773892171963 };
      this.center = this.userLocation;
      this.loadFallbackMap();
    }
  }

  // Convert address → lat/lng using Google Geocoding API
  geocodeAddress(address: string): Promise<google.maps.LatLngLiteral | null> {
    return new Promise((resolve) => {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address }, (results: any, status: any) => {
        if (status === 'OK' && results[0]) {
          const loc = results[0].geometry.location;
          resolve({ lat: loc.lat(), lng: loc.lng() });
        } else {
          console.error('Geocoding failed: ', status);
          resolve(null);
        }
      });
    });
  }

  // Draw optimized map with all delivery stops
  loadMapAndRoute(userLoc: google.maps.LatLngLiteral, deliveryStops: google.maps.LatLngLiteral[]) {
    this.map = new google.maps.Map(this.mapContainer.nativeElement, {
      center: userLoc,
      zoom: 14,
      mapId: 'ea16df23bdf1068b82987400',
      gestureHandling: 'cooperative',
      zoomControl: true,
      fullscreenControl: false,
      streetViewControl: false
    });

    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({ suppressMarkers: true });
    directionsRenderer.setMap(this.map);

    const waypoints = deliveryStops.map((loc) => ({ location: loc, stopover: true }));

    directionsService.route(
      {
        origin: userLoc,
        destination: waypoints.length > 0 ? waypoints[waypoints.length - 1].location : userLoc,
        waypoints,
        optimizeWaypoints: true,
        travelMode: google.maps.TravelMode.DRIVING
      },
      (response: any, status: any) => {
        if (status === 'OK') {
          const route = response.routes[0];
          directionsRenderer.setDirections(response);

          // User marker
          new google.maps.marker.AdvancedMarkerElement({
            position: userLoc,
            map: this.map,
            content: this.createCustomMarker('#28a745')
          });

          // Numbered delivery stops
          const order = route.waypoint_order;
          order.forEach((stopIndex: number, i: number) => {
            const loc = deliveryStops[stopIndex];
            const isLast = i === order.length - 1;
            new google.maps.marker.AdvancedMarkerElement({
              position: loc,
              map: this.map,
              content: this.createNumberedMarker('#dc3545', i + 1)
            });
          });

          // Calculate total distance & duration (calculated, not per-leg text)
          let totalDistance = 0;
          let totalDuration = 0;

          route.legs.forEach((leg: any) => {
            totalDistance += leg.distance?.value || 0; // in meters
            totalDuration += leg.duration?.value || 0; // in seconds
          });

          this.totalDistance = (totalDistance / 1000).toFixed(1) + ' km';
          const totalMinutes = Math.round(totalDuration / 60);
          if (totalMinutes >= 60) {
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            this.totalDuration = minutes > 0 ? `${hours} hr ${minutes} mins` : `${hours} hr`;
          } else {
            this.totalDuration = `${totalMinutes} mins`;
          }

        } else {
          console.error('Directions request failed: ' + status);
        }
      }
    );
  }


  createCustomMarker(color: string): HTMLElement {
    const marker = document.createElement('div');
    marker.style.backgroundColor = color;
    marker.style.width = '20px';
    marker.style.height = '20px';
    marker.style.borderRadius = '50%';
    marker.style.border = '2px solid white';
    marker.style.boxShadow = '0 0 6px rgba(0,0,0,0.3)';
    return marker;
  }

  createNumberedMarker(color: string, number?: number): HTMLElement {
    const marker = document.createElement('div');
    marker.style.backgroundColor = color;
    marker.style.width = '28px';
    marker.style.height = '28px';
    marker.style.borderRadius = '50%';
    marker.style.border = '2px solid white';
    marker.style.boxShadow = '0 0 6px rgba(0,0,0,0.3)';
    marker.style.display = 'flex';
    marker.style.justifyContent = 'center';
    marker.style.alignItems = 'center';
    marker.style.fontSize = '14px';
    marker.style.fontWeight = 'bold';
    marker.style.color = 'white';
    if (number !== undefined) {
      marker.innerText = number.toString();
    }
    return marker;
  }

}
