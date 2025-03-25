namespace Core.Contracts;

using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Base.Core.Contracts;

using Core.DataTransferObjects;
using Core.Entities;

public interface IBonRepository: IGenericRepository<Bon>
{
    Task<IList<BonDto>> GetAllAsync();
   // Task<IList<BonDto>> GetBonsForStudentAsync(string studentId);
    Task<BonDto?> GetBonWithIdAsync(int Id);
    Task<BonUpdateDto> UpdateBonsWithIdAsync(int bonId, BonUpdateDto updateBonDto);

    Task<Bon?> GetCurrentBon();

    Task<Bon?> GetCurrentBonWithoutTransactions();
    Task<BonDto> DeleteBonWithIdAsync(int Id);
}