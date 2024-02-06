export class Product {

  amount = 0;
  rank = 0;

  constructor(
    public id: number,
    public name: string,
    public price: number,
    public measure: string){
  }

}
