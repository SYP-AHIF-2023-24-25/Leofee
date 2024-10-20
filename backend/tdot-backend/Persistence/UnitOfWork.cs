using Core.Contracts;

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
        WhiteListUserRepository = new WhiteListUserRepository(dBContext);
        TransactionRepository = new TransactionRepository(dBContext);

    }    
    public IStudentRepository StudentRepository { get; }
    public IBonRepository BonRepository { get; }
    public IWhiteListUserRepository WhiteListUserRepository { get; }

    public ITransactionRepository TransactionRepository {get;}

    // Validations sonst noch
}