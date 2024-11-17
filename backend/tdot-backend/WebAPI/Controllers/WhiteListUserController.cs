using Core.Contracts;
using Core.DataTransferObjects;
using Core.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
//using Serilog;
using System.ComponentModel.DataAnnotations;

namespace WebAPI.Controllers
{
	[Route("api/[controller]")]
	public class WhiteListUserController : Controller
	{
		private readonly IUnitOfWork _uow;

		public WhiteListUserController(IUnitOfWork uow)
		{
			_uow = uow;
		}

		[HttpGet]
		public async Task<IList<WhiteListUserDto>> GetAllWhiteListUsers()
		{
			return await _uow.WhiteListUserRepository.GetAllAsync();
		}

		[HttpGet("exists/{userId}")]
		public async Task<bool> CheckIfWhiteListUserExists(string userId)
		{
			return await _uow.WhiteListUserRepository.CheckIfUserExists(userId);
		}

		[HttpGet("{userId}")]
		public async Task<WhiteListUserDto> GetWhiteListUserPerUserId(string userId)
		{
			return await _uow.WhiteListUserRepository.GetWhiteListUserPerIdAsync(userId);
		}

		[HttpPost]
		public async Task<IActionResult> PostWhiteListUser([FromBody] WhiteListUserDto whiteListUser)
		{
			
			if (!ModelState.IsValid)
			{
				return BadRequest(ModelState);
			}
			var newWhiteListUser = new WhiteListUser
			{
				UserId = whiteListUser.UserId,
				FirstName = whiteListUser.FirstName,
				LastName = whiteListUser.LastName
			};

			if (await _uow.WhiteListUserRepository.CheckIfUserExists(whiteListUser.UserId))
			{
				return BadRequest($"User with id {whiteListUser.UserId} exits");
			}

			try
			{
				await _uow.WhiteListUserRepository.AddAsync(newWhiteListUser);
				await _uow.SaveChangesAsync();
			}
			catch (ValidationException e)
			{
				return BadRequest($"data base error: {e.InnerException!.Message}");
			}
			catch (DbUpdateException dbException)
			{
				return BadRequest($"data base error: {dbException.InnerException!.Message}");
			}
			return CreatedAtRoute(new { id = newWhiteListUser.UserId }, newWhiteListUser);
		}

		[HttpDelete("{userId}")]
		public async Task<IActionResult> DeleteWhiteListUser(string userId)
		{
			bool check = await _uow.WhiteListUserRepository.CheckIfUserExists(userId);
			if (!check)
			{
				return NotFound("User does not exits");
			}
			WhiteListUserDto whiteListUser = await _uow.WhiteListUserRepository.GetWhiteListUserPerIdAsync(userId);
			WhiteListUser deletedUser = new WhiteListUser
			{
				UserId = whiteListUser.UserId,
				FirstName = whiteListUser.FirstName,
				LastName = whiteListUser.LastName
			};
			_uow.WhiteListUserRepository.Remove(deletedUser);
			await _uow.SaveChangesAsync();

			return Accepted($"User {userId} deleted");
		}
	}
}
