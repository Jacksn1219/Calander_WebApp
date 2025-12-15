using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Calender_WebApp.Migrations
{
    /// <inheritdoc />
    public partial class ChangeisSentToisReadReminder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "is_sent",
                table: "reminders",
                newName: "is_read");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "is_read",
                table: "reminders",
                newName: "is_sent");
        }
    }
}
