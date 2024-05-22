using Core.Contracts;

using Microsoft.EntityFrameworkCore;
using Persistence;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .CreateLogger();

builder.Logging.ClearProviders();
builder.Logging.AddSerilog(Log.Logger);

var env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
Log.Information($"====================================== bla");
Log.Information($"Api has been started in {env} mode");

// Add services to the container.
Log.Information("Configure Services for DI ...");

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
//ZUm Testen:



var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
connectionString = "Data Source=(localdb)\\MSSQLLocalDB;Initial Catalog=LeofeeDb;Integrated Security=True;";//muss nacher noch geï¿½ndert werden
Log.Information($"Api db connectionString: {connectionString}");

builder.Services
    .AddDbContext<ApplicationDbContext>(options =>
        options.UseSqlServer(connectionString))
    .AddScoped<IUnitOfWork, UnitOfWork>();

builder.Services.AddCors(options =>
{
    /*
    options.AddPolicy("AllowAllOrigins", b => b
        //.WithOrigins("http://localhost:4200")
        //.WithOrigins("http://49.12.203.83:8090")
        //.WithOrigins("http://leofee.samuelatzi.com")
        //.WithOrigins("http://leohoot.sophiehaider.com")
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials());*/
         options.AddPolicy("AllowAllOrigins",
        builder => builder.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();
app.UseRouting();
app.UseCors("AllowAllOrigins");

// Configure the HTTP request pipeline.
Log.Information("Service configuration complete, preparing request pipeline ...");

// NOTE: Swagger is now both enabled in Development and in Production mode!!
//if (app.Environment.IsDevelopment())
//{
app.UseSwagger();
app.UseSwaggerUI();
//}

//app.MapControllers();

//app.UseHttpsRedirection();
app.MapControllers();
app.UseAuthorization();



Log.Information("Starting up api service ...");

app.Run();