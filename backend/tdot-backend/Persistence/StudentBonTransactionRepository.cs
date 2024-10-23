using Base.Persistence;
using Core.Contracts;
using Core.DataTransferObjects;
using Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace Persistence;

public class StudentBonTransactionRepository : GenericRepository<StudentBonTransaction>, IStudentBonTransaction
{
    private readonly ApplicationDbContext _dbContext;

    public StudentBonTransactionRepository(ApplicationDbContext dbContext) : base(dbContext)
    {
        _dbContext = dbContext;
    }

    // Get all transactions
    public async Task<IList<StudentBonTransactionDto>> GetAllTransactionsAsync()
    {           
        return await _dbContext.StudentBonTransactions!
            .Select(c => new StudentBonTransactionDto(
                c.Id,
                c.TransactionTime,
                c.BonValue,
                c.TotalTransactionAmount))
            .ToListAsync();
    }

    // Add a new transaction
    public async Task<StudentBonTransactionCreationDto> AddTransactionAsync(StudentBonTransactionCreationDto transactionDto)
    {
        // Create a new transaction entity based on the DTO
        var transaction = new StudentBonTransaction
        {
            StudentId = transactionDto.StudentId,   // Include StudentId
            BonId = transactionDto.BonId,           // Include BonId
            TransactionTime = transactionDto.TransactionTime,
            BonValue = transactionDto.BonValue,     // Use decimal
            TotalTransactionAmount = transactionDto.TotalTransactionAmount // Use decimal
        };

        // Add and save the new transaction
        _dbContext.StudentBonTransactions!.Add(transaction);
        await _dbContext.SaveChangesAsync();

        return transactionDto;
    }
}
