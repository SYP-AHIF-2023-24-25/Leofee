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
        public static List<Bon> getValidBonsForStudent(string studentId, List<Bon> allBons, List<Student> allStudents,DateTime current)
        {
            var bons = getBonsForStudent(studentId, allBons, allStudents);
            var validBons = getValidBons(bons, current);
            return validBons;
        }
        public static List<Bon> getValidBons(List<Bon> bons, DateTime current)
        {
            var validBons = bons
                .Where(bon => bon.getBonStart() <= current && bon.getBonEnd() >= current)
                .ToList();

            return validBons;
        }
        public static void Pay(List<Bon> validBons, double amountToDeduct)
        {
            var orderedBons = validBons
                .OrderBy(bon => bon.getBonEnd())
                .ToList();
            foreach (var bon in orderedBons.TakeWhile(bon => amountToDeduct > 0))
            {
                double deductionAmount = Math.Min(amountToDeduct, bon.getBonValue());
                bon.pay(deductionAmount);
                amountToDeduct -= deductionAmount;
            }

        }
    }
}
