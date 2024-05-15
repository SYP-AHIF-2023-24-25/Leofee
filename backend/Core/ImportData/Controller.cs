using Core;
using MySql.Data.MySqlClient;
using System.Globalization;

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
        public static List<Bon> getValidBonsForStudent(string studentId, List<Bon> allBons, List<Student> allStudents, DateTime current)
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
        //input string: firstname;lastname;password;class;email
        public static bool addStudent(string inputString)
        {
            var parts = inputString.Split(';');
            string firstname = parts[0];
            string lastname = parts[1];
            string password = parts[2];
            string schoolClass = parts[3];
            string email = parts[4];
            string connStr = "server=flr.h.filess.io;user=Leofee_rollshowam;database=Leofee_rollshowam;port=3307;password=89ff40891b7ecf236aa06e6da9f07be68be04447";
            try
            {
                using (MySqlConnection conn = new MySqlConnection(connStr))
                {
                    conn.Open();
                    Console.WriteLine("Try to Insert new Student:");
                    string insertStudentQueryFromFile = "INSERT INTO Student (Firstname, Lastname, Passwort, Class, Email) VALUES (@Firstname, @Lastname, @Passwort, @Class, @Email)";
                    MySqlCommand insertStudentCmdFromFile = new MySqlCommand(insertStudentQueryFromFile, conn);
                    insertStudentCmdFromFile.Parameters.AddWithValue("@Firstname", firstname);
                    insertStudentCmdFromFile.Parameters.AddWithValue("@Lastname", lastname);
                    insertStudentCmdFromFile.Parameters.AddWithValue("@Passwort", password);
                    insertStudentCmdFromFile.Parameters.AddWithValue("@Class", schoolClass);
                    insertStudentCmdFromFile.Parameters.AddWithValue("@Email", email);
                    insertStudentCmdFromFile.ExecuteNonQuery();
                    Console.WriteLine("Insertion completed.");
                    conn.Close();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("An error occurred: " + ex.Message);
                return false;
            }
            return true;
        }
        public static bool deleteStudent(int studentId)
        {


            string connStr = "server=flr.h.filess.io;user=Leofee_rollshowam;database=Leofee_rollshowam;port=3307;password=89ff40891b7ecf236aa06e6da9f07be68be04447";
            try
            {
                using (MySqlConnection conn = new MySqlConnection(connStr))
                {
                    conn.Open();
                    Console.WriteLine("Try to Insert new Student:");
                    string deleteStudentQuery = "DELETE FROM Student WHERE studentId = @StudentId";
                    MySqlCommand deleteStudentCmd = new MySqlCommand(deleteStudentQuery, conn);
                    deleteStudentCmd.Parameters.AddWithValue("@StudentId", studentId);
                    deleteStudentCmd.ExecuteNonQuery();
                    Console.WriteLine("Insertion completed.");
                    conn.Close();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("An error occurred: " + ex.Message);
                return false;
            }
            return true;
        }
        //
        public static bool addBon(string inputString)
        {
            //studentId;startTime;endTime;usedValue;Value
            var parts = inputString.Split(';');
            string studentId = parts[0];
            string startTime= parts[1];
            string endTime= parts[2];
            string usedValue = parts[3];
            string Value = parts[4];
            string connStr = "server=flr.h.filess.io;user=Leofee_rollshowam;database=Leofee_rollshowam;port=3307;password=89ff40891b7ecf236aa06e6da9f07be68be04447";
            try
            {
                using (MySqlConnection conn = new MySqlConnection(connStr))
                {
                    conn.Open();
                    Console.WriteLine("Try to Insert new Student:");
                    string insertBonQueryFromFile = "INSERT INTO Bon (studentId,Value, startTime, endTime, usedValue) VALUES (@studentId, @Value, @startTime, @endTime, @usedValue)";
                    MySqlCommand insertBonCmdFromFile = new MySqlCommand(insertBonQueryFromFile, conn);
                    insertBonCmdFromFile.Parameters.AddWithValue("@studentId", decimal.Parse(studentId));
                    insertBonCmdFromFile.Parameters.AddWithValue("@Value", decimal.Parse(Value, CultureInfo.InvariantCulture));
                    insertBonCmdFromFile.Parameters.AddWithValue("@startTime", DateTime.Parse(startTime));
                    insertBonCmdFromFile.Parameters.AddWithValue("@endTime", DateTime.Parse(endTime));
                    insertBonCmdFromFile.Parameters.AddWithValue("@usedValue", 0); // Assuming initial used value is 0
                    insertBonCmdFromFile.ExecuteNonQuery();
                    conn.Close();
                }
                Console.WriteLine("Insertion completed.");
                    
                
            }
            catch (Exception ex)
            {
                Console.WriteLine("An error occurred: " + ex.Message);
                return false;
            }
            return true;
        }
        public static bool deleteBon(int bonId)
        {
            string connStr = "server=flr.h.filess.io;user=Leofee_rollshowam;database=Leofee_rollshowam;port=3307;password=89ff40891b7ecf236aa06e6da9f07be68be04447";
            try
            {
                using (MySqlConnection conn = new MySqlConnection(connStr))
                {
                    conn.Open();
                    string deleteStudentQuery = "DELETE FROM Bon WHERE bonId = @BonId";
                    MySqlCommand deleteStudentCmd = new MySqlCommand(deleteStudentQuery, conn);
                    deleteStudentCmd.Parameters.AddWithValue("@BonId", bonId);
                    deleteStudentCmd.ExecuteNonQuery();
                    conn.Close();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("An error occurred: " + ex.Message);
                return false;
            }
            return true;
        }
        //
        public static bool deleteBonsForStudent(int studentId)
        {
            string connStr = "server=flr.h.filess.io;user=Leofee_rollshowam;database=Leofee_rollshowam;port=3307;password=89ff40891b7ecf236aa06e6da9f07be68be04447";
            try
            {
                using (MySqlConnection conn = new MySqlConnection(connStr))
                {
                    conn.Open();
                    string deleteStudentQuery = "DELETE FROM Bon WHERE studentId = @StudentId";
                    MySqlCommand deleteStudentCmd = new MySqlCommand(deleteStudentQuery, conn);
                    deleteStudentCmd.Parameters.AddWithValue("@StudentId", studentId);
                    deleteStudentCmd.ExecuteNonQuery();
                    conn.Close();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("An error occurred: " + ex.Message);
                return false;
            }
            return true;
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
