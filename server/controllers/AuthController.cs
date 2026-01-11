using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
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
public class AuthController(AppDbContext db, IConfiguration config) : ControllerBase {
    private readonly AppDbContext _db = db;
    private readonly IConfiguration _config = config;

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] AuthRequest request) {
        if (await _db.Users.AnyAsync(u => u.Username == request.Username)) return BadRequest("Username already exists");

        try {
            UsernameValidator.Validate(request.Username);
        }
        catch (ArgumentException ex) {
            return BadRequest(ex.Message);
        }

        try {
            PasswordValidator.Validate(request.Password);
        }
        catch (ArgumentException ex) {
            return BadRequest(ex.Message);
        }

        var user = new User {
            Username = request.Username,
            PasswordHash = PasswordHasher.HashPassword(request.Password)
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return Ok();
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] AuthRequest request) {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Username == request.Username);
        if (user == null) return Unauthorized("Invalid username or password");

        if (!PasswordHasher.VerifyPassword(request.Password, user.PasswordHash)) return Unauthorized("Invalid username or password");

        var token = GenerateJwt(user);
        return Ok(new { token });
    }

    [Authorize]
    [HttpGet("me")]
    public IActionResult Me() {
        var username = User.Identity?.Name;

        if (username == null) return Unauthorized("Invalid token");

        return Ok(new { username });
    }

    private string GenerateJwt(User user) {
        var jwtConfig = _config.GetSection("Jwt");
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtConfig["Key"]!)
        );

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[] {
            new Claim(ClaimTypes.Name, user.Username),
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

// used only by this file
public record AuthRequest(string Username, string Password);
