using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Calender_WebApp.Migrations
{
    /// <inheritdoc />
    public partial class AddEndTimeAndLocationToEvents : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Add location column
            migrationBuilder.AddColumn<string>(
                name: "location",
                table: "events",
                type: "TEXT",
                nullable: true)
                .Annotation("Relational:ColumnOrder", 5);

            // Add end_time column
            migrationBuilder.AddColumn<string>(
                name: "end_time",
                table: "events",
                type: "TEXT",
                nullable: false,
                defaultValue: "")
                .Annotation("Relational:ColumnOrder", 4);

            // Populate end_time from duration_minutes
            migrationBuilder.Sql(@"
                UPDATE events 
                SET end_time = datetime(event_date, '+' || COALESCE(duration_minutes, 60) || ' minutes')
                WHERE end_time = '';
            ");

            // Shift room_id and created_by column orders
            migrationBuilder.AlterColumn<int?>(
                name: "room_id",
                table: "events",
                type: "INTEGER",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "INTEGER",
                oldNullable: true)
                .Annotation("Relational:ColumnOrder", 6)
                .OldAnnotation("Relational:ColumnOrder", 5);

            migrationBuilder.AlterColumn<int>(
                name: "created_by",
                table: "events",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER")
                .Annotation("Relational:ColumnOrder", 7)
                .OldAnnotation("Relational:ColumnOrder", 6);

            // Drop duration_minutes column
            migrationBuilder.DropColumn(
                name: "duration_minutes",
                table: "events");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Reverse: add duration_minutes back
            migrationBuilder.AddColumn<int>(
                name: "duration_minutes",
                table: "events",
                type: "INTEGER",
                nullable: false,
                defaultValue: 60)
                .Annotation("Relational:ColumnOrder", 4);

            // Shift column orders back
            migrationBuilder.AlterColumn<int?>(
                name: "room_id",
                table: "events",
                type: "INTEGER",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "INTEGER",
                oldNullable: true)
                .Annotation("Relational:ColumnOrder", 5)
                .OldAnnotation("Relational:ColumnOrder", 6);

            migrationBuilder.AlterColumn<int>(
                name: "created_by",
                table: "events",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER")
                .Annotation("Relational:ColumnOrder", 6)
                .OldAnnotation("Relational:ColumnOrder", 7);

            // Compute duration from end_time
            migrationBuilder.Sql(@"
                UPDATE events 
                SET duration_minutes = CAST((julianday(end_time) - julianday(event_date)) * 24 * 60 AS INTEGER)
                WHERE end_time IS NOT NULL;
            ");

            // Drop new columns
            migrationBuilder.DropColumn(
                name: "end_time",
                table: "events");

            migrationBuilder.DropColumn(
                name: "location",
                table: "events");
        }
    }
}
