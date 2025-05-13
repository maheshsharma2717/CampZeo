
namespace MC.Basic.Application.Models.DataModel;
public class ApiRequest<TEntity> {
    public TEntity? Data { get; set; }
    public string? Token { get; set; }
}

