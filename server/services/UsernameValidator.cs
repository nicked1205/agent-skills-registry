namespace server.services;

public static class UsernameValidator {
    public static void Validate(string password) {
        if (password.Length < 3 || password.Length > 100) throw new ArgumentException("Username must be between 3 and 100 characters long");

        if (!password.All(c => char.IsLetterOrDigit(c) || c == '_' || c == '.')) throw new ArgumentException(
                "Username may only contain letters, numbers, underscores (_), and dots (.)"
            );
    }
}
