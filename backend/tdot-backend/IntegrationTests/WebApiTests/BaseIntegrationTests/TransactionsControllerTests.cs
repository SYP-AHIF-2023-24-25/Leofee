using Azure;
using Core.DataTransferObjects;
using Core.Entities;
using IntegrationTests.WebApiTests.Base;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using static WebAPI.Controllers.TransactionsController;

namespace IntegrationTests.WebApiTests.BaseIntegrationTests
{
    public class TransactionsControllerTests : IntegrationTestBase
    {
        public TransactionsControllerTests(IntegrationTestWebAppFactory webApplicationFactory) : base(webApplicationFactory)
        {
        }

    }
}
