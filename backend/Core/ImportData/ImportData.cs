using Core;
using MySql.Data.MySqlClient;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Threading.Tasks.Sources;
using System.Security.Cryptography;

namespace ImportData
{
    public class DataController
    {
        public static string GenerateSHA256Hash(string input)
        {
            using (SHA256 sha256 = SHA256.Create())
            {
                byte[] bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(input));
                StringBuilder builder = new StringBuilder();

                for (int i = 0; i < bytes.Length; i++)
                {
                    builder.Append(bytes[i].ToString("x2"));
                }

                return builder.ToString();
            }
        }
        public static List<Bon> importBons()
        {
            List<Bon> bonList = new List<Bon>();

            string connStr = "server=flr.h.filess.io;user=Leofee_rollshowam;database=Leofee_rollshowam;port=3307;password=89ff40891b7ecf236aa06e6da9f07be68be04447";
            MySqlConnection conn = new MySqlConnection(connStr);
            try
            {
                conn.Open();
                Console.WriteLine("Connecting to MySQL...");
                string selectAllBonsQuery = "SELECT * FROM Bon";
                MySqlCommand selectAllBonsCmd = new MySqlCommand(selectAllBonsQuery, conn);
                MySqlDataReader bonReader = selectAllBonsCmd.ExecuteReader();

                while (bonReader.Read())
                {
                    string bonId = bonReader["bonId"].ToString();
                    string studentId = bonReader["studentId"].ToString();
                    double value = Convert.ToDouble(bonReader["Value"]);
                    string startTime = bonReader["startTime"].ToString();
                    string endTime = bonReader["endTime"].ToString();
                    double usedValue = Convert.ToDouble(bonReader["usedValue"]);

                    Bon bon = new Bon(bonId, studentId, value, startTime, endTime, usedValue);
                    bonList.Add(bon);
                }

                bonReader.Close();
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
            }

            conn.Close();

            return bonList;
        }
        public static List<Student> importStudents()
        {
            List<Student> studentList = new List<Student>();

            string connStr = "server=flr.h.filess.io;user=Leofee_rollshowam;database=Leofee_rollshowam;port=3307;password=89ff40891b7ecf236aa06e6da9f07be68be04447";
            MySqlConnection conn = new MySqlConnection(connStr);
            try
            {
                conn.Open();
                Console.WriteLine("Connecting to MySQL...");
                string selectAllStudentsQuery = "SELECT * FROM Student";
                MySqlCommand selectAllStudentsCmd = new MySqlCommand(selectAllStudentsQuery, conn);
                MySqlDataReader studentReader = selectAllStudentsCmd.ExecuteReader();

                while (studentReader.Read())
                {
                    string id = studentReader["studentId"].ToString();
                    string firstname = studentReader["Firstname"].ToString();
                    string lastname = studentReader["Lastname"].ToString();
                    string password = GenerateSHA256Hash(studentReader["Passwort"].ToString());
                    string schoolClass = studentReader["Class"].ToString();
                    string email = studentReader["Email"].ToString();
                    Student student = new Student(id,firstname,lastname,password,email,schoolClass);
                    studentList.Add(student);
                }

                studentReader.Close();


                conn.Close();

            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
            }

            conn.Close();

            return studentList;
        }
    }
}
