namespace server.dtos;

// in case we provide a reason or expiry for setting skill to public or private in the future
public record UpdateVisibilityRequest(bool IsPublic);