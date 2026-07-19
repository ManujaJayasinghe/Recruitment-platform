using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using RecruitmentPlatform.Application.Interfaces;
using RecruitmentPlatform.Application.Services;
using RecruitmentPlatform.Domain.Interfaces;
using RecruitmentPlatform.Infrastructure.Data;
using RecruitmentPlatform.Infrastructure.Repositories;
using RecruitmentPlatform.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

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
        };

        Console.WriteLine($"[JWT Config] ValidIssuer:    {jwtIssuer}");
        Console.WriteLine($"[JWT Config] ValidAudience:  {jwtAudience}");
        Console.WriteLine($"[JWT Config] SigningKey length: {jwtSecret.Length} chars");

        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                Console.WriteLine($"[JWT Auth Failed] {context.Exception.GetType().Name}: {context.Exception.Message}");
                return Task.CompletedTask;
            }
        };
    });

// ── CORS ──────────────────────────────────────────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// ── Controllers & Swagger ─────────────────────────────────────────────────────
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Serialize enums as strings instead of integers
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Recruitment Platform API", Version = "v1" });

    // Bearer token input in Swagger UI
    var securityScheme = new OpenApiSecurityScheme
    {
        Name         = "Authorization",
        Description  = "Enter: Bearer {token}",
        In           = ParameterLocation.Header,
        Type         = SecuritySchemeType.Http,
        Scheme       = "bearer",
        BearerFormat = "JWT",
        Reference    = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
    };
    c.AddSecurityDefinition("Bearer", securityScheme);
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        { securityScheme, Array.Empty<string>() }
    });
});

// ── Application Services ──────────────────────────────────────────────────────
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<IPasswordHasher, BCryptPasswordHasher>();
builder.Services.AddScoped<ITokenService, JwtTokenService>();

// ── Notification Services (Factory Pattern) ───────────────────────────────────
// EmailNotificationChannel reads Mailtrap config from IConfiguration.
// Mailtrap:Username and Mailtrap:Password must be set via dotnet user-secrets (never committed to source):
//   dotnet user-secrets set "Mailtrap:Username" "your-mailtrap-username"
//   dotnet user-secrets set "Mailtrap:Password" "your-mailtrap-password"
builder.Services.AddScoped<EmailNotificationChannel>();
builder.Services.AddScoped<SmsNotificationChannel>();
builder.Services.AddScoped<INotificationFactory, NotificationFactory>();
builder.Services.AddScoped<INotificationService, NotificationService>();

// ── Calendar Service ──────────────────────────────────────────────────────────
// GoogleCalendarService uses a recruiter-supplied OAuth access token per request.
// No server-side credentials are needed — the token is passed in the request body.
// Prototype limitation: full OAuth consent flow is a future enhancement.
builder.Services.AddScoped<ICalendarService, GoogleCalendarService>();

// ── Build ─────────────────────────────────────────────────────────────────────
var app = builder.Build();

app.Logger.LogInformation("Database provider: Microsoft.EntityFrameworkCore.SqlServer");
app.Logger.LogInformation("Connection string loaded: {CS}", connectionString);

// Seed sample data in Development only
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await DbSeeder.SeedAsync(db);
}

// ── Middleware Pipeline ───────────────────────────────────────────────────────
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Static file serving — intentionally scoped to exclude /uploads.
// Resume files must ONLY be accessed via the authenticated API endpoint
// GET /api/candidates/me/resume — direct URL browsing of /uploads/resumes/...
// is blocked here (security mechanism documented in the report).
//
// How it works: UseStaticFiles with a custom FileProvider that points to wwwroot,
// combined with a OnPrepareResponse hook that returns 404 for any path under /uploads.
// This means other wwwroot assets (favicon, icons, etc.) still work normally.
app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        // Block any direct request whose URL path starts with /uploads
        if (ctx.Context.Request.Path.StartsWithSegments("/uploads"))
        {
            ctx.Context.Response.StatusCode  = StatusCodes.Status404NotFound;
            ctx.Context.Response.ContentLength = 0;
            ctx.Context.Response.Body        = Stream.Null;
        }
    }
});

app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
