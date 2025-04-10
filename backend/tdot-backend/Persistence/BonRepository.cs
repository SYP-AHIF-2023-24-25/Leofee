namespace Persistence;

using Base.Persistence;

using Core.Contracts;
using Core.DataTransferObjects;
using Core.Entities;

using Microsoft.EntityFrameworkCore;

public class BonRepository: GenericRepository<Bon>, IBonRepository
{
    private readonly ApplicationDbContext _dbContext;

    public BonRepository(ApplicationDbContext dbContext) : base(dbContext)
    {
        _dbContext = dbContext;
    }    
    public async Task<IList<BonDto>> GetAllAsync()
    {
        var bonDtos = await _dbContext.Bons!
            .Include(b => b.BonTransactions)
            .Select(c => new BonDto(
                c.Id,            
                c.StartDate, 
                c.EndDate, 
                c.BonTransactions,
                c.AmountPerStudent
                ))
            .ToListAsync();
        return bonDtos;
    }

    public async Task<BonDto?> GetBonWithIdAsync(int Id)
    {
        var bon = await _dbContext.Bons!
            .Include(b => b.BonTransactions)
            .Where(c => c.Id == Id)
            .SingleOrDefaultAsync();
        if (bon == null)
        {
            return null;
        }
        return new BonDto(
            bon.Id,            
            bon.StartDate,
            bon.EndDate,
            bon.BonTransactions,
            bon.AmountPerStudent
            );
    }  

    public async Task<BonDto> DeleteBonWithIdAsync(int Id){
        var bon = await _dbContext.Bons!
            .Include(b => b.BonTransactions)
            .SingleOrDefaultAsync(c => c.Id == Id);
        if (bon is not null)
        {
            _dbContext.Bons!.Remove(bon);
            await _dbContext.SaveChangesAsync();
        }
        return new BonDto(
            bon!.Id,            
            bon.StartDate,
            bon.EndDate,
            bon.BonTransactions,
            bon.AmountPerStudent
            );
    }

    public async Task<BonUpdateDto> UpdateBonsWithIdAsync(int bonId, BonUpdateDto updateBonDto)
    {
        var bon = await _dbContext.Bons!
            .Include(b => b.BonTransactions)
            .SingleOrDefaultAsync(c => c.Id == bonId);
        if (bon is not null)
        {
            bon.StartDate = updateBonDto.StartDate;
            bon.EndDate = updateBonDto.EndDate;
            bon.AmountPerStudent = (decimal)updateBonDto.AmountPerStudent;
            await _dbContext.SaveChangesAsync();
        }
        return updateBonDto;
    }

    public async Task<Bon?> GetCurrentBon()
    {
        var currentBon = await _dbContext.Bons!.Include(b => b.BonTransactions).FirstOrDefaultAsync(bon => bon.EndDate >= DateTime.Now );

        return currentBon;
    }

    public async Task<Bon?> GetCurrentBonWithoutTransactions()
    {
        var currentBon = await _dbContext.Bons!.FirstOrDefaultAsync(bon => bon.EndDate >= DateTime.Now );

        return currentBon;

    }
}
