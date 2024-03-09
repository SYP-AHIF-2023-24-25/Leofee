using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Security.Cryptography;
using System.Collections;
namespace Core
{
    public class Student
    {
        public string id { get; private set; } = string.Empty;
        public string firstname { get; set; } = string.Empty;
        public string lastname { get; set; } = string.Empty;
        private string password { get; set; } = string.Empty;
        public string email { get; set; } = string.Empty;
        public string schoolClass { get; set; } = string.Empty;
        

        public Student(string firstname, string lastname,string password,string email, string schoolClass)
        {
            string idString = firstname + lastname + password;
            //wird noch geändert if.....
            this.id = GenerateSHA256Hash(idString);
            this.firstname = firstname;
            this.lastname = lastname;
            this.password = password;
            this.email = email;
            this.schoolClass = schoolClass;

        }
        static string GenerateSHA256Hash(string input)
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
       

    }
    
}
