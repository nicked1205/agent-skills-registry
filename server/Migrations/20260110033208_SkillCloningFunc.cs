using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace server.Migrations
{
    /// <inheritdoc />
    public partial class SkillCloningFunc : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ClonedFromUsername",
                table: "Skills",
                type: "TEXT",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsCloned",
                table: "Skills",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ClonedFromUsername",
                table: "Skills");

            migrationBuilder.DropColumn(
                name: "IsCloned",
                table: "Skills");
        }
    }
}
