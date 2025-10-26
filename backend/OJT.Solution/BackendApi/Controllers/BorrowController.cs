using Microsoft.AspNetCore.Mvc;
using BackendApi.Models;
using BackendApi.Dtos;
using Microsoft.EntityFrameworkCore;

namespace BackendApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BorrowController : ControllerBase
    {
        private readonly OjtDbContext _context;

        public BorrowController(OjtDbContext context)
        {
            _context = context;
        }

        // GET: api/Borrow
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetBorrows()
        {
            var borrows = await _context.Borrows
                .Include(b => b.User)
                .Include(b => b.Book)
                .ThenInclude(book => book.Category)
                .OrderByDescending(b => b.BorrowDate)
                .Select(b => new
                {
                    b.Id,
                    b.UserId,
                    b.BookId,
                    b.BorrowDate,
                    b.DueDate,
                    b.ReturnDate,
                    b.Status,
                    b.Notes,
                    User = b.User == null ? null : new
                    {
                        b.User.Id,
                        b.User.Username,
                        b.User.Fullname,
                        b.User.Email
                    },
                    Guest = b.User == null ? new
                    {
                        b.GuestName,
                        b.GuestEmail,
                        b.GuestPhone
                    } : null,
                    Book = new
                    {
                        b.Book.Id,
                        b.Book.Title,
                        b.Book.Author,
                        Category = new
                        {
                            b.Book.Category.Id,
                            b.Book.Category.Name
                        }
                    },
                    b.Createdat
                })
                .ToListAsync();

            return Ok(borrows);
        }

        // GET: api/Borrow/5
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetBorrow(int id)
        {
            var borrow = await _context.Borrows
                .Include(b => b.User)
                .Include(b => b.Book)
                .ThenInclude(book => book.Category)
                .Where(b => b.Id == id)
                .Select(b => new
                {
                    b.Id,
                    b.UserId,
                    b.BookId,
                    b.BorrowDate,
                    b.DueDate,
                    b.ReturnDate,
                    b.Status,
                    b.Notes,
                    User = b.User == null ? null : new
                    {
                        b.User.Id,
                        b.User.Username,
                        b.User.Fullname,
                        b.User.Email,
                        b.User.Phone
                    },
                    Guest = b.User == null ? new
                    {
                        b.GuestName,
                        b.GuestEmail,
                        b.GuestPhone
                    } : null,
                    Book = new
                    {
                        b.Book.Id,
                        b.Book.Title,
                        b.Book.Author,
                        b.Book.Isbn,
                        Category = new
                        {
                            b.Book.Category.Id,
                            b.Book.Category.Name
                        }
                    },
                    b.Createdat,
                    b.Updatedat
                })
                .FirstOrDefaultAsync();

            if (borrow == null)
            {
                return NotFound(new { message = "Không tìm thấy phiếu mượn này." });
            }

            return Ok(borrow);
        }

        // GET: api/Borrow/user/5
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetBorrowsByUser(int userId)
        {
            var borrows = await _context.Borrows
                .Include(b => b.Book)
                .ThenInclude(book => book.Category)
                .Where(b => b.UserId == userId)
                .OrderByDescending(b => b.BorrowDate)
                .Select(b => new
                {
                    b.Id,
                    b.BorrowDate,
                    b.DueDate,
                    b.ReturnDate,
                    b.Status,
                    b.Notes,
                    Book = new
                    {
                        b.Book.Id,
                        b.Book.Title,
                        b.Book.Author,
                        Category = new
                        {
                            b.Book.Category.Name
                        }
                    }
                })
                .ToListAsync();

            return Ok(borrows);
        }

        // GET: api/Borrow/overdue
        [HttpGet("overdue")]
        public async Task<ActionResult<IEnumerable<object>>> GetOverdueBorrows()
        {
            var currentDate = DateTime.Now;

            var overdueBorrows = await _context.Borrows
                .Include(b => b.User)
                .Include(b => b.Book)
                .Where(b => b.Status == "borrowed" && b.DueDate < currentDate)
                .OrderBy(b => b.DueDate)
                .Select(b => new
                {
                    b.Id,
                    b.BorrowDate,
                    b.DueDate,
                    DaysOverdue = (currentDate - b.DueDate).Days,
                    User = b.User == null ? null : new
                    {
                        b.User.Id,
                        b.User.Username,
                        b.User.Fullname,
                        b.User.Email,
                        b.User.Phone
                    },
                    Guest = b.User == null ? new { b.GuestName, b.GuestEmail, b.GuestPhone } : null,
                    Book = new
                    {
                        b.Book.Id,
                        b.Book.Title,
                        b.Book.Author
                    }
                })
                .ToListAsync();

            return Ok(overdueBorrows);
        }

        // POST: api/Borrow
        [HttpPost]
        public async Task<ActionResult<object>> CreateBorrow([FromBody] CreateBorrowRequest dto)
        {
            if (dto == null)
                return BadRequest("Request body is null");

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Validate userId or guest info
            if (!dto.UserId.HasValue)
            {
                if (string.IsNullOrWhiteSpace(dto.GuestName))
                {
                    return BadRequest(new { message = "GuestName is required for guest borrow." });
                }
            }
            else
            {
                var userExists = await _context.Users.AnyAsync(u => u.Id == dto.UserId.Value);
                if (!userExists)
                {
                    return BadRequest(new { message = "User không tồn tại." });
                }
            }

            // Use transaction and SELECT FOR UPDATE to avoid race conditions
            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Lock the book row
                var book = await _context.Books
                    .FromSqlRaw("SELECT * FROM books WHERE id = {0} FOR UPDATE", dto.BookId)
                    .AsTracking()
                    .FirstOrDefaultAsync();

                if (book == null)
                {
                    await transaction.RollbackAsync();
                    return BadRequest(new { message = "Sách không tồn tại." });
                }

                var available = book.AvailableCopies ?? 0;
                if (available <= 0)
                {
                    await transaction.RollbackAsync();
                    return BadRequest(new { message = "Sách đã hết, không thể mượn." });
                }

                // If registered user, check existing borrow
                if (dto.UserId.HasValue)
                {
                    var existingBorrow = await _context.Borrows
                        .AnyAsync(b => b.UserId == dto.UserId.Value && b.BookId == dto.BookId && b.Status == "borrowed");

                    if (existingBorrow)
                    {
                        await transaction.RollbackAsync();
                        return BadRequest(new { message = "User đã mượn sách này và chưa trả." });
                    }
                }

                // Map DTO -> entity
                var borrow = new Borrow
                {
                    UserId = dto.UserId,
                    BookId = dto.BookId,
                    BorrowDate = dto.BorrowDate ?? DateTime.Now,
                    DueDate = dto.DueDate == null || dto.DueDate == default ? DateTime.Now.AddDays(14) : dto.DueDate.Value,
                    Status = "borrowed",
                    Notes = dto.Notes,
                    Createdat = DateTime.Now,
                    Updatedat = DateTime.Now,
                    GuestName = dto.GuestName,
                    GuestEmail = dto.GuestEmail,
                    GuestPhone = dto.GuestPhone
                };

                // Giảm AvailableCopies
                book.AvailableCopies = available - 1;

                _context.Borrows.Add(borrow);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                // Load related data for response
                if (borrow.UserId.HasValue)
                {
                    await _context.Entry(borrow).Reference(b => b.User).LoadAsync();
                }
                await _context.Entry(borrow).Reference(b => b.Book).LoadAsync();

                var response = new BorrowResponse
                {
                    Id = borrow.Id,
                    UserId = borrow.UserId,
                    BookId = borrow.BookId,
                    BorrowDate = borrow.BorrowDate,
                    DueDate = borrow.DueDate,
                    ReturnDate = borrow.ReturnDate,
                    Status = borrow.Status,
                    Notes = borrow.Notes,
                    Createdat = borrow.Createdat,
                    Updatedat = borrow.Updatedat,
                    User = borrow.User == null ? null : new
                    {
                        borrow.User.Id,
                        borrow.User.Username,
                        borrow.User.Fullname,
                        borrow.User.Email
                    },
                    Guest = borrow.User == null ? new { borrow.GuestName, borrow.GuestEmail, borrow.GuestPhone } : null,
                    Book = new
                    {
                        borrow.Book.Id,
                        borrow.Book.Title,
                        borrow.Book.Author
                    }
                };

                return CreatedAtAction(nameof(GetBorrow), new { id = borrow.Id }, response);
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        // PUT: api/Borrow/5/return
        [HttpPut("{id}/return")]
        public async Task<IActionResult> ReturnBook(int id, [FromBody] ReturnRequest? request = null)
        {
            // Use transaction to update borrow and book atomically
            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var borrow = await _context.Borrows
                    .Include(b => b.Book)
                    .FirstOrDefaultAsync(b => b.Id == id);

                if (borrow == null)
                {
                    await transaction.RollbackAsync();
                    return NotFound(new { message = "Không tìm thấy phiếu mượn này." });
                }

                if (borrow.Status != "borrowed")
                {
                    await transaction.RollbackAsync();
                    return BadRequest(new { message = "Sách đã được trả hoặc trạng thái không hợp lệ." });
                }

                // Lock the book row for update
                var book = await _context.Books
                    .FromSqlRaw("SELECT * FROM books WHERE id = {0} FOR UPDATE", borrow.BookId)
                    .AsTracking()
                    .FirstOrDefaultAsync();

                if (book == null)
                {
                    await transaction.RollbackAsync();
                    return NotFound(new { message = "Book not found." });
                }

                // Cập nhật thông tin trả sách
                borrow.ReturnDate = DateTime.Now;
                borrow.Status = "returned";
                borrow.Notes = request?.Notes ?? borrow.Notes;
                borrow.Updatedat = DateTime.Now;

                // Tăng AvailableCopies (treat null as 0)
                book.AvailableCopies = (book.AvailableCopies ?? 0) + 1;

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new
                {
                    message = "Trả sách thành công.",
                    borrow = new
                    {
                        borrow.Id,
                        borrow.ReturnDate,
                        borrow.Status,
                        Book = new
                        {
                            borrow.Book.Title,
                            borrow.Book.AvailableCopies
                        }
                    }
                });
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        // PUT: api/Borrow/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBorrow(int id, [FromBody] UpdateBorrowRequest dto)
        {
            if (dto == null)
                return BadRequest("Request body is null");

            if (id != dto.Id)
            {
                return BadRequest("ID không khớp.");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var existingBorrow = await _context.Borrows.FindAsync(id);
            if (existingBorrow == null)
            {
                return NotFound(new { message = "Không tìm thấy phiếu mượn này." });
            }

            // Chỉ cho phép cập nhật một số trường
            existingBorrow.DueDate = dto.DueDate ?? existingBorrow.DueDate;
            existingBorrow.Notes = dto.Notes ?? existingBorrow.Notes;
            existingBorrow.Updatedat = DateTime.Now;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!BorrowExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            var response = new BorrowResponse
            {
                Id = existingBorrow.Id,
                UserId = existingBorrow.UserId,
                BookId = existingBorrow.BookId,
                BorrowDate = existingBorrow.BorrowDate,
                DueDate = existingBorrow.DueDate,
                ReturnDate = existingBorrow.ReturnDate,
                Status = existingBorrow.Status,
                Notes = existingBorrow.Notes,
                Createdat = existingBorrow.Createdat,
                Updatedat = existingBorrow.Updatedat
            };

            return Ok(new { message = "Cập nhật phiếu mượn thành công.", borrow = response });
        }

        // DELETE: api/Borrow/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBorrow(int id)
        {
            var borrow = await _context.Borrows
                .Include(b => b.Book)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (borrow == null)
            {
                return NotFound(new { message = "Không tìm thấy phiếu mượn này." });
            }

            // Nếu sách chưa trả, tăng lại AvailableCopies
            if (borrow.Status == "borrowed")
            {
                borrow.Book.AvailableCopies = (borrow.Book.AvailableCopies ?? 0) + 1;
            }

            _context.Borrows.Remove(borrow);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Xóa phiếu mượn thành công." });
        }

        private bool BorrowExists(int id)
        {
            return _context.Borrows.Any(e => e.Id == id);
        }
    }

    // Helper class for return request
    public class ReturnRequest
    {
        public string? Notes { get; set; }
    }
}