-- ═══════════════════════════════════════════════════════════════
-- EVOKE — Supabase Schema
-- Generated from src/lib/db.js — every column matches exactly.
-- Run in: Supabase Dashboard → SQL Editor → New query → Run
-- ═══════════════════════════════════════════════════════════════

-- ── Drop existing tables (clean slate) ──────────────────────
-- Remove in reverse dependency order so FK constraints don't block drops.
drop table if exists contact_enquiries cascade;
drop table if exists products           cascade;
drop table if exists collections        cascade;
drop table if exists finishes           cascade;
drop table if exists categories         cascade;

-- ── Extensions ───────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ════════════════════════════════════════════════════════════
-- TABLE: collections
-- Columns used in db.js: id, name, mood, description,
--                        sort_order, active
--                        (+ created_at, updated_at auto)
-- ════════════════════════════════════════════════════════════
create table collections (
  id          text        primary key,
  name        text        not null,
  mood        text        not null default '',
  description text        not null default '',
  sort_order  integer     not null default 0,
  active      boolean     not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ════════════════════════════════════════════════════════════
-- TABLE: finishes
-- Columns used in db.js: id, label, hex, description,
--                        active, sort_order
-- ════════════════════════════════════════════════════════════
create table finishes (
  id          text        primary key,
  label       text        not null,
  hex         text        not null default '#C8C8C8',
  description text        not null default '',
  active      boolean     not null default true,
  sort_order  integer     not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ════════════════════════════════════════════════════════════
-- TABLE: categories
-- Columns used in db.js: id, name, descriptor, subcategories,
--                        sort_order, active
-- ════════════════════════════════════════════════════════════
create table categories (
  id            text        primary key,
  name          text        not null,
  descriptor    text        not null default '',
  subcategories jsonb       not null default '[]'::jsonb,
  sort_order    integer     not null default 0,
  active        boolean     not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ════════════════════════════════════════════════════════════
-- TABLE: products
-- Write columns (productToRow):
--   id, name, category_id, subcategory_id, collection_id,
--   published, featured, stock_status,
--   project_availability, retail_availability,
--   description, full_description, finishes, material,
--   additional_material, features, specifications,
--   dimensions, trade_price, mrp, pricing_mode, pricing_note,
--   sku, tags, related_products, meta_title, meta_description
-- Extra read columns (rowToProduct):
--   images, cad_file, bim_file, tech_data_sheet,
--   installation_manual, dimension_diagram,
--   created_at, updated_at
-- ════════════════════════════════════════════════════════════
create table products (
  -- Identity
  id                   text        primary key,
  name                 text        not null,

  -- Classification
  category_id          text        references categories(id) on delete set null,
  subcategory_id       text,
  collection_id        text        references collections(id) on delete set null,

  -- Visibility
  published            boolean     not null default false,
  featured             boolean     not null default false,
  stock_status         text        not null default 'in-stock'
                         check (stock_status in ('in-stock','out-of-stock','made-to-order')),
  project_availability boolean     not null default true,
  retail_availability  boolean     not null default true,

  -- Copy
  description          text        not null default '',
  full_description     text        not null default '',

  -- Materials & construction
  finishes             text[]      not null default '{}',
  material             text        not null default '',
  additional_material  text        not null default '',

  -- Spec data (arrays / JSON)
  features             text[]      not null default '{}',
  specifications       jsonb       not null default '[]'::jsonb,
  dimensions           jsonb       not null default '{}'::jsonb,

  -- Pricing
  trade_price          numeric,
  mrp                  numeric,
  pricing_mode         text        not null default 'on-request'
                         check (pricing_mode in ('on-request','show-mrp','hidden')),
  pricing_note         text        not null default '',

  -- Catalogue
  sku                  text        not null default '',
  tags                 text[]      not null default '{}',

  -- Media (Supabase Storage public URLs)
  images               text[]      not null default '{}',
  cad_file             text,
  bim_file             text,
  tech_data_sheet      text,
  installation_manual  text,
  dimension_diagram    text,

  -- Relations
  related_products     text[]      not null default '{}',

  -- SEO
  meta_title           text        not null default '',
  meta_description     text        not null default '',

  -- Timestamps
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- ════════════════════════════════════════════════════════════
-- TABLE: contact_enquiries
-- Columns used in db.js insert:
--   name, company, project_type, city, country,
--   email, phone, message
-- ════════════════════════════════════════════════════════════
create table contact_enquiries (
  id           uuid        primary key default uuid_generate_v4(),
  name         text,
  company      text,
  project_type text,
  city         text,
  country      text,
  email        text,
  phone        text,
  message      text,
  created_at   timestamptz not null default now()
);

-- ════════════════════════════════════════════════════════════
-- INDEXES
-- ════════════════════════════════════════════════════════════
create index idx_products_category_id    on products (category_id);
create index idx_products_collection_id  on products (collection_id);
create index idx_products_published      on products (published);
create index idx_products_featured       on products (featured);
create index idx_products_created_at     on products (created_at);
create index idx_collections_sort_order  on collections (sort_order);
create index idx_finishes_sort_order     on finishes (sort_order);
create index idx_categories_sort_order   on categories (sort_order);
create index idx_enquiries_created_at    on contact_enquiries (created_at);

-- ════════════════════════════════════════════════════════════
-- UPDATED_AT TRIGGER
-- ════════════════════════════════════════════════════════════
create or replace function set_updated_at()
returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_collections_updated_at
  before update on collections
  for each row execute procedure set_updated_at();

create trigger trg_finishes_updated_at
  before update on finishes
  for each row execute procedure set_updated_at();

create trigger trg_categories_updated_at
  before update on categories
  for each row execute procedure set_updated_at();

create trigger trg_products_updated_at
  before update on products
  for each row execute procedure set_updated_at();

-- ════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ════════════════════════════════════════════════════════════
alter table collections       enable row level security;
alter table finishes          enable row level security;
alter table categories        enable row level security;
alter table products          enable row level security;
alter table contact_enquiries enable row level security;

-- Collections: public read, anon full write
create policy "Public read collections"
  on collections for select using (true);
create policy "Anon manage collections"
  on collections for all using (true) with check (true);

-- Finishes: public read, anon full write
create policy "Public read finishes"
  on finishes for select using (true);
create policy "Anon manage finishes"
  on finishes for all using (true) with check (true);

-- Categories: public read, anon full write
create policy "Public read categories"
  on categories for select using (true);
create policy "Anon manage categories"
  on categories for all using (true) with check (true);

-- Products: published rows public, anon full admin
create policy "Public read published products"
  on products for select using (published = true);
create policy "Anon manage products"
  on products for all using (true) with check (true);

-- Contact enquiries: anon insert + read
create policy "Anon insert enquiries"
  on contact_enquiries for insert with check (true);
create policy "Anon read enquiries"
  on contact_enquiries for select using (true);

-- ════════════════════════════════════════════════════════════
-- SEED DATA
-- All columns match the table definitions above exactly.
-- ════════════════════════════════════════════════════════════

-- collections: id, name, mood, description, sort_order, active
insert into collections (id, name, mood, description, sort_order, active) values
  ('milano', 'Milano', 'Sharp geometry. Polished chrome. Milanese restraint.', '', 1, true),
  ('como',   'Como',   'Fluid curves. Brushed nickel. Lakeside serenity.',     '', 2, true),
  ('verona', 'Verona', 'Classic proportion. Matte black. Timeless authority.', '', 3, true)
on conflict (id) do nothing;

-- finishes: id, label, hex, description, active, sort_order
insert into finishes (id, label, hex, description, active, sort_order) values
  ('chrome',         'Chrome',         '#C8C8C8', '', true, 1),
  ('brushed-nickel', 'Brushed Nickel', '#A7A39B', '', true, 2),
  ('matte-black',    'Matte Black',    '#1C1C1C', '', true, 3),
  ('brushed-gold',   'Brushed Gold',   '#C9A96E', '', true, 4),
  ('satin-black',    'Satin Black',    '#2C2C2C', '', true, 5)
on conflict (id) do nothing;

-- ════════════════════════════════════════════════════════════
-- STORAGE BUCKETS
-- Create these manually in Supabase Dashboard → Storage:
--   product-images   (public)
--   project-images   (public)
--   downloads        (public)
--   brand-assets     (public)
-- Or run these if you have storage admin privileges:
-- ════════════════════════════════════════════════════════════
-- insert into storage.buckets (id, name, public) values
--   ('product-images', 'product-images', true),
--   ('project-images', 'project-images', true),
--   ('downloads',      'downloads',      true),
--   ('brand-assets',   'brand-assets',   true)
-- on conflict (id) do nothing;
