using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.data;
using server.models;
using server.services;
using System.Security.Claims;

namespace server.controllers;

[ApiController]
[Route("skills")]
[Authorize]
public class SkillsController(AppDbContext db) : ControllerBase
{
    private readonly AppDbContext _db = db;

    // upload a new skill via markdown file with frontmatter (auth required)
    [HttpPost]
    public async Task<IActionResult> UploadSkill(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file uploaded");

        if (!file.FileName.EndsWith(".md"))
            return BadRequest("Only .md files are supported"); // just to be sure, probably gonna add more validation later in frontend

        string markdown;
        using (var reader = new StreamReader(file.OpenReadStream()))
        {
            markdown = await reader.ReadToEndAsync();
        }

        SkillFrontmatter parsed;
        try
        {
            parsed = FrontmatterParser.Parse(markdown);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }

        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var skill = new Skill
        {
            OwnerId = userId,
            Name = parsed.Name,
            Description = parsed.Description,
            AllowedTools = parsed.AllowedTools,
            IsPublic = false
        };

        _db.Skills.Add(skill);
        await _db.SaveChangesAsync();

        var version = new SkillVersion
        {
            SkillId = skill.Id,
            VersionNumber = 1,
            Content = parsed.Body
        };

        _db.SkillVersions.Add(version);
        await _db.SaveChangesAsync();

        return Ok(new
        {
            skill.Id,
            skill.Name,
            skill.Description
        });
    }

    // get all skills owned by the authenticated user
    [HttpGet("mine")]
    public async Task<IActionResult> GetMySkills()
    {
        var userId = int.Parse(
            User.FindFirstValue(ClaimTypes.NameIdentifier)!
        );

        var skills = await _db.Skills
            .Where(s => s.OwnerId == userId)
            .Select(s => new
            {
                s.Id,
                s.Name,
                s.Description,
                s.IsPublic,
                LatestVersion = s.Versions
                    .OrderByDescending(v => v.VersionNumber)
                    .Select(v => v.VersionNumber)
                    .FirstOrDefault(),
                s.UpdatedAt
            })
            .OrderByDescending(s => s.UpdatedAt)
            .ToListAsync();

        return Ok(skills);
    }

    // get all public skills (anonymous access allowed)
    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetSkills()
    {
        var skills = await _db.Skills
            .Where(s => s.IsPublic)
            .Select(s => new
            {
                s.Id,
                s.Name,
                s.Description,
                s.OwnerId,
                LatestVersion = s.Versions
                    .OrderByDescending(v => v.VersionNumber)
                    .Select(v => v.VersionNumber)
                    .FirstOrDefault(),
                s.UpdatedAt
            })
            .OrderByDescending(s => s.UpdatedAt)
            .ToListAsync();

        return Ok(skills);
    }

    // delete a skill owned by the authenticated user
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteSkill(int id)
    {
        var userId = int.Parse(
            User.FindFirstValue(ClaimTypes.NameIdentifier)!
        );

        var skill = await _db.Skills
            .Include(s => s.Versions)
            .Include(s => s.SkillTags)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (skill == null)
            return NotFound();

        if (skill.OwnerId != userId)
            return Forbid();

        _db.Skills.Remove(skill);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
