using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Calender_WebApp.Migrations
{
    /// <inheritdoc />
    public partial class RoomBookings_AddIdAndUniqueIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_roombookings",
                table: "roombookings");

            migrationBuilder.AddColumn<int>(
                name: "booking_id",
                table: "roombookings",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0)
                .Annotation("Sqlite:Autoincrement", true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_roombookings",
                table: "roombookings",
                column: "booking_id");

            migrationBuilder.CreateIndex(
                name: "IX_roombookings_room_id",
                table: "roombookings",
                column: "room_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_roombookings",
                table: "roombookings");

            migrationBuilder.DropIndex(
                name: "IX_roombookings_room_id",
                table: "roombookings");

            migrationBuilder.DropColumn(
                name: "booking_id",
                table: "roombookings");

            migrationBuilder.AddPrimaryKey(
                name: "PK_roombookings",
                table: "roombookings",
                columns: new[] { "room_id", "user_id" });
        }
    }
}
