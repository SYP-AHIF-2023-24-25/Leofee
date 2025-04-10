using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Transactions;
using Core.Entities;
using ImportConsole;

namespace Core;

public class ImportController
{
    public async static Task<IList<Bon>> ReadBonsAsync()
    {
        var lines = await File.ReadAllLinesAsync("ImportData/Bons.txt");
        //AmountPerStudent;StartDate;EndDate
        var bons = lines
            .Skip(1)
            .Select((line) => line.Split(';'))
            .Select(cols => new Bon
            {
                AmountPerStudent = decimal.Parse(cols[0]),
                StartDate = DateTime.Parse(cols[1]),
                EndDate = DateTime.Parse(cols[2]),

            }).ToList();

        return bons;
    }

    public async static Task<IList<Student>> ReadStudentsAsync()
    {
        var lines = await File.ReadAllLinesAsync("ImportData/Students.txt");
        //EdufsUsername;FirstName;LastName;StudentClass;Department
        var students = lines
            .Skip(1)
            .Select(line => line.Split(';'))
            .Select(cols => new Student
            {
                EdufsUsername = cols[0],
                FirstName = cols[1],
                LastName = cols[2],
                StudentClass = cols[3],
                Department = cols[4],
            }).ToList();

        return students;
    }

    public async static Task<IList<StudentBonTransaction>> ReadTransactionsAsync()
    {
        var lines = await File.ReadAllLinesAsync("ImportData/Transaction.txt");
        //StudentId;BonId;TransactionTime;BonValue;TotalTransactionAmount
        var students = await ReadStudentsAsync();
        var bons = await ReadBonsAsync();

        var transactions = lines
            .Skip(1)
            .Select(line => line.Split(';'))
            .Select(cols => new StudentBonTransaction
            {
                //Student = students.FirstOrDefault(t => t.Id == int.Parse(cols[0])),
                //Bon = bons.FirstOrDefault(t => t.Id == int.Parse(cols[1])),
                TransactionTime = DateTime.Parse(cols[2]),
                BonValue = decimal.Parse(cols[3]),
                TotalTransactionAmount = decimal.Parse(cols[4])
            }).ToList();
            
        /*var students = await ReadStudentsAsync();
        var bons = await ReadBonsAsync();

        foreach (var transaction in transactions)
        {
            transaction.Student = students.SingleOrDefault(s => s.Id == transaction.StudentId);
            transaction.Bon = bons.SingleOrDefault(b => b.Id == transaction.BonId);
        }*/

        return transactions;
    }


    public async static Task<IList<WhiteListUser>> ReadWhiteListUserAsync()
    {
        var lines = await File.ReadAllLinesAsync("ImportData/WhiteListUsers.txt");
        //UserId;FirstName;LastName
        var whiteListUsers = lines
            .Skip(1)
            .Select(line => line.Split(';'))
            .Select(cols => new WhiteListUser
            {
                UserId = cols[0],
                FirstName = cols[1],
                LastName = cols[2]
            }).ToList();

        return whiteListUsers;
    }


    public async static Task<IList<StudentBonTransaction>> ReadAllTogetherAsync(List<Student> students, List<Bon> bons)
    {
        //var linesBons = await File.ReadAllLinesAsync("ImportData/Bons.txt");
        //var linesStudents = await File.ReadAllLinesAsync("ImportData/Students.txt");
        var linesTransactions = await File.ReadAllLinesAsync("ImportData/Transaction.txt");

        //AmountPerStudent;StartDate;EndDate
       /* var bons = linesBons
            .Skip(1)
            .Select((line) => line.Split(';'))
            .Select(cols => new Bon
            {
                AmountPerStudent = decimal.Parse(cols[0]),
                StartDate = DateTime.Parse(cols[1]),
                EndDate = DateTime.Parse(cols[2]),             

            }).ToList();

        //EdufsUsername;FirstName;LastName;StudentClass;Department
        // var counter = 0; 
        var students = linesStudents
            .Skip(1)
            .Select(line => line.Split(';'))
            .Select(cols => new Student
            {
                EdufsUsername = cols[0],
                FirstName = cols[1],
                LastName = cols[2],
                StudentClass = cols[3],
                Department = cols[4],              
            }).ToList();*/

        //StudentId;BonId;TransactionTime;BonValue;TotalTransactionAmount
        var transactions = linesTransactions
            .Skip(1)
            .Select(line => line.Split(';'))
            .Select(cols => new StudentBonTransaction
            {                
                Student =  students.FirstOrDefault(s => s.EdufsUsername == cols[0])!,                
                Bon = bons.FirstOrDefault(s => s.Id == int.Parse(cols[1]))!,
                TransactionTime = DateTime.Parse(cols[2]),
                BonValue = decimal.Parse(cols[3]),
                TotalTransactionAmount = decimal.Parse(cols[4])
            }).ToList();


        return transactions;
    }
}