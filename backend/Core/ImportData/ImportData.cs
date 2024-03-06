using Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Threading.Tasks.Sources;

namespace ImportData
{
    public class DataController
    {
        
        public static List<Bon> importBons(string path)
        {
            /*
             
             StudentID;VoucherValue;StartDate;EndDate
             */
            var lines = File.ReadAllLines(path).Skip(1).ToList();
            var bons = lines
                .Select(l => l.Split(';'))
                .Select(bons => new Bon(bons[0], double.Parse(bons[1])))
                .ToList();
            return bons;
        }
        public static List<Student> importStudents(string studentPath)
        {
            /*
             Firstname;Lastname;Class;Password;Email
            (string firstname, string lastname,string password,string email, string schoolClass)
             */
            var lines = File.ReadAllLines(studentPath).Skip(1).ToList();
            var students = lines
                .Select(l => l.Split(';'))
                .Select(student => new Student(student[0], student[1],student[3],student[4],student[2]))
                .ToList();            
            return students;
        }
    }
}
