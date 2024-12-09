namespace Core.DataTransferObjects;

public record StudentDto(string StudentId, string FirstName, string LastName,string StudentClass);

public record StudentBalanceDto(string StudentID, string FirstName, string LastName, string StudentClass, decimal Balance);
