namespace Icms.Helpers;

using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;

public class JwtMiddleware
{
    private readonly RequestDelegate _next;

    public JwtMiddleware(RequestDelegate next)
    {
        _next = next;

    }

    public async Task Invoke(HttpContext context)
    {

        var token23 = context.Request.Headers["Authorization"];
        var token1 = context.Request.Headers["Authorization"].FirstOrDefault();
        var token = context.Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();
        if(token != null)
        {
            await attachUserToContext(context, token);
        }

        await _next(context);
    }

    private async Task attachUserToContext(HttpContext context, string token)
    {
        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes("YourSuperStrongSecretKey1234567891230");
            tokenHandler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = false,
                ValidateAudience = false,
                ClockSkew = TimeSpan.Zero
            }, out SecurityToken validatedToken);

            var jwtToken = (JwtSecurityToken)validatedToken;
               context.Items["token"] = jwtToken;

            // attach user to context on successful jwt validation

            //var user = await authService.GetUserByToken(token);
            //if(user != null)
            //{
            //    context.Items["User"] = user;
            //}
        }
        catch
        {
            // do nothing if jwt validation fails
            // user is not attached to context so request won't have access to secure routes
        }
    }
}