using Base.Core.Contracts;
using Core.DataTransferObjects;
using Core.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Contracts
{
	public interface IWhiteListUserRepository : IGenericRepository<WhiteListUser>
	{
		Task<IList<WhiteListUserDto>> GetAllAsync();
		Task<WhiteListUserDto> GetWhiteListUserPerIdAsync(string userId);
		//Task GetWhiteListUserPerUsernameAsync(string firstName, string lastName);
		Task<bool> CheckIfUserExists(string userId);
	}
}
