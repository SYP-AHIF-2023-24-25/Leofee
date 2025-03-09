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
			await _uow.CreateDatabaseAsync(); 
            //await _uow.MigrateDatabaseAsync();

            Console.WriteLine("Read data from file ...");

            var (studentsDemo,bonDemo,transactions) = DemoDataGenerator.CreateDemoData();
            var whiteListUsers = await ImportController.ReadWhiteListUserAsync();
            Console.WriteLine($"- {whiteListUsers.Count} WhiteListUsers read");

            Console.WriteLine("Saving to database ...");

            await _uow.WhiteListUserRepository.AddRangeAsync(whiteListUsers);
            await _uow.SaveChangesAsync();

            await _uow.StudentBonTransactionRepository.AddRangeAsync(transactions);
            await _uow.SaveChangesAsync();

            return Ok("Database recreated, transactions, whitelist, bons and students imported");
        }

    }
}
