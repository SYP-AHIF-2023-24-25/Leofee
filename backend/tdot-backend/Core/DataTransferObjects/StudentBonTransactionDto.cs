using System;
using System.Globalization;

namespace Core.DataTransferObjects;

public record StudentBonTransactionDto(int Id, DateTime TransactionTime, double Value, double AmountOfBon );

public record StudentBonTransactionCreationDto(DateTime TransactionTime, double Value, double AmountOfBon );