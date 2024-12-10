using Core.Entities;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;

namespace Persistence;

using Base.Core.Entities;
using Base.Tools;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;




public class ApplicationDbContext : DbContext
{
    public DbSet<Student>? Students { get; set; }
    public DbSet<Bon>? Bons { get; set; }
    public DbSet<WhiteListUser>? WhiteListUsers { get; set; }
    public DbSet<StudentBonTransaction>? StudentBonTransactions { get; set; }

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public ApplicationDbContext()
    {
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (!optionsBuilder.IsConfigured)
        {
            /*var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production";
            var configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json")
                .AddJsonFile($"appsettings.{environment}.json", optional: true)
                .Build();*/

            string connectionString = "server=127.0.0.1;Port=3307;Database=db;user=root;password=password;";
            optionsBuilder.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString));
        }

        optionsBuilder.LogTo(message => Debug.WriteLine(message));
    }

    public void ConfigureIntegrationTestDb(DbContextOptionsBuilder optionsBuilder, string connectionString)
    {
        optionsBuilder.UseMySql(connectionString, ServerVersion.AutoDetect("server=127.0.0.1;Port=3308;Database=test_db;user=root;password=password;"));
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Konfigurieren der Präzision und Skala für decimal-Eigenschaften
        modelBuilder.Entity<Bon>()
            .Property(b => b.AmountPerStudent)
            .HasPrecision(18, 2);

        modelBuilder.Entity<StudentBonTransaction>()
            .Property(sbt => sbt.BonValue)
            .HasPrecision(18, 2);

        modelBuilder.Entity<StudentBonTransaction>()
            .Property(sbt => sbt.TotalTransactionAmount)
            .HasPrecision(18, 2);

        // Weitere Modellkonfigurationen hier hinzufügen
    }
}


public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        var connectionString = "server=127.0.0.1;Port=3307;Database=db;user=root;password=password;";
        var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
        optionsBuilder.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString));
        return new ApplicationDbContext(optionsBuilder.Options);
    }
}

