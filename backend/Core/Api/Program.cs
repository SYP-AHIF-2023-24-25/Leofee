
using Core;
using Microsoft.AspNetCore.Http.HttpResults;
using System.Runtime.CompilerServices;

string bonsPath = @"./bons.txt";
string personsPath = @"./personal.txt";


var students = ImportData.DataController.importStudents(personsPath);
var bons = ImportData.DataController.importBons(bonsPath);

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


app.MapGet("/students", () =>
{
    //var ids = students.Select(student => student.id).ToList();
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
app.MapGet("student/{studentString}/getId", (string studentString) =>
{
    string studentId = Student.GenerateSHA256Hash(studentString);
    return studentId;
});
app.MapPost("/student/{id}/pay/{value}", (string id, double value) =>
{
    ImportData.Controller.Pay(bons, value);
});

app.MapDelete("/student/{id}", (string id) =>
{
    
});


app.Run();
