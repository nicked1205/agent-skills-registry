namespace server.dtos;

// match skill-card.ts in the frontend
public record SkillCardDto(
    int Id,
    string Name,
    string Description,
    string OwnerUsername,
    int LatestVersion,
    DateTimeOffset UpdatedAt,
    List<TagDto> Tags,
    bool IsPublic,
    bool IsCloned,
    string? ClonedFromUsername
);
