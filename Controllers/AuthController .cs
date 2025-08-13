using EkoPazar.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ECommerceAPI.Controllers
{
    /// <summary>
    /// Kullanıcı kimlik doğrulama işlemleri
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    [Produces("application/json")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        /// <summary>
        /// Yeni kullanıcı kaydı oluşturur
        /// </summary>
        /// <param name="model">Kullanıcı kayıt bilgileri</param>
        /// <returns>Kayıt sonucu ve JWT token'ları</returns>
        /// <response code="200">Kayıt başarılı</response>
        /// <response code="400">Geçersiz veri veya email zaten kayıtlı</response>
        [HttpPost("register")]
        [ProducesResponseType(typeof(object), 200)]
        [ProducesResponseType(typeof(object), 400)]
        public async Task<IActionResult> Register([FromBody] RegisterModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _authService.RegisterAsync(model);

            if (!result.Success)
            {
                return BadRequest(new { message = result.Message });
            }

            return Ok(new
            {
                message = result.Message,
                accessToken = result.AccessToken,
                refreshToken = result.RefreshToken,
                user = result.User
            });
        }

        /// <summary>
        /// Kullanıcı giriş işlemi
        /// </summary>
        /// <param name="model">Giriş bilgileri (email ve şifre)</param>
        /// <returns>Giriş sonucu ve JWT token'ları</returns>
        /// <response code="200">Giriş başarılı</response>
        /// <response code="400">Geçersiz email veya şifre</response>
        [HttpPost("login")]
        [ProducesResponseType(typeof(object), 200)]
        [ProducesResponseType(typeof(object), 400)]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _authService.LoginAsync(model);

            if (!result.Success)
            {
                return BadRequest(new { message = result.Message });
            }

            return Ok(new
            {
                message = result.Message,
                accessToken = result.AccessToken,
                refreshToken = result.RefreshToken,
                user = result.User
            });
        }

        /// <summary>
        /// Access token'ı yeniler
        /// </summary>
        /// <param name="model">Refresh token</param>
        /// <returns>Yeni access token ve refresh token</returns>
        /// <response code="200">Token yenileme başarılı</response>
        /// <response code="400">Geçersiz refresh token</response>
        [HttpPost("refresh-token")]
        [ProducesResponseType(typeof(object), 200)]
        [ProducesResponseType(typeof(object), 400)]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenModel model)
        {
            if (string.IsNullOrEmpty(model.RefreshToken))
            {
                return BadRequest(new { message = "Refresh token gerekli." });
            }

            var result = await _authService.RefreshTokenAsync(model.RefreshToken);

            if (!result.Success)
            {
                return BadRequest(new { message = result.Message });
            }

            return Ok(new
            {
                accessToken = result.AccessToken,
                refreshToken = result.RefreshToken
            });
        }

        /// <summary>
        /// Refresh token'ı iptal eder (logout)
        /// </summary>
        /// <param name="model">İptal edilecek refresh token</param>
        /// <returns>İptal sonucu</returns>
        /// <response code="200">Token iptal edildi</response>
        /// <response code="400">Token iptal edilemedi</response>
        /// <response code="401">Yetkisiz erişim</response>
        [HttpPost("revoke-token")]
        [Authorize]
        [ProducesResponseType(typeof(object), 200)]
        [ProducesResponseType(typeof(object), 400)]
        [ProducesResponseType(401)]
        public async Task<IActionResult> RevokeToken([FromBody] RefreshTokenModel model)
        {
            if (string.IsNullOrEmpty(model.RefreshToken))
            {
                return BadRequest(new { message = "Refresh token gerekli." });
            }

            var result = await _authService.RevokeTokenAsync(model.RefreshToken);

            if (!result)
            {
                return BadRequest(new { message = "Token iptal edilemedi." });
            }

            return Ok(new { message = "Token başarıyla iptal edildi." });
        }

        /// <summary>
        /// Mevcut kullanıcı bilgilerini getirir
        /// </summary>
        /// <returns>Kullanıcı profil bilgileri</returns>
        /// <response code="200">Kullanıcı bilgileri</response>
        /// <response code="401">Yetkisiz erişim</response>
        [HttpGet("me")]
        [Authorize]
        [ProducesResponseType(typeof(object), 200)]
        [ProducesResponseType(401)]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
            {
                return Unauthorized();
            }

            return Ok(new
            {
                id = userId,
                email = User.FindFirst(ClaimTypes.Email)?.Value,
                name = User.FindFirst(ClaimTypes.Name)?.Value
            });
        }
    }
}