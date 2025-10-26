using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using System.IO;
using System;
using BackendApi.Models;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace BackendApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoryController : ControllerBase
    {
        private readonly OjtDbContext _context;
        private readonly IWebHostEnvironment _env;

        public CategoryController(OjtDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        // GET: api/Category
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CategoryViewModel>>> GetCategories()
        {
            var categories = await _context.Categories
                .OrderBy(c => c.Name)
                .Select(c => new CategoryViewModel
                {
                    Id = c.Id,
                    Name = c.Name,
                    Description = c.Description,
                    ImageUrl = c.ImageUrl
                })
                .ToListAsync();

            return Ok(categories);
        }

        // GET: api/Category/5
        [HttpGet("{id}")]
        public async Task<ActionResult<CategoryViewModel>> GetCategory(int id)
        {
            var category = await _context.Categories
                .Where(c => c.Id == id)
                .Select(c => new CategoryViewModel
                {
                    Id = c.Id,
                    Name = c.Name,
                    Description = c.Description,
                    ImageUrl = c.ImageUrl
                })
                .FirstOrDefaultAsync();

            if (category == null)
            {
                return NotFound(new { message = "Không tìm thấy thể loại này." });
            }

            return Ok(category);
        }

        // POST: api/Category
        [HttpPost]
        public async Task<ActionResult<CategoryViewModel>> CreateCategory([FromBody] CategoryViewModel model)
        {
            if (model == null)
                return BadRequest("Request body is null");

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var existingCategory = await _context.Categories
                .FirstOrDefaultAsync(c => c.Name.ToLower() == model.Name.ToLower());

            if (existingCategory != null)
            {
                return BadRequest(new { message = "Tên thể loại đã tồn tại." });
            }

            var category = new Category
            {
                Name = model.Name,
                Description = model.Description,
                ImageUrl = model.ImageUrl,
                Createdat = DateTime.Now,
                Updatedat = DateTime.Now
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, new CategoryViewModel
            {
                Id = category.Id,
                Name = category.Name,
                Description = category.Description,
                ImageUrl = category.ImageUrl
            });
        }

        // PUT: api/Category/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategory(int id, [FromBody] CategoryViewModel model)
        {
            if (model == null)
                return BadRequest("Request body is null");

            if (id != model.Id)
            {
                return BadRequest("ID không khớp.");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var existingCategory = await _context.Categories.FindAsync(id);
            if (existingCategory == null)
            {
                return NotFound(new { message = "Không tìm thấy thể loại này." });
            }

            var duplicateCategory = await _context.Categories
                .FirstOrDefaultAsync(c => c.Name.ToLower() == model.Name.ToLower() && c.Id != id);

            if (duplicateCategory != null)
            {
                return BadRequest(new { message = "Tên thể loại đã tồn tại." });
            }

            existingCategory.Name = model.Name;
            existingCategory.Description = model.Description;
            existingCategory.ImageUrl = model.ImageUrl;
            existingCategory.Updatedat = DateTime.Now;

            await _context.SaveChangesAsync();

            return Ok(new CategoryViewModel
            {
                Id = existingCategory.Id,
                Name = existingCategory.Name,
                Description = existingCategory.Description,
                ImageUrl = existingCategory.ImageUrl
            });
        }

        // DELETE: api/Category/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _context.Categories
                .Include(c => c.Books)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (category == null)
            {
                return NotFound(new { message = "Không tìm thấy thể loại này." });
            }

            if (category.Books.Any())
            {
                return BadRequest(new { message = "Không thể xóa thể loại này vì còn có sách thuộc thể loại này." });
            }

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Xóa thể loại thành công." });
        }

        private bool CategoryExists(int id)
        {
            return _context.Categories.Any(e => e.Id == id);
        }

        // POST: api/Category/upload/5
        // Upload a single image file and set the Category.ImageUrl to the uploaded file's public URL.
        [HttpPost("upload/{id}")]
        public async Task<IActionResult> UploadCategoryImage(int id, IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file uploaded." });

            var category = await _context.Categories.FindAsync(id);
            if (category == null)
                return NotFound(new { message = "Category not found." });

            // ensure uploads folder exists
            var uploadsRoot = Path.Combine(_env.WebRootPath ?? "wwwroot", "uploads", "categories");
            Directory.CreateDirectory(uploadsRoot);

            // use a GUID filename to avoid collisions
            var ext = Path.GetExtension(file.FileName);
            var fileName = $"{Guid.NewGuid()}{ext}";
            var filePath = Path.Combine(uploadsRoot, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // build public URL to the uploaded file
            var baseUrl = $"{Request.Scheme}://{Request.Host}";
            var publicUrl = $"{baseUrl}/uploads/categories/{fileName}";

            // update category
            category.ImageUrl = publicUrl;
            category.Updatedat = DateTime.Now;
            await _context.SaveChangesAsync();

            return Ok(new { id = category.Id, imageUrl = category.ImageUrl });
        }
    }
}