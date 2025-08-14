import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-my-orders',
  imports: [CommonModule],
  templateUrl: './my-orders.component.html',
  styleUrl: './my-orders.component.scss'
})
export class MyOrdersComponent {

  orders = [
    {
      customerName: 'Sarah Johnson',
      deliveryTime: '03:00 PM - 03:30 PM',
      orderId: '#RTX9M2GHF8DFH',
      items: 1,
      totalItems: 7,
      address: '123 Main st, New York, NY 10001'
    },
    {
      customerName: 'Sarah Johnson',
      deliveryTime: '03:00 PM - 03:30 PM',
      orderId: '#RTX9M2GHF8DFH',
      items: 1,
      totalItems: 7,
      address: '123 Main st, New York, NY 10001'
    },
    {
      customerName: 'Sarah Johnson',
      deliveryTime: '03:00 PM - 03:30 PM',
      orderId: '#RTX9M2GHF8DFH',
      items: 1,
      totalItems: 7,
      address: '123 Main st, New York, NY 10001'
    },
    {
      customerName: 'Sarah Johnson',
      deliveryTime: '03:00 PM - 03:30 PM',
      orderId: '#RTX9M2GHF8DFH',
      items: 1,
      totalItems: 7,
      address: '123 Main st, New York, NY 10001'
    },
    {
      customerName: 'Sarah Johnson',
      deliveryTime: '03:00 PM - 03:30 PM',
      orderId: '#RTX9M2GHF8DFH',
      items: 1,
      totalItems: 7,
      address: '123 Main st, New York, NY 10001'
    },
  ];

}
