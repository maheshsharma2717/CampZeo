namespace MC.Basic.Application.Models.DataModel;

public class ReportLogRequest
{
    public string? Email { get; set; }
    public List<string>Events{ get; set; } =new List<string>();
}
