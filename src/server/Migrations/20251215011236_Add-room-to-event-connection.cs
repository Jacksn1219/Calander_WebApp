using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Calender_WebApp.Migrations
{
    /// <inheritdoc />
    public partial class Addroomtoeventconnection : Migration
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
                .Annotation("Relational:ColumnOrder", 5)
                .OldAnnotation("Relational:ColumnOrder", 4);

            migrationBuilder.AddColumn<int>(
                name: "room_id",
                table: "events",
                type: "INTEGER",
                nullable: true)
                .Annotation("Relational:ColumnOrder", 4);

            migrationBuilder.CreateIndex(
                name: "IX_events_room_id",
                table: "events",
                column: "room_id");

            migrationBuilder.AddForeignKey(
                name: "FK_events_rooms_room_id",
                table: "events",
                column: "room_id",
                principalTable: "rooms",
                principalColumn: "room_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_events_rooms_room_id",
                table: "events");

            migrationBuilder.DropIndex(
                name: "IX_events_room_id",
                table: "events");

            migrationBuilder.DropColumn(
                name: "room_id",
                table: "events");

            migrationBuilder.AlterColumn<int>(
                name: "created_by",
                table: "events",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER")
                .Annotation("Relational:ColumnOrder", 4)
                .OldAnnotation("Relational:ColumnOrder", 5);
        }
    }
}
