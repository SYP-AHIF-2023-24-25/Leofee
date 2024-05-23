using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers;

using System.Collections;
using System.ComponentModel.DataAnnotations;
using Core.Contracts;
using Core.DataTransferObjects;
using Core.Entities;
using Microsoft.EntityFrameworkCore;
using Serilog;

[Route("api/[controller]")]
public class StudentController : Controller
{
    private readonly IUnitOfWork _uow;
    
    public StudentController(IUnitOfWork uow)
    {
        _uow = uow;
    }

    [HttpGet]
    public async Task<IList<StudentDto>> GetAllStudents()
    {
        Log.Information("GetAllStudents called");
        return await _uow.StudentRepository.GetAllAsync();
    }
    //public record CustomerBookingDto(string? FirstName, string LastName, DateTime From, DateTime? To, string RoomNumber);

    [HttpGet("student/{studentId}/bons")]
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
                b.StudentId,
                b.From,
                b.To,
                b.UsedValue,
                b.Value))
            .ToList();
        return Ok(bonDtos);
    }

    [HttpGet("student/{id}")]
    public async Task<ActionResult<StudentDto?>> GetStudentById(string studentId)
    { 
        var studentEntity = await _uow.StudentRepository.GetStudentWithIdAsync(studentId);
        if (studentEntity == null)
        {
            return NotFound();
        }
        return new StudentDto(studentEntity.StudentId,studentEntity.FirstName,studentEntity.LastName,studentEntity.StudentClass);
    }
    [HttpDelete("student/{studentId}")]
    public async Task<ActionResult<StudentDto?>> DeleteStudentById(string studentId)
    {
        var result = await _uow.StudentRepository.GetStudentWithIdAsync(studentId);
        if (result == null)
        {
            return NotFound("Es gibt keinen Student mit dieser ID");
        }
        _uow.StudentRepository.Remove(result);
        await _uow.SaveChangesAsync();
        return Ok(new StudentDto(result.StudentId,result.FirstName,result.LastName,result.StudentClass));        
    }
    [HttpGet("student/{studentId}/balance")]
    public async Task<double> GetBalanceForStudentById(string studentId)
    {
        try
        {
            var bons = await _uow.BonRepository.GetBonsForStudentAsync(studentId);
            var result = bons
            .Sum(b => b.Value);
            return result;
        } catch (Exception ex)
        {
            Log.Error(ex.Message);
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
            StudentId = student.StudentId,
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
            Log.Error(e, "Error while adding a new student");
            return BadRequest($"data base error: {e.InnerException!.Message}");
        }
        catch (DbUpdateException dbException)
        {
            Log.Error(dbException, "Error while adding a new student");
            return BadRequest($"data base error: {dbException.InnerException!.Message}");
        }
        return CreatedAtRoute(new { id = newStudent.StudentId }, newStudent);
    }
    [HttpPost("/pay")]
    public async Task<IActionResult> Pay(double amount,string studentId)
    {        
        var result = await _uow.StudentRepository.PayAsync(studentId,amount);
        await _uow.SaveChangesAsync();
        return Ok(result);      
        
    }
    [HttpGet("student/{id}/usedValue")]
    public async Task<ActionResult<StudentDto?>> GetUsedValueForStudent(string studentId)
    {
        var studentEntity = await _uow.StudentRepository.GetStudentWithIdAsync(studentId);
        if (studentEntity == null)
        {
            return NotFound();
        }
        var bonsForStudent = await _uow.BonRepository.GetBonsForStudentAsync(studentId);
        var usedValue = bonsForStudent
                            .Sum(b => b.UsedValue);
        return Ok(usedValue);
    }


}