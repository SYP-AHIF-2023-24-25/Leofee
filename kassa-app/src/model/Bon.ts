

export interface BonResponse{
   
    amount: number;
    currentBon: Bon

};

export interface Bon {
    id: string;
    startDate: Date;
    endDate: Date;
    amountPerStudent: number;
}