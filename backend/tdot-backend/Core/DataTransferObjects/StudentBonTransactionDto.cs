using System;

namespace Core.DataTransferObjects;

public record StudentBonTransactionDto(int Id, DateTime TransactionTime, decimal BonValue, decimal TotalTransactionAmount);

public record StudentBonTransactionCreationDto(int StudentId, int BonId, DateTime TransactionTime, decimal BonValue, decimal TotalTransactionAmount);