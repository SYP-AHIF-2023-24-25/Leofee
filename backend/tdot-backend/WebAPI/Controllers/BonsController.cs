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
public class BonsController : Controller
{
    private readonly IUnitOfWork _uow;
    
    public BonsController(IUnitOfWork uow)
    {
        _uow = uow;
    }

    [HttpGet]
    public async Task<ActionResult<IList<BonDto>>> GetAllBons()
    {
        try
        {
            var bons = await _uow.BonRepository.GetAllAsync();
            return Ok(bons);
        }
        catch (Exception ex)
        {
             return BadRequest($"data base error: {ex.InnerException!.Message}");
            throw;
        }
        
       
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<BonDto?>> GetBonById(int id)
    { 
        var bon = await _uow.BonRepository.GetBonWithIdAsync(id);
        if (bon == null)
        {
            return NotFound();
        }
        return Ok(bon);
    }

    [HttpPost]
    public async Task<IActionResult> CreateBon([FromBody] BonCreateDto bonDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }
        var newBon = new Bon
        {
            AmountPerStudent = bonDto.AmountPerStudent,
            StartDate = bonDto.StartDate,
            EndDate = bonDto.EndDate,
            BonTransactions = []
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
       
        try
        {
            await _uow.BonRepository.UpdateBonsWithIdAsync(id, bonDto);
        }
        catch (Exception e)
        {
            //Log.Error(e, "Error while updating a bon");
            return BadRequest($"data base error: {e.InnerException!.Message}");
        }
        return Ok();
    }
}