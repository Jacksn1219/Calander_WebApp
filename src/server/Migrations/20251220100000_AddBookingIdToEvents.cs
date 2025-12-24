using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Calender_WebApp.Migrations
{
    /// <inheritdoc />
    public partial class AddBookingIdToEvents : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "created_by",
                table: "events",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER")
                .Annotation("Relational:ColumnOrder", 8)
                .OldAnnotation("Relational:ColumnOrder", 7);

            migrationBuilder.AddColumn<int>(
                name: "booking_id",
                table: "events",
                type: "INTEGER",
                nullable: true)
                .Annotation("Relational:ColumnOrder", 7);

            migrationBuilder.CreateIndex(
                name: "IX_events_booking_id",
                table: "events",
                column: "booking_id");

            migrationBuilder.AddForeignKey(
                name: "FK_events_roombookings_booking_id",
                table: "events",
                column: "booking_id",
                principalTable: "roombookings",
                principalColumn: "booking_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_events_roombookings_booking_id",
                table: "events");

            migrationBuilder.DropIndex(
                name: "IX_events_booking_id",
                table: "events");

            migrationBuilder.DropColumn(
                name: "booking_id",
                table: "events");

            migrationBuilder.AlterColumn<int>(
                name: "created_by",
                table: "events",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER")
                .Annotation("Relational:ColumnOrder", 7)
                .OldAnnotation("Relational:ColumnOrder", 8);
        }
    }
}
