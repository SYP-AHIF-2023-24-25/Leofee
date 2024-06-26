﻿using Persistence;

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
var bons = await ImportController.ReadBonsAsync();
Console.WriteLine($"- {students.Count} bookings read");
Console.WriteLine($"- {bons.Count} bons read");

Console.WriteLine("Saving to database ...");

await using (var uow = new UnitOfWork(new ApplicationDbContext()))
{
    await uow.StudentRepository.AddRangeAsync(students);
    await uow.BonRepository.AddRangeAsync(bons);
    await uow.SaveChangesAsync();
}

await using (var uow = new UnitOfWork(new ApplicationDbContext()))
{
    var countStudents = await uow.StudentRepository.CountAsync();
    var countBons = await uow.BonRepository.CountAsync();
    Console.WriteLine($"- {countStudents} rooms in database");
    Console.WriteLine($"- {countStudents} customers in database");
}

Console.WriteLine("done");