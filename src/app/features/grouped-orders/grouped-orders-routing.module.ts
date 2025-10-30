import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrdersListComponent } from './orders-list/orders-list.component';
import { GroupedOrderDetailsComponent } from './grouped-order-details/grouped-order-details.component';

const routes: Routes = [
  {
    path: '',
    component: OrdersListComponent,
    data: { title: 'Grouped Orders' }
  },
  {
    path: 'grouped-order-detail/:id',
    component: GroupedOrderDetailsComponent,
    data: { title: 'Grouped Order Details', showBack: true }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GroupedOrdersRoutingModule { }
