
namespace MC.Basic.Application.Models.DataModel;
public class MailgunEmailParams
{
    public List<string> Recipients { get; set; }
    public string Subject { get; set; }
    public string TextBody { get; set; }
    public Dictionary<string, Dictionary<string, object>> RecipientVariables { get; set; }
    public bool Tracking { get; set; }
    public bool TrackingClicks { get; set; }
    public bool TrackingOpens { get; set; }
}
