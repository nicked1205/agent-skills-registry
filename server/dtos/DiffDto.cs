namespace server.dtos;

public record DiffLineDto(
    string Type,
    string Content,
    int? OldLineNumber,
    int? NewLineNumber
);

public record VersionsDiffDto(
    int FromVersion,
    int ToVersion,
    List<DiffLineDto> Lines
);