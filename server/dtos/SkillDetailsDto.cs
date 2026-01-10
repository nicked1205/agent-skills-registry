namespace server.dtos;

// match skill-details.ts in frontend
public record SkillDetailsDto(
    int Id,
    string Name,
    string Description,
    bool IsPublic,
    string OwnerUsername,
    int LatestVersion,
    string Content,
    DateTimeOffset UpdatedAt,
    List<TagDto> Tags,
    bool IsCloned,
    string? ClonedFromUsername
);