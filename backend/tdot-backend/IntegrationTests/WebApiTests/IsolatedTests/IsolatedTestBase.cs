using Testcontainers.MySql;

namespace IntegrationTests.WebApiTests.IsolatedTests
{
    public abstract class IsolatedTestBase : IAsyncLifetime
    {
        protected readonly HttpClient _httpClient;
        protected readonly IsolatedWebAppFactory _factory;
        private readonly MySqlContainer _dbContainer = new MySqlBuilder()
            .WithDatabase("TestDb")
            .WithUsername("root")
            .WithPassword("password")
            .Build();
        public IsolatedTestBase()
        {
            _dbContainer.StartAsync().Wait();
            _factory = new IsolatedWebAppFactory(_dbContainer.GetConnectionString());
            _httpClient = _factory.CreateClient();
        }
        public Task InitializeAsync()
        {
            return Task.CompletedTask;
        }

        public Task DisposeAsync()
        {
            return _dbContainer.StopAsync();
        }
    }
}
