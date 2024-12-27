using System;
using System.Collections.Generic;
using Core.Entities;


namespace Core.DataTransferObjects;

public record BonDto(int Id, DateTime StartDate, DateTime EndDate, List<StudentBonTransaction> Transactions , decimal AmountPerStudent);
public class BonCreateDto
{
    public decimal AmountPerStudent { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
}

public class BonUpdateDto : BonCreateDto
{    
    public int Id { get; set; }
}



public record CurrentBonDto(int Id, DateTime StartDate, DateTime EndDate, decimal AmountPerStudent);

public record CurrentBonWithAmountDto(CurrentBonDto CurrentBon, decimal Amount);