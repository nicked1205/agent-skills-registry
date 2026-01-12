namespace server.dtos;

public record PaginatedResult<T>(
    List<T> Items,
    int Total
);