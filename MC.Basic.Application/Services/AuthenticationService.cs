using MC.Basic.Application.Contracts.Infrasructure;
using MC.Basic.Application.Contracts.Persistance;
using MC.Basic.Application.Models.Authentication;
using MC.Basic.Application.Models.DataModel;
using MC.Basic.Domain;
using MC.Basic.Domains.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.Json;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Twilio.Jwt.AccessToken;

namespace MC.Basic.Application.Services
{
    public class AuthenticationService : IAuthenticationService
    {
        private readonly IUserRepository _repository;
        private readonly IEmailService _emailService;
        private readonly string passwordKey;
        public AuthenticationService(IUserRepository repository, IEmailService emailService)
        {
            _repository = repository;
            _emailService = emailService;
             passwordKey = "b14ca5898a4e4133bbce2ea2315a1917";
        }
        public async Task<User?> GetUserByToken(string token)
        {
            var dbUser = await _repository.GetUserWithOrganisation(token);
            return dbUser;
        }
        public async Task<ApiResponse<User>> AuthenticateUser(string Email, string Password)
        {

            ApiResponse<User> response = new ApiResponse<User>();
            var password = EncryptString(passwordKey, Password);
            var dbUser = await _repository.GetRecordWithIncludes(x => x.Organisation, x => x.Email == Email && x.Password == password);
            if (dbUser != null)
            {
                var token = generateJwtToken(dbUser);
                response.IsSuccess = true;
                dbUser.Token = token;
                var user = await _repository.CreateUpdateUser(dbUser);
                response.Data = new User
                {
                    Id = user.Id,
                    CreatedDate = user.CreatedDate,
                    LastModifiedDate = user.LastModifiedDate,
                    CreatedBy = user.CreatedBy,
                    LastModifiedBy = user.LastModifiedBy,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Mobile = user.Mobile,
                    Email = user.Email,
                    Token = user.Token,
                    Role = user.Role,
                    IsFirstLogin = user.IsFirstLogin
                };
                response.IsSuccess = true;
            }
            return response;
        }

        public async Task<ApiResponse<User>> LogInAsOrgenisation(int Id)
        {

            ApiResponse<User> response = new ApiResponse<User>();
            //var password = EncryptString(passwordKey, Password);
            //var dbUser = await _repository.GetRecordWithIncludes(x => x.Organisation,x => x.Organisation.Id == Id);
            //if(dbUser != null)
            var dbUser = await _repository.GetQuariable().Include(x => x.Organisation).SingleOrDefaultAsync(x => x.Organisation.Id == Id);
            if (dbUser != null)
            {
                var token = generateJwtToken(dbUser);
                response.IsSuccess = true;
                dbUser.Token = token;
                var user = await _repository.CreateUpdateUser(dbUser);
                response.Data = new User
                {
                    Id = user.Id,
                    CreatedDate = user.CreatedDate,
                    LastModifiedDate = user.LastModifiedDate,
                    CreatedBy = user.CreatedBy,
                    LastModifiedBy = user.LastModifiedBy,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Mobile = user.Mobile,
                    Email = user.Email,
                    Token = user.Token
                };
                response.IsSuccess = true;
            }
            return response;
        }
        public async Task<ApiResponse<User>> ValidateToken(string token)
        {
            ApiResponse<User> response = new ApiResponse<User>();
            var dbUser = await _repository.GetAsync(x => x.Token == token);
            if (dbUser != null)
            {
                response.IsSuccess = true;
                dbUser.Token = token;
                response.Data = new User
                {
                    Id = dbUser.Id,
                    CreatedDate = dbUser.CreatedDate,
                    LastModifiedDate = dbUser.LastModifiedDate,
                    CreatedBy = dbUser.CreatedBy,
                    LastModifiedBy = dbUser.LastModifiedBy,
                    FirstName = dbUser.FirstName,
                    LastName = dbUser.LastName,
                    Mobile = dbUser.Mobile,
                    Email = dbUser.Email,
                    Token = dbUser.Token,
                    Role = dbUser.Role
                };

                response.IsSuccess = true;
            }
            return response;
        }

        public async Task<ApiResponse<string>> SendResetTokenToUser(string email)
        {
            ApiResponse<string> response = new ApiResponse<string>();
            var user = await _repository.GetAsync(u => u.Email == email);
            if (user == null)
            {
                response.Message = "Email Invalid. Please confirm the email and try again.";
                response.IsSuccess = false;
                response.Data = null;
                return response;
            }
            var token = generateJwtToken(user);
            var resetUrl = $"http://localhost:4200/?token={token}";

            var htmlMessage = $@"
                                <html>
                                <body>
                                    <p>Dear User,</p>
                                    <p>Your request to change your password is in progress.</p>
                                    <p>You can now reset your password by clicking the button below:</p>
                                    <p>
                                        <a href='{resetUrl}' style='
                                            display: inline-block;
                                            padding: 10px 20px;
                                            font-size: 16px;
                                            color: white;
                                            background-color: #007bff;
                                            text-decoration: none;
                                            border-radius: 5px;'>Reset Password</a>
                                    </p>
                                    <p>Please keep your password safe and do not share it with anyone.</p>
                                    <p>Best regards,<br/>CampZeo Team</p>
                                </body>
                                </html>";

            await _emailService.SendEmailMessage(email, htmlMessage);
            user.ResetToken = token;
            var dbUser = await _repository.CreateUpdateUser(user);
            response.Message = $"Email sent to user: {dbUser.Email} for rest password.";
            response.IsSuccess = true;
            return response;
        }

