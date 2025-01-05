using Core.Entities;
using IntegrationTests.PersistenceTests.Base;
using Persistence;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IntegrationTests.PersistenceTests
{

    [Collection(nameof(MyPersistenceTests))]
    public class BonsRepositoryTests : PersistenceTestBase
    {
        public BonsRepositoryTests(DbContextTestFixture fixture) : base(fixture)
        {
        }

        [Fact]
        public async Task ReadBonsTest()
        {
            var existsMinimumOne = await Uow.BonRepository.GetAllAsync();
            Assert.True(existsMinimumOne.Count > 0);
        }

        [Fact]
        public async Task CreateBookingTest_OK()
        {

            await ExecuteInATransactionAsync(async() =>
                {
                    var getAllBons = await Uow.BonRepository.GetAllAsync();
                    var firstCount = getAllBons.Count;
                    var bon = new Bon
                    {
                        StartDate = DateTime.Now.AddDays(-2),
                        EndDate = DateTime.Now.AddDays(+1),
                        AmountPerStudent = 5, 
                        BonTransactions = new List<StudentBonTransaction>()
                    };                                      
                    Thread.Sleep(5000);
                    await Uow.BonRepository.AddAsync(bon);
                    await Uow.SaveChangesAsync();
                    getAllBons = await Uow.BonRepository.GetAllAsync();
                    var secondCount = getAllBons.Count;
                    Assert.True(secondCount > firstCount);
                });
        }

        [Fact]
        public async Task CreateBookingTest_InvalidRange()
        {
            await ExecuteInATransactionAsync(async() =>
            {
                Thread.Sleep(5000);
                var bon = new Bon
                {
                    StartDate = DateTime.Now.AddDays(-1),
                    EndDate = DateTime.Now.AddDays(-2),
                    AmountPerStudent = 5,
                    BonTransactions = new List<StudentBonTransaction>()
                };
                await Uow.BonRepository.AddAsync(bon);
                var exception = await Assert.ThrowsAsync<ValidationException>(Uow.SaveChangesAsync);
                Assert.Contains("EndDate must be after StartDate", exception.Message);
            });

        }
    }

}
