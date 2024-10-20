namespace Persistence;

using Base.Persistence;

using Core.Contracts;
using Core.DataTransferObjects;
using Core.Entities;

using Microsoft.EntityFrameworkCore;

public class TransactionRepository: GenericRepository<Transaction>, ITransactionRepository
{
    private readonly ApplicationDbContext _dbContext;

      public TransactionRepository(ApplicationDbContext dbContext) : base(dbContext)
    {
        _dbContext = dbContext;
    }   

    public async Task<IList<TransactionDto>> GetAllTransactionsAsync()
    {           

        return await _dbContext.Transactions!
            .Select(c => new TransactionDto(c.Id, c.TransactionTime, c.Value, c.AmountOfBon))
            .ToListAsync();
    }

     public async Task<TransactionCreationDto> AddTransactionAsync(TransactionCreationDto transactionDto)
    {
        var transaction = new Transaction
        {
            TransactionTime = transactionDto.TransactionTime,
            Value = transactionDto.Value,
            AmountOfBon = transactionDto.AmountOfBon
        };

        _dbContext.Transactions!.Add(transaction);
        await _dbContext.SaveChangesAsync();

       
        return transactionDto;
    }

   
    


}