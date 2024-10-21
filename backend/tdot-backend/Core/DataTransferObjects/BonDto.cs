using System;

namespace Core.DataTransferObjects;

public record BonDto(int Id,string StudentId, DateTime StartDate, DateTime EndDate, decimal UsedValue, decimal Value);
public class BonCreateDto
{
    public required string StudentId { get; set; }
    public required DateTime StartDate { get; set; }
    public required DateTime EndDate { get; set; }
    public required decimal Value { get; set; }
    public required decimal UsedValue { get; set; }
}
public class BonUpdateDto : BonCreateDto
{    
    public int Id { get; set; }
}