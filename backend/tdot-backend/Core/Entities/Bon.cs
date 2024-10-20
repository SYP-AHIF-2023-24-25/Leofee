

using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities;

using System;
using System.ComponentModel.DataAnnotations;
using Base.Core.Entities;

public class Bon : EntityObject
{
    [Key]
    public int Id { get; set; } 

    [ForeignKey(nameof(Student))]
    public string StudentId { get; set; } = string.Empty;
    public double Value { get; set; }
    public double UsedValue { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
}