using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MC.Basic.Persistance.Migrations
{
    /// <inheritdoc />
    public partial class youtubemigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "YoutubeAccessToken",
                table: "Users",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "YoutubeAuthUrn",
                table: "Users",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "YoutubeAccessToken",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "YoutubeAuthUrn",
                table: "Users");
        }
    }
}
