using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Calender_WebApp.Migrations
{
    /// <inheritdoc />
    public partial class ReverseRelationEventToBooking : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_roombookings_events_event_id",
                table: "roombookings");

            migrationBuilder.DropIndex(
                name: "IX_roombookings_event_id",
                table: "roombookings");

            migrationBuilder.DropColumn(
                name: "event_id",
                table: "roombookings");

            migrationBuilder.AlterColumn<string>(
                name: "purpose",
                table: "roombookings",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT")
                .Annotation("Relational:ColumnOrder", 5)
                .OldAnnotation("Relational:ColumnOrder", 6);

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

            migrationBuilder.AlterColumn<string>(
                name: "purpose",
                table: "roombookings",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT")
                .Annotation("Relational:ColumnOrder", 6)
                .OldAnnotation("Relational:ColumnOrder", 5);

            migrationBuilder.AddColumn<int>(
                name: "event_id",
                table: "roombookings",
                type: "INTEGER",
                nullable: true)
                .Annotation("Relational:ColumnOrder", 5);

            migrationBuilder.CreateIndex(
                name: "IX_roombookings_event_id",
                table: "roombookings",
                column: "event_id",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_roombookings_events_event_id",
                table: "roombookings",
                column: "event_id",
                principalTable: "events",
                principalColumn: "event_id");
        }
    }
}
