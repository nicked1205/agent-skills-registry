using System.ComponentModel.DataAnnotations;

namespace server.models;

public class Tag
{
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    public string Name { get; set; } = string.Empty;

    public List<SkillTag> SkillTags { get; set; } = [];
}
