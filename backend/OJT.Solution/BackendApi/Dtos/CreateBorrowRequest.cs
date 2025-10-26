using System;
using System.ComponentModel.DataAnnotations;

namespace BackendApi.Dtos
{
    public class CreateBorrowRequest
    {
        // Either UserId for registered user or GuestName for guest
        public int? UserId { get; set; }

        [Required]
        public int BookId { get; set; }

        public DateTime? BorrowDate { get; set; }

        public DateTime? DueDate { get; set; }

        [StringLength(500)]
        public string? Notes { get; set; }

        // Guest fields
        [StringLength(200)]
        public string? GuestName { get; set; }
        [StringLength(100)]
        public string? GuestEmail { get; set; }
        [StringLength(20)]
        public string? GuestPhone { get; set; }
    }
}
