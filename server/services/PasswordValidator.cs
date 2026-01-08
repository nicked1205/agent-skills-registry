namespace server.services;

public static class PasswordValidator
{
    public static void Validate(string password)
    {
        if (password.Length < 8)
            throw new ArgumentException("Password must be at least 8 characters long");

        if (!password.Any(char.IsDigit))
            throw new ArgumentException("Password must contain at least one digit");

        if (!password.All(c => char.IsLetterOrDigit(c) || c == '_' || c == '.'))
            throw new ArgumentException(
                "Password may only contain letters, numbers, underscores (_), and dots (.)"
            );
    }
}
