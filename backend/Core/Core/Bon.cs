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
        private double value { get; set; } = 0;
        private DateTime start;
        private DateTime end;
        private double usedValue { get; set; } = 0;
        public Bon(string studentId,double value, string dateTimeStart, string dateTimeEnd) {
            this.studentID = studentId;
            this.value = value;
            this.start = DateTime.Parse(dateTimeStart);
            this.end = DateTime.Parse(dateTimeEnd);
        }
        public DateTime getBonStart()
        {
            return this.start;
        }
        public DateTime getBonEnd()
        {
            return this.end;
        }
        public double getBonValue()
        {
            return value;
        }
        public void pay(double worth)
        {
            this.value -= worth;
            this.usedValue += worth;            
        }
    }
}
