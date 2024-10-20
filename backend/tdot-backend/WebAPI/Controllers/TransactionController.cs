using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers;

using System.Collections;
using System.ComponentModel.DataAnnotations;
using Core.Contracts;
using Core.DataTransferObjects;
using Core.Entities;
using Microsoft.EntityFrameworkCore;
//using Serilog;

[Route("api/[controller]")]
public class TransactionController : Controller
{
    private readonly IUnitOfWork _uow;
    
    public TransactionController(IUnitOfWork uow)
    {
        _uow = uow;
    }

    [HttpGet]
    public async Task<IList<TransactionDto>> GetAllTransactions()
    {
        
        return await _uow.TransactionRepository.GetAllTransactionsAsync();
    }

    [HttpPost]
    public async Task<IActionResult> AddTransaction([FromBody] TransactionCreationDto transaction)
    {
         if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var newTransaction = new Transaction
        {
            TransactionTime = transaction.TransactionTime,
            Value = transaction.Value,
            AmountOfBon = transaction.AmountOfBon
        };

        try
        {
            await _uow.TransactionRepository.AddTransactionAsync(transaction);
            //await _uow.SaveChangesAsync();
            return CreatedAtAction(nameof(GetAllTransactions), new { id = newTransaction.Id }, transaction);
        }
        catch (Exception )
        {
            // Log the exception (e) here as needed
            
            return StatusCode(500, "Internal server error");
        }
    }
}