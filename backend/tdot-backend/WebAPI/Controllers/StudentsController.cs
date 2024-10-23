using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers;

using System.Collections;
using System.ComponentModel.DataAnnotations;
using Core.Contracts;
using Core.DataTransferObjects;
using Core.Entities;
using Microsoft.EntityFrameworkCore;

[Route("api/[controller]")]
public class StudentsController : Controller
{
    private readonly IUnitOfWork _uow;
    
    public StudentsController(IUnitOfWork uow)
    {
        _uow = uow;
    }

    [HttpGet]
    public async Task<IList<StudentDto>> GetAllStudents()
    {
        return await _uow.StudentRepository.GetAllAsync();
    }

    [HttpGet("{studentId}/bons")]
    public async Task<ActionResult<IList<BonDto>>> GetBonsForStudent(string studentId)
    {        
        var studentExists = await _uow.StudentRepository.StudentExistsAsync(studentId);
        if (!studentExists)
        {
            return NotFound($"There exists no student with id {studentId}!");
        }
        var bonEntities = await _uow.BonRepository.GetBonsForStudentAsync(studentId);

        var bonDtos = bonEntities
            .Select(b => new BonDto(
                b.Id,
                studentId,
                b.StartDate,
                b.EndDate,
                b.TotalBonValue,
                b.AmountPerStudent))
            .ToList();
        return Ok(bonDtos);
    }

    [HttpGet("id/{studentId}")]
    public async Task<ActionResult<StudentDto?>> GetStudentByEdufsUserId(string studentId)
    { 
        var studentEntity = await _uow.StudentRepository.GetStudentWithEdufsUserAsync(studentId);
        if (studentEntity == null)
        {
            return NotFound();
        }
        return new StudentDto(studentEntity.EdufsUsername, studentEntity.FirstName, studentEntity.LastName, studentEntity.StudentClass);
    }

    [HttpGet("{Id}")]
    public async Task<ActionResult<StudentDto?>> GetStudentById(int id)
    { 
        var studentEntity = await _uow.StudentRepository.GetStudentWithIdAsync(id);
        if (studentEntity == null)
        {
            return NotFound();
        }
        return new StudentDto(studentEntity.EdufsUsername, studentEntity.FirstName, studentEntity.LastName, studentEntity.StudentClass);
    }

    [HttpDelete("{studentId}")]
    public async Task<ActionResult<StudentDto?>> DeleteStudentById(string studentId)
    {
        var result = await _uow.StudentRepository.GetStudentWithEdufsUserAsync(studentId);
        if (result == null)
        {
            return NotFound("Es gibt keinen Student mit dieser ID");
        }
        _uow.StudentRepository.Remove(result);
        await _uow.SaveChangesAsync();
        return Ok(new StudentDto(result.EdufsUsername, result.FirstName, result.LastName, result.StudentClass));        
    }

    [HttpGet("{studentId}/balance")]
    public async Task<double> GetBalanceForStudentById(string studentId)
    {
        try
        {
            var bons = await _uow.BonRepository.GetBonsForStudentAsync(studentId);
            var result = bons.Sum(b => b.AmountPerStudent);
            return (double)result;
        } 
        catch (Exception)
        {
            return -1;
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreateStudent([FromBody] StudentDto student)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }
        var newStudent = new Student
        {
            EdufsUsername = student.StudentId,
            FirstName = student.FirstName,
            LastName = student.LastName,
            StudentClass = student.StudentClass
        };
        try
        {
            await _uow.StudentRepository.AddAsync(newStudent);
            await _uow.SaveChangesAsync();
        }
        catch (ValidationException e)
        {            
            return BadRequest($"data base error: {e.InnerException!.Message}");
        }
        catch (DbUpdateException dbException)
        {
            return BadRequest($"data base error: {dbException.InnerException!.Message}");
        }
        return CreatedAtRoute(new { id = newStudent.EdufsUsername }, newStudent);
    }

    [HttpPost("/student/pay")]
    
    public async Task<IActionResult> Pay(double amount, string studentId)
    {        
        var result = await _uow.StudentRepository.PayAsync(studentId, amount);
        await _uow.SaveChangesAsync();
        return Ok(result);      
    }

    [HttpGet("{studentId}/usedValue")]
    public async Task<ActionResult<decimal>> GetUsedValueForStudent(string studentId)
    {
        var studentEntity = await _uow.StudentRepository.GetStudentWithEdufsUserAsync(studentId);
        if (studentEntity == null)
        {
            return NotFound();
        }
        var bonsForStudent = await _uow.BonRepository.GetBonsForStudentAsync(studentId);
        var usedValue = bonsForStudent.Sum(b => b.TotalBonValue);
        return Ok(usedValue);
    }
}