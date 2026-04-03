# Frontend Setup Instructions

## Environment Variables

### 1. Copy Environment Template

```bash
cp .env.example .env.local
```

### 2. Configure Supabase

Edit `.env.local` và điền thông tin Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

Lấy Supabase credentials từ:
- Dashboard → Settings → API
- Copy `Project URL` và `anon/public key`

### 2.1 Configure Google OAuth (Supabase)

Để dùng nút "Google" ở trang Sign In / Sign Up:

1. Supabase Dashboard → **Authentication** → **Providers** → bật **Google**
2. Thêm `Authorized redirect URL`:
   - `http://localhost:3000/signin` (local)
   - domain production tương ứng (nếu có)
3. Tạo OAuth Client trong Google Cloud Console và điền `Client ID` + `Client Secret` vào Supabase

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

Frontend sẽ chạy tại `http://localhost:3000`

## Security Notes

- **KHÔNG BAO GIỜ** commit file `.env.local` vào git
- `NEXT_PUBLIC_*` variables sẽ được expose ra client-side
- Chỉ dùng `NEXT_PUBLIC_SUPABASE_ANON_KEY` (không phải service_role key)
- Backend API URL có thể thay đổi theo environment

## Production Deployment

Khi deploy lên Vercel/Netlify:

1. Set environment variables trong dashboard
2. Update `NEXT_PUBLIC_API_BASE_URL` với production backend URL
3. Đảm bảo backend CORS cho phép production domain
4. Verify Supabase RLS policies đã được enable

## Troubleshooting

### CORS Error
- Check backend đang chạy tại port 8080
- Verify `CORS_ALLOWED_ORIGINS` trong backend `.env`

### Supabase Auth Error
- Verify `NEXT_PUBLIC_SUPABASE_URL` và `ANON_KEY` đúng
- Check Supabase project không bị pause (free tier)

### API Connection Error
- Verify backend đang chạy
- Check `NEXT_PUBLIC_API_BASE_URL` đúng
- Test backend endpoint: `curl http://localhost:8080/api/categories`
