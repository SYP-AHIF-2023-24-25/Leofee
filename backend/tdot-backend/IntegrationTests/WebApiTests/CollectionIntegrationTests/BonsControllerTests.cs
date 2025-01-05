using Core.DataTransferObjects;
using IntegrationTests.WebApiTests.Base;
using System.Net;
using System.Text.Json;
using IntegrationTests.WebApiTests.CollectionTests;
using static WebAPI.Controllers.BonsController;

namespace IntegrationTests.WebApiTests.CollectionIntegrationTests
{
    [Collection(nameof(MyWebApiCollectionTests))]
    public class BonsControllerTests : CollectionTestBase
    {
        public BonsControllerTests(IntegrationTestWebAppFactory factory) : base(factory)
        {
        }
        /*
        [Fact]
        public async Task AddCustomer_First_Could_Fail()
        {
            // Arrange
            CustomerCreateDto dto = new CustomerCreateDto
            {
                Email = "john@doe.at",
                FirstName = "John",
                LastName = "Doe",
                Iban = "123456789"
            };

            // Act
            var result = await _httpClient.PostAsJsonAsync("/api/Customers", dto);

            // Assert
            Assert.Equal(HttpStatusCode.Created, result.StatusCode);
            var responseBody = await result.Content.ReadAsStringAsync();
            var customerDto = JsonSerializer.Deserialize<CustomerDto>(responseBody, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            Assert.NotNull(customerDto);
        }

        [Fact]
        public async Task AddCustomer_Second_Could_Fail()
        {
            // Arrange
            CustomerCreateDto dto = new CustomerCreateDto
            {
                Email = "john@doe.at",
                FirstName = "John",
                LastName = "Doe",
                Iban = "123456789"
            };

            // Act
            var result = await _httpClient.PostAsJsonAsync("/api/Customers", dto);

            // Assert
            Assert.Equal(HttpStatusCode.Created, result.StatusCode);
            var responseBody = await result.Content.ReadAsStringAsync();
            var customerDto = JsonSerializer.Deserialize<CustomerDto>(responseBody, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            Assert.NotNull(customerDto);
        }*/
    }
}
