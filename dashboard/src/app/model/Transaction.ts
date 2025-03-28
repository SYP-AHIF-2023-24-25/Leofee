export interface Transaction {

    id: number,  
    transactionTime: Date,    
    amountOfBon: number,
    totalTransactionAmount: number  

}

export interface StudentBonTransaction{
    StudentId: number,
    BonId: number,
    bonValue: DoubleRange,
    transactionTime: Date,
    totalTransactionAmount: DoubleRange
}
