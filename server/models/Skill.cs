using System.ComponentModel.DataAnnotations;

namespace server.models;

public class Skill
{
    public int Id { get; set; }

    public int OwnerId { get; set; }
    public User Owner { get; set; } = null!;

    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(500)]
    public string Description { get; set; } = string.Empty;

    public string? AllowedTools { get; set; }

    public bool IsPublic { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public List<SkillVersion> Versions { get; set; } = new();
    public List<SkillTag> SkillTags { get; set; } = new();
}
