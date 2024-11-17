

using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities;

using System;
using System.ComponentModel.DataAnnotations;
using Base.Core.Entities;

public class StudentBonTransaction : EntityObject
{
    
    public int StudentId { get; set; }
    [ForeignKey(nameof(StudentId))]
    public Student Student { get; set; } = null!;


    public int BonId { get; set; }
    [ForeignKey(nameof(BonId))]
    public Bon Bon { get; set; } = null!;

    public DateTime TransactionTime { get; set; } 

    public decimal BonValue { get; set; }
    public decimal TotalTransactionAmount { get; set; }
    

    
}