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
        IQueryable<Bon> bonQuery = _dbContext.Bons!;  

        return await bonQuery
            .Select(c => new BonDto(c.Id,c.StudentId,c.StartDate,c.EndDate,c.UsedValue,c.Value))
            .ToListAsync();
    }

    public async Task<BonDto?> GetBonWithIdAsync(int Id)
    {
        IQueryable<Bon> bonQuery = _dbContext.Bons!;
        var bon = await bonQuery
            .Where(c => c.Id == Id)
            .SingleOrDefaultAsync();

        if (bon == null)
        {
            return null;
        }

        return new BonDto(bon.Id,bon.StudentId,bon.StartDate,bon.EndDate,bon.UsedValue,bon.Value);
    }
    public async Task<bool> CreateBonAsync(BonDto bonDto)
    {
        var bon = new Bon
        {
            Id = bonDto.Id,
            StudentId = bonDto.StudentId,
            StartDate = bonDto.From,
            EndDate = bonDto.To,
            UsedValue = bonDto.UsedValue,
            Value = bonDto.Value
        };

        _dbContext.Bons!.Add(bon);
        var result = await _dbContext.SaveChangesAsync();
        return result > 0;
    }
    public async Task<IList<BonDto>> GetBonsForStudentAsync(string studentId)
    {
        IQueryable<Bon> bonQuery = _dbContext.Bons!;

        var bons = await bonQuery
            .Where(c => c.StudentId == studentId)
            .ToListAsync();

        return bons
            .Select(b => new BonDto(b.Id, b.StudentId, b.StartDate, b.EndDate, b.UsedValue, b.Value))
            .OrderBy(b => b.From)
            .ToList();
    }
}
