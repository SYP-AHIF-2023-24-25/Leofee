

using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities;

using System;
using System.ComponentModel.DataAnnotations;
using Base.Core.Entities;

public class StudentBonTransaction : EntityObject
{

    public int StudentId { get; set; }
    public Student? Student { get; set; }

    public int BonId { get; set; }
    public Bon? Bon { get; set; }

    public DateTime TransactionTime { get; set; } 

    public decimal BonValue { get; set; }
    public decimal TotalTransactionAmount { get; set; }
    

    
}