using Microsoft.AspNetCore.Mvc;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PingController : ControllerBase
    {

        private readonly ILogger<PingController> _logger;
        public PingController(ILogger<PingController> logger)
        {
            _logger = logger;
        }
        // GET: api/<PingController>
        [HttpGet]
        public ActionResult<string> Get()
        {
            _logger.LogInformation("Ping request received");
            return Ok("Pong");
        }
    }
}
