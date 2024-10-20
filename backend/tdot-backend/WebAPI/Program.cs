using Core.Contracts;

using Microsoft.EntityFrameworkCore;
using Persistence;
//using Serilog;

var builder = WebApplication.CreateBuilder(args);

/*Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .CreateLogger();*/

//builder.Logging.ClearProviders();
//builder.Logging.AddSerilog(Log.Logger);

var env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
//Log.Information($"====================================== bla");
//Log.Information($"Api has been started in {env} mode");

// Add services to the container.
//Log.Information("Configure Services for DI ...");

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
//ZUm Testen:

builder.Services.AddCors(options =>
{
    /*
    options.AddPolicy("AllowAllOrigins", b => b
        //.WithOrigins("http://localhost:4200")
        //.WithOrigins("http://49.12.203.83:8090")
        //.WithOrigins("http://leofee.samuelatzi.com")
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials());*/
    options.AddPolicy("AllowAllOrigins",
   builder => builder.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
//connectionString = "server=127.0.0.1;Port=3306;Database=db;user=root;password=password;";//muss nacher noch geï¿½ndert werden
Console.WriteLine($"Api db connectionString: {connectionString}");

builder.Services
    .AddDbContext<ApplicationDbContext>(options =>
        options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)))
    .AddScoped<IUnitOfWork, UnitOfWork>();


var app = builder.Build();
app.UseRouting();
app.UseCors("AllowAllOrigins");

// Configure the HTTP request pipeline.
//Log.Information("Service configuration complete, preparing request pipeline ...");
//var basePath = "";
// NOTE: Swagger is now both enabled in Development and in Production mode!!
if (app.Environment.IsDevelopment() || app.Environment.IsProduction())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
/*else{
    basePath = "/leofee-backend";
    app.UsePathBase(basePath + "/");
}*/

//app.MapControllers();

//app.UseHttpsRedirection();
app.MapControllers();
app.UseAuthorization();
app.UseHttpsRedirection();

//Log.Information("Starting up api service ...");

app.Run();