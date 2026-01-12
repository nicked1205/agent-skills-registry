using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.data;
using server.models;
using server.services;
using System.Security.Claims;
using server.dtos;
using System.Text;

namespace server.controllers;

[ApiController]
[Route("skills")]
[Authorize]
public class SkillsController(AppDbContext db) : ControllerBase {
    private readonly AppDbContext _db = db;

    // upload a new skill via markdown file with frontmatter (auth required)
    [HttpPost]
    public async Task<IActionResult> UploadSkill(IFormFile file) {
        if (file == null || file.Length == 0) return BadRequest("No file uploaded");

        if (!file.FileName.EndsWith(".md")) return BadRequest("Only .md files are supported"); // just to be sure, probably gonna add more validation later in frontend

        string markdown;
        using (var reader = new StreamReader(file.OpenReadStream())) {
            markdown = await reader.ReadToEndAsync();
        }

        SkillFrontmatter parsed;
        try {
            parsed = FrontmatterParser.Parse(markdown);
        }
        catch (Exception ex) {
            return BadRequest(ex.Message);
        }

        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var skill = new Skill {
            OwnerId = userId,
            Name = parsed.Name,
            Description = parsed.Description,
            AllowedTools = parsed.AllowedTools,
            IsPublic = false
        };

        _db.Skills.Add(skill);
        await _db.SaveChangesAsync();

        var version = new SkillVersion {
            SkillId = skill.Id,
            VersionNumber = 1,
            Content = markdown
        };

        _db.SkillVersions.Add(version);
        await _db.SaveChangesAsync();

        return Ok(new {
            skill.Id,
            skill.Name,
            skill.Description
        });
    }

