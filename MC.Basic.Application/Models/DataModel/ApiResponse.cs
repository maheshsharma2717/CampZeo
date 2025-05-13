namespace MC.Basic.Application.Models.DataModel;
public class ApiResponse<TEntity>
{
    public TEntity? Data { get; set; }
    public bool IsSuccess { get; set; }
    public string? Message { get; set; }
}