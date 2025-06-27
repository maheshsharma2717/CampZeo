using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MC.Basic.Persistance.Migrations
{
    /// <inheritdoc />
    public partial class YoutubeVideo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "VideoId",
                table: "CampaignPosts",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "VideoId",
                table: "CampaignPosts");
        }
    }
}
