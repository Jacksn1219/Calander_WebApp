using Calender_WebApp.Services.Interfaces;
using Calender_WebApp.Services;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;

namespace Calender_WebApp;

class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        builder.Services.AddDbContext<AppDbContext>(options =>
            options.UseSqlite(builder.Configuration.GetConnectionString("Default")));

        builder.Services.AddControllers();
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();

        // 🔐 Authentication
        builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
            .AddCookie(options =>
            {
                options.LoginPath = "/auth/login";
                options.LogoutPath = "/auth/logout";
                options.AccessDeniedPath = "/auth/denied";
                options.ExpireTimeSpan = TimeSpan.FromHours(8);
            });
        builder.Services.AddAuthorization();

        // 🌐 CORS for React frontend
        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AllowFrontend", policy =>
            {
                policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
                      .AllowAnyHeader()
                      .AllowAnyMethod()
                      .AllowCredentials();
            });
        });

        // 🧩 Register app services
        builder.Services.AddScoped<IAdminsService, AdminsService>();
        builder.Services.AddScoped<IEmployeesService, EmployeesService>();
        builder.Services.AddScoped<IEventParticipationService, EventParticipationService>();
        builder.Services.AddScoped<IEventsService, EventsService>();
        builder.Services.AddScoped<IGroupMembershipsService, GroupMembershipsService>();
        builder.Services.AddScoped<IGroupsService, GroupsService>();
        builder.Services.AddScoped<IOfficeAttendanceService, OfficeAttendanceService>();
        builder.Services.AddScoped<IRoomBookingsService, RoomBookingsService>();
        builder.Services.AddScoped<IRoomsService, RoomsService>();

        var app = builder.Build();

        if (!app.Environment.IsDevelopment())
        {
            app.UseExceptionHandler("/Home/Error");
            app.UseHsts();
        }

        app.UseSwagger();
        app.UseSwaggerUI();

        // 🚫 Disable HTTPS redirect in local dev (prevents mixed-content errors)
        // app.UseHttpsRedirection();

        app.UseStaticFiles();

        app.UseRouting();

        app.UseCors("AllowFrontend");
        app.UseAuthentication();
        app.UseAuthorization();

        app.MapControllers();

        app.Run();
    }
}
