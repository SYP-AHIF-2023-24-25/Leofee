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

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
connectionString = "Server=localhost;Database=tdot;Uid=root;Pwd=Abcdefg1;";//muss nacher noch geändert werden
Log.Information($"Api db connectionString: {connectionString}");

builder.Services
    .AddDbContext<ApplicationDbContext>(options =>
        options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)))
    .AddScoped<IUnitOfWork, UnitOfWork>();

var app = builder.Build();

// Configure the HTTP request pipeline.
Log.Information("Service configuration complete, preparing request pipeline ...");

// NOTE: Swagger is now both enabled in Development and in Production mode!!
//if (app.Environment.IsDevelopment())
//{
app.UseSwagger();
app.UseSwaggerUI();
//}

app.MapControllers();

//app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

Log.Information("Starting up api service ...");

app.Run();
