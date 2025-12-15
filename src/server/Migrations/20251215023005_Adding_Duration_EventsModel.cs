using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Calender_WebApp.Migrations
{
    /// <inheritdoc />
    public partial class Adding_Duration_EventsModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "event_id",
                table: "roombookings",
                type: "INTEGER",
                nullable: true)
                .Annotation("Relational:ColumnOrder", 5);

            migrationBuilder.AlterColumn<int>(
                name: "room_id",
                table: "events",
                type: "INTEGER",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "INTEGER",
                oldNullable: true)
                .Annotation("Relational:ColumnOrder", 5)
                .OldAnnotation("Relational:ColumnOrder", 4);

            migrationBuilder.AlterColumn<int>(
                name: "created_by",
                table: "events",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER")
                .Annotation("Relational:ColumnOrder", 6)
                .OldAnnotation("Relational:ColumnOrder", 5);

            migrationBuilder.AddColumn<int>(
                name: "duration_minutes",
                table: "events",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0)
                .Annotation("Relational:ColumnOrder", 4);

            migrationBuilder.CreateIndex(
                name: "IX_roombookings_event_id",
                table: "roombookings",
                column: "event_id");

            migrationBuilder.AddForeignKey(
                name: "FK_roombookings_events_event_id",
                table: "roombookings",
                column: "event_id",
                principalTable: "events",
                principalColumn: "event_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
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

            migrationBuilder.DropColumn(
                name: "duration_minutes",
                table: "events");

            migrationBuilder.AlterColumn<int>(
                name: "room_id",
                table: "events",
                type: "INTEGER",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "INTEGER",
                oldNullable: true)
                .Annotation("Relational:ColumnOrder", 4)
                .OldAnnotation("Relational:ColumnOrder", 5);

            migrationBuilder.AlterColumn<int>(
                name: "created_by",
                table: "events",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER")
                .Annotation("Relational:ColumnOrder", 5)
                .OldAnnotation("Relational:ColumnOrder", 6);
        }
    }
}
