using Core.DataTransferObjects;
using System.Net;
using System.Text.Json;
using static WebAPI.Controllers.StudentsController;

namespace IntegrationTests.WebApiTests.IsolatedTests
{
    public class IsolatedStudentsControllerTest : IsolatedTestBase
    {/*
        [Fact]
        public async Task AddCustomer_First_Should_Be_Ok()
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
        public async Task AddCustomer_Second_Should_Also_Be_Ok()
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
        */
    }
}
