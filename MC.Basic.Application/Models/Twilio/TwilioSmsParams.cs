namespace MC.Basic.Application.Models.Twilio;

public class TwilioSmsParams
{
     
        public List<string> PhoneNumber { get; set; }
        public string Message { get; set; }
        public string SenderId { get; set; }
        public TwilioSmsParams(List<string> phoneNumber, string message, string senderId = "")
        {
            PhoneNumber = phoneNumber;
            Message = message;
            SenderId = senderId == "" ? "7018273907" : senderId;
        }
    
}
