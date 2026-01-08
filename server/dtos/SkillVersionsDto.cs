namespace server.dtos;

public record CreateSkillVersionRequest(
    string RawContent
);

public record SkillVersionDto(
    int VersionNumber,
    DateTimeOffset CreatedAt
);