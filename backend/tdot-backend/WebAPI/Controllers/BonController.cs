using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers;

using System.Collections;
using System.ComponentModel.DataAnnotations;
using Core.Contracts;
using Core.DataTransferObjects;
using Core.Entities;
using Microsoft.EntityFrameworkCore;
using Serilog;

[Route("api/[controller]")]
public class BonController : Controller
{
    private readonly IUnitOfWork _uow;
    
    public BonController(IUnitOfWork uow)
    {
        _uow = uow;
    }

    [HttpGet]
    public async Task<IList<BonDto>> GetAllBons()
    {
        Log.Information("GetAllBons called ");
        return await _uow.BonRepository.GetAllAsync();
    }

    [HttpGet("bon/{id}")]
    public async Task<ActionResult<BonDto?>> GetBonById(int id)
    { 
        var bonEntity = await _uow.BonRepository.GetBonWithIdAsync(id);
        if (bonEntity == null)
        {
            return NotFound();
        }
        return new BonDto(bonEntity.Id,bonEntity.StudentId,bonEntity.From,bonEntity.To,bonEntity.UsedValue,bonEntity.Value);
    }
    
    public class BonCreateDto
    {
        public required string StudentId { get; set; }
        public required DateTime From { get; set; }
        public required DateTime To { get; set; }
        public required double  Value { get; set; }
    }

    [HttpPost]
    public async Task<IActionResult> CreateBon([FromBody] BonCreateDto bon)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }
        var newBon = new Bon
        {
            StudentId = bon.StudentId,
            EndDate = bon.To,
            StartDate = bon.From,
            UsedValue = 0,
            Value = bon.Value
        };
        try
        {
            await _uow.BonRepository.AddAsync(newBon);
            await _uow.SaveChangesAsync();
        }
        catch (ValidationException e)
        {            
            Log.Error(e, "Error while adding a new bon");
            return BadRequest($"data base error: {e.InnerException!.Message}");
        }
        catch (DbUpdateException dbException)
        {
            Log.Error(dbException, "Error while adding a new bon");
            return BadRequest($"data base error: {dbException.InnerException!.Message}");
        }
        return CreatedAtRoute(new { id = newBon.Id }, newBon);
    }

    public class BonUpdateDto : BonCreateDto
    {
        public int Id { get; set; }
    }   

    /*
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateCustomer(int id, [FromBody] CustomerUpdateDto customer)
    {
        Log.Information("UpdateCustomer called with id: {id}, customer: {@customer}", id, customer);
        // client data consistent?
        if (id != customer.Id)
        {
            return BadRequest($"Invalid Ids in client request");
        }

        // client data valid?
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // customer exists?
        var customerEntity = await _uow.CustomerRepository.GetByIdAsync(id);
        if (customerEntity == null)
        {
            return NotFound($"There exists no customer with id ${id}!");
        }

        // update customer
        customerEntity.FirstName = customer.FirstName;
        customerEntity.LastName = customer.LastName;
        customerEntity.Email = customer.Email;
        customerEntity.Iban = customer.Iban;
        try
        {
            await _uow.SaveChangesAsync();
        }
        catch (Exception e)
        {
            Log.Error(e, "Error while updating a customer");
            return BadRequest($"data base error: {e.InnerException!.Message}");
        }
        return Ok();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCustomer(int id)
    {
        var customerEntity = await _uow.CustomerRepository.GetByIdAsync(id);
        if (customerEntity == null)
        {
            return NotFound($"There exists no customer with id ${id}!");
        }
        _uow.CustomerRepository.Remove(customerEntity);
        await _uow.SaveChangesAsync();
        return NoContent();
    }
    */
}