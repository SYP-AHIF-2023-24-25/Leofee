
using Core;
using Microsoft.EntityFrameworkCore;
using Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IntegrationTests
{
    public class TestDataInitializer
    {
        public static async Task ImportDataAsync(ApplicationDbContext dbContext)
        {
            var studentsCount = await dbContext.Students!.CountAsync();
            if (studentsCount > 0)
                return;
            Console.WriteLine("Read data from file ...");
            var (studentsDemo, bonsDemo, transactions) = DemoDataGenerator.CreateDemoData();
            //var bons = await ImportController.ReadBonsAsync();
            //var students = await ImportController.ReadStudentsAsync();
            Console.WriteLine($"- {bonsDemo.Count} bons read");
            Console.WriteLine($"- {studentsDemo.Count} students read");
            await dbContext.Students!.AddRangeAsync(studentsDemo);
            await dbContext.Bons!.AddRangeAsync(bonsDemo);
            await dbContext.StudentBonTransactions!.AddRangeAsync(transactions);
            await dbContext.SaveChangesAsync();
        }
    }
}
