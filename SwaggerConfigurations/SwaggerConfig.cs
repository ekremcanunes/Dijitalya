using EkoPazar.Services;
using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Reflection;

namespace EkoPazar.Configuration
{
    public static class SwaggerConfig
    {
        public static void AddSwaggerConfiguration(this IServiceCollection services)
        {
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo
                {
                    Title = "E-Commerce API",
                    Version = "v1",
                    Description = "Modern E-Ticaret API Dokümantasyonu",
                    Contact = new OpenApiContact
                    {
                        Name = "E-Commerce Team",
                        Email = "info@ecommerce.com",
                        Url = new Uri("https://ecommerce.com")
                    },
                    License = new OpenApiLicense
                    {
                        Name = "MIT License",
                        Url = new Uri("https://opensource.org/licenses/MIT")
                    }
                });

                // JWT Authentication için Swagger yapılandırması
                c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
                    Name = "Authorization",
                    In = ParameterLocation.Header,
                    Type = SecuritySchemeType.ApiKey,
                    Scheme = "Bearer",
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

                // XML yorumlarını dahil et
                var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
                var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
                if (File.Exists(xmlPath))
                {
                    c.IncludeXmlComments(xmlPath);
                }

                // Enum'ları string olarak göster
                c.SchemaFilter<EnumSchemaFilter>();

                // Model örnekleri ekle
                c.SchemaFilter<ExampleSchemaFilter>();
            });
        }
    }

    public class EnumSchemaFilter : ISchemaFilter
    {
        public void Apply(OpenApiSchema schema, SchemaFilterContext context)
        {
            if (context.Type.IsEnum)
            {
                schema.Enum.Clear();
                Enum.GetNames(context.Type)
                    .ToList()
                    .ForEach(name => schema.Enum.Add(new OpenApiString(name)));
            }
        }
    }

    public class ExampleSchemaFilter : ISchemaFilter
    {
        public void Apply(OpenApiSchema schema, SchemaFilterContext context)
        {
            if (context.Type == typeof(RegisterModel))
            {
                schema.Example = new Microsoft.OpenApi.Any.OpenApiObject
                {
                    ["email"] = new Microsoft.OpenApi.Any.OpenApiString("user@example.com"),
                    ["password"] = new Microsoft.OpenApi.Any.OpenApiString("Password123!"),
                    ["firstName"] = new Microsoft.OpenApi.Any.OpenApiString("Ahmet"),
                    ["lastName"] = new Microsoft.OpenApi.Any.OpenApiString("Yılmaz")
                };
            }
            else if (context.Type == typeof(LoginModel))
            {
                schema.Example = new Microsoft.OpenApi.Any.OpenApiObject
                {
                    ["email"] = new Microsoft.OpenApi.Any.OpenApiString("user@example.com"),
                    ["password"] = new Microsoft.OpenApi.Any.OpenApiString("Password123!")
                };
            }
            else if (context.Type == typeof(CreateProductDto))
            {
                schema.Example = new Microsoft.OpenApi.Any.OpenApiObject
                {
                    ["name"] = new Microsoft.OpenApi.Any.OpenApiString("iPhone 15"),
                    ["description"] = new Microsoft.OpenApi.Any.OpenApiString("Apple iPhone 15 256GB"),
                    ["price"] = new Microsoft.OpenApi.Any.OpenApiDouble(30000),
                    ["stock"] = new Microsoft.OpenApi.Any.OpenApiInteger(50),
                    ["categoryId"] = new Microsoft.OpenApi.Any.OpenApiInteger(1),
                    ["imageUrl"] = new Microsoft.OpenApi.Any.OpenApiString("https://example.com/iphone15.jpg")
                };
            }
        }
    }
}