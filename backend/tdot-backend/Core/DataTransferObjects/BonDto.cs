using System;

namespace Core.DataTransferObjects;

public record BonDto(int Id,string StudentId, DateTime From, DateTime To, double UsedValue, double Value);