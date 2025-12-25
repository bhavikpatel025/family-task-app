using FamilyTask.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace FamilyTask.Infrastructure.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Member> Members { get; set; }
        public DbSet<TaskItem> TaskItems { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Member entity
            modelBuilder.Entity<Member>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.EmailAddress).HasMaxLength(200);
                entity.Property(e => e.Roles).HasMaxLength(200);
                entity.Property(e => e.Avatar).HasMaxLength(500);
        
                entity.HasMany(m => m.Tasks)
                    .WithOne(t => t.AssignedMember)
                    .HasForeignKey(t => t.AssignedMemberId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure TaskItem entity
            modelBuilder.Entity<TaskItem>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Subject).IsRequired().HasMaxLength(500);
                entity.Property(e => e.IsComplete).IsRequired();
                entity.Property(e => e.AssignedMemberId).IsRequired(false);
            });
        }
    }
}