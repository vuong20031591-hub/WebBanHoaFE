# WebBanHoaFE

Frontend Next.js cho task kết nối FE + BE end-to-end.

## 1) Chạy Backend trước

Trong repo `WebBanHoaBE`:

```bash
./mvnw spring-boot:run
```

Backend mặc định chạy ở `http://localhost:8080` với API:

- `GET /api/products?page=0&size=20&sortBy=createdAt&direction=desc`
- `GET /api/categories`

## 2) Chạy Frontend

Tạo file `.env.local` (tuỳ chọn):

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

Cài package và chạy dev:

```bash
npm install
npm run dev
```

Mở `http://localhost:3000` để xem Product Page đã nối API BE.

## 3) Build kiểm tra

```bash
npm run build
npm start
```
