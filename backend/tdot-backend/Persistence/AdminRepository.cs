using Base.Persistence;
using Core.Contracts;
using Core.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Persistence
{
    public class AdminRepository : GenericRepository<Admin>, IAdminRepository
    {
        private readonly ApplicationDbContext _dbContext;
        public AdminRepository(ApplicationDbContext dbContext) : base(dbContext)
        {
            _dbContext = dbContext;
        }
    }
}
