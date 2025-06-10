namespace MC.Basic.Application.Models.DataModel;

public class ConversationResponse
{
    public List<ConversationMessage> Messages { get; set; }
    public Meta Meta { get; set; }  // Optional: Metadata about the response (like pagination)
}

public class ConversationMessage
{
    public string Sid { get; set; }
    public string Status { get; set; }
    public string Author { get; set; }
    public DateTime DateCreated { get; set; }
    public string Body { get; set; } // The content of the message
}

public class Meta
{
    public string NextPageUrl { get; set; }
    public string PreviousPageUrl { get; set; }
}
public class TwilioMessageParams
{
    public TwilioMessageParams(List<string?> recipients, string message)
    {
        Recipients = recipients;
        Message = message;
    }
    public List<string?> Recipients { get; set; }
    public string Message { get; set; }
}
public class InfobipMessageParams
{
    public InfobipMessageParams(List<string?> recipients, string message)
    {
        Recipients = recipients;
        Message = message;
    }

    public List<string?> Recipients { get; set; }
    public string Message { get; set; }
    public string? MediaType { get; set; }
    public string? MediaUrl { get; set; }
}

public class RcsLog
{
    public string Recipient { get; set; }
    public string Status { get; set; }
    public string MessageId { get; set; }
    public string ErrorMessage { get; set; }
}