using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Calender_WebApp.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "employees",
                columns: table => new
                {
                    user_id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    name = table.Column<string>(type: "TEXT", nullable: false),
                    email = table.Column<string>(type: "TEXT", nullable: false),
                    role = table.Column<int>(type: "INTEGER", nullable: false),
                    password = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_employees", x => x.user_id);
                });

            migrationBuilder.CreateTable(
                name: "groups",
                columns: table => new
                {
                    group_id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    group_name = table.Column<string>(type: "TEXT", nullable: false),
                    description = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_groups", x => x.group_id);
                });

            migrationBuilder.CreateTable(
                name: "reminderpreferences",
                columns: table => new
                {
                    user_id = table.Column<int>(type: "INTEGER", nullable: false),
                    event_reminder = table.Column<bool>(type: "INTEGER", nullable: false),
                    booking_reminder = table.Column<bool>(type: "INTEGER", nullable: false),
                    reminder_advance_minutes = table.Column<TimeSpan>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_reminderpreferences", x => x.user_id);
                });

            migrationBuilder.CreateTable(
                name: "reminders",
                columns: table => new
                {
                    reminder_id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    user_id = table.Column<int>(type: "INTEGER", nullable: false),
                    reminder_type = table.Column<int>(type: "INTEGER", nullable: false),
                    related_room_id = table.Column<int>(type: "INTEGER", nullable: false),
                    related_event_id = table.Column<int>(type: "INTEGER", nullable: false),
                    reminder_time = table.Column<DateTime>(type: "TEXT", nullable: false),
                    is_read = table.Column<bool>(type: "INTEGER", nullable: false),
                    title = table.Column<string>(type: "TEXT", nullable: false),
                    message = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_reminders", x => x.reminder_id);
                });

            migrationBuilder.CreateTable(
                name: "rooms",
                columns: table => new
                {
                    room_id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    room_name = table.Column<string>(type: "TEXT", nullable: false),
                    capacity = table.Column<int>(type: "INTEGER", nullable: false),
                    location = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_rooms", x => x.room_id);
                });

            migrationBuilder.CreateTable(
                name: "admins",
                columns: table => new
                {
                    admin_id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    user_id = table.Column<int>(type: "INTEGER", nullable: false),
                    permissions = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_admins", x => x.admin_id);
                    table.ForeignKey(
                        name: "FK_admins_employees_user_id",
                        column: x => x.user_id,
                        principalTable: "employees",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "officeattendance",
                columns: table => new
                {
                    attendance_id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    user_id = table.Column<int>(type: "INTEGER", nullable: false),
                    date = table.Column<DateTime>(type: "TEXT", nullable: false),
                    status = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_officeattendance", x => x.attendance_id);
                    table.ForeignKey(
                        name: "FK_officeattendance_employees_user_id",
                        column: x => x.user_id,
                        principalTable: "employees",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "groupmemberships",
                columns: table => new
                {
                    user_id = table.Column<int>(type: "INTEGER", nullable: false),
                    group_id = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_groupmemberships", x => new { x.user_id, x.group_id });
                    table.ForeignKey(
                        name: "FK_groupmemberships_employees_user_id",
                        column: x => x.user_id,
                        principalTable: "employees",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_groupmemberships_groups_group_id",
                        column: x => x.group_id,
                        principalTable: "groups",
                        principalColumn: "group_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "events",
                columns: table => new
                {
                    event_id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    title = table.Column<string>(type: "TEXT", nullable: false),
                    description = table.Column<string>(type: "TEXT", nullable: true),
                    event_date = table.Column<DateTime>(type: "TEXT", nullable: false),
                    end_time = table.Column<DateTime>(type: "TEXT", nullable: false),
                    location = table.Column<string>(type: "TEXT", nullable: true),
                    room_id = table.Column<int>(type: "INTEGER", nullable: true),
                    booking_id = table.Column<int>(type: "INTEGER", nullable: true),
                    created_by = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_events", x => x.event_id);
                    table.ForeignKey(
                        name: "FK_events_employees_created_by",
                        column: x => x.created_by,
                        principalTable: "employees",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_events_rooms_room_id",
                        column: x => x.room_id,
                        principalTable: "rooms",
                        principalColumn: "room_id");
                });

            migrationBuilder.CreateTable(
                name: "eventparticipation",
                columns: table => new
                {
                    event_id = table.Column<int>(type: "INTEGER", nullable: false),
                    user_id = table.Column<int>(type: "INTEGER", nullable: false),
                    status = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_eventparticipation", x => new { x.event_id, x.user_id });
                    table.ForeignKey(
                        name: "FK_eventparticipation_employees_user_id",
                        column: x => x.user_id,
                        principalTable: "employees",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_eventparticipation_events_event_id",
                        column: x => x.event_id,
                        principalTable: "events",
                        principalColumn: "event_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "roombookings",
                columns: table => new
                {
                    room_id = table.Column<int>(type: "INTEGER", nullable: false),
                    user_id = table.Column<int>(type: "INTEGER", nullable: false),
                    booking_date = table.Column<DateTime>(type: "TEXT", nullable: false),
                    start_time = table.Column<TimeSpan>(type: "TEXT", nullable: false),
                    end_time = table.Column<TimeSpan>(type: "TEXT", nullable: false),
                    event_id = table.Column<int>(type: "INTEGER", nullable: true),
                    purpose = table.Column<string>(type: "TEXT", nullable: false),
                    booking_id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_roombookings", x => x.booking_id);
                    table.ForeignKey(
                        name: "FK_roombookings_employees_user_id",
                        column: x => x.user_id,
                        principalTable: "employees",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_roombookings_events_event_id",
                        column: x => x.event_id,
                        principalTable: "events",
                        principalColumn: "event_id");
                    table.ForeignKey(
                        name: "FK_roombookings_rooms_room_id",
                        column: x => x.room_id,
                        principalTable: "rooms",
                        principalColumn: "room_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_admins_user_id",
                table: "admins",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_eventparticipation_user_id",
                table: "eventparticipation",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_events_created_by",
                table: "events",
                column: "created_by");

            migrationBuilder.CreateIndex(
                name: "IX_events_room_id",
                table: "events",
                column: "room_id");

            migrationBuilder.CreateIndex(
                name: "IX_groupmemberships_group_id",
                table: "groupmemberships",
                column: "group_id");

            migrationBuilder.CreateIndex(
                name: "IX_officeattendance_user_id",
                table: "officeattendance",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_roombookings_event_id",
                table: "roombookings",
                column: "event_id");

            migrationBuilder.CreateIndex(
                name: "IX_roombookings_room_id",
                table: "roombookings",
                column: "room_id");

            migrationBuilder.CreateIndex(
                name: "IX_roombookings_user_id",
                table: "roombookings",
                column: "user_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "admins");

            migrationBuilder.DropTable(
                name: "eventparticipation");

            migrationBuilder.DropTable(
                name: "groupmemberships");

            migrationBuilder.DropTable(
                name: "officeattendance");

            migrationBuilder.DropTable(
                name: "reminderpreferences");

            migrationBuilder.DropTable(
                name: "reminders");

            migrationBuilder.DropTable(
                name: "roombookings");

            migrationBuilder.DropTable(
                name: "groups");

            migrationBuilder.DropTable(
                name: "events");

            migrationBuilder.DropTable(
                name: "employees");

            migrationBuilder.DropTable(
                name: "rooms");
        }
    }
}
