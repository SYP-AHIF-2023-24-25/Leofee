using Core.Contracts;
using Microsoft.EntityFrameworkCore;
using Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IntegrationTests.PersistenceTests.Base
{
    [CollectionDefinition(nameof(MyPersistenceTests))]
    public class MyPersistenceTests : ICollectionFixture<DbContextTestFixture>
    {
        // This class has no code, and is never created. Its purpose is simply
        // to be the place to apply [CollectionDefinition] and all the
        // ICollectionFixture<> interfaces.
    }

    [Collection(nameof(MyPersistenceTests))]
    public abstract class PersistenceTestBase: IAsyncLifetime
    {
        public DbContextTestFixture Fixture { get; }

        protected IUnitOfWork Uow { get; }
        private ApplicationDbContext _context;
        protected PersistenceTestBase(DbContextTestFixture fixture)
        {
            Fixture = fixture;
            _context = fixture.CreateContext();
            // For each test, a distinct uow instance is created
            Uow = new UnitOfWork(_context);
        }

        protected async ValueTask ExecuteInATransactionAsync(Func<Task> actionToExecute)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            await actionToExecute();
            await transaction.RollbackAsync();
        }

        public async Task InitializeAsync()
        {
            await Task.CompletedTask;
        }

        async Task IAsyncLifetime.DisposeAsync()
        {
            await Uow.DisposeAsync();
        }
    }
}
