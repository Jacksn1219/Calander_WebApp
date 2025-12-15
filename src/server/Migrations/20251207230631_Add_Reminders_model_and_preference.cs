using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Calender_WebApp.Migrations
{
    /// <inheritdoc />
    public partial class Add_Reminders_model_and_preference : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "reminderpreferences",
                columns: table => new
                {
                    user_id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    event_reminder = table.Column<bool>(type: "INTEGER", nullable: false),
                    booking_reminder = table.Column<bool>(type: "INTEGER", nullable: false),
                    reminder_advance_minutes = table.Column<TimeSpan>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_reminderpreferences", x => x.user_id);
                });

            migrationBuilder.CreateTable(
                name: "reminders",
                columns: table => new
                {
                    reminder_id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    user_id = table.Column<int>(type: "INTEGER", nullable: false),
                    reminder_type = table.Column<int>(type: "INTEGER", nullable: false),
                    related_entity_id = table.Column<int>(type: "INTEGER", nullable: false),
                    reminder_time = table.Column<DateTime>(type: "TEXT", nullable: false),
                    is_sent = table.Column<bool>(type: "INTEGER", nullable: false),
                    title = table.Column<string>(type: "TEXT", nullable: false),
                    message = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_reminders", x => x.reminder_id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "reminderpreferences");

            migrationBuilder.DropTable(
                name: "reminders");
        }
    }
}
