using Microsoft.Extensions.DependencyInjection;
using Persistence;

namespace IntegrationTests.WebApiTests.Base
{
    public abstract class IntegrationTestBase : 
        IClassFixture<IntegrationTestWebAppFactory>, IDisposable
    {
        private readonly IServiceScope _scope;
        protected readonly ApplicationDbContext DbContext;
        protected readonly HttpClient _httpClient;

        protected IntegrationTestBase(IntegrationTestWebAppFactory factory)
        {
            _httpClient = factory.CreateClient();
            _scope = factory.Services.CreateScope();
            DbContext = _scope.ServiceProvider
                .GetRequiredService<ApplicationDbContext>();
        }

        public void Dispose()
        {
            _scope?.Dispose();
            DbContext?.Dispose();
        }
    }

}
