using Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ImportConsole
{
    public class ImportData
    {
        public List<Bon> Bons { get; set; } = [];
        public List<Student> Students { get; set; } = [];
        public List<StudentBonTransaction> StudentBonTransactions { get; set; } = [];
    }
}