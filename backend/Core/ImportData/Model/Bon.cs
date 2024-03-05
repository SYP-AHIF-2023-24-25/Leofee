using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ImportData.Model
{
    public class Bon
    {
        private int studentID = 0;
        private double value  = 0;
        private DateTime start;
        private DateTime end;
        public Bon(int studentId,double value) {
            this.studentID = studentId;
            this.value = value;
        }
    }
}
