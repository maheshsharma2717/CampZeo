using MC.Basic.API.Helpers;
using MC.Basic.API;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

var app = builder
    .ConfigureServices()
    .ConfigurePipeline();
//await app.ResetDatabaseAsync();

app.Run();
