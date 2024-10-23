namespace Core.Contracts;

using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Base.Core.Contracts;

using Core.DataTransferObjects;
using Core.Entities;

public interface IStudentBonTransaction: IGenericRepository<StudentBonTransaction>
{   
    Task<IList<StudentBonTransactionDto>> GetAllTransactionsAsync();  

    Task<StudentBonTransactionCreationDto> AddTransactionAsync(StudentBonTransactionCreationDto transactionDto);
}