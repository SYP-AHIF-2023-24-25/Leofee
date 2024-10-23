using System;

namespace Core.DataTransferObjects;

public record BonDto(int Id,string StudentId, DateTime StartDate, DateTime EndDate, decimal TotalBonValue, decimal AmountPerStudent);
public class BonCreateDto
{
    public required string StudentId { get; set; }
    public required DateTime StartDate { get; set; }
    public required DateTime EndDate { get; set; }
    public required decimal TotalBonValue { get; set; }
    public required decimal AmountPerStudent { get; set; }
}
public class BonUpdateDto : BonCreateDto
{    
    public int Id { get; set; }
}