using System.Text;

namespace server.services;

public record SkillFrontmatter(
    string Name,
    string Description,
    string? AllowedTools,
    string Body
);

public static class FrontmatterParser {
    public static SkillFrontmatter Parse(string markdown) {
        if (!markdown.StartsWith("---")) throw new Exception("Missing frontmatter");

        var parts = markdown.Split("---", 3);
        if (parts.Length < 3) throw new Exception("Invalid frontmatter format"); // assuming all md files is formatted like in the brief

        var frontmatter = parts[1];
        var body = parts[2].Trim();

        string? name = null;
        string? description = null;
        string? allowedTools = null;

        foreach (var line in frontmatter.Split('\n', StringSplitOptions.RemoveEmptyEntries)) {
            var trimmed = line.Trim();
            if (string.IsNullOrWhiteSpace(trimmed)) continue;

            var idx = trimmed.IndexOf(':');
            if (idx == -1) continue;

            var key = trimmed[..idx].Trim().ToLower();
            var value = trimmed[(idx + 1)..].Trim();

            switch (key) {
                case "name":
                    name = value;
                    break;
                case "description":
                    description = value;
                    break;
                case "allowed-tools":
                    allowedTools = value;
                    break;
            }
        }

        if (string.IsNullOrWhiteSpace(name) || string.IsNullOrWhiteSpace(description)) throw new Exception("Frontmatter must include name and description"); // also following the format in the brief

        if (name.Length > 100) throw new Exception($"Skill name must be 100 characters or fewer. Current name length: {name.Length}/100");

        if (description.Length > 500) throw new Exception($"Skill description must be 500 characters or fewer. Current description length: {description.Length}/500");

        return new SkillFrontmatter(
            name,
            description,
            allowedTools,
            body
        );
    }
}
