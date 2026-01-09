using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.data;
using server.models;
using server.services;
using System.Security.Claims;
using server.dtos;

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
            Content = markdown
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

        var skills = (await _db.Skills
            .Where(s => s.OwnerId == userId)
            .Select(s => new
            {
                s.Id,
                s.Name,
                s.Description,
                s.IsPublic,
                OwnerUsername = s.Owner.Username,
                LatestVersion = s.Versions
                    .OrderByDescending(v => v.VersionNumber)
                    .Select(v => v.VersionNumber)
                    .FirstOrDefault(),
                s.UpdatedAt
            })
            .ToListAsync())
            .OrderByDescending(s => s.UpdatedAt)
            .ToList();

        return Ok(skills);
    }

    // get all public skills (anonymous access allowed)
    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetSkills()
    {
        var skills = (await _db.Skills
            .Where(s => s.IsPublic)
            .Select(s => new
            {
                s.Id,
                s.Name,
                s.Description,
                OwnerUsername = s.Owner.Username,
                LatestVersion = s.Versions
                    .OrderByDescending(v => v.VersionNumber)
                    .Select(v => v.VersionNumber)
                    .FirstOrDefault(),
                s.UpdatedAt
            })
            .ToListAsync())
            .OrderByDescending(s => s.UpdatedAt)
            .ToList();

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

    // update skill visibility (public/private) owned by the authenticated user
    [HttpPatch("{id:int}/visibility")]
    public async Task<IActionResult> UpdateVisibility(
        int id,
        // in case there are more fields to update in the future
        [FromBody] UpdateVisibilityRequest request)
    {
        var userId = int.Parse(
            User.FindFirstValue(ClaimTypes.NameIdentifier)!
        );

        var skill = await _db.Skills.FirstOrDefaultAsync(s => s.Id == id);

        if (skill == null)
            return NotFound();

        if (skill.OwnerId != userId)
            return Forbid();

        skill.IsPublic = request.IsPublic;
        skill.UpdatedAt = DateTimeOffset.UtcNow;

        await _db.SaveChangesAsync();

        return NoContent();
    }

    // get skill details by id (auth required)
    [HttpGet("{id:int}")]
    [Authorize]
    public async Task<ActionResult<SkillDetailsDto>> GetSkillById(int id)
    {
        var userId = int.Parse(
            User.FindFirstValue(ClaimTypes.NameIdentifier)!
        );

        var skill = await _db.Skills
            .Include(s => s.Owner)
            .Include(s => s.Versions)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (skill == null)
            return NotFound();

        if (!skill.IsPublic && skill.OwnerId != userId)
            return Forbid();

        var latestVersion = skill.Versions
            .OrderByDescending(v => v.VersionNumber)
            .FirstOrDefault();

        var dto = new SkillDetailsDto
        {
            Id = skill.Id,
            Name = skill.Name,
            Description = skill.Description,
            IsPublic = skill.IsPublic,
            OwnerUsername = skill.Owner.Username,
            LatestVersion = latestVersion?.VersionNumber ?? 1,
            Content = latestVersion?.Content ?? string.Empty,
            UpdatedAt = skill.UpdatedAt
        };

        return Ok(dto);
    }

    // create a new skill version for a skill owned by the authenticated user
    [Authorize]
    [HttpPost("{id:int}/versions")]
    public async Task<IActionResult> CreateSkillVersion(
        int id,
        [FromBody] CreateSkillVersionRequest request)
    {
        var userId = int.Parse(
            User.FindFirstValue(ClaimTypes.NameIdentifier)!
        );

        if (string.IsNullOrWhiteSpace(request.RawContent))
            return BadRequest("Content cannot be empty.");

        var skill = await _db.Skills
            .Include(s => s.Versions)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (skill == null)
            return NotFound();

        if (skill.OwnerId != userId)
            return Forbid();

        SkillFrontmatter parsed;
        try
        {
            parsed = FrontmatterParser.Parse(request.RawContent);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }

        var nextVersionNumber = skill.Versions.Count != 0
            ? skill.Versions.Max(v => v.VersionNumber) + 1
            : 1;

        var version = new SkillVersion
        {
            SkillId = skill.Id,
            VersionNumber = nextVersionNumber,
            Content = request.RawContent,
            CreatedAt = DateTimeOffset.UtcNow
        };

        skill.Name = parsed.Name;
        skill.Description = parsed.Description;
        skill.UpdatedAt = DateTimeOffset.UtcNow;

        _db.SkillVersions.Add(version);

        await _db.SaveChangesAsync();

        return Ok(new SkillVersionDto(
            version.VersionNumber,
            version.CreatedAt
        ));
    }

    // get all versions of a skill by id owned by the authenticated user
    [Authorize]
    [HttpGet("{id:int}/versions")]
    public async Task<IActionResult> GetSkillVersions(int id)
    {
        var userId = int.Parse(
            User.FindFirstValue(ClaimTypes.NameIdentifier)!
        );

        var skill = await _db.Skills
            .Include(s => s.Versions)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (skill == null)
            return NotFound();

        if (!skill.IsPublic && skill.OwnerId != userId)
            return Forbid();

        var versions = skill.Versions
            .OrderByDescending(v => v.VersionNumber)
            .Select(v => new SkillVersionDto(
                v.VersionNumber,
                v.CreatedAt
            ))
            .ToList();

        return Ok(versions);
    }

    // get all tags of a skill by id (auth required)
    [Authorize]
    [HttpGet("{id:int}/tags")]
    public async Task<IActionResult> GetSkillTags(int id)
    {
        var skill = await _db.Skills
            .Include(s => s.SkillTags)
            .ThenInclude(st => st.Tag)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (skill == null)
            return NotFound();

        var tags = skill.SkillTags
            .Select(st => new TagDto(st.TagId, st.Tag.Name))
            .OrderBy(t => t.Name)
            .ToList();

        return Ok(tags);
    }

    // add a tag to a skill owned by the authenticated user
    [Authorize]
    [HttpPost("{id:int}/tags")]
    public async Task<IActionResult> AddTag(
        int id,
        [FromBody] AddTagDto dto)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        if (string.IsNullOrWhiteSpace(dto.Tag))
            return BadRequest("Tag cannot be empty.");

        // normalize tag name in BE in case haven''t done in frontend
        var normalized = dto.Tag.Trim().ToLowerInvariant();

        if (normalized.Length > 20)
            return BadRequest("Tag must be 20 characters or fewer.");

        if (!normalized.All(c => char.IsLetterOrDigit(c) || c == '_' || c == '.' || c == '-')) 
            return BadRequest("Username may only contain letters, numbers, underscores (_), dots (.) and hyphens (-)");

        var skill = await _db.Skills
            .Include(s => s.SkillTags)
            .ThenInclude(st => st.Tag)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (skill == null)
            return NotFound();

        if (skill.OwnerId != userId)
            return Forbid();

        // check if tag already exists globally
        var tag = await _db.Tags.FirstOrDefaultAsync(t => t.Name == normalized);

        if (tag == null)
        {
            tag = new Tag { Name = normalized };
            _db.Tags.Add(tag);
        }

        // check if skill already has this tag
        var alreadyTagged = skill.SkillTags.Any(st => st.Tag.Name == normalized);
        if (alreadyTagged)
            return Ok(); // dont do anything if exists

        skill.SkillTags.Add(new SkillTag
        {
            Skill = skill,
            Tag = tag
        });

        await _db.SaveChangesAsync();
        return Ok();
    }

    // remove a tag from a skill owned by the authenticated user
    [Authorize]
    [HttpDelete("{id:int}/tags/{tagId:int}")]
    public async Task<IActionResult> RemoveTag(int id, int tagId)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var skill = await _db.Skills
            .Include(s => s.SkillTags)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (skill == null)
            return NotFound();

        if (skill.OwnerId != userId)
            return Forbid();

        var skillTag = skill.SkillTags
            .FirstOrDefault(st => st.TagId == tagId);

        if (skillTag == null)
            return NoContent();

        skill.SkillTags.Remove(skillTag);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
