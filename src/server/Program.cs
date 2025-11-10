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
        builder.Services.AddDistributedMemoryCache();
        builder.Services.AddHttpContextAccessor();

        // Register dependency injection for services
        builder.Services.AddScoped<IAdminsService, AdminsService>();
        builder.Services.AddScoped<IEmployeesService, EmployeesService>();
        builder.Services.AddScoped<IEventParticipationService, EventParticipationService>();
        builder.Services.AddScoped<IEventsService, EventsService>();
        builder.Services.AddScoped<IGroupMembershipsService, GroupMembershipsService>();
        builder.Services.AddScoped<IGroupsService, GroupsService>();
        builder.Services.AddScoped<IOfficeAttendanceService, OfficeAttendanceService>();
        builder.Services.AddScoped<IRoomBookingsService, RoomBookingsService>();
        builder.Services.AddScoped<IRoomsService, RoomsService>();


        // Add Swagger/OpenAPI services
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();
        builder.Services.AddSession(options =>
                    {
                        options.IdleTimeout = TimeSpan.FromMinutes(20); 
                        options.Cookie.HttpOnly = true;                
                        options.Cookie.IsEssential = true;             
                    });
        builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowReactApp", corsBuilder =>
                {
                    corsBuilder.WithOrigins("http://localhost:3000")
                               .AllowAnyHeader()
                               .AllowAnyMethod()
                               .AllowCredentials();
                });
            });

            var app = builder.Build();

            // Ensure database is created and migrated to latest version on startup
            using (var scope = app.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                db.Database.Migrate();
            }
            app.Urls.Add("http://localhost:3001");
        // Configure the HTTP request pipeline.
         if (!app.Environment.IsDevelopment())
            {
                app.UseExceptionHandler("/Home/Error");
                app.UseHsts();
            }

        // Enable Swagger middleware
        app.UseSwagger();
        app.UseSwaggerUI();

        app.UseHttpsRedirection();
        app.UseStaticFiles();
        app.UseRouting();
        app.UseCors("AllowReactApp");
        app.UseSession();
        app.UseAuthorization();

        app.MapStaticAssets();

        app.MapControllerRoute(
            name: "default",
            pattern: "{controller=Home}/{action=Index}/{id?}")
            .WithStaticAssets();

        app.Run();
    }
}
