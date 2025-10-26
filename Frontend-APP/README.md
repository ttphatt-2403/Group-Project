# Hướng dẫn sử dụng FrontEnd (React)

Yêu cầu trước: Node.js (phiên bản >= 16) và npm đã cài.

1. Mở terminal và vào thư mục project

   - Nếu đã ở trong thư mục cha: `cd Frontend-APP`
   - Hoặc dùng đường dẫn đầy đủ (Windows): `cd E:\OJT_FALL25\Group-Project\Frontend-APP`

2. Cài phụ thuộc

   - Thông thường: `npm install`
   - Nếu cần cài thêm gói cụ thể:  
     `npm install axios react-bootstrap bootstrap jwt-decode formik yup react-router-dom`

3. Chạy môi trường phát triển

   - `npm run dev`
   - Mở trình duyệt tới http://localhost:5173 (hoặc link/port hiển thị trong terminal). Bạn cũng có thể Ctrl+Click vào link trong terminal để mở nhanh.

4. Xây dựng để deploy

   - `npm run build`
   - Thư mục đầu ra thường là `dist` (kiểm tra cấu hình trong `package.json`/vite.config).

5. Lưu ý và khắc phục sự cố nhanh
   - Nếu lỗi phụ thuộc: chạy lại `npm install` hoặc xóa `node_modules` + `package-lock.json` rồi cài lại.
   - Nếu port đang dùng: thay đổi port trong biến môi trường hoặc cấu hình dev server.
   - Kiểm tra biến môi trường (nếu dự án dùng `.env`) và đảm bảo các giá trị cần thiết tồn tại.

That's it — front-end sẵn sàng chạy.
