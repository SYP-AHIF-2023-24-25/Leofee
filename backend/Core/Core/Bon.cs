using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core
{
    public class Bon
    {
        public string studentID { get; private set; } = string.Empty;
        public double value { get; private set; } = 0;
        private DateTime start;
        private DateTime end;
        public Bon(string studentId,double value) {
            this.studentID = studentId;
            this.value = value;
        }
    }
}
