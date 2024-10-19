using Persistence;

using System;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Base.Core;
using Base.Tools.CsvImport;

using Core.Entities;

using Microsoft.Extensions.DependencyInjection;
using Import;

Console.WriteLine("Recreate Database");

await using (var uow = new UnitOfWork(new ApplicationDbContext()))
{
    await uow.DeleteDatabaseAsync();
    await uow.MigrateDatabaseAsync();
}

Console.WriteLine("Read data from file ...");
var students = await ImportController.ReadStudentsAsync();
Console.WriteLine($"- {students.Count} Students read");

var bons = await ImportController.ReadBonsAsync();
Console.WriteLine($"- {bons.Count} bons read");

var transactions = await ImportController.ReadTransactionAsync();
Console.WriteLine($"- {transactions.Count} transaction read");

Console.WriteLine("Saving to database ...");

await using (var uow = new UnitOfWork(new ApplicationDbContext()))
{
    await uow.StudentRepository.AddRangeAsync(students);
    await uow.BonRepository.AddRangeAsync(bons);
    await uow.TransactionRepository.AddRangeAsync(transactions);
    await uow.SaveChangesAsync();
}

await using (var uow = new UnitOfWork(new ApplicationDbContext()))
{
    var countStudents = await uow.StudentRepository.CountAsync();
    Console.WriteLine($"- {countStudents} Students in database");

    var countBons = await uow.BonRepository.CountAsync();    
    Console.WriteLine($"- {countBons} Bons in database");

    var countTransaction = await uow.TransactionRepository.CountAsync();
    Console.WriteLine($"- {countTransaction} Transaction in database");
}

Console.WriteLine("done");