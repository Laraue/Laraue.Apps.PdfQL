using Laraue.Apps.PdfQL.AppServices;
using Laraue.PdfQL;
using Laraue.PdfQL.PdfObjects.Serializing;

var builder = WebApplication.CreateBuilder(args);

builder.Logging.AddJsonConsole();

builder.Services.AddSingleton<IPdfqlService, PdfqlService>();
builder.Services.AddSingleton<IPdfqlExecutor, PdfqlExecutor>();
builder.Services.AddSingleton<ISerializer, Serializer>();
builder.Services.AddControllers();

builder.Services.AddHealthChecks();

builder.WebHost.ConfigureKestrel(options => options.Limits.MaxRequestBodySize = 50 * 1024 * 1024);

var app = builder.Build();

var origins = builder
    .Configuration
    .GetRequiredSection("Cors:Hosts")
    .Get<string[]>() ?? throw new InvalidOperationException("Hosts section not found");

app.UseCors(corsPolicyBuilder =>
    corsPolicyBuilder.WithOrigins(origins)
        .AllowCredentials()
        .AllowAnyMethod()
        .AllowAnyHeader());

app.MapControllers();
app.MapHealthChecks("/_health");

app.Run();