

using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities;

using System;
using System.ComponentModel.DataAnnotations;
using Base.Core.Entities;

public class Transaction : EntityObject
{

    [Key]
    public int Id { get; set; } 

    public DateTime TransactionTime { get; set; } 
    public double Value { get; set; } = 0;
    public double AmountOfBon { get; set; } =0;
    
    
}