
using Microsoft.EntityFrameworkCore;
using Calender_WebApp.Models;


namespace Calender_WebApp
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<EmployeesModel> Employees => Set<EmployeesModel>();

        public DbSet<GroupsModel> Groups => Set<GroupsModel>();
        public DbSet<EventsModel> Events => Set<EventsModel>();
        public DbSet<EventParticipationModel> EventParticipations => Set<EventParticipationModel>();
        public DbSet<GroupMembershipsModel> GroupMemberships => Set<GroupMembershipsModel>();
        public DbSet<OfficeAttendanceModel> OfficeAttendances => Set<OfficeAttendanceModel>();
    }
}
