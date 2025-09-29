using Calender_WebApp.Services.Interfaces;
using Calender_WebApp.Services;
using Microsoft.EntityFrameworkCore;

namespace Calender_WebApp;

class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        builder.Services.AddDbContext<AppDbContext>(options =>
            options.UseSqlite(builder.Configuration.GetConnectionString("Default")));




        // Add services to the container.
        builder.Services.AddControllersWithViews();

        // Register dependency injection for services
        builder.Services.AddScoped<IAdminsService, AdminsService>();
        builder.Services.AddScoped<IEmployeesService, EmployeesService>();
        builder.Services.AddScoped<IEventParticipationService, EventParticipationService>();
        builder.Services.AddScoped<IEventsService, EventsService>();
        builder.Services.AddScoped<IGroupMembershipsService, GroupMembershipsService>();
        builder.Services.AddScoped<IGroupsService, GroupsService>();
        builder.Services.AddScoped<IOfficeAttendanceService, OfficeAttendanceService>();


        // Add Swagger/OpenAPI services
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();

        var app = builder.Build();

        // Configure the HTTP request pipeline.
        if (!app.Environment.IsDevelopment())
        {
            app.UseExceptionHandler("/Home/Error");
            // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
            app.UseHsts();
        }

        // Enable Swagger middleware
        app.UseSwagger();
        app.UseSwaggerUI();

        app.UseHttpsRedirection();
        app.UseRouting();

        app.UseAuthorization();

        app.MapStaticAssets();

        app.MapControllerRoute(
            name: "default",
            pattern: "{controller=Home}/{action=Index}/{id?}")
            .WithStaticAssets();

        app.Run();
    }
}
