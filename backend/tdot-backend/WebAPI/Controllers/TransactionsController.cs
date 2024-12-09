using Microsoft.AspNetCore.Mvc;
using Core.Contracts;
using Core.DataTransferObjects;
using Core.Entities;
using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TransactionsController : ControllerBase
    {
        private readonly IUnitOfWork _uow;

        public TransactionsController(IUnitOfWork uow)
        {
            _uow = uow;
        }

        // Get all transactions
        [HttpGet]
        public async Task<IActionResult> GetAllTransactions()
        {
            try
            {
                var transactions = await _uow.StudentBonTransactionRepository.GetAllTransactionsAsync();
                return Ok(transactions);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"An error occurred while processing your request. Message: {ex.Message}");
            }
        }

        // Add a new transaction
        [HttpPost]
        public async Task<IActionResult> AddTransaction([FromBody] StudentBonTransactionCreationDto transactionDto)
        {
            try
            {
                // Modellvalidierung
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // Überprüfen, ob Student und Bon existieren
                var studentExists = await _uow.StudentRepository.GetStudentWithIdAsync(transactionDto.StudentId);
                var bonExists = await _uow.BonRepository.GetBonWithIdAsync(transactionDto.BonId);

                if (studentExists == null)
                {
                    return NotFound($"Student with ID {transactionDto.StudentId} not found.");
                }

                if (bonExists == null)
                {
                    return NotFound($"Bon with ID {transactionDto.BonId} not found.");
                }

                // Transaktion erstellen
                var transaction = new StudentBonTransaction
                {
                    StudentId = transactionDto.StudentId,
                    BonId = transactionDto.BonId,
                    TotalTransactionAmount = transactionDto.TotalTransactionAmount,
                    BonValue = bonExists.AmountPerStudent,
                    TransactionTime = DateTime.Now
                };

                await _uow.StudentBonTransactionRepository.AddAsync(transaction);
                await _uow.SaveChangesAsync();

                return CreatedAtAction(nameof(GetAllTransactions), new { id = transaction.Id }, transaction);
            }
            catch (ValidationException e)
            {
                return BadRequest($"Validation error: {e.Message}");
            }
            catch (DbUpdateException dbException)
            {
                return BadRequest($"Database error: {dbException.InnerException?.Message}");
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"An error occurred while processing your request. Message: {ex.Message}");
            }
        }
    }
}