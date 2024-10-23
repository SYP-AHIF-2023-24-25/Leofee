namespace Persistence;

using Base.Persistence;

using Core.Contracts;
using Core.DataTransferObjects;
using Core.Entities;

using Microsoft.EntityFrameworkCore;

public class StudentBonTransactionRepository: GenericRepository<StudentBonTransaction>, IStudentBonTransaction
{
    private readonly ApplicationDbContext _dbContext;

      public StudentBonTransactionRepository(ApplicationDbContext dbContext) : base(dbContext)
    {
        _dbContext = dbContext;
    }   

    public async Task<IList<StudentBonTransactionDto>> GetAllTransactionsAsync()
    {           
        return await _dbContext.StudentBonTransactions!
            .Select(c => new StudentBonTransactionDto(c.Id, c.TransactionTime, (double)c.BonValue, (double)c.TotalTransactionAmount))
            .ToListAsync();
    }

      public async Task<StudentBonTransactionCreationDto> AddTransactionAsync(StudentBonTransactionCreationDto transactionDto)
        {
            var transaction = new StudentBonTransaction
            {
                TransactionTime = transactionDto.TransactionTime,
                BonValue = (decimal)transactionDto.Value,
                TotalTransactionAmount = (decimal)transactionDto.AmountOfBon
            };

            _dbContext.StudentBonTransactions!.Add(transaction);
            await _dbContext.SaveChangesAsync();

            return transactionDto;
        }



}