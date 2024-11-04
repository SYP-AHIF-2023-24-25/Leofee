namespace Base.Core.Entities;

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Base.Core.Contracts;

public class EntityObject : IEntityObject
{
    
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }
    
    [Timestamp]
    public byte[]? RowVersion { get; set; }
}