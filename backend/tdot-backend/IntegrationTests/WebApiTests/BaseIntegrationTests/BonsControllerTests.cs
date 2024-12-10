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
using Xunit;

namespace IntegrationTests.WebApiTests.BaseIntegrationTests
{
    public class BonsControllerTests : IntegrationTestBase
    {
        public BonsControllerTests(IntegrationTestWebAppFactory factory) : base(factory)
        {
        }

        [Fact]
        public async Task AddBon_Should_Return_Created()
        {
            // Arrange
            var bon = new Bon
            {
                AmountPerStudent = 50.0m,
                StartDate = DateTime.UtcNow,
                EndDate = DateTime.UtcNow.AddDays(30)
            };

            // Act
            var result = await _httpClient.PostAsJsonAsync("/api/Bons", bon);

            // Assert
            Assert.Equal(HttpStatusCode.Created, result.StatusCode);
            var responseBody = await result.Content.ReadAsStringAsync();
            var createdBon = JsonSerializer.Deserialize<Bon>(responseBody, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            Assert.NotNull(createdBon);
            Assert.Equal(bon.AmountPerStudent, createdBon.AmountPerStudent);
            Assert.Equal(bon.StartDate, createdBon.StartDate);
            Assert.Equal(bon.EndDate, createdBon.EndDate);
        }

        [Fact]
        public async Task GetAllBons_Should_Return_Ok()
        {
            // Act
            var result = await _httpClient.GetAsync("/api/Bons");

            // Assert
            Assert.Equal(HttpStatusCode.OK, result.StatusCode);
            var responseBody = await result.Content.ReadAsStringAsync();
            var bons = JsonSerializer.Deserialize<List<BonDto>>(responseBody, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            Assert.NotNull(bons);
            Assert.True(bons.Count >= 0);
        }

        [Fact]
        public async Task GetBonById_Should_Return_Ok()
        {
            // Arrange
            var bon = new Bon
            {
                AmountPerStudent = 50.0m,
                StartDate = DateTime.UtcNow,
                EndDate = DateTime.UtcNow.AddDays(30)
            };
            var postResult = await _httpClient.PostAsJsonAsync("/api/Bons", bon);
            var createdBon = JsonSerializer.Deserialize<Bon>(await postResult.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            // Act
            var result = await _httpClient.GetAsync($"/api/Bons/{createdBon?.Id}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, result.StatusCode);
            var responseBody = await result.Content.ReadAsStringAsync();
            var fetchedBon = JsonSerializer.Deserialize<BonDto>(responseBody, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            Assert.NotNull(fetchedBon);
            Assert.Equal(createdBon?.Id, fetchedBon.Id);
        }

        [Fact]
        public async Task UpdateBon_Should_Return_Ok()
        {
            // Arrange
            var bon = new Bon
            {
                AmountPerStudent = 50.0m,
                StartDate = DateTime.UtcNow,
                EndDate = DateTime.UtcNow.AddDays(30)
            };
            var postResult = await _httpClient.PostAsJsonAsync("/api/Bons", bon);
            var createdBon = JsonSerializer.Deserialize<Bon>(await postResult.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            var updateDto = new BonUpdateDto
            {
                Id = createdBon!.Id,
                AmountPerStudent = 75.0m,
                StartDate = createdBon.StartDate,
                EndDate = createdBon.EndDate
            };

            // Act
            var result = await _httpClient.PutAsJsonAsync($"/api/Bons/{createdBon.Id}", updateDto);

            // Assert
            Assert.Equal(HttpStatusCode.OK, result.StatusCode);
        }

        [Fact]
        public async Task DeleteBon_Should_Return_NoContent()
        {
            // Arrange
            var bon = new Bon
            {
                AmountPerStudent = 50.0m,
                StartDate = DateTime.UtcNow,
                EndDate = DateTime.UtcNow.AddDays(30)
            };
            var postResult = await _httpClient.PostAsJsonAsync("/api/Bons", bon);
            var createdBon = JsonSerializer.Deserialize<Bon>(await postResult.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            // Act
            var result = await _httpClient.DeleteAsync($"/api/Bons/{createdBon?.Id}");

            // Assert
            Assert.Equal(HttpStatusCode.NoContent, result.StatusCode);
        }
    }
}
