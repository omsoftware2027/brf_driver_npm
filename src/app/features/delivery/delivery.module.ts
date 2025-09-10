import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DeliveryRoutingModule } from './delivery-routing.module';
import { GoogleMapsModule } from '@angular/google-maps';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    DeliveryRoutingModule,
    GoogleMapsModule
  ]
})
export class DeliveryModule { }
