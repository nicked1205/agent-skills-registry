namespace server.dtos;

// used in many endpoints and matches skill.ts in frontend
public class SkillDetailsDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsPublic { get; set; }

    public string OwnerUsername { get; set; } = string.Empty;

    public int LatestVersion { get; set; }
    public string Content { get; set; } = string.Empty;

    public DateTimeOffset UpdatedAt { get; set; }
}
