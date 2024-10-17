using Base.Persistence;
using Core.Contracts;
using Core.DataTransferObjects;
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
        private readonly ApplicationDbContext _dbContext;
        public WhiteListUserRepository(ApplicationDbContext dbContext) : base(dbContext)
        {
            _dbContext = dbContext;
        }

		public async Task<bool> CheckIfUserExists(string userId)
		{
			return await _dbContext.WhiteListUsers!.AnyAsync(user => user.UserId == userId);
		}

		public async Task<IList<WhiteListUserDto>> GetAllAsync()
		{
			var users = await _dbContext.WhiteListUsers!
				.Select(user => new WhiteListUserDto(
					user.UserId,
					user.FirstName,
					user.LastName))
				.ToListAsync();
			return users;
		}

		public async Task<WhiteListUserDto> GetWhiteListUserPerIdAsync(string userId)
		{
			return await _dbContext.WhiteListUsers!
				.Where(u => u.UserId == userId)
				.Select(user => new WhiteListUserDto(
					user.UserId,
					user.FirstName,
					user.LastName))
				.FirstAsync();

		}
	}
}
