using Core.Entities;

using Microsoft.EntityFrameworkCore;

using System.Diagnostics;

namespace Persistence;

using Base.Core.Entities;
using Base.Tools;

public class ApplicationDbContext : DbContext
{
    public DbSet<Student>?  Students  { get; set; }
    public DbSet<Bon>?     Bons     { get; set; }
    public DbSet<WhiteListUser>? WhiteListUsers { get; set; }

    public DbSet<StudentBonTransaction>? StudentBonTransactions {get;set;}
    
    
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options): base(options)
    {
    }

    public ApplicationDbContext()
    {
    }
    

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (!optionsBuilder.IsConfigured)
        {
            string connectionString = "server=127.0.0.1;Port=3306;Database=db;user=root;password=password;";    //"server=127.0.0.1;Port=3306;Database=leofee;user=leofee-admin;password=admin-password;";            
            optionsBuilder.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString));
        }

        optionsBuilder.LogTo(message => Debug.WriteLine(message));
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        /* modelBuilder.Entity<Student>()
        .HasKey(e => e.Id); // Primärschlüssel festlegen

         modelBuilder.Entity<Student>()
             .Property(e => e.Id)
             .ValueGeneratedOnAdd(); // Auto-Inkrement konfigurieren

          modelBuilder.Entity<Bon>()
            .HasOne<Student>()
            .WithMany()
            .HasForeignKey(b => b.Id)
            .OnDelete(DeleteBehavior.Cascade);*/



        /*base.OnModelCreating(modelBuilder);

        // Definiere die Beziehungen hier
        modelBuilder.Entity<StudentBonTransaction>()
            .HasOne(sbt => sbt.Student)
            .WithMany(s => s.StudentTransactions)
            .HasForeignKey(sbt => sbt.StudentId)
            .OnDelete(DeleteBehavior.Cascade); // Optionale Löschverhalten

        modelBuilder.Entity<StudentBonTransaction>()
            .HasOne(sbt => sbt.Bon)
            .WithMany(b => b.BonTransactions)
            .HasForeignKey(sbt => sbt.BonId)
            .OnDelete(DeleteBehavior.Cascade); // Optionale Löschverhalten*/


    }
}