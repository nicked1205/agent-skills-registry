using System.ComponentModel.DataAnnotations;

namespace server.models;

public class Skill {
    public int Id { get; set; }

    public int OwnerId { get; set; }
    public User Owner { get; set; } = null!;

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(500)]
    public string Description { get; set; } = string.Empty;

    public string? AllowedTools { get; set; }

    public bool IsPublic { get; set; } = false;

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public long UpdatedAtUnix { get; set; } = DateTimeOffset.UtcNow.ToUnixTimeSeconds();

    public List<SkillVersion> Versions { get; set; } = [];
    public List<SkillTag> SkillTags { get; set; } = [];

    public bool IsCloned { get; set; } = false;
    [MaxLength(100)]
    public string? ClonedFromUsername { get; set; }

    public int CloneCount { get; set; } = 0;
    public int DownloadCount { get; set; } = 0;
}
