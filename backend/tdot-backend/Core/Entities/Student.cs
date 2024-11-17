

using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities;

using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Base.Core.Entities;
using Core.Entities;

public class Student : EntityObject
{

    public required string EdufsUsername { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string StudentClass { get; set; } = string.Empty;

    public string Department { get; set; } = string.Empty;

    public List<StudentBonTransaction> StudentTransactions { get; set; } = [];    
}