import { OrderItem } from './order-items';
import { IBuffet } from "./buffet";

export class Order {

  orderItems: OrderItem[] = [];
  constructor(public time: Date, public buffet: IBuffet){

  };
}
