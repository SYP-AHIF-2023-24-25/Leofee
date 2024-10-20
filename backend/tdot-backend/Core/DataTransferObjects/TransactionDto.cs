using System;
using System.Globalization;

namespace Core.DataTransferObjects;

public record TransactionDto(int Id, DateTime TransactionTime, double Value, double AmountOfBon );

public record TransactionCreationDto(DateTime TransactionTime, double Value, double AmountOfBon );