using Calender_WebApp;
using Calender_WebApp.Models;
using Calender_WebApp.Services;
using Calender_WebApp.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

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
        builder.Services.AddScoped<AuthService>();
        builder.Services.AddScoped<IAdminsService, AdminsService>();
        builder.Services.AddScoped<IEmployeesService, EmployeesService>();
        builder.Services.AddScoped<IEventParticipationService, EventParticipationService>();
        builder.Services.AddScoped<IEventsService, EventsService>();
        builder.Services.AddScoped<IGroupMembershipsService, GroupMembershipsService>();
        builder.Services.AddScoped<IGroupsService, GroupsService>();
        builder.Services.AddScoped<IOfficeAttendanceService, OfficeAttendanceService>();
        builder.Services.AddScoped<IRoomBookingsService, RoomBookingsService>();
        builder.Services.AddScoped<IRoomsService, RoomsService>();
        builder.Services.AddScoped<IRemindersService, RemindersService>();
        builder.Services.AddScoped<IReminderPreferencesService, ReminderPreferencesService>();


        // Add Swagger/OpenAPI services
        
        // Controllers + Swagger
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen(options =>
        {
            options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                In = Microsoft.OpenApi.Models.ParameterLocation.Header,
                Description = "Voer JWT token in: Bearer {token}",
                Name = "Authorization",
                Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
                Scheme = "Bearer"
            });

            options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement {
            {
                new Microsoft.OpenApi.Models.OpenApiSecurityScheme {
                    Reference = new Microsoft.OpenApi.Models.OpenApiReference {
                        Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                        Id = "Bearer"
                    }
                }, new string[] { }
            }});
        });
        builder.Services.AddSession(options =>
                    {
                        options.IdleTimeout = TimeSpan.FromMinutes(20); 
                        options.Cookie.HttpOnly = true;                
                        options.Cookie.IsEssential = true;             
                    });
        var frontendUrl1 = builder.Configuration["FrontendUrl"] ?? "http://localhost:3000";
        var frontendUrl2 = builder.Configuration["FrontendUrl2"] ?? "http://frontend:3000";
        builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowReactApp", corsBuilder =>
                {
                    corsBuilder.WithOrigins(frontendUrl1, frontendUrl2)
                            .AllowAnyHeader()
                            .AllowAnyMethod()
                            .AllowCredentials();
                });
            });
                    // JWT Authentication
        var jwt = builder.Configuration.GetSection("Jwt");
        builder.Services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = jwt["Issuer"],
                ValidAudience = jwt["Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["Key"]!))
            };
        });
        builder.Services.AddAuthorization();



        var app = builder.Build();

        // Ensure database is created and migrated to latest version on startup
        using (var scope = app.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            db.Database.Migrate();
        }
        app.Urls.Add("http://0.0.0.0:3001");
        
        // Redirect root URL to Swagger
        app.MapGet("/", () => Results.Redirect("/swagger")).ExcludeFromDescription();

        // Configure the HTTP request pipeline.
        if (!app.Environment.IsDevelopment())
        {
            app.UseExceptionHandler("/Home/Error");
            app.UseHsts();
        }

        // Enable Swagger middleware
        app.UseSwagger();
        app.UseSwaggerUI();

        if (!app.Environment.IsDevelopment())
        {
            app.UseHttpsRedirection();
        }
        app.UseStaticFiles();
        app.UseRouting();
        app.UseCors("AllowReactApp");

        app.UseAuthentication();
        app.UseAuthorization();

        app.UseSession();

        app.MapControllers();

        // One-time setup / seeding
        using (var scope = app.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            // Optional: migrate any existing plain passwords to bcrypt hashes
            foreach (var user in db.Employees.ToList())
            {
                if (!user.Password.StartsWith("$2")) // bcrypt hashes start with "$2"
                {
                    user.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);
                }
            }

            if (!db.Employees.Any())
            {
                var bartEmployee = new EmployeesModel
                {
                    Name = "bart",
                    Email = "bart@test.com",
                    Password = BCrypt.Net.BCrypt.HashPassword("1234"), // hash before saving
                    Role = UserRole.SuperAdmin
                };
                db.Employees.Add(bartEmployee);
                db.SaveChanges(); // Save to generate the ID

                // Create default reminder preferences for bart
                var bartPreferences = new ReminderPreferencesModel
                {
                    Id = bartEmployee.Id!.Value
                };
                db.ReminderPreferences.Add(bartPreferences);
            }

            db.SaveChanges();
        }

        app.Run();
    }
}