using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers;

using System.Collections;
using System.ComponentModel.DataAnnotations;
using Core.Contracts;
using Core.DataTransferObjects;
using Core.Entities;
using Humanizer;
using Microsoft.EntityFrameworkCore;


[Route("api/[controller]")]
public class StudentsController : Controller
{
    private readonly IUnitOfWork _uow;

    public StudentsController(IUnitOfWork uow)
    {
        _uow = uow;
    }

    #region GetAllStudents, ById, ByEDUFSNummer
    [HttpGet]
    public async Task<IList<StudentDto>> GetAllStudents()
    {
        return await _uow.StudentRepository.GetAllAsync();
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

    #endregion



    [HttpGet("{studentId}/bons")]
    public async Task<ActionResult<BonDto>> GetBonsForStudent(string studentId)
    {
        var currentBon = await  _uow.BonRepository.GetCurrentBonWithoutTransactions();
       
        if(currentBon is not null)
        {
            

            return Ok(new BonDto(
            currentBon.Id,
            currentBon.StartDate,
            currentBon.EndDate,
            currentBon.BonTransactions,
            currentBon.AmountPerStudent));

        }
        return NotFound();

    }

    #region Delete Student, Delete AllStudents

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

    [HttpDelete("DeleteAll")]
    public async Task<ActionResult<bool>> DeleteAllStudents()
    {
        try
        {
            // Alle Studenten l�schen
            await _uow.StudentRepository.DeleteAllAsync();          

            return Ok(true); // Erfolgreiche L�schung
        }
        catch (Exception ex)
        {           
            return StatusCode(500, $"Interner Fehler: {ex.Message}");
        }
    }

    #endregion


    #region GetBalance, UsedValue, Pay

    [HttpGet("{studentId}/balance")]
    public async Task<ActionResult<decimal>> GetBalanceForStudentById(string studentId)
    {
        var currentBon = await _uow.BonRepository.GetCurrentBon();

        //aktuellen Bon holen 
        if (currentBon is not null)
        {
            var currentStudent = await _uow.StudentRepository.GetStudentWithEdufsUserAsync(studentId);
            if (currentStudent is not null)
            {
                var allTransactionsAmountForBonForStudent = currentStudent.StudentTransactions.Where(transaction => transaction.BonId == currentBon.Id)
                                                                                    .Sum(transaction => transaction.TotalTransactionAmount);
                
                var balance =  currentBon.AmountPerStudent - allTransactionsAmountForBonForStudent ;  
                if(balance < 0)
                {
                    balance = 0; 
                }

                return Ok(balance);

            }
        }
        return NotFound();
    }

    [HttpPost("/student/pay")]

    public async Task<IActionResult> Pay(double amount, string studentId)
    {
        var currentBon = await _uow.BonRepository.GetCurrentBon();
        var result = false;
        //aktuellen Bon holen 
        if (currentBon is not null)
        {
            var currentStudent = await _uow.StudentRepository.GetStudentWithEdufsUserAsync(studentId);
            if (currentStudent is not null)
            {
                var allTransactionsAmountForBonForStudent = currentStudent.StudentTransactions.Where(transaction => transaction.BonId == currentBon.Id)
                                                                                    .Sum(transaction => transaction.TotalTransactionAmount);

                if ((allTransactionsAmountForBonForStudent + (decimal)amount) <= currentBon.AmountPerStudent)
                {
                    StudentBonTransaction transaction = new StudentBonTransaction();
                    transaction.BonId = currentBon.Id;
                    transaction.StudentId = currentStudent.Id;
                    transaction.TotalTransactionAmount = (decimal)amount;
                    transaction.BonValue = currentBon.AmountPerStudent;
                    transaction.TransactionTime = DateTime.Now;

                    await _uow.StudentBonTransactionRepository.AddAsync(transaction);
                    await _uow.SaveChangesAsync();
                    result = true;
                }
            }
        }
        return Ok(result);
    }

    [HttpGet("{studentId}/usedValue")]
    public async Task<ActionResult<decimal>> GetUsedValueForStudent(string studentId)
    {
        var currentBon = await _uow.BonRepository.GetCurrentBon();

        //aktuellen Bon holen 
        if (currentBon is not null)
        {
            var currentStudent = await _uow.StudentRepository.GetStudentWithEdufsUserAsync(studentId);
            if (currentStudent is not null)
            {
                var allTransactionsAmountForBonForStudent = currentStudent.StudentTransactions.Where(transaction => transaction.BonId == currentBon.Id)
                                                                                    .Sum(transaction => transaction.TotalTransactionAmount);
                return Ok(allTransactionsAmountForBonForStudent);

            }
        }
        return NotFound();
    }

    #endregion



    #region CreateStudent, CreateStudentsByList => TODO!!

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

    [HttpPost("UploadStudents")]
    public async Task<ActionResult> UploadStudents(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("Datei ist leer oder fehlt.");
        try
        {
            using var stream = file.OpenReadStream();
            using var reader = new StreamReader(stream);

            var lines = await reader.ReadToEndAsync();

            await _uow.StudentRepository.UploadStudentsAsync(lines);
        }
        catch (ValidationException e)
        {
            return BadRequest($"data base error: {e.InnerException!.Message}");
        }
        catch (DbUpdateException dbException)
        {
            return BadRequest($"data base error: {dbException.InnerException!.Message}");
        }

        return Ok();
    }

    #endregion
}