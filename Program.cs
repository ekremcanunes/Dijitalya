using EkoPazar.Data;
using EkoPazar.Services;
using EkoPazar.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Circular reference problemini çöz
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });

// Entity Framework with PostgreSQL
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Identity
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    // Password settings
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequiredLength = 6;
    options.Password.RequireNonAlphanumeric = false;

    // User settings
    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

// JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["SecretKey"])),
        ClockSkew = TimeSpan.Zero
    };
});

// Memory cache for session
builder.Services.AddMemoryCache();
builder.Services.AddDistributedMemoryCache();

// Session support - SON ÇÖZÜM
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromDays(30);
    options.Cookie.Name = "EkoPazar.Session";
    options.Cookie.HttpOnly = false; // JavaScript eriþimi için false
    options.Cookie.IsEssential = true;
    options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest; // Development ve Production uyumlu
    options.Cookie.SameSite = SameSiteMode.Lax; // None yerine Lax - daha güvenli
    options.Cookie.Path = "/";
    options.Cookie.MaxAge = TimeSpan.FromDays(30);
});

// CORS - Basitleþtirilmiþ
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "https://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<ICartService, CartService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IAdminService, AdminService>();

// Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "EkoPazar API", Version = "v1" });

    // JWT Authentication için Swagger konfigürasyonu
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement()
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                },
                Scheme = "oauth2",
                Name = "Bearer",
                In = Microsoft.OpenApi.Models.ParameterLocation.Header,
            },
            new List<string>()
        }
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseDeveloperExceptionPage();
}

app.UseHttpsRedirection();

// Static files
app.UseStaticFiles();

// CORS
app.UseCors("AllowReactApp");

// Session - Authentication'dan önce
app.UseSession();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Database migration ve seed data
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();

        // Database oluþtur/güncelle
        await context.Database.MigrateAsync();

        // Seed data
        await SeedDataAsync(context, userManager, roleManager);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while migrating or seeding the database.");
    }
}

app.Run();

// Seed data method
static async Task SeedDataAsync(ApplicationDbContext context, UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager)
{
    // Rolleri oluþtur
    string[] roles = { "Admin", "User" };
    foreach (string role in roles)
    {
        if (!await roleManager.RoleExistsAsync(role))
        {
            await roleManager.CreateAsync(new IdentityRole(role));
        }
    }

    // Admin kullanýcýsý oluþtur
    if (await userManager.FindByEmailAsync("admin@ekopazar.com") == null)
    {
        var adminUser = new ApplicationUser
        {
            UserName = "admin@ekopazar.com",
            Email = "admin@ekopazar.com",
            FirstName = "Admin",
            LastName = "User",
            EmailConfirmed = true
        };

        var result = await userManager.CreateAsync(adminUser, "Admin123!");
        if (result.Succeeded)
        {
            await userManager.AddToRoleAsync(adminUser, "Admin");
        }
    }

    // Demo kullanýcýsý oluþtur
    if (await userManager.FindByEmailAsync("demo@example.com") == null)
    {
        var demoUser = new ApplicationUser
        {
            UserName = "demo@example.com",
            Email = "demo@example.com",
            FirstName = "Demo",
            LastName = "User",
            EmailConfirmed = true
        };

        var result = await userManager.CreateAsync(demoUser, "Demo123!");
        if (result.Succeeded)
        {
            await userManager.AddToRoleAsync(demoUser, "User");
        }
    }

    // Kategoriler oluþtur
    if (!context.Categories.Any())
    {
        var categories = new[]
        {
            new Category { Name = "Elektronik", Description = "Elektronik ürünler" },
            new Category { Name = "Giyim", Description = "Giyim ve aksesuar" },
            new Category { Name = "Ev & Yaþam", Description = "Ev eþyalarý ve dekorasyon" },
            new Category { Name = "Kitap", Description = "Kitap ve dergi" },
            new Category { Name = "Spor", Description = "Spor malzemeleri" }
        };

        context.Categories.AddRange(categories);
        await context.SaveChangesAsync();
    }

    // Örnek ürünler oluþtur
    if (!context.Products.Any())
    {
        var categories = context.Categories.ToList();
        var products = new[]
        {
            new Product { Name = "iPhone 14", Description = "Apple iPhone 14 128GB", Price = 35000, Stock = 10, CategoryId = categories[0].Id, ImageUrl = "/uploads/products/iphone14.jpg" },
            new Product { Name = "Samsung Galaxy S23", Description = "Samsung Galaxy S23 256GB", Price = 30000, Stock = 15, CategoryId = categories[0].Id, ImageUrl = "/uploads/products/galaxy-s23.jpg" },
            new Product { Name = "Nike Air Max", Description = "Nike Air Max spor ayakkabý", Price = 1200, Stock = 25, CategoryId = categories[1].Id, ImageUrl = "/uploads/products/nike-air-max.jpg" },
            new Product { Name = "Kahve Makinesi", Description = "Otomatik kahve makinesi", Price = 2500, Stock = 8, CategoryId = categories[2].Id, ImageUrl = "/uploads/products/coffee-machine.jpg" },
            new Product { Name = "Yoga Matý", Description = "Antislip yoga matý", Price = 150, Stock = 30, CategoryId = categories[4].Id, ImageUrl = "/uploads/products/yoga-mat.jpg" }
        };

        context.Products.AddRange(products);
        await context.SaveChangesAsync();
    }
}