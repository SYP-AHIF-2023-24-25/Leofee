using Core;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Persistence;
using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Testcontainers.MsSql;
using Testcontainers.MySql;


namespace IntegrationTests.PersistenceTests.Base
{
    public class DbContextTestFixture : IClassFixture<ApplicationDbContext>, IAsyncLifetime
    {
        private readonly MySqlContainer _dbContainer =  new MySqlBuilder()
            .WithDatabase("db")
            .WithUsername("admin")
            .WithPassword("password")
            .Build();
        private DbContextOptions<ApplicationDbContext>? _contextOptions;

        /// <summary>
        /// 
        /// 
        /// Called when an object is no longer needed
        /// </summary>
        /// <returns></returns>
        public async Task DisposeAsync()
        {
            await _dbContainer.DisposeAsync();
        }

        /// <summary>
        /// Called after the class has been created, and before it is used.
        /// </summary>
        /// <returns></returns>
        public async Task InitializeAsync()
        {
            await _dbContainer.StartAsync();
            // These options will be used by the context instances in this test suite, including the connection opened above.
            _contextOptions = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseMySql(_dbContainer.GetConnectionString(), ServerVersion.AutoDetect(_dbContainer.GetConnectionString()))
                .Options;
            // Create the schema and seed some data
            using var context = CreateContext();
            await context.Database.EnsureCreatedAsync();
            await TestDataInitializer.ImportDataAsync(context);
        }
        
        public ApplicationDbContext CreateContext()
        {
            if (_contextOptions == null)
            {
                throw new InvalidOperationException("The InitializeAsync method must be called before creating the context.");
            }

            return new ApplicationDbContext(_contextOptions);
        }
    }
}
