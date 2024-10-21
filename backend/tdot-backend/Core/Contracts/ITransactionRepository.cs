namespace Core.Contracts;

using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Base.Core.Contracts;

using Core.DataTransferObjects;
using Core.Entities;

public interface ITransactionRepository: IGenericRepository<StudentBonTransaction>
{   
    Task<IList<TransactionDto>> GetAllTransactionsAsync();  

    Task<TransactionCreationDto> AddTransactionAsync(TransactionCreationDto transactionDto);
}