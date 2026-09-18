-- =========================================================
-- le-dinh-hon-budget — Supabase schema
-- Chạy toàn bộ file này trong Supabase SQL Editor (project của bạn)
-- =========================================================

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------
-- 1. settings: lưu Ngân sách dự kiến tổng (1 dòng duy nhất)
-- ---------------------------------------------------------
create table if not exists settings (
  id int primary key default 1,
  total_budget numeric(14, 0) not null default 200000000,
  updated_at timestamptz not null default now(),
  constraint settings_singleton check (id = 1)
);

insert into settings (id, total_budget)
values (1, 200000000)
on conflict (id) do nothing;

-- ---------------------------------------------------------
-- 2. budget_categories: Hạng mục dự trù (mục 1.1)
-- ---------------------------------------------------------
create table if not exists budget_categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  planned_amount numeric(14, 0) not null default 0,
  vendor text default '',
  sub_items jsonb not null default '[]'::jsonb,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- 3. expenses: Quản lý chi phí chi tiết (mục 1.2) — "Công việc"
-- ---------------------------------------------------------
create table if not exists expenses (
  id uuid primary key default uuid_generate_v4(),
  category_id uuid references budget_categories(id) on delete set null,
  work_name text not null,
  description text default '',
  vendor text default '',
  total_amount numeric(14, 0) not null default 0,
  payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid', 'deposited', 'paid')),
  deposit_amount numeric(14, 0) default 0,
  note text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists expenses_category_id_idx on expenses (category_id);

-- ---------------------------------------------------------
-- 4. tasks: Quản lý tiến độ (mục 1.3)
-- ---------------------------------------------------------
create table if not exists tasks (
  id uuid primary key default uuid_generate_v4(),
  task_name text not null,
  category_id uuid references budget_categories(id) on delete set null,
  expense_id uuid references expenses(id) on delete set null,
  deadline date,
  status text not null default 'not_started'
    check (status in ('not_started', 'in_progress', 'done', 'overdue')),
  assignee text default '',
  note text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tasks_category_id_idx on tasks (category_id);
create index if not exists tasks_expense_id_idx on tasks (expense_id);
create index if not exists tasks_deadline_idx on tasks (deadline);

-- ---------------------------------------------------------
-- 5. Seed 7 hạng mục dự trù mặc định (mục 1.1)
--    Chỉ seed nếu bảng đang trống, để tránh chèn trùng khi chạy lại.
-- ---------------------------------------------------------
insert into budget_categories (name, planned_amount, vendor, sub_items, sort_order)
select * from (values
  ('Mâm quả / Lễ vật', 0, '', '["Mâm trầu cau","Mâm trà – rượu – nến (đèn cầy)","Mâm bánh phu thê (hoặc bánh kem)","Mâm ngũ quả (trái cây)","Mâm xôi gấc (hoặc heo quay)"]'::jsonb, 1),
  ('Nhà hàng / Tiệc đãi khách', 0, '', '[]'::jsonb, 2),
  ('Trang trí', 0, '', '[]'::jsonb, 3),
  ('Trang phục cô dâu & chú rể', 0, '', '[]'::jsonb, 4),
  ('Trang điểm – làm tóc', 0, '', '[]'::jsonb, 5),
  ('Nhiếp ảnh – quay phim', 0, '', '[]'::jsonb, 6),
  ('Xe hoa / đưa đón', 0, '', '[]'::jsonb, 7)
) as seed(name, planned_amount, vendor, sub_items, sort_order)
where not exists (select 1 from budget_categories);

-- ---------------------------------------------------------
-- 6. updated_at auto-touch trigger
-- ---------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_settings_updated_at on settings;
create trigger trg_settings_updated_at before update on settings
  for each row execute function set_updated_at();

drop trigger if exists trg_budget_categories_updated_at on budget_categories;
create trigger trg_budget_categories_updated_at before update on budget_categories
  for each row execute function set_updated_at();

drop trigger if exists trg_expenses_updated_at on expenses;
create trigger trg_expenses_updated_at before update on expenses
  for each row execute function set_updated_at();

drop trigger if exists trg_tasks_updated_at on tasks;
create trigger trg_tasks_updated_at before update on tasks
  for each row execute function set_updated_at();

-- ---------------------------------------------------------
-- 7. Row Level Security
--    Webapp không có đăng nhập, dùng chung 1 link — nhưng vẫn bật RLS
--    và chỉ cho phép truy cập qua anon key public (không lộ service key).
--    Vì không có hệ thống user thật, policy cho phép anon đọc/ghi toàn bộ
--    (bảo vệ chính nằm ở việc không public URL/anon key ra ngoài phạm vi
--    gia đình + Supabase anon key vốn chỉ cho phép qua các policy dưới đây).
-- ---------------------------------------------------------
alter table settings enable row level security;
alter table budget_categories enable row level security;
alter table expenses enable row level security;
alter table tasks enable row level security;

drop policy if exists "settings_all" on settings;
create policy "settings_all" on settings for all using (true) with check (true);

drop policy if exists "budget_categories_all" on budget_categories;
create policy "budget_categories_all" on budget_categories for all using (true) with check (true);

drop policy if exists "expenses_all" on expenses;
create policy "expenses_all" on expenses for all using (true) with check (true);

drop policy if exists "tasks_all" on tasks;
create policy "tasks_all" on tasks for all using (true) with check (true);

-- ---------------------------------------------------------
-- 8. Realtime: bật replication để các client đồng bộ live
--    (bọc trong DO block để chạy lại file này không bị lỗi trùng)
-- ---------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array['settings', 'budget_categories', 'expenses', 'tasks']
  loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table %I', t);
    end if;
  end loop;
end $$;
