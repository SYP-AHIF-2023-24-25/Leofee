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
        private readonly IConfiguration _configuration;
        public PingController(ILogger<PingController> logger, IUnitOfWork uow, IConfiguration configuration)
        {
            _logger = logger;
            _uow = uow;
            _configuration = configuration;
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
            //[FromHeader(Name = "X-Admin-Secret")] string? secretFromHeader)
        {
            // (1) Secret aus der Config holen
            /*var expectedSecret = _configuration["Security:AdminSecret"];
            if (string.IsNullOrWhiteSpace(expectedSecret))
            {
                _logger.LogError("AdminSecret is not set in configuration.");
                return StatusCode(500, "Missing server configuration. Contact Admin.");
            }

            // (2) Secret im Header prüfen
            if (string.IsNullOrWhiteSpace(secretFromHeader) || secretFromHeader != expectedSecret)
            {
                _logger.LogWarning("Unauthorized attempt to call Patch endpoint.");
                return Unauthorized("Invalid or missing admin secret.");
            }*/

            // (3) Nur wenn der Header-Secret stimmt, führen wir die Logik aus
            await _uow.DeleteDatabaseAsync();
            await _uow.CreateDatabaseAsync();

            Console.WriteLine("Read data from file ...");
            var (studentsDemo, bonDemo, transactions) = DemoDataGenerator.CreateDemoData();
            var whiteListUsers = await ImportController.ReadWhiteListUserAsync();
            Console.WriteLine($"- {whiteListUsers.Count} WhiteListUsers read");

            Console.WriteLine("Saving to database ...");
            await _uow.WhiteListUserRepository.AddRangeAsync(whiteListUsers);
            await _uow.SaveChangesAsync();

            await _uow.StudentBonTransactionRepository.AddRangeAsync(transactions);
            await _uow.SaveChangesAsync();

            return Ok("Database recreated, transactions, whitelist, bons and students imported");
        }

        [HttpPatch("OnlyWhiteListUsers")]
        public async Task<ActionResult<string>> PatchOnlyWhiteListUsers(){
            await _uow.DeleteDatabaseAsync();
            await _uow.CreateDatabaseAsync();

            Console.WriteLine("Read data from file ...");
            var (studentsDemo, bonDemo, transactions) = DemoDataGenerator.CreateDemoData();
            var whiteListUsers = await ImportController.ReadWhiteListUserAsync();
            Console.WriteLine($"- {whiteListUsers.Count} WhiteListUsers read");

            Console.WriteLine("Saving to database ...");
            await _uow.WhiteListUserRepository.AddRangeAsync(whiteListUsers);
            await _uow.SaveChangesAsync();

            return Ok("Database recreated, whitelist imported");
        }
    }
}
