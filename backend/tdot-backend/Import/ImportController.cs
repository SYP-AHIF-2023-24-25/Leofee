using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Core.Entities;
using Microsoft.IdentityModel.Tokens;

namespace Import;

public class ImportController
{
    public async static Task<IList<Bon>> ReadBonsAsync()
    {
        var lines = await File.ReadAllLinesAsync("ImportData/Bons.txt");
        //StudentId;Value;From;To
        var bons = lines
            .Skip(1)
            .Select(line => line.Split(';'))
            .Select(cols => new Bon{
                StudentId = cols[0],
                Value = Double.Parse(cols[1]),
                StartDate = DateTime.Parse(cols[2]),
                EndDate = DateTime.Parse(cols[3])

            }).ToList();
        
        return bons;
    }

    public async static Task<IList<Student>> ReadStudentsAsync()
    {
        var lines = await File.ReadAllLinesAsync("ImportData/Students.txt");
        //StudentId;Firstname;Lastname;StudentClass
        var students = lines
            .Skip(1)
            .Select(line => line.Split(';'))
            .Select(cols => new Student
            {
                StudentId = cols[0],
                FirstName = cols[1],
                LastName = cols[2],
                StudentClass = cols[3]

            }).ToList();

        return students;

    }

    public async static Task<IList<Transaction>> ReadTransactionAsync()
    {
        var lines = await File.ReadAllLinesAsync("ImportData/Transaction.txt");
       
        var students = lines
            .Skip(1)
            .Select(line => line.Split(';'))
            .Select(cols => new Transaction
            {
                Id = int.Parse(cols[0]),
                TransactionTime = DateTime.Parse(cols[1]),
                Value = double.Parse(cols[2]),
                AmountOfBon = double.Parse(cols[3])

            }).ToList();

        return students;

    } 
  

    public async static Task<IList<WhiteListUser>> ReadWhiteListUserAsync()
    {

        var lines = await File.ReadAllLinesAsync("ImportData/WhiteListUsers.txt");
        var whtieListUsers = lines
            .Skip(1)
            .Select(line => line.Split(';'))
            .Select(column => new WhiteListUser
            {
                UserId = column[0],
                FirstName = column[1],
                LastName = column[2]
            })
            .ToList();

        return whtieListUsers;
    }
}