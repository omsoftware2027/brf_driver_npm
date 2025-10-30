import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { GroupedOrdersRoutingModule } from './grouped-orders-routing.module';
import { OrdersListComponent } from './orders-list/orders-list.component';
import { GroupedOrderDetailsComponent } from './grouped-order-details/grouped-order-details.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NgSelectModule } from '@ng-select/ng-select';


@NgModule({
  declarations: [OrdersListComponent, GroupedOrderDetailsComponent],
  imports: [
    CommonModule,
    GroupedOrdersRoutingModule,
    FormsModule,

    BsDatepickerModule,
    ReactiveFormsModule,
    NgSelectModule
  ],
  
  providers: [DatePipe]
})
export class GroupedOrdersModule { }
