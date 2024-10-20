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
            .Select(c => new BonDto(c.Id, c.StudentId, c.StartDate, c.EndDate, c.UsedValue, c.Value))
            .ToListAsync();
        return bonDtos;
       
    }

    public async Task<BonDto?> GetBonWithIdAsync(int Id)
    {         
        var bon = await _dbContext.Bons!
            .Where(c => c.Id == Id)
            .SingleOrDefaultAsync();
        if (bon == null)
        {
            return null;
        }
        return new BonDto(bon.Id,bon.StudentId,bon.StartDate,bon.EndDate,bon.UsedValue,bon.Value);
    }    
    public async Task<IList<BonDto>> GetBonsForStudentAsync(string studentId)
    {       

        var bons = await _dbContext.Bons!
            .Where(c => c.StudentId == studentId)
            .ToListAsync();

        return bons
            .Select(b => new BonDto(b.Id, b.StudentId, b.StartDate, b.EndDate, b.UsedValue, b.Value))
            .OrderBy(b => b.From)
            .ToList();
    }

    public async Task<BonUpdateDto> UpdateBonsWithIdAsync(int bonId, BonUpdateDto updateBonDto)
    {

        var bon = await _dbContext.Bons!
            .SingleOrDefaultAsync(c => c.Id == bonId);
        if(bon is not null)
        {
            bon.StartDate = updateBonDto.From;
            bon.EndDate = updateBonDto.To;
            bon.UsedValue = updateBonDto.UsedValue;
            bon.Value = updateBonDto.Value;
            await _dbContext.SaveChangesAsync();            
        }
        return updateBonDto;
    }
}
