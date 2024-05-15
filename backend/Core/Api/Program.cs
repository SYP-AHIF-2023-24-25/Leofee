
using Core;
using Microsoft.AspNetCore.Http.HttpResults;
using System.Diagnostics.CodeAnalysis;
using System.Runtime.CompilerServices;




var students = ImportData.DataController.importStudents();
var bons = ImportData.DataController.importBons();

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.UseCors(policy => policy
    .WithOrigins("http://localhost:4200") // Hier geben Sie die Origin Ihrer Angular-Anwendung an
    .AllowAnyMethod()
    .AllowAnyHeader());

app.MapGet("/students", () =>
{
    
    return Results.Ok(students);
});
app.MapGet("/students/{id}", (string id) =>
{
    var studentForId = students
                        .SingleOrDefault(student => student.id == id);
    if(studentForId == null)
    {
        return Results.NotFound();
    }
    return Results.Ok(studentForId);
});
app.MapGet("/student/{id}/balance", (string id) =>
{
    var bonsForStudent = ImportData.Controller.getValidBonsForStudent(id, bons, students,DateTime.Now);
    var balanceForStudent = ImportData.Controller.getBalanceFromAllBons(bonsForStudent);
    return Results.Ok(balanceForStudent);
});
app.MapPost("/student/{id}/pay/{value}", (string id, double value) =>
{
    var bonsForStudent = ImportData.Controller.getValidBonsForStudent(id,bons,students,DateTime.Now);
    var finishedResult = ImportData.Controller.Pay(bonsForStudent, value);
    if (finishedResult == false)
    {
        return Results.BadRequest();

    }
    bons = ImportData.DataController.importBons();
    return Results.Ok();
});
app.MapPost("/student/{creationString}", (string creationString) =>
{
    var result = ImportData.Controller.addStudent(creationString);
    if (result == false)
    {
        return Results.Problem();   

    }
    students = ImportData.DataController.importStudents();
    return Results.Ok();
});

app.MapDelete("/student/{id}", (string id) =>
{
    var result = ImportData.Controller.deleteStudent(int.Parse(id));
    if (result == false)
    {
        return Results.Problem();

    }
    students = ImportData.DataController.importStudents();
    return Results.Ok();
});
app.MapPost("/bon/{creationString}", (string creationString) =>
{
    var result = ImportData.Controller.addBon(creationString);
    if (result == false)
    {
        return Results.Problem();

    }
    bons = ImportData.DataController.importBons();
    return Results.Ok();
});

app.MapDelete("/bon/{id}", (string id) =>
{
    var result = ImportData.Controller.deleteBon(int.Parse(id));
    if (result == false)
    {
        return Results.Problem();

    }
    bons = ImportData.DataController.importBons();
    return Results.Ok();
});

app.Run();
