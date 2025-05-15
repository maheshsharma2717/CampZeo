using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MC.Basic.Persistance.Migrations
{
    /// <inheritdoc />
    public partial class campaign_remove_checks_for_types : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CampaignPostsId",
                table: "Campaigns");

            migrationBuilder.DropColumn(
                name: "IsEmailCampaign",
                table: "Campaigns");

            migrationBuilder.DropColumn(
                name: "IsFacebookCampaign",
                table: "Campaigns");

            migrationBuilder.DropColumn(
                name: "IsInstagramCampaign",
                table: "Campaigns");

            migrationBuilder.DropColumn(
                name: "IsRCSCampaign",
                table: "Campaigns");

            migrationBuilder.DropColumn(
                name: "IsSmsCampaign",
                table: "Campaigns");

            migrationBuilder.DropColumn(
                name: "IsWhatsAppCampaign",
                table: "Campaigns");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "CampaignPostsId",
                table: "Campaigns",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsEmailCampaign",
                table: "Campaigns",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsFacebookCampaign",
                table: "Campaigns",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsInstagramCampaign",
                table: "Campaigns",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsRCSCampaign",
                table: "Campaigns",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsSmsCampaign",
                table: "Campaigns",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsWhatsAppCampaign",
                table: "Campaigns",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }
    }
}
