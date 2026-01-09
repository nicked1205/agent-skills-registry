namespace server.dtos;

// in case we decide to modify other things aside from the md in the future
public record CreateSkillVersionRequest(
    string RawContent
);

// in case we have to return more than just version num and created date
public record SkillVersionDto(
    int VersionNumber,
    DateTimeOffset CreatedAt
);