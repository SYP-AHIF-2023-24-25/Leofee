using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.VisualStudio.TestPlatform.TestHost;
using Persistence;
using WebAPI;

namespace IntegrationTests.WebApiTests.IsolatedTests
{
    public class IsolatedWebAppFactory : WebApplicationFactory<Program>
    {
        private readonly string _connectionString;
        public IsolatedWebAppFactory(string connectionString)
        {
            _connectionString = connectionString;
        }
        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.ConfigureTestServices(services =>
            {
                var descriptorType =
                    typeof(DbContextOptions<ApplicationDbContext>);

                var descriptor = services
                    .SingleOrDefault(s => s.ServiceType == descriptorType);

                if (descriptor is not null)
                {
                    services.Remove(descriptor);
                }

                services.AddDbContext<ApplicationDbContext>(options =>
                    options.UseMySql(
                        _connectionString, 
                        ServerVersion.AutoDetect(_connectionString)));

                var sp = services.BuildServiceProvider();
                using var scope = sp.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                db.Database.EnsureCreated();
                TestDataInitializer.ImportDataAsync(db).Wait();

            });
        }


    }
}
