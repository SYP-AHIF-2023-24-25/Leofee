import { Transaction } from "./Transaction";
import { List } from "immutable";

export interface Bons{
    id: number,   
    startDate: Date,
    endDate: Date,
    amountPerStudent:number,
    value: number,
    bonTransactions: List<Transaction>,
}
