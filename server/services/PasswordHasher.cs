using System.Security.Cryptography;

namespace server.services;

public static class PasswordHasher
{
    private const int SaltSize = 16;
    private const int KeySize = 32;
    private const int Iterations = 100_000;

    public static string HashPassword(string password)
    {
        using var deriveBytes = new Rfc2898DeriveBytes(
            password,
            SaltSize,
            Iterations,
            HashAlgorithmName.SHA256
        );

        var salt = deriveBytes.Salt;
        var key = deriveBytes.GetBytes(KeySize);

        return $"{Convert.ToBase64String(salt)}.{Convert.ToBase64String(key)}";
    }

    public static bool VerifyPassword(string password, string storedHash)
    {
        var parts = storedHash.Split('.');
        if (parts.Length != 2) return false;

        var salt = Convert.FromBase64String(parts[0]);
        var expectedKey = Convert.FromBase64String(parts[1]);

        using var deriveBytes = new Rfc2898DeriveBytes(
            password,
            salt,
            Iterations,
            HashAlgorithmName.SHA256
        );

        var actualKey = deriveBytes.GetBytes(KeySize);
        return CryptographicOperations.FixedTimeEquals(expectedKey, actualKey);
    }
}
