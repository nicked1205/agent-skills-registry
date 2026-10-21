using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using server.data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options => {
    options.SwaggerDoc("v1", new() { Title = "API", Version = "v1" });

    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Enter: {your JWT token}"
    });

    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement {{
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Provider and location are config-driven so one build runs both locally and on a
// host with a mounted disk. With nothing configured this still resolves to
// server/app.db, so local development needs no setup.
var dbProvider = builder.Configuration["Database:Provider"] ?? "sqlite";

builder.Services.AddDbContext<AppDbContext>(options => {
    switch (dbProvider.ToLowerInvariant()) {
        case "sqlite":
            var dbPath = builder.Configuration["Database:Path"]
                ?? Path.Combine(builder.Environment.ContentRootPath, "app.db");

            // The directory must exist before SQLite will open a file inside it.
            var dbDir = Path.GetDirectoryName(Path.GetFullPath(dbPath));
            if (!string.IsNullOrEmpty(dbDir)) Directory.CreateDirectory(dbDir);

            options.UseSqlite($"Data Source={dbPath}");
            break;

        case "postgres":
            throw new NotSupportedException(
                "Database:Provider=postgres is not wired up yet. To switch: add the " +
                "Npgsql.EntityFrameworkCore.PostgreSQL package, replace this branch with " +
                "options.UseNpgsql(...), and generate a Postgres migration set — EF " +
                "migrations are provider-specific, so the SQLite ones in Migrations/ " +
                "cannot be reused. See DEPLOYMENT.md.");

        default:
            throw new NotSupportedException(
                $"Unknown Database:Provider '{dbProvider}'. Supported: 'sqlite'.");
    }
});

// Allowed origins come from config so the deployed frontend URL is set per
// environment; falls back to the Vite dev server for local work.
var allowedOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>() ?? ["http://localhost:5173"];

builder.Services.AddCors(options => {
    options.AddPolicy("AllowFrontend", policy => {
        policy
            .WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var jwtConfig = builder.Configuration.GetSection("Jwt");
var jwtKey = jwtConfig["Key"];

if (string.IsNullOrWhiteSpace(jwtKey))
    throw new InvalidOperationException("Jwt:Key is not configured.");

// The key committed in appsettings.json is a public development placeholder.
// Refuse to boot with it outside Development rather than silently signing
// production tokens with a secret that is in the git history.
if (!builder.Environment.IsDevelopment() && jwtKey == "dev-secret-key-might-change-later")
    throw new InvalidOperationException(
        "Jwt:Key is still the development placeholder. Set a real secret via the " +
        "Jwt__Key environment variable before running outside Development.");

// HMAC-SHA256 needs at least a 256-bit key; fail here with a clear message
// rather than at the first attempt to sign a token.
if (Encoding.UTF8.GetByteCount(jwtKey) < 32)
    throw new InvalidOperationException(
        $"Jwt:Key must be at least 32 bytes for HMAC-SHA256 (got {Encoding.UTF8.GetByteCount(jwtKey)}).");

var key = Encoding.UTF8.GetBytes(jwtKey);

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => {
        options.Events = new JwtBearerEvents {
            OnAuthenticationFailed = context => {
                Console.WriteLine("JWT AUTH FAILED:");
                Console.WriteLine(context.Exception.ToString());
                return Task.CompletedTask;
            }
        };

        options.TokenValidationParameters = new TokenValidationParameters {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtConfig["Issuer"],
            ValidAudience = jwtConfig["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ClockSkew = TimeSpan.FromMinutes(5)

        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

using (var scope = app.Services.CreateScope()) {
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

// Render terminates TLS at its proxy and forwards plain HTTP, so the app must
// trust X-Forwarded-Proto to know the original request was HTTPS. Without this,
// UseHttpsRedirection would see HTTP and redirect forever.
var forwardedHeaders = new ForwardedHeadersOptions {
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
};
// The platform proxy is the only ingress and its IP is not known ahead of time.
forwardedHeaders.KnownNetworks.Clear();
forwardedHeaders.KnownProxies.Clear();
app.UseForwardedHeaders(forwardedHeaders);

if (app.Environment.IsDevelopment()) {
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Only self-redirect when running directly; behind a proxy the edge already
// serves HTTPS and redirecting here causes a loop.
if (app.Environment.IsDevelopment()) {
    app.UseHttpsRedirection();
}

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Unauthenticated liveness probe for the platform health check.
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.Run();
