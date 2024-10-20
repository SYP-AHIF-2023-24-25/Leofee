using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers;

using System.Collections;
using System.ComponentModel.DataAnnotations;
using Core.Contracts;
using Core.DataTransferObjects;
using Core.Entities;
using Humanizer;
using Microsoft.EntityFrameworkCore;
//using Serilog;

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
        //Log.Information("GetAllBons called ");
        return await _uow.BonRepository.GetAllAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<BonDto?>> GetBonById(int id)
    { 
        var bonEntity = await _uow.BonRepository.GetBonWithIdAsync(id);
        if (bonEntity == null)
        {
            return NotFound();
        }
        return new BonDto(bonEntity.Id,bonEntity.StudentId,bonEntity.From,bonEntity.To,bonEntity.UsedValue,bonEntity.Value);
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
            //Log.Error(e, "Error while adding a new bon");
            return BadRequest($"data base error: {e.InnerException!.Message}");
        }
        catch (DbUpdateException dbException)
        {
            //Log.Error(dbException, "Error while adding a new bon");
            return BadRequest($"data base error: {dbException.InnerException!.Message}");
        }
        return CreatedAtRoute(new { id = newBon.Id }, newBon);
    }

    

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateBon(int id, [FromBody] BonUpdateDto bonDto)
    {
        //Log.Information("Update Bon called with id: {id}, Bon: {@bon}", id, bon);
        
        if (id != bonDto.Id)
        {
            return BadRequest($"Invalid Ids in client request");
        }
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }
        
        try
        {
            await _uow.BonRepository.UpdateBonsWithIdAsync(id,bonDto);
        }
        catch (Exception e)
        {
            //Log.Error(e, "Error while updating a bon");
            return BadRequest($"data base error: {e.InnerException!.Message}");
        }
        return Ok();
    }
}