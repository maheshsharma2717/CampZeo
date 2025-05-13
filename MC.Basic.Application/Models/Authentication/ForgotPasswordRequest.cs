using System.ComponentModel.DataAnnotations;

namespace MC.Basic.Application.Models.Authentication;
public class ForgetPasswordRequest
{
    public long UserId { get; set; }
    public string? NewPassword { get; set; }
    [Compare("NewPassword", ErrorMessage = "Passwords do not match.")]
    public string? ConfirmPassword { get; set; }
}

