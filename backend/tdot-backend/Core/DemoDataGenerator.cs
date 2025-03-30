using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Bogus;
using Core.Entities;

namespace Core
{
    public class DemoDataGenerator
    {
        public enum Department
        {
            HIF,
            HEL,
            HITM,
            HBG
        }
        public static (List<Student> students, List<Bon> bons, List<StudentBonTransaction> transactions) CreateDemoData()
        {
            var studentFaker = new Faker<Student>();
            studentFaker
                .RuleFor(c => c.FirstName, f => f.Name.FirstName())
                .RuleFor(c => c.LastName, f => f.Name.LastName())
                .RuleFor(c => c.EdufsUsername, f => $"if{f.Random.Number(100000, 999999)}")
                .RuleFor(c => c.StudentClass, f => $"{f.Random.Number(1, 5)}{f.Random.Char('A', 'D')}{f.PickRandom<Department>()}")
                .RuleFor(c => c.Department, (f, c) =>
                 {
                     var departmentCode = c.StudentClass.Substring(c.StudentClass.Length - 3);
                     return departmentCode switch
                     {
                         "HIF" => "Informatik",
                         "HEL" => "Elektrotechnik",
                         "HITM" => "Medientechnik",
                         "HBG" => "Medizintechnik",
                         _ => "not available"
                     };
                 });
            var students = studentFaker.Generate(20);
            var passivBonsFaker = new Faker<Bon>();
            var bons = new List<Bon>();
            var usedDates = new HashSet<DateTime>();

            passivBonsFaker
                .RuleFor(b => b.StartDate, f =>
                {
                    DateTime startDate;
                    do
                    {
                        startDate = f.Date.Past(1, DateTime.Now.AddDays(2)).Date;
                    } while (usedDates.Contains(startDate) || usedDates.Contains(startDate.AddDays(1)) || usedDates.Contains(startDate.AddDays(2)));

                    usedDates.Add(startDate);
                    usedDates.Add(startDate.AddDays(1));
                    usedDates.Add(startDate.AddDays(2));
                    return startDate;
                })
                .RuleFor(b => b.EndDate, (f, b) => b.StartDate.AddDays(6))
                .RuleFor(b => b.AmountPerStudent, f => f.Finance.Amount(1, 10))
                .RuleFor(b => b.BonTransactions, f => new List<StudentBonTransaction>());
            //bons = passivBonsFaker.Generate(10);
            var activeBon = new Bon
            {
                Id = 0,
                StartDate = DateTime.Today,
                EndDate = DateTime.Today.AddDays(3),
                AmountPerStudent = 3,
                BonTransactions = new List<StudentBonTransaction>()
            };
            bons.Add(activeBon);
            var transactionFaker = new Faker<StudentBonTransaction>();
            var transactions = new List<StudentBonTransaction>();

            transactionFaker
                .RuleFor(t => t.Student, f => f.PickRandom(students))
                .RuleFor(t => t.Bon, f => f.PickRandom(bons))
                .RuleFor(t => t.TransactionTime, f => f.Date.Between(DateTime.Today, DateTime.Today.AddDays(1)))
                .RuleFor(t => t.BonValue, f => f.PickRandom(bons).AmountPerStudent)
                .RuleFor(t => t.TotalTransactionAmount, f => f.Random.Int(1, 3));

            transactions = transactionFaker.Generate(10);

            return (students, bons, transactions);
        }


    }
}
