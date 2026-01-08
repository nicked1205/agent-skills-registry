using System.ComponentModel.DataAnnotations;

namespace server.models;

public class SkillVersion
{
    public int Id { get; set; }

    public int SkillId { get; set; }
    public Skill Skill { get; set; } = null!;

    public int VersionNumber { get; set; }

    [Required]
    public string Content { get; set; } = string.Empty;

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
