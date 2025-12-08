
using Microsoft.EntityFrameworkCore;
using Calender_WebApp.Models;


namespace Calender_WebApp
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<AdminsModel> Admins => Set<AdminsModel>();
        public DbSet<EmployeesModel> Employees => Set<EmployeesModel>();
        public DbSet<GroupsModel> Groups => Set<GroupsModel>();
        public DbSet<EventsModel> Events => Set<EventsModel>();
        public DbSet<EventParticipationModel> EventParticipations => Set<EventParticipationModel>();
        public DbSet<GroupMembershipsModel> GroupMemberships => Set<GroupMembershipsModel>();
        public DbSet<OfficeAttendanceModel> OfficeAttendances => Set<OfficeAttendanceModel>();
        public DbSet<RoomBookingsModel> RoomBookings => Set<RoomBookingsModel>();
        public DbSet<RoomsModel> Rooms => Set<RoomsModel>();
        public DbSet<RemindersModel> Reminders => Set<RemindersModel>();
        public DbSet<ReminderPreferencesModel> ReminderPreferences => Set<ReminderPreferencesModel>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure cascade delete for Employees related entities
            modelBuilder.Entity<EmployeesModel>()
                .HasMany<EventParticipationModel>()
                .WithOne()
                .HasForeignKey(ep => ep.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<EmployeesModel>()
                .HasMany<GroupMembershipsModel>()
                .WithOne()
                .HasForeignKey(gm => gm.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<EmployeesModel>()
                .HasMany<OfficeAttendanceModel>()
                .WithOne()
                .HasForeignKey(oa => oa.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            
            modelBuilder.Entity<EmployeesModel>()
                .HasMany<RoomBookingsModel>()
                .WithOne()
                .HasForeignKey(rb => rb.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<EmployeesModel>()
                .HasMany<ReminderPreferencesModel>()
                .WithOne()
                .HasForeignKey(rp => rp.Id)
                .OnDelete(DeleteBehavior.Cascade);
            
            modelBuilder.Entity<EmployeesModel>()
                .HasMany<RemindersModel>()
                .WithOne()
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            
            modelBuilder.Entity<AdminsModel>()
                .HasOne<EmployeesModel>()
                .WithMany(e => e.Admins)
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure cascade delete for Events related entities
            modelBuilder.Entity<EventsModel>()
                .HasMany<EventParticipationModel>()
                .WithOne()
                .HasForeignKey(ep => ep.EventId)
                .OnDelete(DeleteBehavior.Cascade);
            
            modelBuilder.Entity<EventsModel>()
                .HasMany<RemindersModel>()
                .WithOne()
                .HasForeignKey(r => r.RelatedEventId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure cascade delete for Groups related entities
            modelBuilder.Entity<GroupsModel>()
                .HasMany<GroupMembershipsModel>()
                .WithOne()
                .HasForeignKey(gm => gm.GroupId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure cascade delete for Rooms related entities
            modelBuilder.Entity<RoomsModel>()
                .HasMany<RoomBookingsModel>()
                .WithOne()
                .HasForeignKey(rb => rb.RoomId)
                .OnDelete(DeleteBehavior.Cascade);
            
            modelBuilder.Entity<RoomBookingsModel>()
                .HasMany<RemindersModel>()
                .WithOne()
                .HasForeignKey(r => r.RelatedRoomId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure entity relationships and constraints here if needed
        }
    }
}
