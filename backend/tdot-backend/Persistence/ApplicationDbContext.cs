﻿using Core.Entities;

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

    public DbSet<Transaction>? Transactions {get;set;}
    
    
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
        modelBuilder.Entity<Bon>()
           .HasOne<Student>()
           .WithMany()
           .HasForeignKey(b => b.StudentId)
           .OnDelete(DeleteBehavior.Cascade);
    }
}