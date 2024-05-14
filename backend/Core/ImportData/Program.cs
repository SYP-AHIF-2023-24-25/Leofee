using System;
using System.IO;
using System.Globalization;
using MySql.Data.MySqlClient;

public class MySQL
{
    public static void Main()
    {
        string connStr = "server=flr.h.filess.io;user=Leofee_rollshowam;database=Leofee_rollshowam;port=3307;password=89ff40891b7ecf236aa06e6da9f07be68be04447";

        try
        {
            using (MySqlConnection conn = new MySqlConnection(connStr))
            {
                conn.Open();

                
                Console.WriteLine("Try to Insert new Student:");                

                // Hier kommt der Code zum Einlesen der Daten aus der "personal.txt" Datei und Einfügen in die Datenbank
                string filePath = "personal.txt";
                /*using (StreamReader sr = new StreamReader(filePath))
                {
                    string line;
                    while ((line = sr.ReadLine()) != null)
                    {
                        string[] data = line.Split(';');

                        string insertStudentQueryFromFile = "INSERT INTO Student (Firstname, Lastname, Passwort, Class, Email) VALUES (@Firstname, @Lastname, @Passwort, @Class, @Email)";
                        MySqlCommand insertStudentCmdFromFile = new MySqlCommand(insertStudentQueryFromFile, conn);
                        insertStudentCmdFromFile.Parameters.AddWithValue("@Firstname", data[0]);
                        insertStudentCmdFromFile.Parameters.AddWithValue("@Lastname", data[1]);
                        insertStudentCmdFromFile.Parameters.AddWithValue("@Passwort", data[3]);
                        insertStudentCmdFromFile.Parameters.AddWithValue("@Class", data[2]);
                        insertStudentCmdFromFile.Parameters.AddWithValue("@Email", data[4]);
                        insertStudentCmdFromFile.ExecuteNonQuery();
                    }
                }
                */
                Console.WriteLine("Insertion completed.");
                Console.WriteLine("Try to Insert new Bons:");

                // Hier kommt der Code zum Einlesen der Daten aus der "bons.txt" Datei und Einfügen in die Datenbank
                filePath = "bons.txt";
                using (StreamReader sr = new StreamReader(filePath))
                {
                    string line;
                    while ((line = sr.ReadLine()) != null)
                    {
                        string[] data = line.Split(';');

                        string insertBonQueryFromFile = "INSERT INTO Bon (studentId,Value, startTime, endTime, usedValue) VALUES (@studentId, @Value, @startTime, @endTime, @usedValue)";
                        MySqlCommand insertBonCmdFromFile = new MySqlCommand(insertBonQueryFromFile, conn);
                        insertBonCmdFromFile.Parameters.AddWithValue("@studentId", decimal.Parse(data[0]));
                        insertBonCmdFromFile.Parameters.AddWithValue("@Value", decimal.Parse(data[1], CultureInfo.InvariantCulture));
                        insertBonCmdFromFile.Parameters.AddWithValue("@startTime", DateTime.Parse(data[2]));
                        insertBonCmdFromFile.Parameters.AddWithValue("@endTime", DateTime.Parse(data[3]));
                        insertBonCmdFromFile.Parameters.AddWithValue("@usedValue", 0); // Assuming initial used value is 0
                        insertBonCmdFromFile.ExecuteNonQuery();
                    }
                }

                Console.WriteLine("Insertion completed.");
                conn.Close();
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine("An error occurred: " + ex.Message);
        }
    }
}
