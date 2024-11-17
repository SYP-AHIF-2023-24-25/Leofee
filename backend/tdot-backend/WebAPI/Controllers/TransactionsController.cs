using Microsoft.AspNetCore.Mvc;
using Core.Contracts;
using Core.DataTransferObjects;
using Core.Entities;
using System.Threading.Tasks;

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
            var transactions = await _uow.StudentBonTransactionRepository.GetAllTransactionsAsync();
            return Ok(transactions);
        }

        // Add a new transaction
        [HttpPost]
        public async Task<IActionResult> AddTransaction([FromBody] StudentBonTransactionCreationDto transactionDto)
        {
            // Modellvalidierung
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Überprüfen, ob Student und Bon existieren
            var studentExists = await _uow.StudentRepository.GetStudentWithIdAsync(transactionDto.StudentId);
            var bonExists = await _uow.BonRepository.GetBonWithIdAsync(transactionDto.BonId);

            if (studentExists == null || bonExists == null)
            {
                return NotFound("Entweder der Student oder der Bon wurde nicht gefunden.");
            }

            // Transaktion erstellen
            try
            {
                await _uow.StudentBonTransactionRepository.AddTransactionAsync(transactionDto);
                return CreatedAtAction(nameof(GetAllTransactions), new { id = transactionDto.StudentId }, transactionDto);
            }
            catch (Exception)
            {
                return StatusCode(500, "Es gab ein Problem beim Hinzufügen der Transaktion.");
            }
        }
    }
}
