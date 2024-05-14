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
        public string id { get; set; } = string.Empty;
        public string firstname { get; set; } = string.Empty;
        public string lastname { get; set; } = string.Empty;
        public string password { get; set; } = string.Empty;
        public string email { get; set; } = string.Empty;
        public string schoolClass { get; set; } = string.Empty;
        

        public Student(string id,string firstname, string lastname,string password,string email, string schoolClass)
        {
            
            this.id = id;
            this.firstname = firstname;
            this.lastname = lastname;
            this.password = password;
            this.email = email;
            this.schoolClass = schoolClass;

        }
        
       

    }
    
}
