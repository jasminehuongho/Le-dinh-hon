# Lễ Đính Hôn 02.01.2027 — Quản lý ngân sách

Webapp quản lý dự trù kinh phí, chi phí chi tiết và tiến độ chuẩn bị cho Lễ đính hôn tổ chức ngày **02/01/2027** tại xã Tân Thủy, tỉnh Vĩnh Long. Dùng chung 1 link, không cần đăng nhập, dữ liệu đồng bộ realtime cho 2–3 người cùng nhập liệu.

**Kỹ thuật:** React (Vite) + Supabase (PostgreSQL + Realtime) + Vercel.

## 1. Cấu trúc chức năng

- **Dự trù kinh phí** — ngân sách tổng + danh sách hạng mục dự trù (7 hạng mục mặc định theo phong tục miền Tây Nam Bộ).
- **Quản lý chi phí chi tiết** — danh sách công việc đã chi, liên kết hạng mục, tính % chênh lệch tự động, theo dõi đặt cọc/còn thiếu.
- **Quản lý tiến độ** — deadline từng công việc, tự sắp xếp theo hạn gần nhất, cảnh báo khẩn cấp/quá hạn.
- **Tổng quan** — read-only, tổng hợp ngân sách/chi phí/thiếu-đủ và chi tiết từng công việc.

## 2. Thiết lập Supabase (bắt buộc trước khi chạy)

1. Tạo project mới tại [supabase.com](https://supabase.com) (gói Free, không cần thẻ tín dụng).
2. Vào **SQL Editor**, dán toàn bộ nội dung file [`supabase/schema.sql`](./supabase/schema.sql) và chạy (**Run**). File này tạo đầy đủ bảng, seed 7 hạng mục mặc định, bật Row Level Security và Realtime.
3. Vào **Project Settings → API**, lấy:
   - `Project URL` → dùng cho `VITE_SUPABASE_URL`
   - `anon public key` → dùng cho `VITE_SUPABASE_ANON_KEY`

> ⚠️ Chỉ dùng **anon key**, không dùng `service_role key` trong frontend. RLS trong `schema.sql` cho phép anon key đọc/ghi vì webapp không có hệ thống đăng nhập — vì vậy **không public link/anon key ra ngoài phạm vi gia đình**.

## 3. Chạy local

```bash
npm install
cp .env.example .env
# điền VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY vào .env
npm run dev
```

Mở http://localhost:5173.

Nếu chưa cấu hình `.env`, app vẫn chạy được (không crash) nhưng sẽ hiện banner cảnh báo và không đọc/ghi được dữ liệu.

## 4. Deploy lên Vercel

1. Push repo này lên GitHub (đã có sẵn).
2. Vào [vercel.com](https://vercel.com) → **New Project** → import repo.
3. Ở phần **Environment Variables**, thêm:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy — Vercel tự nhận `vercel.json` (build bằng `npm run build`, output `dist/`, rewrite SPA).
5. Sau khi deploy xong, chia sẻ link Vercel cho các thành viên gia đình cùng dùng.

## 5. Cấu trúc thư mục

```
le-dinh-hon-budget/
├── supabase/schema.sql      # toàn bộ schema + seed + RLS + realtime
├── src/
│   ├── lib/supabaseClient.js
│   ├── styles/theme.css     # bảng màu Be – Nâu – Trắng – Đỏ đô
│   ├── components/
│   │   ├── layout/          # Sidebar, Layout
│   │   ├── common/          # Modal, IconButton, StatusBadge
│   │   ├── budget/          # 1. Dự trù kinh phí
│   │   ├── expenses/        # 2. Quản lý chi phí chi tiết
│   │   ├── timeline/        # 3. Quản lý tiến độ
│   │   └── overview/        # 4. Tổng quan (read-only)
│   ├── hooks/                # useBudgetCategories, useExpenses, useTasks, useSettings
│   └── utils/                # formatCurrency, calculations
└── vercel.json
```

## 6. Quy tắc tính toán (luôn tự động, không hard-code)

- **Tổng dự trù** = tổng `planned_amount` của tất cả hạng mục dự trù.
- **% chênh lệch** của một công việc = so sánh `Tổng tiền` đang nhập với phần **ngân sách còn lại** của hạng mục đó (= dự trù hạng mục − tổng các khoản đã chi trước đó cùng hạng mục).
- **Còn thiếu** (khi đã đặt cọc) = Tổng tiền − Số tiền đã cọc.
- **Tổng chi phí** (Tổng quan) = tổng `total_amount` của toàn bộ công việc trong mục Chi phí chi tiết.
- **Thiếu / Đủ** = Ngân sách dự kiến tổng − Tổng chi phí.
- Task được đánh dấu **khẩn cấp** (đỏ) khi deadline trong vòng 3 ngày tới, và **quá hạn** khi deadline đã qua mà chưa hoàn thành — cả hai đều tính lại theo ngày hiện tại mỗi lần tải trang.
