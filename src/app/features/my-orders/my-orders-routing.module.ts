import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MyOrdersComponent } from './my-orders.component';
import { OrderDetailComponent } from './order-detail/order-detail.component';

const routes: Routes = [
  {
    path: '',
    component: MyOrdersComponent,
     data: { title: 'All Orders' }
  },
  {
    path: 'order-detail/:id',
    component: OrderDetailComponent,
    data: { title: 'Order Details', showBack: true }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MyOrdersRoutingModule { }
