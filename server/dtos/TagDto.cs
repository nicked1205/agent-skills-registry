namespace server.dtos;

// in case tag stores more information in the future
public class AddTagDto
{
    public string Tag { get; set; } = string.Empty;
}

// in case you want to return more information than just id and name in the future
public record TagDto(int Id, string Name);