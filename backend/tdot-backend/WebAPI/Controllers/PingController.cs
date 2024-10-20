using Core;
using Core.Contracts;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PingController : ControllerBase
    {

        private readonly IUnitOfWork _uow;
        private readonly ILogger<PingController> _logger;
        public PingController(ILogger<PingController> logger, IUnitOfWork uow)
        {
            _logger = logger;
            _uow = uow;
        }
        // GET: api/<PingController>
        [HttpGet]
        public ActionResult<string> Get()
        {
            _logger.LogInformation("Ping request received");
            return Ok("Pong");
        }

        [HttpPatch]
        public async Task<ActionResult<string>> Patch()
        {
            await _uow.DeleteDatabaseAsync();
            await _uow.MigrateDatabaseAsync();
            var bons = await ImportController.ReadBonsAsync();
            var students = await ImportController.ReadStudentsAsync();
            var whiteListUsers = await ImportController.ReadWhiteListUserAsync();
            var transactions = await ImportController.ReadTransactionAsync();
            await _uow.BonRepository.AddRangeAsync(bons);
            await _uow.StudentRepository.AddRangeAsync(students);
            await _uow.WhiteListUserRepository.AddRangeAsync(whiteListUsers);
            await _uow.TransactionRepository.AddRangeAsync(transactions);
            await _uow.SaveChangesAsync();
            return Ok("Database recreated, transactions, whitelist, bons and students imported");
        }
    }
}
