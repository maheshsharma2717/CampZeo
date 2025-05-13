using MC.Basic.Domains.Entities;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc;
using MC.Basic.Domain;

namespace MC.Basic.API.Helpers;
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class AdminOnlyAttribute : Attribute, IAuthorizationFilter
{
    public void OnAuthorization(AuthorizationFilterContext context)
    {
        // Retrieve the user object from the HttpContext
        var user = (User)context.HttpContext.Items["User"];

        // Check if the user is not authenticated or doesn't have admin role
        if(user == null || user.Role != UserRole.AdminUser)
        {
            // If user is not authorized, return a 403 Forbidden response
            context.Result = new JsonResult(new { message = "Forbidden - Admins Only" }) { StatusCode = StatusCodes.Status403Forbidden };
        }
    }
}
