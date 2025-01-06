﻿using Azure;
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
using static WebAPI.Controllers.WhiteListUserController;

namespace IntegrationTests.WebApiTests.BaseIntegrationTests
{
    public class RoomsControllerTests : IntegrationTestBase
    {
        public RoomsControllerTests(IntegrationTestWebAppFactory webApplicationFactory) : base(webApplicationFactory)
        {
        }

    }
}