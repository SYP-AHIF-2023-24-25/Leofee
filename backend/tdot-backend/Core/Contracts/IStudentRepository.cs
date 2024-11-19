namespace Core.Contracts;

using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Base.Core.Contracts;

using Core.DataTransferObjects;
using Core.Entities;

public interface IStudentRepository: IGenericRepository<Student>
{
    Task<IList<StudentDto>> GetAllAsync();
    Task<Student?> GetStudentWithEdufsUserAsync(string studentId);
    Task<Student?> GetStudentWithIdAsync(int studentId);
    Task<bool> StudentExistsAsync(string studentId);
    Task<bool> PayAsync(string studentId, double amountToDeduct);
    Task DeleteAllAsync();
}