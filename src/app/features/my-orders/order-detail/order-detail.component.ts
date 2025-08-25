import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-order-detail',
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.scss'
})
export class OrderDetailComponent {
  orderId!: string;
  searchText: string = '';
  searchResults: any[] = [];

  tabs = [
    { key: 'all', label: 'All', count: 9 },
    { key: 'pickup', label: 'Pickup', count: 3 },
    { key: 'jetro1', label: 'Jetro One', count: 2 },
    { key: 'jetro2', label: 'Jetro Two', count: 4 }
  ];

  activeTab: string = 'all';

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.orderId = this.route.snapshot.paramMap.get('id')!;

  }

  onSearch() {
    // if (!this.user?.id || !this.searchText) {
    //   this.searchResults = [];
    //   return;
    // }

    // this.orderService.searchOrders(this.user.id, this.lastSevenDayDate, this.searchText).subscribe({
    //   next: (res) => {
    //     this.searchResults = res?.response?.dataSet || [];
    //     console.log('searched', this.searchResults)
    //   },
    //   error: (err) => {
    //     this.toastr.error('Search failed. Please try again.', 'Error');
    //     this.searchResults = [];
    //   }
    // });
  }

  setActiveTab(tabKey: string) {
    this.activeTab = tabKey;
    console.log('Active tab--->', this.activeTab)
  }
}
