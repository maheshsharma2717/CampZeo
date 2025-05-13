


namespace MC.Basic.Application.Models.Twilio;

public class TwilioLogResponse
{
    public List<TwilioMessage> Messages { get; set; }
}
public class TwilioMessage
{
    public string AccountSid { get; set; }
    public string ApiVersion { get; set; }
    public string Body { get; set; }
    public DateTime Date_Created { get; set; }
    public DateTime Date_Sent { get; set; }
    public DateTime Date_Updated { get; set; }
    public string Direction { get; set; }
    public string ErrorCode { get; set; }
    public string ErrorMessage { get; set; }
    public string From { get; set; }
    public string MessagingServiceSid { get; set; }
    public string NumMedia { get; set; }
    public string NumSegments { get; set; }
    public string Price { get; set; }
    public string PriceUnit { get; set; }
    public string Sid { get; set; }
    public string Status { get; set; }
    public string To { get; set; }
    public string Uri { get; set; }
}
