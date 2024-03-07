using Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ImportData
{
    public class Controller
    {
        public static List<Bon> getBonsForStudent(string studentId, List<Bon> allBons, List<Student> allStudents)
        {
            var bonsForStudent = allBons
                .Select(bon => bon)
                .Where(bon => bon.studentID == studentId)
                .ToList();


            return bonsForStudent;
        }
        public static double getBalanceFromAllBons(List<Bon> bonsFromStudent)
        {
            var balance = bonsFromStudent
                .Sum(bon => bon.value);
            return balance;
        }
    }
}
