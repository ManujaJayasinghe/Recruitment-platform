using System.Reflection;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using RecruitmentPlatform.API.Middleware;
using RecruitmentPlatform.Application.Interfaces;
using RecruitmentPlatform.Application.Services;
using RecruitmentPlatform.Domain.Interfaces;
using RecruitmentPlatform.Infrastructure.Data;
using RecruitmentPlatform.Infrastructure.Notifications;
using RecruitmentPlatform.Infrastructure.Repositories;
using RecruitmentPlatform.Infrastructure.Services;
using Serilog;

// ── Serilog Configuration ─────────────────────────────────────────────────────
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .MinimumLevel.Override("Microsoft.AspNetCore", Serilog.Events.LogEventLevel.Warning)
    .Enrich.FromLogContext()
    .WriteTo.Console(
        outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj} {Properties:j}{NewLine}{Exception}")
    .WriteTo.File(
        path: "logs/log-.txt",
        rollingInterval: RollingInterval.Day,
        outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {Message:lj} {Properties:j}{NewLine}{Exception}",
        retainedFileCountLimit: 30)
    .CreateLogger();

try
{
    Log.Information("Starting Recruitment Platform API");

var builder = WebApplication.CreateBuilder(args);

// Use Serilog for logging
builder.Host.UseSerilog();

// ── Database ──────────────────────────────────────────────────────────────────
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));

// ── JWT Authentication ────────────────────────────────────────────────────────
var jwtSecret   = builder.Configuration["Jwt:Secret"]!;
var jwtIssuer   = builder.Configuration["Jwt:Issuer"]!;
var jwtAudience = builder.Configuration["Jwt:Audience"]!;

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        // Use the legacy handler to match JwtSecurityToken generation (avoids kid mismatch with newer JsonWebToken handler)
        options.UseSecurityTokenValidators = true;

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer           = true,
            ValidateAudience         = true,
            ValidateLifetime         = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer              = jwtIssuer,
            ValidAudience            = jwtAudience,
            IssuerSigningKey         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            // Important: Map the role claim correctly for authorization
            RoleClaimType            = ClaimTypes.Role,
            NameClaimType            = ClaimTypes.NameIdentifier,
        };

        Console.WriteLine($"[JWT Config] ValidIssuer:    {jwtIssuer}");
        Console.WriteLine($"[JWT Config] ValidAudience:  {jwtAudience}");
        Console.WriteLine($"[JWT Config] SigningKey length: {jwtSecret.Length} chars");

        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                Log.Error("[JWT Auth Failed] {ExceptionType}: {Message}", 
                    context.Exception.GetType().Name, 
                    context.Exception.Message);
                return Task.CompletedTask;
            },
            OnTokenValidated = context =>
            {
                var claims = context.Principal?.Claims.Select(c => $"{c.Type}={c.Value}");
                Log.Information("[JWT Token Validated] User: {UserId}, Role: {Role}", 
                    context.Principal?.FindFirst(ClaimTypes.NameIdentifier)?.Value,
                    context.Principal?.FindFirst(ClaimTypes.Role)?.Value);
                return Task.CompletedTask;
            },
            OnChallenge = context =>
            {
                Log.Warning("[JWT Challenge] Path: {Path}, Error: {Error}, ErrorDescription: {ErrorDescription}",
                    context.Request.Path,
                    context.Error,
                    context.ErrorDescription);
                return Task.CompletedTask;
            },
            OnMessageReceived = context =>
            {
                var authHeader = context.Request.Headers["Authorization"].ToString();
                Log.Information("[JWT Message Received] Path: {Path}, Auth Header: {AuthHeader}",
                    context.Request.Path,
                    string.IsNullOrEmpty(authHeader) ? "(none)" : authHeader.Substring(0, Math.Min(20, authHeader.Length)) + "...");
                return Task.CompletedTask;
            }
        };
    });

// ── Controllers & Swagger ─────────────────────────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Recruitment Platform API",
        Version = "v1",
        Description = "A comprehensive recruitment platform API with AI-powered features",
        Contact = new OpenApiContact
        {
            Name = "Recruitment Platform Team",
            Email = "support@recruitmentplatform.dev"
        }
    });

    // Include XML comments from controller doc-comments
    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        c.IncludeXmlComments(xmlPath);
    }

    // JWT Authentication in Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter your token below (without 'Bearer' prefix and without quotes)",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// ── Application Services ──────────────────────────────────────────────────────
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<IPasswordHasher, BCryptPasswordHasher>();
builder.Services.AddScoped<ITokenService, JwtTokenService>();
builder.Services.AddSingleton<IAIService, OpenAIService>();
builder.Services.AddScoped<ResumeParsingService>();

// Candidate ranking strategies - swap implementation here to change strategy
// Options: EmbeddingMatchStrategy (default, AI-powered) or KeywordMatchStrategy (simple keyword overlap)
builder.Services.AddScoped<ICandidateRankingStrategy, EmbeddingMatchStrategy>();
builder.Services.AddScoped<RankingService>();

// ── Notifications ─────────────────────────────────────────────────────────────
builder.Services.AddScoped<EmailNotificationChannel>();
builder.Services.AddScoped<SmsNotificationChannel>();
builder.Services.AddScoped<INotificationFactory, NotificationFactory>();

// ── Calendar Integration ──────────────────────────────────────────────────────
builder.Services.AddScoped<ICalendarService, GoogleCalendarService>();

// ── Build ─────────────────────────────────────────────────────────────────────
var app = builder.Build();

Log.Information("Database provider: Microsoft.EntityFrameworkCore.SqlServer");
Log.Information("Connection string configured for database");

// Seed sample data in Development only
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await DbSeeder.SeedAsync(db);
}

// ── Middleware Pipeline ───────────────────────────────────────────────────────

// Serilog request logging - logs all HTTP requests
app.UseSerilogRequestLogging(options =>
{
    options.MessageTemplate = "HTTP {RequestMethod} {RequestPath} responded {StatusCode} in {Elapsed:0.0000} ms";
    options.EnrichDiagnosticContext = (diagnosticContext, httpContext) =>
    {
        diagnosticContext.Set("RequestHost", httpContext.Request.Host.Value);
        diagnosticContext.Set("UserAgent", httpContext.Request.Headers["User-Agent"].ToString());
    };
});

// Global exception handler (must be early in pipeline)
app.UseMiddleware<GlobalExceptionHandlerMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Recruitment Platform API v1");
        c.RoutePrefix = "swagger";
        c.DocumentTitle = "Recruitment Platform API";
        c.DisplayRequestDuration();
    });
}

app.UseHttpsRedirection();

// Static files - but block direct access to uploads folder
app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        // Block direct access to /uploads folder - must go through authenticated API
        if (ctx.Context.Request.Path.StartsWithSegments("/uploads"))
        {
            ctx.Context.Response.StatusCode = 403; // Forbidden
            ctx.Context.Response.ContentLength = 0;
            ctx.Context.Response.Body = Stream.Null;
        }
    }
});

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

Log.Information("Application configured and ready to start");
app.Run();

}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
