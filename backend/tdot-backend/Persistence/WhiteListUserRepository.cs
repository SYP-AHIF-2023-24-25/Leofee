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
    public class WhiteListUserRepository : GenericRepository<WhiteListUser>, IWhiteListUserRepository
    {
        private readonly DbContext _dbContext;
        public WhiteListUserRepository(DbContext dbContext) : base(dbContext)
        {
            _dbContext = dbContext;
        }
    }
}
