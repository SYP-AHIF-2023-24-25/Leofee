using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Identity.Client;
using IntegrationTests.WebApiTests.Base;
using static WebAPI.Controllers.StudentsController;

namespace IntegrationTests.WebApiTests.BaseIntegrationTests
{
    public class StudentsControllerTests : IntegrationTestBase
    {
        public StudentsControllerTests(IntegrationTestWebAppFactory webApplicationFactory) : base(webApplicationFactory)
        {
        }

       
    }
}
