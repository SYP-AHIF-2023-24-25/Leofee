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
[ApiController]
public class StudentsController : ControllerBase
{
    private readonly IUnitOfWork _uow;

    public StudentsController(IUnitOfWork uow)
    {
        _uow = uow;
    }

    #region GetAllStudents, ById, ByEDUFSNummer, GetStudentsWithBalance

    [HttpGet]
    public async Task<ActionResult<IList<StudentDto>>> GetAllStudents()
    {
        try
        {
            var students = await _uow.StudentRepository.GetAllAsync();
            return Ok(students);
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, $"An error occurred while processing your request. Message: {ex.Message}");
        }
    }

    [HttpGet("id/{studentId}")]
    public async Task<ActionResult<StudentDto?>> GetStudentByEdufsUserId(string studentId)
    {
        try
        {
            var studentEntity = await _uow.StudentRepository.GetStudentWithEdufsUserAsync(studentId);
            if (studentEntity == null)
            {
                return NotFound();
            }
            return Ok(new StudentDto(studentEntity.EdufsUsername, studentEntity.FirstName, studentEntity.LastName, studentEntity.StudentClass));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, $"An error occurred while processing your request. Message: {ex.Message}");
        }
    }

    [HttpGet("allStudentsWithBalances")]
    public async Task<ActionResult<IList<StudentBalanceDto>>> GetStudentsWithBalance()
    {
        try
        {
            var students = await _uow.StudentRepository.GetAllAsync();
            var studentsWithBalance = new List<StudentBalanceDto>();

            foreach (var s in students)
            {
                var balance = await GetBalance(s.StudentId);
                var studentBalanceDto = new StudentBalanceDto(
                    s.StudentId,
                    s.FirstName,
                    s.LastName,
                    s.StudentClass,
                    Convert.ToDecimal(balance)
                );
                studentsWithBalance.Add(studentBalanceDto);
            }

            return Ok(studentsWithBalance);
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, $"An error occurred while processing your request. Message: {ex.Message}");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<StudentDto?>> GetStudentById(int id)
    {
        try
        {
            var studentEntity = await _uow.StudentRepository.GetStudentWithIdAsync(id);
            if (studentEntity == null)
            {
                return NotFound();
            }
            return Ok(new StudentDto(studentEntity.EdufsUsername, studentEntity.FirstName, studentEntity.LastName, studentEntity.StudentClass));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, $"An error occurred while processing your request. Message: {ex.Message}");
        }
    }

    #endregion

    [HttpGet("{studentId}/bons")]
    public async Task<ActionResult<BonDto>> GetBonsForStudent(string studentId)
    {
        try
        {
            var currentBon = await _uow.BonRepository.GetCurrentBonWithoutTransactions();

            if (currentBon is not null)
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
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, $"An error occurred while processing your request. Message: {ex.Message}");
        }
    }

    #region Delete Student, Delete AllStudents

    [HttpDelete("{studentId}")]
    public async Task<ActionResult<StudentDto?>> DeleteStudentById(string studentId)
    {
        try
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
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, $"An error occurred while processing your request. Message: {ex.Message}");
        }
    }

    [HttpDelete("DeleteAll")]
    public async Task<ActionResult<bool>> DeleteAllStudents()
    {
        try
        {
            await _uow.StudentRepository.DeleteAllAsync();
            return Ok(true);
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, $"Interner Fehler: {ex.Message}");
        }
    }

    #endregion

    #region GetBalance, UsedValue, Pay

    [HttpGet("balance/{studentId}")]
    public async Task<ActionResult<decimal>> GetBalanceForStudentById(string studentId)
    {
        try
        {
            var currentBon = await _uow.BonRepository.GetCurrentBon();

            if (currentBon is not null)
            {
                var currentStudent = await _uow.StudentRepository.GetStudentWithEdufsUserAsync(studentId);
                if (currentStudent is not null)
                {
                    var allTransactionsAmountForBonForStudent = currentStudent.StudentTransactions
                        .Where(transaction => transaction.BonId == currentBon.Id)
                        .Sum(transaction => transaction.TotalTransactionAmount);

                    var balance = currentBon.AmountPerStudent - allTransactionsAmountForBonForStudent;
                    if (balance < 0)
                    {
                        balance = 0;
                    }

                    return Ok(balance);
                }
            }
            return NotFound();
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, $"An error occurred while processing your request. Message: {ex.Message}");
        }
    }

    [HttpPost("/student/pay")]
    public async Task<IActionResult> Pay(double amount, string studentId)
    {
        try
        {
            var currentBon = await _uow.BonRepository.GetCurrentBon();
            var result = false;

            if (currentBon is not null)
            {
                var currentStudent = await _uow.StudentRepository.GetStudentWithEdufsUserAsync(studentId);
                if (currentStudent is not null)
                {
                    var allTransactionsAmountForBonForStudent = currentStudent.StudentTransactions
                        .Where(transaction => transaction.BonId == currentBon.Id)
                        .Sum(transaction => transaction.TotalTransactionAmount);

                    if ((allTransactionsAmountForBonForStudent + (decimal)amount) <= currentBon.AmountPerStudent)
                    {
                        var transaction = new StudentBonTransaction
                        {
                            BonId = currentBon.Id,
                            StudentId = currentStudent.Id,
                            TotalTransactionAmount = (decimal)amount,
                            BonValue = currentBon.AmountPerStudent,
                            TransactionTime = DateTime.Now
                        };

                        await _uow.StudentBonTransactionRepository.AddAsync(transaction);
                        await _uow.SaveChangesAsync();
                        result = true;
                    }
                }
            }
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, $"An error occurred while processing your request. Message: {ex.Message}");
        }
    }

    [HttpGet("{studentId}/usedValue")]
    public async Task<ActionResult<decimal>> GetUsedValueForStudent(string studentId)
    {
        try
        {
            var currentBon = await _uow.BonRepository.GetCurrentBon();

            if (currentBon is not null)
            {
                var currentStudent = await _uow.StudentRepository.GetStudentWithEdufsUserAsync(studentId);
                if (currentStudent is not null)
                {
                    var allTransactionsAmountForBonForStudent = currentStudent.StudentTransactions
                        .Where(transaction => transaction.BonId == currentBon.Id)
                        .Sum(transaction => transaction.TotalTransactionAmount);
                    return Ok(allTransactionsAmountForBonForStudent);
                }
            }
            return NotFound();
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, $"An error occurred while processing your request. Message: {ex.Message}");
        }
    }

    #endregion

    #region CreateStudent, UploadStudents

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
            return CreatedAtRoute(new { id = newStudent.EdufsUsername }, newStudent);
        }
        catch (ValidationException e)
        {
            return BadRequest($"Database error: {e.InnerException!.Message}");
        }
        catch (DbUpdateException dbException)
        {
            return BadRequest($"Database error: {dbException.InnerException!.Message}");
        }
    }

    [HttpPost("UploadStudents")]
    public async Task<ActionResult> UploadStudents(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest("Datei ist leer oder fehlt.");
        }
        try
        {
            using var stream = file.OpenReadStream();
            using var reader = new StreamReader(stream);

            var lines = await reader.ReadToEndAsync();

            await _uow.StudentRepository.UploadStudentsAsync(lines);
            return Ok();
        }
        catch (ValidationException e)
        {
            return BadRequest($"Database error: {e.InnerException!.Message}");
        }
        catch (DbUpdateException dbException)
        {
            return BadRequest($"Database error: {dbException.InnerException!.Message}");
        }
    }

    #endregion
    [HttpGet("balance/{studentId}")]
    private async Task<decimal> GetBalance(string studentId)
    {
        var currentBon = await _uow.BonRepository.GetCurrentBon();

        if (currentBon is not null)
        {
            var currentStudent = await _uow.StudentRepository.GetStudentWithEdufsUserAsync(studentId);
            if (currentStudent is not null)
            {
                var allTransactionsAmountForBonForStudent = currentStudent.StudentTransactions
                    .Where(transaction => transaction.BonId == currentBon.Id)
                    .Sum(transaction => transaction.TotalTransactionAmount);

                var balance = currentBon.AmountPerStudent - allTransactionsAmountForBonForStudent;
                if (balance < 0)
                {
                    balance = 0;
                }

                return balance;
            }
        }
        return -1;
    }
}