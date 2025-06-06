using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MC.Basic.Persistance.Migrations
{
    /// <inheritdoc />
    public partial class linkedinFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "LinkedInAccessToken",
                table: "Users",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "LinkedInAuthUrn",
                table: "Users",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LinkedInAccessToken",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "LinkedInAuthUrn",
                table: "Users");
        }
    }
}
