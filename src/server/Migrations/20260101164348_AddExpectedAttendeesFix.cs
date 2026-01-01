using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Calender_WebApp.Migrations
{
    /// <inheritdoc />
    public partial class AddExpectedAttendeesFix : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "expected_attendees",
                table: "events",
                type: "INTEGER",
                nullable: true)
                .Annotation("Relational:ColumnOrder", 8);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "expected_attendees",
                table: "events");
        }
    }
}
