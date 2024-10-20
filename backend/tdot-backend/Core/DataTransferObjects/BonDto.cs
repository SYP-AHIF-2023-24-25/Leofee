using System;

namespace Core.DataTransferObjects;

public record BonDto(int Id,string StudentId, DateTime From, DateTime To, double UsedValue, double Value);

public class BonCreateDto
{
    public required string StudentId { get; set; }
    public required DateTime From { get; set; }
    public required DateTime To { get; set; }
    public required double Value { get; set; }
    public required double UsedValue { get; set; }
}
public class BonUpdateDto : BonCreateDto
{    public int Id { get; set; }
}