using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using server.data;
using server.models;
using server.services;

namespace server.controllers;

[ApiController]
[Route("auth")]
public class AuthController(AppDbContext db, IConfiguration config) : ControllerBase
{
    private readonly AppDbContext _db = db;
    private readonly IConfiguration _config = config;

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] AuthRequest request)
    {
        if (await _db.Users.AnyAsync(u => u.Username == request.Username))
            return BadRequest("Username already exists");

        var user = new User
        {
            Username = request.Username,
            PasswordHash = PasswordHasher.HashPassword(request.Password)
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return Ok();
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] AuthRequest request)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Username == request.Username);
        if (user == null)
            return Unauthorized();

        if (!PasswordHasher.VerifyPassword(request.Password, user.PasswordHash))
            return Unauthorized();

        var token = GenerateJwt(user);
        return Ok(new { token });
    }

    private string GenerateJwt(User user)
    {
        var jwtConfig = _config.GetSection("Jwt");
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtConfig["Key"]!)
        );

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.UniqueName, user.Username),
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())
        };

        var token = new JwtSecurityToken(
            issuer: jwtConfig["Issuer"],
            audience: jwtConfig["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(2),
            signingCredentials: creds
        );

        Console.WriteLine(jwtConfig["Issuer"]);
        Console.WriteLine(jwtConfig["Audience"]);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

public record AuthRequest(string Username, string Password);
