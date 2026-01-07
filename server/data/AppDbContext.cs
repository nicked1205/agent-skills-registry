using Microsoft.EntityFrameworkCore;
using server.models;

namespace server.data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
        
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Skill> Skills => Set<Skill>();
    public DbSet<SkillVersion> SkillVersions => Set<SkillVersion>();
    public DbSet<Tag> Tags => Set<Tag>();
    public DbSet<SkillTag> SkillTags => Set<SkillTag>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // unique username
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Username)
            .IsUnique();

        // unique tag name
        modelBuilder.Entity<Tag>()
            .HasIndex(t => t.Name)
            .IsUnique();

        // SkillTag composite key (many-to-many)
        modelBuilder.Entity<SkillTag>()
            .HasKey(st => new { st.SkillId, st.TagId });

        modelBuilder.Entity<SkillTag>()
            .HasOne(st => st.Skill)
            .WithMany(s => s.SkillTags)
            .HasForeignKey(st => st.SkillId);

        modelBuilder.Entity<SkillTag>()
            .HasOne(st => st.Tag)
            .WithMany(t => t.SkillTags)
            .HasForeignKey(st => st.TagId);

        // SkillVersion uniqueness per skill + version
        modelBuilder.Entity<SkillVersion>()
            .HasIndex(v => new { v.SkillId, v.VersionNumber })
            .IsUnique();
    }
}
