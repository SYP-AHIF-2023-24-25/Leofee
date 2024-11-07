using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities;

using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Base.Core.Entities;

public class Bon : EntityObject
{
    public decimal AmountPerStudent { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }

    public List<StudentBonTransaction> BonTransactions { get; set; } = [];

}