    // get all skills owned by the authenticated user
    [HttpGet("mine")]
    public async Task<IActionResult> GetMySkills(
        [FromQuery] string? search,
        [FromQuery] string? tags,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 12
    ) {
        var userId = int.Parse(
            User.FindFirstValue(ClaimTypes.NameIdentifier)!
        );

        const int MAX_PAGE_SIZE = 50;

        page = page < 1 ? 1 : page;
        pageSize = pageSize < 1 || pageSize > MAX_PAGE_SIZE ? 12 : pageSize;

        var query = _db.Skills
            .Where(s => s.OwnerId == userId)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search)) {
            var term = search.Trim().ToLower();
            query = query.Where(s => s.Name.ToLower().Contains(term));
        }

        if (!string.IsNullOrWhiteSpace(tags)) {
            var tagList = tags
                .Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(t => t.Trim().ToLower())
                .Distinct()
                .ToList();

            const int MAX_TAG_FILTERS = 5;
            if (tagList.Count > MAX_TAG_FILTERS) return BadRequest($"You can filter by at most {MAX_TAG_FILTERS} tags");

            foreach (var tag in tagList) {
                query = query.Where(s =>
                    s.SkillTags.Any(st => st.Tag.Name == tag)
                );
            }
        }

        var skills = await query
            .OrderByDescending(s => s.UpdatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(s => new SkillCardDto(
                s.Id,
                s.Name,
                s.Description,
                s.Owner.Username,
                s.Versions
                    .OrderByDescending(v => v.VersionNumber)
                    .Select(v => v.VersionNumber)
                    .FirstOrDefault(),
                s.UpdatedAt,
                s.SkillTags
                    .OrderBy(st => st.Tag.Name)
                    .Select(st => new TagDto(st.TagId, st.Tag.Name))
                    .ToList(),
                s.IsPublic,
                s.IsCloned,
                s.ClonedFromUsername,
                s.CloneCount,
                s.DownloadCount
            ))
            .ToListAsync();

        return Ok(skills);
    }

    // get all public skills (auth required to view)
    [HttpGet]
    public async Task<IActionResult> GetSkills(
        [FromQuery] string? search,
        [FromQuery] string? tags,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 12
    ) {
        const int MAX_PAGE_SIZE = 50;

        page = page < 1 ? 1 : page;
        pageSize = pageSize < 1 || pageSize > MAX_PAGE_SIZE ? 12 : pageSize;

        var query = _db.Skills
            .Where(s => s.IsPublic)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search)) {
            var term = search.Trim().ToLower();
            query = query.Where(s => s.Name.ToLower().Contains(term));
        }

        if (!string.IsNullOrWhiteSpace(tags)) {
            var tagList = tags
                .Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(t => t.Trim().ToLower())
                .Distinct()
                .ToList();

            const int MAX_TAG_FILTERS = 5;
            if (tagList.Count > MAX_TAG_FILTERS) return BadRequest($"You can filter by at most {MAX_TAG_FILTERS} tags");

            foreach (var tag in tagList) {
                query = query.Where(s =>
                    s.SkillTags.Any(st => st.Tag.Name == tag)
                );
            }
        }

        var total = await query.CountAsync();

        var skills = await query
            .OrderByDescending(s => s.UpdatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(s => new SkillCardDto(
                s.Id,
                s.Name,
                s.Description,
                s.Owner.Username,
                s.Versions
                    .OrderByDescending(v => v.VersionNumber)
                    .Select(v => v.VersionNumber)
                    .FirstOrDefault(),
                s.UpdatedAt,
                s.SkillTags
                    .OrderBy(st => st.Tag.Name)
                    .Select(st => new TagDto(st.TagId, st.Tag.Name))
                    .ToList(),
                s.IsPublic,
                s.IsCloned,
                s.ClonedFromUsername,
                s.CloneCount,
                s.DownloadCount
            ))
            .ToListAsync();

        return Ok(skills);
    }

    // delete a skill owned by the authenticated user
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteSkill(int id) {
        var userId = int.Parse(
            User.FindFirstValue(ClaimTypes.NameIdentifier)!
        );

        var skill = await _db.Skills
            .Include(s => s.Versions)
            .Include(s => s.SkillTags)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (skill == null) return NotFound("Cannot find skill");

        if (skill.OwnerId != userId) return Forbid("You do not have permission to delete this skill");

        _db.Skills.Remove(skill);
        await _db.SaveChangesAsync();

        return NoContent();
    }

    // update skill visibility (public/private) owned by the authenticated user
    [HttpPatch("{id:int}/visibility")]
    public async Task<IActionResult> UpdateVisibility(
        int id,
        // in case there are more fields to update in the future
        [FromBody] UpdateVisibilityRequest request) {
        var userId = int.Parse(
            User.FindFirstValue(ClaimTypes.NameIdentifier)!
        );

        var skill = await _db.Skills.FirstOrDefaultAsync(s => s.Id == id);

        if (skill == null) return NotFound("Cannot find skill");

        if (skill.OwnerId != userId) return Forbid("You do not have permission to update this skill's visibility");
        
        if (skill.IsCloned && request.IsPublic) return BadRequest("Cloned skills cannot be made public");

        skill.IsPublic = request.IsPublic;
        skill.UpdatedAt = DateTimeOffset.UtcNow;

        await _db.SaveChangesAsync();

        return NoContent();
    }

    // get skill details by id (auth required)
    [HttpGet("{id:int}")]
    public async Task<ActionResult<SkillDetailsDto>> GetSkillById(int id) {
        var userId = int.Parse(
            User.FindFirstValue(ClaimTypes.NameIdentifier)!
        );

        var skill = await _db.Skills
            .Include(s => s.Owner)
            .Include(s => s.Versions)
            .Include(s => s.SkillTags)
                .ThenInclude(st => st.Tag)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (skill == null) return NotFound("Cannot find skill");

        if (!skill.IsPublic && skill.OwnerId != userId) return Forbid("You do not have permission to view this skill");

        var latestVersion = skill.Versions
            .OrderByDescending(v => v.VersionNumber)
            .FirstOrDefault();

        var dto = new SkillDetailsDto(
            skill.Id,
            skill.Name,
            skill.Description,
            skill.IsPublic,
            skill.Owner.Username,
            latestVersion?.VersionNumber ?? 1,
            latestVersion?.Content ?? string.Empty,
            skill.UpdatedAt,
            skill.CreatedAt,
            skill.SkillTags
                .OrderBy(st => st.Tag.Name)
                .Select(st => new TagDto(st.TagId, st.Tag.Name))
                .ToList(),
            skill.IsCloned,
            skill.ClonedFromUsername,
            skill.CloneCount,
            skill.DownloadCount
        );

        return Ok(dto);
    }

    // create a new skill version for a skill owned by the authenticated user
    [HttpPost("{id:int}/versions")]
    public async Task<IActionResult> CreateSkillVersion(
        int id,
        [FromBody] CreateSkillVersionRequest request) {
        var userId = int.Parse(
            User.FindFirstValue(ClaimTypes.NameIdentifier)!
        );

        if (string.IsNullOrWhiteSpace(request.RawContent)) return BadRequest("Content cannot be empty");

        var skill = await _db.Skills
            .Include(s => s.Versions)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (skill == null) return NotFound("Cannot find skill");

        if (skill.OwnerId != userId) return Forbid("You do not have permission to create a version for this skill");

        SkillFrontmatter parsed;
        try {
            parsed = FrontmatterParser.Parse(request.RawContent);
        }
        catch (Exception ex) {
            return BadRequest(ex.Message);
        }

        var nextVersionNumber = skill.Versions.Count != 0 ? skill.Versions.Max(v => v.VersionNumber) + 1 : 1;

        var version = new SkillVersion {
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
    [HttpGet("{id:int}/versions")]
    public async Task<IActionResult> GetSkillVersions(int id) {
        var userId = int.Parse(
            User.FindFirstValue(ClaimTypes.NameIdentifier)!
        );

        var skill = await _db.Skills
            .Include(s => s.Versions)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (skill == null) return NotFound("Cannot find skill");

        if (!skill.IsPublic && skill.OwnerId != userId) return Forbid("You do not have permission to view this skill");

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
    [HttpGet("{id:int}/tags")]
    public async Task<IActionResult> GetSkillTags(int id) {
        var skill = await _db.Skills
            .Include(s => s.SkillTags)
            .ThenInclude(st => st.Tag)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (skill == null) return NotFound("Cannot find skill");

        if (!skill.IsPublic) {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            if (skill.OwnerId != userId)
                return Forbid( "You do not have permission to view tags for this skill");
        }

        var tags = skill.SkillTags
            .OrderBy(st => st.Tag.Name)
            .Select(st => new TagDto(st.TagId, st.Tag.Name))
            .ToList();

        return Ok(tags);
    }

    // add a tag to a skill owned by the authenticated user
    [HttpPost("{id:int}/tags")]
    public async Task<IActionResult> AddTag(
        int id,
        [FromBody] AddTagDto dto
    ) {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        if (string.IsNullOrWhiteSpace(dto.Tag)) return BadRequest("Tag cannot be empty");

        // normalize tag name in BE in case haven''t done in frontend
        var normalized = dto.Tag.Trim().ToLowerInvariant();

        if (normalized.Length > 20) return BadRequest("Tag must be 20 characters or fewer");

        if (!normalized.All(c => char.IsLetterOrDigit(c) || c == '_' || c == '.' || c == '-')) return BadRequest("Tag may only contain letters, numbers, underscores (_), dots (.) and hyphens (-)");

        var skill = await _db.Skills
            .Include(s => s.SkillTags)
            .ThenInclude(st => st.Tag)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (skill == null) return NotFound("Cannot find skill");

        if (skill.OwnerId != userId) return Forbid("You do not have permission to add a tag to this skill");

        // check if tag already exists globally
        var tag = await _db.Tags.FirstOrDefaultAsync(t => t.Name == normalized);

        if (tag == null) {
            tag = new Tag { Name = normalized };
            _db.Tags.Add(tag);
        }

        // check if skill already has this tag
        var alreadyTagged = skill.SkillTags.Any(st => st.Tag.Name == normalized);
        if (alreadyTagged) return Ok(new TagDto(tag.Id, tag.Name)); // dont do anything if exists

        skill.SkillTags.Add(new SkillTag {
            Skill = skill,
            Tag = tag
        });

        await _db.SaveChangesAsync();
        return Ok(new TagDto(tag.Id, tag.Name));
    }

    // remove a tag by tagid from a skill owned by the authenticated user
    [HttpDelete("{id:int}/tags/{tagId:int}")]
    public async Task<IActionResult> RemoveTag(int id, int tagId) {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var skill = await _db.Skills
            .Include(s => s.SkillTags)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (skill == null) return NotFound("Cannot find skill");

        if (skill.OwnerId != userId) return Forbid("You do not have permission to remove a tag from this skill");

        var skillTag = skill.SkillTags
            .FirstOrDefault(st => st.TagId == tagId);

        if (skillTag == null) return NoContent();

        skill.SkillTags.Remove(skillTag);
        await _db.SaveChangesAsync();

        return NoContent();
    }

    // get all tags
    [HttpGet("tags")]
    public async Task<IActionResult> GetTags([FromQuery] string? search) {
        const int limit = 30;

        var query = _db.Tags.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search)) {
            var term = search.Trim().ToLower();
            query = query.Where(t => t.Name.ToLower().Contains(term));
        }

        var tags = await query
            .OrderBy(t => t.Name)
            .Take(limit)
            .Select(t => new TagDto(t.Id, t.Name))
            .ToListAsync();

        return Ok(tags);
    }

    // clone a public skill into the authenticated user's private library
    [HttpPost("{id:int}/clone")]
    public async Task<IActionResult> CloneSkill(int id) {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var sourceSkill = await _db.Skills
            .Include(s => s.Owner)
            .Include(s => s.Versions)
            .Include(s => s.SkillTags)
                .ThenInclude(st => st.Tag)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (sourceSkill == null) return NotFound("Cannot find skill");

        // must be public
        if (!sourceSkill.IsPublic) return Forbid("You do not have permission to clone this skill");

        // probably not gonna happen because cloned skills can be public but just in case
        if (sourceSkill.IsCloned) return BadRequest("Cloned skills cannot be cloned again");

        // prevent cloning your own skill
        if (sourceSkill.OwnerId == userId) return BadRequest("You cannot clone your own skill");

        var latestVersion = sourceSkill.Versions
            .OrderByDescending(v => v.VersionNumber)
            .FirstOrDefault();

        if (latestVersion == null) return BadRequest("Source skill has no versions");

        var clonedSkill = new Skill {
            OwnerId = userId,
            Name = sourceSkill.Name,
            Description = sourceSkill.Description,
            AllowedTools = sourceSkill.AllowedTools,
            IsPublic = false, // automatically private
            IsCloned = true,
            ClonedFromUsername = sourceSkill.Owner.Username,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        _db.Skills.Add(clonedSkill);
        await _db.SaveChangesAsync();

        sourceSkill.CloneCount += 1;
        await _db.SaveChangesAsync();

        // only clone the latest version as v1 of new skill
        var version = new SkillVersion {
            SkillId = clonedSkill.Id,
            VersionNumber = 1,
            Content = latestVersion.Content,
            CreatedAt = DateTimeOffset.UtcNow
        };

        _db.SkillVersions.Add(version);

        // copy tags
        foreach (var st in sourceSkill.SkillTags) {
            clonedSkill.SkillTags.Add(new SkillTag {
                SkillId = clonedSkill.Id,
                TagId = st.TagId
            });
        }

        await _db.SaveChangesAsync();

        return Ok(new {
            clonedSkill.Id,
            clonedSkill.Name
        });
    }

    [HttpGet("{id:int}/download")]
    public async Task<IActionResult> DownloadSkill(int id) {
        var skill = await _db.Skills
            .Include(s => s.Versions)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (skill == null) return NotFound("Cannot find skill");

        // public skills can be downloaded by anyone while only owner for privates
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        if (!skill.IsPublic && skill.OwnerId != userId) return Forbid("You do not have permission to download this skill");

        var latestVersion = skill.Versions
            .OrderByDescending(v => v.VersionNumber)
            .FirstOrDefault();

        if (latestVersion == null) return BadRequest("Skill has no content");

        // only increase download count when public skill is downloaded by someone else
        if (skill.IsPublic && skill.OwnerId != userId) {
            skill.DownloadCount += 1;
            await _db.SaveChangesAsync();
        }

        var bytes = Encoding.UTF8.GetBytes(latestVersion.Content);
        var fileName = $"{skill.Name}.md";

        return File(bytes, "text/markdown", fileName);
    }

    // get diff between two versions of a skill
    [HttpGet("{id:int}/diff")]
    public async Task<IActionResult> GetSkillDiff(
        int id,
        [FromQuery] int from,
        [FromQuery] int to)
    {
        if (from == to) return Ok(new VersionsDiffDto(from, to, []));

        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var skill = await _db.Skills
            .Include(s => s.Versions)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (skill == null) return NotFound("Cannot find skill");

        if (!skill.IsPublic && skill.OwnerId != userId) return Forbid("You do not have permission to view diffs of this skill");

        var fromVersion = skill.Versions.FirstOrDefault(v => v.VersionNumber == from);
        var toVersion = skill.Versions.FirstOrDefault(v => v.VersionNumber == to);

        if (fromVersion == null || toVersion == null) return BadRequest("Invalid version numbers");

        var diff = DiffCheckerService.DiffLines(
            fromVersion.Content,
            toVersion.Content
        );

        var dto = new VersionsDiffDto(
            from,
            to,
            diff
        );

        return Ok(dto);
    }

    // rollback a skill to a previous version by creating a NEW version (no history mutation)
    [HttpPost("{id:int}/rollback")]
    public async Task<IActionResult> RollbackSkill(
        int id,
        [FromQuery] int to
    ) {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        if (to <= 0) return BadRequest("Invalid target version number");

        var skill = await _db.Skills
            .Include(s => s.Versions)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (skill == null) return NotFound("Cannot find skill");

        if (skill.OwnerId != userId) return Forbid("You do not have permission to rollback this skill");

        var target = skill.Versions.FirstOrDefault(v => v.VersionNumber == to);
        if (target == null) return BadRequest("Version does not exist");

        SkillFrontmatter parsed;
        try {
            parsed = FrontmatterParser.Parse(target.Content);
        }
        catch (Exception ex) {
            return BadRequest(ex.Message);
        }

        // compute next version number
        var nextVersionNumber = skill.Versions.Count != 0
            ? skill.Versions.Max(v => v.VersionNumber) + 1
            : 1;

        // create new version with copied content
        var newVersion = new SkillVersion {
            SkillId = skill.Id,
            VersionNumber = nextVersionNumber,
            Content = target.Content,
            CreatedAt = DateTimeOffset.UtcNow
        };

        // update skill metadata + updated time
        skill.Name = parsed.Name;
        skill.Description = parsed.Description;
        skill.UpdatedAt = DateTimeOffset.UtcNow;

        _db.SkillVersions.Add(newVersion);
        await _db.SaveChangesAsync();

        return Ok(new SkillVersionDto(
            newVersion.VersionNumber,
            newVersion.CreatedAt
        ));
    }
}
