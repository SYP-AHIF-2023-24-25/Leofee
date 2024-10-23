using Microsoft.AspNetCore.Mvc;
using Core.Contracts;
using Core.DataTransferObjects;
using Core.Entities;
using System.Threading.Tasks;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController] // Fügt nützliche Features wie die automatische Validierung von Modellen hinzu
    public class TransactionController : ControllerBase
    {
        private readonly IUnitOfWork _uow;

        public TransactionController(IUnitOfWork uow)
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

            if (!studentExists || !bonExists)
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
                // Logge den Fehler hier (ex.Message)
                return StatusCode(500, "Es gab ein Problem beim Hinzufügen der Transaktion.");
            }
        }
    }
}
