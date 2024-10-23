namespace Persistence;

using Base.Persistence;
using Core.Contracts;
using Core.DataTransferObjects;
using Core.Entities;
using Microsoft.EntityFrameworkCore;

public class StudentRepository : GenericRepository<Student>, IStudentRepository
{
    private readonly ApplicationDbContext _dbContext;

    public StudentRepository(ApplicationDbContext dbContext) : base(dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IList<StudentDto>> GetAllAsync()
    {
        return await _dbContext.Students!
            .Select(c => new StudentDto(c.EdufsUsername, c.FirstName, c.LastName, c.StudentClass))
            .ToListAsync();
    }

    public async Task<Student?> GetStudentWithIdAsync(string studentId)
    {
        var student = await _dbContext.Students!
            .Where(c => c.EdufsUsername == studentId)
            .Include(s => s.StudentTransactions)
            .ThenInclude(t => t.Bon)
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
            .AnyAsync(s => s.EdufsUsername == studentId);
    }

    public async Task<bool> PayAsync(string studentId, double amountToDeduct)
    {
        using var transactions = await _dbContext.Database.BeginTransactionAsync();

        try
        {
            var student = await _dbContext.Students!
                .Where(s => s.EdufsUsername == studentId)
                .Include(s => s.StudentTransactions)
                .ThenInclude(t => t.Bon)
                .SingleOrDefaultAsync();

            if (student == null)
            {
                return false;
            }

            var validBons = student.StudentTransactions
                .Where(t => t.Bon != null && t.Bon.EndDate >= DateTime.Now)
                .OrderBy(t => t.Bon!.EndDate)
                .ToList();

            var fullValue = validBons.Sum(t => t.Bon!.AmountPerStudent - t.BonValue);
            if ((decimal)amountToDeduct > fullValue)
            {
                return false;
            }

            foreach (var transaction in validBons)
            {
                if (amountToDeduct <= 0)
                {
                    break;
                }

                decimal deductionAmount = Math.Min((decimal)amountToDeduct, transaction.Bon!.AmountPerStudent - transaction.BonValue);

                transaction.BonValue += deductionAmount;
                amountToDeduct -= (double)deductionAmount;

                // Transaction aktualisieren
                _dbContext.StudentBonTransactions!.Update(transaction);
            }

            await _dbContext.SaveChangesAsync();
            await transactions.CommitAsync();

            return true;
        }
        catch (Exception)
        {
            await transactions.RollbackAsync();
            throw;
        }
    }
}