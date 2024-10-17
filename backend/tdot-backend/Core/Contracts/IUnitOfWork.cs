namespace Core.Contracts;

using Base.Core.Contracts;

public interface IUnitOfWork : IBaseUnitOfWork
{

    IStudentRepository StudentRepository { get; }
    IBonRepository BonRepository { get; }
    IWhiteListUserRepository WhiteListUserRepository { get; }
}