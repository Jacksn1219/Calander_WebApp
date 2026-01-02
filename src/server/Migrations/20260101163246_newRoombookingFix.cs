using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Calender_WebApp.Migrations
{
    /// <inheritdoc />
    public partial class newRoombookingFix : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_roombookings_event_id",
                table: "roombookings");

            migrationBuilder.CreateIndex(
                name: "IX_roombookings_event_id",
                table: "roombookings",
                column: "event_id",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_roombookings_event_id",
                table: "roombookings");

            migrationBuilder.CreateIndex(
                name: "IX_roombookings_event_id",
                table: "roombookings",
                column: "event_id");
        }
    }
}
