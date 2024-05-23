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
    Task<Student?> GetStudentWithIdAsync(string studentId);
    Task<bool> StudentExistsAsync(string studentId);
    Task<bool> PayAsync(string studentId, double amountToDeduct);
}