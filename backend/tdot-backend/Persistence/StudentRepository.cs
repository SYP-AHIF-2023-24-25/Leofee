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
        IQueryable<Student> studentQuery = _dbContext.Students!;      

        return await studentQuery
            .Select(c => new StudentDto(c.StudentId, c.FirstName, c.LastName, c.StudentClass))
            .ToListAsync();
    }

    public async Task<StudentDto?> GetStudentWithIdAsync(string studentId)
    {
        IQueryable<Student> studentQuery = _dbContext.Students!;
        var student = await studentQuery
            .Where(c => c.StudentId == studentId)
            .SingleOrDefaultAsync();

        if (student == null)
        {
            return null;
        }

        return new StudentDto(student.StudentId, student.FirstName, student.LastName, student.StudentClass);
    }
    public async Task<bool> CreateStudentAsync(StudentDto studentDto)
    {
        var student = new Student
        {
            StudentId = studentDto.StudentId,
            FirstName = studentDto.FirstName,
            LastName = studentDto.LastName,
            StudentClass = studentDto.StudentClass
        };

        _dbContext.Students!.Add(student);
        var result = await _dbContext.SaveChangesAsync();

        return result > 0;
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

            await _dbContext.SaveChangesAsync();
            await transaction.CommitAsync();

            return true;
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();
            throw;
        }

    }
    public async Task<bool> DeleteStudentAsync(string studentId)
    {        
        var student = await _dbContext.Students!.FindAsync(studentId);
        if (student == null)
        {
            return false;
        }
        var result = _dbContext.Students.Remove(student!);       
        await _dbContext.SaveChangesAsync();
        return true;
    }
}


