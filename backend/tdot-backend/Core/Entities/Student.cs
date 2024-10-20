using System.ComponentModel.DataAnnotations.Schema;
namespace Core.Entities;
using System;
using System.ComponentModel.DataAnnotations;
using Base.Core.Entities;

public class Student : EntityObject
{

    [Key]
    public string StudentId { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string StudentClass { get; set; } = string.Empty;
    
    
}