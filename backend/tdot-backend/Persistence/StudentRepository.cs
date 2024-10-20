namespace Persistence;

using Base.Persistence;

using Core.Contracts;
using Core.DataTransferObjects;
using Core.Entities;

using Microsoft.EntityFrameworkCore;

public class StudentRepository: GenericRepository<Student>, IStudentRepository
{
    private readonly ApplicationDbContext _dbContext;

    public StudentRepository(ApplicationDbContext dbContext) : base(dbContext)
    {
        _dbContext = dbContext;
    }    
    public async Task<IList<StudentDto>> GetAllAsync()
    {           

        return await _dbContext.Students!
            .Select(c => new StudentDto(c.StudentId, c.FirstName, c.LastName, c.StudentClass))
            .ToListAsync();
    }

    public async Task<Student?> GetStudentWithIdAsync(string studentId)
    {
        var student = await _dbContext.Students!
            .Where(c => c.StudentId == studentId)
            .SingleOrDefaultAsync();
        

        if (student == null)
        {
            return null;
        }

        return student;
    }    
    public async Task<bool> StudentExistsAsync(string studentId)
    {
        return await _dbContext.Students!
            .AnyAsync(s => s.StudentId == studentId);
    }
    public async Task<bool> PayAsync(string studentId, double amountToDeduct)
    {
        using var transaction = await _dbContext.Database.BeginTransactionAsync();

        try
        {
            var validBons = await _dbContext.Bons!
                .Where(bon => bon.StudentId == studentId)
                .OrderBy(bon => bon.EndDate)
                .ToListAsync();

            var fullValue = validBons.Sum(bon => bon.Value - bon.UsedValue);
            if (amountToDeduct > fullValue)
            {
                return false;
            }

            foreach (var bon in validBons)
            {
                if (amountToDeduct <= 0)
                {
                    break;
                }

                double deductionAmount = Math.Min(amountToDeduct, bon.Value - bon.UsedValue);

                bon.UsedValue += deductionAmount;
                bon.Value -= deductionAmount; // Value wird reduziert
                amountToDeduct -= deductionAmount;

                // Bon aktualisieren
                _dbContext.Bons!.Update(bon);
            }
            
            await transaction.CommitAsync();

            return true;
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();
            throw;
        }

    }
    

}


