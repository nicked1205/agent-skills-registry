namespace server.dtos;

public record DiffLineDto(
    string Type,
    string Content,
    int? OldLineNumber,
    int? NewLineNumber,
    List<DiffWordDto>? Words
);

public record DiffWordDto(
    string Type,
    string Content
);

public record VersionsDiffDto(
    int FromVersion,
    int ToVersion,
    List<DiffLineDto> Lines
);