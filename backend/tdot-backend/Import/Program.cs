using Persistence;

using System;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Base.Core;
using Base.Tools.CsvImport;

using Core.Entities;

using Microsoft.Extensions.DependencyInjection;
using Core;
using Microsoft.EntityFrameworkCore;

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

var whiteListUsers = await ImportController.ReadWhiteListUserAsync();
Console.WriteLine($"- {whiteListUsers.Count} WhiteListUsers read");


//var transactions = await ImportController.ReadTransactionsAsync();
//Console.WriteLine($"- {transactions.Count} transaction read");

var bontransaction = await ImportController.ReadAllTogetherAsync(students.ToList(), bons.ToList());

Console.WriteLine("Saving to database ...");

await using (var uow = new UnitOfWork(new ApplicationDbContext()))
{
   

    /*
    await uow.StudentRepository.AddRangeAsync(students);
    await uow.SaveChangesAsync(); 


    await uow.BonRepository.AddRangeAsync(bons);
    await uow.SaveChangesAsync();*/


    await uow.WhiteListUserRepository.AddRangeAsync(whiteListUsers);
    await uow.SaveChangesAsync();

  
    



    await uow.StudentBonTransactionRepository.AddRangeAsync(bontransaction);
    await uow.SaveChangesAsync();
}
/*
await using (var uow = new UnitOfWork(new ApplicationDbContext()))
{
    /*var countStudents = await uow.StudentRepository.CountAsync();
     var countWhiteListUsers = await uow.WhiteListUserRepository.CountAsync();
    var countBons = await uow.BonRepository.CountAsync();
     var countTransaction = await uow.StudentBonTransactionRepository.CountAsync();
     
    Console.WriteLine($"- {countTransaction} Transaction in database");
    Console.WriteLine($"- {countStudents} rooms in database");
     Console.WriteLine($"- {countWhiteListUsers} WhiteListUsers in database");
    Console.WriteLine($"- {countStudents} customers in database");
    Console.WriteLine($"- {countWhiteListUsers} WhiteListUsers in database");
}*/

Console.WriteLine("done");