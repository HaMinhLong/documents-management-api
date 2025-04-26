# Documents Management API

Hệ thống API quản lý tài liệu học tập, cho phép người dùng chia sẻ và mua bán tài liệu.

## Tính năng chính

- Xác thực người dùng (Đăng nhập, Đăng ký, Quên mật khẩu)
- Đăng nhập bằng Google, Facebook
- Upload và quản lý tài liệu
- Tìm kiếm và xem trước tài liệu
- Thanh toán qua VNPay
- Hệ thống giới thiệu (Referral)
- Phân quyền người dùng
- Quản lý danh mục, môn học, trường đại học

## Công nghệ sử dụng

- Node.js & Express.js
- PostgreSQL & Prisma ORM
- JWT Authentication
- Multer cho upload file
- PDF-lib cho xử lý file PDF
- LibreOffice cho chuyển đổi định dạng file
- Nodemailer cho gửi email

## Cài đặt

1. Clone repository

```bash
git clone <repository-url>
```

2. Cài đặt dependencies

```bash
cd <project-folder>
npm install
```

3. Cấu hình môi trường

```bash
cp .env.example .env
```

4. Chạy migration

```bash
npx prisma migrate dev
```

5. Chạy server

```bash
npm run dev
```

## API Endpoints

### Authentication

- POST /api/v1/auth/register - Đăng ký
- POST /api/v1/auth/login - Đăng nhập
- POST /api/v1/auth/google - Đăng nhập Google
- POST /api/v1/auth/facebook - Đăng nhập Facebook
- POST /api/v1/auth/forgot-password - Quên mật khẩu

### Documents

- POST /api/v1/document - Tạo tài liệu mới
- GET /api/v1/document - Lấy danh sách tài liệu
- GET /api/v1/document/:id - Lấy chi tiết tài liệu
- PUT /api/v1/document/:id - Cập nhật tài liệu
- DELETE /api/v1/document/:id - Xóa tài liệu
- GET /api/v1/document/preview/:id - Xem trước tài liệu
- GET /api/v1/document/top-viewed - Lấy tài liệu xem nhiều
- GET /api/v1/documents/related - Lấy tài liệu liên quan
- GET /api/v1/documents/purchased - Lấy tài liệu đã mua

### Categories, Subjects & Universities

- CRUD operations cho Categories
- CRUD operations cho Subjects
- CRUD operations cho Universities

### Payments & Transactions

- POST /api/v1/document/payment - Tạo thanh toán
- Các endpoint xử lý thanh toán VNPay
- Quản lý lịch sử giao dịch

## License

MIT
