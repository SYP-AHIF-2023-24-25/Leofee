using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core
{
    public class Bon
    {
        public string studentID { get;  set; } = string.Empty;
        public string bonId { get; set; } = string.Empty;
        //Als Standardwert wird 0 gesetzt
        private double value { get; set; } = 0;
        private DateTime start;
        private DateTime end;
        public double usedValue { get; private set; } = 0;
        public Bon(string bonId,string studentId,double value, string dateTimeStart, string dateTimeEnd,double usedValue) {
            this.bonId = bonId;
            this.studentID = studentId;
            this.value = value;
            this.start = DateTime.Parse(dateTimeStart);
            this.end = DateTime.Parse(dateTimeEnd);
            this.usedValue = usedValue;
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
