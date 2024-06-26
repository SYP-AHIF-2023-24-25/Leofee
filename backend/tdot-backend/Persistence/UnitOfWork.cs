﻿using Core.Contracts;

namespace Persistence;

using Base.Core.Contracts;
using Base.Persistence;
using Core.Entities;

public class UnitOfWork : BaseUnitOfWork, IUnitOfWork
{
    public UnitOfWork(ApplicationDbContext dBContext) : base(dBContext)
    {        
        StudentRepository = new StudentRepository(dBContext);
        BonRepository = new BonRepository(dBContext);
    }    
    public IStudentRepository StudentRepository { get; }
    public IBonRepository BonRepository { get; }

    // Validations sonst noch
}