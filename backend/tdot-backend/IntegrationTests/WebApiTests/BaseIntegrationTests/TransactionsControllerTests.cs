using System.Net;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Core.DataTransferObjects;
using IntegrationTests.WebApiTests.Base;
using Microsoft.EntityFrameworkCore.Metadata.Conventions;
using Xunit;

namespace IntegrationTests.WebApiTests.BaseIntegrationTests
{
    public class TransactionsControllerTests : IntegrationTestBase
    {
        public TransactionsControllerTests(IntegrationTestWebAppFactory webApplicationFactory) : base(webApplicationFactory)
        {
        }

        [Fact]
        public async Task GetAllTransactions_Should_Return_Ok()
        {
            var response = await _httpClient.GetAsync("/api/transactions");
            response.EnsureSuccessStatusCode();
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }


        [Fact]
        public async Task CreateTransaction_Should_Return_Created()
        {
            var bonResponse = await _httpClient.GetAsync("/api/bons");
            bonResponse.EnsureSuccessStatusCode();
            var bons = JsonSerializer.Deserialize<List<BonDto>>(await bonResponse.Content.ReadAsStringAsync());            
            int studentId = DbContext!.Students!.First().Id;
            int bonId = DbContext!.Bons!.First().Id;
            var transaction = new StudentBonTransactionCreationDto(studentId, bonId, DateTime.UtcNow, 100, 100);
            var content = new StringContent(JsonSerializer.Serialize(transaction), Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync("/api/transactions", content);
            response.EnsureSuccessStatusCode();
            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        }
    }
}
