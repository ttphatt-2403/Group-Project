import React from "react";
import { Link } from "react-router-dom";

const BorrowLanding = () => {
  return (
    <div className="page-container">
      <div className="page-card center">
        <h2>Mượn trả (Khách)</h2>
        <p>
          Bạn có thể duyệt sách và chọn sách muốn mượn. Để thực hiện mượn hoặc
          xem phiếu mượn cá nhân, vui lòng đăng nhập.
        </p>
        <div style={{ marginTop: 12 }}>
          <Link to="/books" className="btn-primary" style={{ marginRight: 8 }}>
            Xem sách
          </Link>
          <Link to="/login" className="btn-secondary">
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BorrowLanding;