        public async Task<ApiResponse<User>> ResetUserPassword(ResetPasswordDto request)
        {
            ApiResponse<User> response = new ApiResponse<User>();
            var user = await _repository.GetAsync(u => u.Email == request.Email);
            if (user == null)
            {
                response.Message = "User not found. Please enter a valid Email and try again.";
                response.IsSuccess = false;
                response.Data = null;
                return response;
            }
            if(user.ResetToken == request.Token)
            {
                user.Password = EncryptString(passwordKey, request.Password);
                user.IsFirstLogin = false;
                response.Data = await _repository.UpdateAsync(user);
                response.IsSuccess = true;
                response.Message = "Password reset Successful";
            }
            else
            {
                throw new Exception("Invalid Password");
            }
            return response;
        }

        public async Task<ApiResponse<User>> UpdateUserPassword(ApiRequest<UpdatePasswordRequest> request)
        {
            ApiResponse<User> response = new ApiResponse<User>();
            var user = await _repository.GetAsyncById(request.Data.UserId);
            if (user != null && user.Password == EncryptString(passwordKey, request.Data.CurrentPassword))
            {
                user.Password = EncryptString(passwordKey, request.Data.NewPassword);
                user.IsFirstLogin = false;
                response.Data = await _repository.UpdateAsync(user);
                response.IsSuccess = true;

            }
            else
            {
                throw new Exception("Current Password is not valid");
            }
            return response;
        }
        public async Task<User?> CreateAdminUser(string firstName, string lastName, string email, string password)
        {
            var response = new ApiResponse<User>();
            var isAdminAlreadyCreated = (await _repository.ListAllAsync()).Any(users => users.Role == UserRole.AdminUser);
            if (isAdminAlreadyCreated)
            {
                return await Task.FromResult(new User());
            }
            else
            {
                return await _repository.CreateUpdateUser(new User
                {
                    Email = email,
                    Password = EncryptString(passwordKey, password),
                    FirstName = firstName,
                    LastName = lastName,
                    Role = UserRole.AdminUser,
                    IsApproved = true,
                    FacebookAccessToken = string.Empty,
                    FacebookTokenType = string.Empty,
                    FacebookUserId = string.Empty,
                    FacebookPageId = string.Empty,
                    FacebookPageAccessToken = string.Empty,
                    InstagramAccessToken = string.Empty,
                    InstagramUserId = string.Empty,
                    Mobile = string.Empty,
                    Token = string.Empty,
                    UserName = $"{firstName}+{lastName}"
                });
            }
        }
        private string generateJwtToken(User user)
        {
            // generate token that is valid for 7 days
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes("THIS IS USED TO SIGN AND VERIFY JWT TOKENS, REPLACE IT WITH YOUR OWN SECRET, IT CAN BE ANY STRING");
            var claims = new List<Claim>
            {
                new Claim("id", user.Id.ToString())
            };

            // Add organisationId claim if the user is an OrganisationUser
            if (user.Organisation != null && user.Role == UserRole.OrganisationUser)
            {
                claims.Add(new Claim("organisationId", user.Organisation.Id.ToString()));
            }
            else
            {
                claims.Add(new Claim("organisationId", "0"));  // Default to 0 if not an OrganisationUser
            }
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
        public string updateJwtToken(ApiRequest<long> request)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes("THIS IS USED TO SIGN AND VERIFY JWT TOKENS, REPLACE IT WITH YOUR OWN SECRET, IT CAN BE ANY STRING");
            var principal = tokenHandler.ReadToken(request.Token) as JwtSecurityToken;
            if (principal == null)
            {
                throw new SecurityTokenException("Invalid token");
            }
            var claims = principal?.Claims.ToList();
            var organisationClaim = claims.FirstOrDefault(c => c.Type == "organisationId");
            if (organisationClaim != null)
            {
                organisationClaim = new Claim("organisationId", request.Data.ToString());
                claims.RemoveAll(c => c.Type == "organisationId");
                claims.Add(organisationClaim);
            }
            else
            {
                claims.Add(new Claim("organisationId", request.Data.ToString()));
            }
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddDays(7),  // Set the expiration to 7 days from now
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var newToken = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(newToken);
        }


        private string EncryptString(string key, string plainText)
        {
            byte[] iv = new byte[16];
            byte[] array;

            using (Aes aes = Aes.Create())
            {
                aes.Key = Encoding.UTF8.GetBytes(key);
                aes.IV = iv;

                ICryptoTransform encryptor = aes.CreateEncryptor(aes.Key, aes.IV);

                using (MemoryStream memoryStream = new MemoryStream())
                {
                    using (CryptoStream cryptoStream = new CryptoStream((Stream)memoryStream, encryptor, CryptoStreamMode.Write))
                    {
                        using (StreamWriter streamWriter = new StreamWriter((Stream)cryptoStream))
                        {
                            streamWriter.Write(plainText);
                        }

                        array = memoryStream.ToArray();
                    }
                }
            }

            return Convert.ToBase64String(array);
        }

        public async Task<ApiResponse<User>> ForgotUserPassword(ApiRequest<ForgetPasswordRequest> request)
        {
            ApiResponse<User> response = new ApiResponse<User>();

            var user = await _repository.GetAsyncById(request.Data.UserId);
            if (user == null)
            {
                throw new Exception("User not found.");
            }

            if (string.IsNullOrWhiteSpace(request.Data.NewPassword) ||
                string.IsNullOrWhiteSpace(request.Data.ConfirmPassword))
            {
                throw new Exception("Password fields cannot be empty.");
            }

            if (request.Data.NewPassword != request.Data.ConfirmPassword)
            {
                throw new Exception("New Password and Confirm Password do not match.");
            }

            user.Password = EncryptString(passwordKey, request.Data.NewPassword);
            user.IsFirstLogin = false;

            response.Data = await _repository.UpdateAsync(user);
            response.IsSuccess = true;

            return response;
        }
    }

}
