import { Transaction,StudentBonTransaction } from "./Transaction";
import { List } from "immutable";

export interface Bons{
    id: number,   
    startDate: Date,
    endDate: Date,
    amountPerStudent:number,   
    bonTransactions: List<Transaction>,
}


export interface Bon{
    id: number,   
    startDate: Date,
    endDate: Date,
    amountPerStudent:number,   
    transactions: List<StudentBonTransaction>,
}

export interface BonWithBalance {
    id: number,   
    startDate: Date,
    endDate: Date,
    amountPerStudent: number, 
    BonsConsumed: number,
}

export interface BonResponse {
    currentBon: BonWithBalance,
    amount: number
}