using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Calender_WebApp.Migrations
{
    /// <inheritdoc />
    public partial class Migration_Fix : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_admins_employees_EmployeeId",
                table: "admins");

            migrationBuilder.DropForeignKey(
                name: "FK_eventparticipation_employees_EmployeeId",
                table: "eventparticipation");

            migrationBuilder.DropForeignKey(
                name: "FK_eventparticipation_events_EventId1",
                table: "eventparticipation");

            migrationBuilder.DropForeignKey(
                name: "FK_groupmemberships_employees_EmployeeId",
                table: "groupmemberships");

            migrationBuilder.DropForeignKey(
                name: "FK_groupmemberships_groups_GroupId1",
                table: "groupmemberships");

            migrationBuilder.DropForeignKey(
                name: "FK_officeattendance_employees_EmployeeId",
                table: "officeattendance");

            migrationBuilder.DropForeignKey(
                name: "FK_reminderpreferences_employees_user_id",
                table: "reminderpreferences");

            migrationBuilder.DropForeignKey(
                name: "FK_reminders_employees_user_id",
                table: "reminders");

            migrationBuilder.DropForeignKey(
                name: "FK_reminders_events_related_event_id",
                table: "reminders");

            migrationBuilder.DropForeignKey(
                name: "FK_reminders_roombookings_related_room_id",
                table: "reminders");

            migrationBuilder.DropForeignKey(
                name: "FK_roombookings_employees_EmployeeId",
                table: "roombookings");

            migrationBuilder.DropForeignKey(
                name: "FK_roombookings_rooms_RoomId1",
                table: "roombookings");

            migrationBuilder.DropIndex(
                name: "IX_roombookings_EmployeeId",
                table: "roombookings");

            migrationBuilder.DropIndex(
                name: "IX_roombookings_RoomId1",
                table: "roombookings");

            migrationBuilder.DropIndex(
                name: "IX_reminders_related_event_id",
                table: "reminders");

            migrationBuilder.DropIndex(
                name: "IX_reminders_related_room_id",
                table: "reminders");

            migrationBuilder.DropIndex(
                name: "IX_reminders_user_id",
                table: "reminders");

            migrationBuilder.DropIndex(
                name: "IX_officeattendance_EmployeeId",
                table: "officeattendance");

            migrationBuilder.DropIndex(
                name: "IX_groupmemberships_EmployeeId",
                table: "groupmemberships");

            migrationBuilder.DropIndex(
                name: "IX_groupmemberships_GroupId1",
                table: "groupmemberships");

            migrationBuilder.DropIndex(
                name: "IX_eventparticipation_EmployeeId",
                table: "eventparticipation");

            migrationBuilder.DropIndex(
                name: "IX_eventparticipation_EventId1",
                table: "eventparticipation");

            migrationBuilder.DropIndex(
                name: "IX_admins_EmployeeId",
                table: "admins");

            migrationBuilder.DropColumn(
                name: "EmployeeId",
                table: "roombookings");

            migrationBuilder.DropColumn(
                name: "RoomId1",
                table: "roombookings");

            migrationBuilder.DropColumn(
                name: "EmployeeId",
                table: "officeattendance");

            migrationBuilder.DropColumn(
                name: "EmployeeId",
                table: "groupmemberships");

            migrationBuilder.DropColumn(
                name: "GroupId1",
                table: "groupmemberships");

            migrationBuilder.DropColumn(
                name: "EmployeeId",
                table: "eventparticipation");

            migrationBuilder.DropColumn(
                name: "EventId1",
                table: "eventparticipation");

            migrationBuilder.DropColumn(
                name: "EmployeeId",
                table: "admins");

            migrationBuilder.AlterColumn<int>(
                name: "user_id",
                table: "reminderpreferences",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER")
                .Annotation("Sqlite:Autoincrement", true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "EmployeeId",
                table: "roombookings",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RoomId1",
                table: "roombookings",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "user_id",
                table: "reminderpreferences",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER")
                .OldAnnotation("Sqlite:Autoincrement", true);

            migrationBuilder.AddColumn<int>(
                name: "EmployeeId",
                table: "officeattendance",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "EmployeeId",
                table: "groupmemberships",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "GroupId1",
                table: "groupmemberships",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "EmployeeId",
                table: "eventparticipation",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "EventId1",
                table: "eventparticipation",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "EmployeeId",
                table: "admins",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_roombookings_EmployeeId",
                table: "roombookings",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_roombookings_RoomId1",
                table: "roombookings",
                column: "RoomId1");

            migrationBuilder.CreateIndex(
                name: "IX_reminders_related_event_id",
                table: "reminders",
                column: "related_event_id");

            migrationBuilder.CreateIndex(
                name: "IX_reminders_related_room_id",
                table: "reminders",
                column: "related_room_id");

            migrationBuilder.CreateIndex(
                name: "IX_reminders_user_id",
                table: "reminders",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_officeattendance_EmployeeId",
                table: "officeattendance",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_groupmemberships_EmployeeId",
                table: "groupmemberships",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_groupmemberships_GroupId1",
                table: "groupmemberships",
                column: "GroupId1");

            migrationBuilder.CreateIndex(
                name: "IX_eventparticipation_EmployeeId",
                table: "eventparticipation",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_eventparticipation_EventId1",
                table: "eventparticipation",
                column: "EventId1");

            migrationBuilder.CreateIndex(
                name: "IX_admins_EmployeeId",
                table: "admins",
                column: "EmployeeId");

            migrationBuilder.AddForeignKey(
                name: "FK_admins_employees_EmployeeId",
                table: "admins",
                column: "EmployeeId",
                principalTable: "employees",
                principalColumn: "user_id");

            migrationBuilder.AddForeignKey(
                name: "FK_eventparticipation_employees_EmployeeId",
                table: "eventparticipation",
                column: "EmployeeId",
                principalTable: "employees",
                principalColumn: "user_id");

            migrationBuilder.AddForeignKey(
                name: "FK_eventparticipation_events_EventId1",
                table: "eventparticipation",
                column: "EventId1",
                principalTable: "events",
                principalColumn: "event_id");

            migrationBuilder.AddForeignKey(
                name: "FK_groupmemberships_employees_EmployeeId",
                table: "groupmemberships",
                column: "EmployeeId",
                principalTable: "employees",
                principalColumn: "user_id");

            migrationBuilder.AddForeignKey(
                name: "FK_groupmemberships_groups_GroupId1",
                table: "groupmemberships",
                column: "GroupId1",
                principalTable: "groups",
                principalColumn: "group_id");

            migrationBuilder.AddForeignKey(
                name: "FK_officeattendance_employees_EmployeeId",
                table: "officeattendance",
                column: "EmployeeId",
                principalTable: "employees",
                principalColumn: "user_id");

            migrationBuilder.AddForeignKey(
                name: "FK_reminderpreferences_employees_user_id",
                table: "reminderpreferences",
                column: "user_id",
                principalTable: "employees",
                principalColumn: "user_id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_reminders_employees_user_id",
                table: "reminders",
                column: "user_id",
                principalTable: "employees",
                principalColumn: "user_id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_reminders_events_related_event_id",
                table: "reminders",
                column: "related_event_id",
                principalTable: "events",
                principalColumn: "event_id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_reminders_roombookings_related_room_id",
                table: "reminders",
                column: "related_room_id",
                principalTable: "roombookings",
                principalColumn: "booking_id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_roombookings_employees_EmployeeId",
                table: "roombookings",
                column: "EmployeeId",
                principalTable: "employees",
                principalColumn: "user_id");

            migrationBuilder.AddForeignKey(
                name: "FK_roombookings_rooms_RoomId1",
                table: "roombookings",
                column: "RoomId1",
                principalTable: "rooms",
                principalColumn: "room_id");
        }
    }
}
