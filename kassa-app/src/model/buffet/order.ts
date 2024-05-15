import { OrderItem } from './order-items';
import { IBuffet } from "./buffet";

import { BonBooking } from './bonBooking';


export class Order {

  orderItems: OrderItem[] = [];
 
  constructor(public time: Date, public buffet: IBuffet,public bonBooking: BonBooking){

  };
}
