namespace MC.Basic.Application.Models.Authentication;
public class UpdatePasswordRequest
{
    public long UserId { get; set; }
    public string? CurrentPassword { get; set; }
    public string? NewPassword { get; set; }
}

