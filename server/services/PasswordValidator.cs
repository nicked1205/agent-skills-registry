namespace server.services;

public static class PasswordValidator {
    public static void Validate(string password) {
        if (password.Length < 8) throw new ArgumentException("Password must be at least 8 characters long");

        if (!password.Any(char.IsDigit)) throw new ArgumentException("Password must contain at least one digit");
    }
}
