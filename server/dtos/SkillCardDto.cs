namespace server.dtos;

public record SkillCardDto(
    int Id,
    string Name,
    string Description,
    string OwnerUsername,
    int LatestVersion,
    DateTimeOffset UpdatedAt,
    List<TagDto> Tags,
    bool IsPublic
);
