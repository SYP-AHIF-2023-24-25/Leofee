using Core;
using MySql.Data.MySqlClient;
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
                .Sum(bon => bon.getBonValue());
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
        public static bool Pay(List<Bon> validBons, double amountToDeduct)
        {
                        string connStr = "server=flr.h.filess.io;user=Leofee_rollshowam;database=Leofee_rollshowam;port=3307;password=89ff40891b7ecf236aa06e6da9f07be68be04447";
            MySqlConnection conn = new MySqlConnection(connStr);
            try
            {
                conn.Open();
                var fullValue = validBons
                .Sum(bon => bon.getBonValue());
                if (amountToDeduct > fullValue)
                {
                    return false;
                }
                var orderedBons = validBons
                    .OrderBy(bon => bon.getBonEnd())
                    .ToList();
                foreach (var bon in orderedBons.TakeWhile(bon => amountToDeduct > 0))
                {
                    double deductionAmount = Math.Min(amountToDeduct, bon.getBonValue());
                    bon.pay(deductionAmount);
                    amountToDeduct -= deductionAmount;
                    string updateQuery = "UPDATE Bon SET usedValue = usedValue + @deductionAmount WHERE bonId = @bonId";


                    //
                    MySqlCommand updateCommand = new MySqlCommand(updateQuery, conn);
                    updateCommand.Parameters.AddWithValue("@deductionAmount", deductionAmount);
                    updateCommand.Parameters.AddWithValue("@bonId", bon.bonId);
                    updateCommand.ExecuteNonQuery();

                    // Value des Bons in der Datenbank aktualisieren
                    string updateValueQuery = "UPDATE Bon SET Value = Value - @deductionAmount WHERE bonId = @bonId";
                    MySqlCommand updateValueCommand = new MySqlCommand(updateValueQuery, conn);
                    updateValueCommand.Parameters.AddWithValue("@deductionAmount", deductionAmount);
                    updateValueCommand.Parameters.AddWithValue("@bonId", bon.bonId);
                    updateValueCommand.ExecuteNonQuery();
                }
                
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
            }

            conn.Close();
            return true;
        }
    }
}
