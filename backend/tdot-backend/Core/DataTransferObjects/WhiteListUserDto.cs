using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.DataTransferObjects
{
	public record WhiteListUserDto(string UserId, string FirstName, string LastName);
}
