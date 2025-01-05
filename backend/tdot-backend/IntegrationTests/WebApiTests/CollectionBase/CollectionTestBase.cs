using IntegrationTests.WebApiTests.Base;
using Microsoft.Extensions.DependencyInjection;
using Persistence;

namespace IntegrationTests.WebApiTests.CollectionTests
{
    [CollectionDefinition(nameof(MyWebApiCollectionTests))] 
    public class MyWebApiCollectionTests : ICollectionFixture<IntegrationTestWebAppFactory>
    {
    }

    [Collection(nameof(MyWebApiCollectionTests))]
    public abstract class CollectionTestBase : IAsyncLifetime
    {
        private readonly IServiceScope _scope;
        protected readonly ApplicationDbContext DbContext;
        protected readonly HttpClient _httpClient;
        protected CollectionTestBase(IntegrationTestWebAppFactory factory)
        {
            _httpClient = factory.CreateClient();
            _scope = factory.Services.CreateScope();
            DbContext = _scope.ServiceProvider
                .GetRequiredService<ApplicationDbContext>();
        }

        public async Task InitializeAsync()
        {
            await Task.CompletedTask;
        }

        public async Task DisposeAsync()
        {
            _httpClient.Dispose();
            _scope?.Dispose();
            await DbContext.DisposeAsync();
        }
    }
}
