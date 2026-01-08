using System.ComponentModel.DataAnnotations;

namespace server.models;

public class Tag
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    [Required]
    [MaxLength(20)]
    public string Name { get; set; } = string.Empty;

    public List<SkillTag> SkillTags { get; set; } = [];
}

