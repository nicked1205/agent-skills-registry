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
}