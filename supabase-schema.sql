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

-- ── Seed: products (30 default EVOKE products) ─────────────────────────
-- Uses ON CONFLICT (id) DO NOTHING so existing edits are preserved.
INSERT INTO products (
  id, name, category_id, subcategory_id, collection_id,
  published, featured, stock_status,
  project_availability, retail_availability,
  description, full_description,
  finishes, material, additional_material,
  features, specifications, dimensions,
  trade_price, mrp, pricing_mode, pricing_note,
  sku, tags, related_products,
  meta_title, meta_description,
  images
) VALUES
  (
    'VH-BF-001', 'Elara Wall-Mounted Basin Mixer', 'bath-fittings', 'wall-mounted-mixers', 'milano',
    true, true, 'in-stock',
    true, true,
    'A study in geometric restraint, the Elara mixer brings Milanese precision to the wash basin. Crafted from solid brass with a ceramic disc cartridge.', 'The Elara Wall-Mounted Basin Mixer represents the finest expression of the Milano Collection — form reduced to its essential geometry, function elevated to art.',
    ARRAY['chrome', 'brushed-nickel', 'matte-black'], 'Solid brass body, ceramic disc cartridge', 'Stainless steel braided hose',
    ARRAY['Solid brass construction', 'Ceramic disc cartridge — drip-free lifetime', 'Compatible with all EVOKE Milano sanitaryware', 'Available in 5 architectural finishes', 'WRAS approved'], '[{"key": "Cartridge Type", "value": "Ceramic disc"}, {"key": "Water Pressure", "value": "0.5–5.0 bar"}, {"key": "Flow Rate", "value": "5 L/min at 3 bar"}, {"key": "Certification", "value": "WRAS, CE"}]'::jsonb, '{"height": 192, "width": 44, "depth": 176, "spoutReach": 152, "spoutHeight": 110, "weight": 1.2}'::jsonb,
    18500, 24000, 'on-request', '',
    'VH-BF-001-CHR', ARRAY['basin mixer', 'wall mounted', 'milano'], ARRAY['VH-BF-002', 'VH-SS-001'],
    'Elara Wall-Mounted Basin Mixer — EVOKE Milano', 'Specification-grade wall-mounted basin mixer from the EVOKE Milano Collection.',
    ARRAY[]::text[]
  ),
  (
    'VH-BF-002', 'Palazzo Deck-Mounted Bath Mixer', 'bath-fittings', 'deck-mounted-mixers', 'como',
    true, false, 'in-stock',
    true, true,
    'The Palazzo deck mixer channels the fluid elegance of the Como Collection. Brushed nickel finish, organic curves, enduring form.', 'Inspired by the gentle curves of Lake Como''s shores, the Palazzo mixer softens the geometry of the contemporary bath without sacrificing specification-grade performance.',
    ARRAY['brushed-nickel', 'brushed-gold'], 'Solid brass body, ceramic disc cartridge', '',
    ARRAY['Fluid curve geometry', 'Single-lever precision control', 'Como Collection compatible', 'Suitable for 0.5–5 bar', 'WRAS approved'], '[{"key": "Cartridge Type", "value": "Ceramic disc"}, {"key": "Water Pressure", "value": "0.5–5.0 bar"}]'::jsonb, '{"height": 220, "width": 52, "depth": 190, "spoutReach": 168, "spoutHeight": 130, "weight": 1.5}'::jsonb,
    22000, 29000, 'on-request', '',
    'VH-BF-002-BN', ARRAY['bath mixer', 'deck mounted', 'como'], ARRAY['VH-BF-001', 'VH-WB-001'],
    'Palazzo Deck-Mounted Bath Mixer — EVOKE Como', '',
    ARRAY[]::text[]
  ),
  (
    'VH-SS-001', 'Cielo Rain Showerhead 300mm', 'shower-systems', 'rain-showerheads', 'milano',
    true, true, 'in-stock',
    true, true,
    'The Cielo 300mm overhead rain showerhead delivers a wide, enveloping rainfall experience through 120 precision-laser-cut nozzles.', 'Engineered for five-star hospitality environments and luxury residential projects, the Cielo rain showerhead pairs architectural proportion with hydrological precision.',
    ARRAY['chrome', 'matte-black', 'brushed-nickel'], '316L stainless steel body, silicone nozzles', '',
    ARRAY['120 laser-cut silicone nozzles', 'Anti-limescale technology', 'Compatible with EVOKE thermostatic systems', 'Easy clean nozzle wipe'], '[{"key": "Spray Pattern", "value": "Full rainfall"}, {"key": "Nozzles", "value": "120 silicone"}, {"key": "Flow Rate", "value": "12 L/min at 3 bar"}]'::jsonb, '{"height": 8, "width": 300, "depth": 300, "spoutReach": 0, "spoutHeight": 0, "weight": 0.9}'::jsonb,
    14000, 19500, 'on-request', '',
    'VH-SS-001-CHR', ARRAY['rain shower', 'overhead', 'milano'], ARRAY['VH-BF-001', 'VH-SS-002'],
    'Cielo Rain Showerhead 300mm — EVOKE Milano', '',
    ARRAY[]::text[]
  ),
  (
    'VH-SS-002', 'Terma Thermostatic Shower Column', 'shower-systems', 'shower-columns', 'verona',
    true, false, 'made-to-order',
    true, false,
    'The Terma thermostatic column integrates overhead rain, body jets, and a handheld shower within a single architectural statement piece.', 'Specified for the most demanding hospitality and residential projects, the Terma column embodies the Verona Collection''s commitment to classical proportion.',
    ARRAY['matte-black', 'satin-black'], 'Solid brass thermostatic body, stainless steel column', '',
    ARRAY['Integrated thermostatic cartridge', '300mm overhead rain', '4 body jets', 'Handheld shower with 1.5m hose', 'Anti-scald safety system'], '[{"key": "Thermostatic Range", "value": "20–50°C"}, {"key": "Water Pressure", "value": "1.0–5.0 bar"}, {"key": "Outlets", "value": "3 (overhead / jets / handheld)"}]'::jsonb, '{"height": 1200, "width": 120, "depth": 120, "spoutReach": 0, "spoutHeight": 0, "weight": 8.5}'::jsonb,
    85000, 110000, 'on-request', 'Hotel projects: minimum 10 units',
    'VH-SS-002-MB', ARRAY['thermostatic', 'shower column', 'verona'], ARRAY['VH-SS-001', 'VH-BF-001'],
    'Terma Thermostatic Shower Column — EVOKE Verona', '',
    ARRAY[]::text[]
  ),
  (
    'VH-WB-001', 'Lago Vessel Basin', 'wash-basins', 'vessel-basins', 'como',
    true, true, 'in-stock',
    true, true,
    'The Lago vessel basin sits above the vanity surface like a singular sculptural object. Hand-finished ceramic in a soft matte white glaze.', 'Drawn from the organic forms of Italian ceramic tradition, the Lago basin is produced in a single casting from vitreous ceramic, then hand-finished to a level of surface quality reserved for gallery objects.',
    ARRAY['matte-black'], 'Vitreous ceramic, hand-finished matte white glaze', '',
    ARRAY['Single-cast vitreous ceramic', 'Hand-finished surface', 'Overflow integrated', 'Compatible with all EVOKE wall-mounted mixers'], '[{"key": "Material", "value": "Vitreous ceramic"}, {"key": "Glaze", "value": "Matte white, hand-finished"}, {"key": "Overflow", "value": "Integrated"}]'::jsonb, '{"height": 148, "width": 450, "depth": 350, "spoutReach": 0, "spoutHeight": 0, "weight": 9.2}'::jsonb,
    32000, 42000, 'on-request', '',
    'VH-WB-001-MW', ARRAY['vessel basin', 'ceramic', 'como'], ARRAY['VH-BF-002', 'VH-LV-001'],
    'Lago Vessel Basin — EVOKE Como', '',
    ARRAY[]::text[]
  ),
  (
    'VH-LV-001', 'Stanza Wall-Hung Vanity 1200mm', 'luxury-vanities', 'wall-hung-vanities', 'verona',
    true, false, 'made-to-order',
    true, true,
    'The Stanza vanity unit in American oak veneer with a floating wall-hung profile. Softclose drawers, integrated basin cut-out, matte black hardware.', 'The Stanza 1200mm vanity represents EVOKE''s specification furniture range — architectural joinery at bathroom scale, built to the same tolerances demanded of structural elements.',
    ARRAY['matte-black', 'brushed-nickel'], 'American oak veneer over MDF carcass, solid oak drawer fronts', 'Matte black powder-coated hardware',
    ARRAY['Wall-hung floating installation', 'Softclose undermount drawers', 'Integrated basin cut-out (500mm)', 'Matte black hardware throughout', 'FSC-certified oak veneer'], '[{"key": "Carcass", "value": "MDF, moisture-resistant"}, {"key": "Doors/Drawers", "value": "Solid oak veneer, softclose"}, {"key": "Hardware", "value": "Matte black powder coat"}]'::jsonb, '{"height": 520, "width": 1200, "depth": 480, "spoutReach": 0, "spoutHeight": 0, "weight": 42}'::jsonb,
    95000, 130000, 'on-request', 'Lead time: 8 weeks',
    'VH-LV-001-OAK', ARRAY['vanity', 'wall-hung', 'oak', 'verona'], ARRAY['VH-WB-001', 'VH-BF-002'],
    'Stanza Wall-Hung Vanity 1200mm — EVOKE Verona', '',
    ARRAY[]::text[]
  ),
  (
    'EV-MR-001', 'Lumina LED Smart Mirror', 'mirrors', 'led-smart-mirrors', 'milano',
    true, true, 'in-stock',
    true, true,
    'Integrated LED illumination with touch dimming. Anti-fog coating, backlit perimeter glow and warm/cool light temperature control.', 'The Lumina Smart Mirror redefines bathroom illumination with precision-engineered LED technology. A perimeter backlight casts an even, flattering glow while the anti-fog system ensures clarity in all conditions.',
    ARRAY['brushed-nickel', 'matte-black'], 'Float glass, aluminium frame, LED strip', 'IP44 rated driver, touch sensor panel',
    ARRAY['Anti-fog coating', 'Touch dimmer control', 'Warm/cool light temperature 2700–6500K', 'IP44 splash-rated', 'Milano Collection compatible'], '[{"key": "Glass", "value": "5mm float glass"}, {"key": "LED Life", "value": "50,000 hrs"}, {"key": "IP Rating", "value": "IP44"}, {"key": "Light Temp", "value": "2700–6500K"}]'::jsonb, '{"height": 800, "width": 600, "depth": 40, "weight": 8.5}'::jsonb,
    28000, 36000, 'on-request', '',
    'EV-MR-001-BN', ARRAY['smart mirror', 'LED mirror', 'illuminated', 'anti-fog'], ARRAY['EV-MR-002', 'VH-LV-001'],
    'Lumina LED Smart Mirror — EVOKE Milano', 'Integrated LED smart mirror with anti-fog and touch dimming from EVOKE.',
    ARRAY[]::text[]
  ),
  (
    'EV-MR-002', 'Arco Frameless Mirror', 'mirrors', 'frameless-mirrors', 'como',
    true, false, 'in-stock',
    true, true,
    'A pure expression of architectural restraint. Polished edge frameless glass with a concealed wall bracket system.', 'The Arco Frameless Mirror achieves visual weightlessness through concealed bracket fixings and polished edge glass. Available in standard and bespoke sizing.',
    ARRAY['chrome', 'brushed-nickel'], '6mm low-iron glass, polished edge', 'Concealed stainless bracket system',
    ARRAY['Polished bevelled edge', 'Concealed bracket fixing', 'Available in custom sizes', 'Como Collection compatible'], '[{"key": "Glass", "value": "6mm low-iron"}, {"key": "Edge", "value": "Polished bevel 10mm"}, {"key": "Fixing", "value": "Concealed bracket"}]'::jsonb, '{"height": 900, "width": 700, "depth": 25, "weight": 12}'::jsonb,
    18000, 24000, 'on-request', '',
    'EV-MR-002-PE', ARRAY['frameless mirror', 'architectural', 'como'], ARRAY['EV-MR-001', 'VH-WB-001'],
    'Arco Frameless Mirror — EVOKE Como', 'Polished-edge frameless mirror with concealed fixings from EVOKE.',
    ARRAY[]::text[]
  ),
  (
    'EV-SW-001', 'Forma Wall-Hung WC', 'sanitaryware', 'wall-hung-wcs', 'verona',
    true, true, 'in-stock',
    true, true,
    'A sculptural wall-hung WC with a softly tapered form. Rimless wash technology, dual flush, and a whisper-close seat.', 'The Forma WC pairs refined geometry with engineering precision. The rimless bowl ensures effortless hygiene while the whisper-close seat and dual-flush mechanism deliver quiet, efficient performance.',
    ARRAY['matte-white', 'matte-black'], 'Vitreous china, high-gloss glaze', 'Soft-close PP seat, stainless fixings',
    ARRAY['Rimless flush technology', 'Dual flush 3/6L', 'Whisper-close soft seat', 'Wall-hung — floor clearance for easy cleaning', 'Verona Collection compatible'], '[{"key": "Flush", "value": "Dual 3/6L"}, {"key": "Material", "value": "Vitreous china"}, {"key": "Seat", "value": "Soft-close PP"}, {"key": "Fixing Height", "value": "400–430mm AFF"}]'::jsonb, '{"height": 350, "width": 360, "depth": 520, "weight": 22}'::jsonb,
    32000, 42000, 'on-request', '',
    'EV-SW-001-MW', ARRAY['wall hung WC', 'rimless', 'sanitaryware', 'verona'], ARRAY['EV-SW-002', 'EV-AC-001'],
    'Forma Wall-Hung WC — EVOKE Verona', 'Rimless wall-hung WC with dual flush and whisper-close seat from EVOKE.',
    ARRAY[]::text[]
  ),
  (
    'EV-SW-002', 'Alto Concealed Cistern', 'sanitaryware', 'cisterns', 'verona',
    true, false, 'in-stock',
    true, true,
    'In-wall concealed cistern frame for wall-hung WC installations. Adjustable height, pneumatic flush, and full-access service panel.', 'The Alto Concealed Cistern provides the structural and hydraulic infrastructure for floating WC installations. Engineered for silent operation and long-term accessibility.',
    ARRAY['chrome', 'brushed-nickel', 'matte-black'], 'Galvanised steel frame, ABS cistern', 'Dual pneumatic flush valve, service panel',
    ARRAY['Height adjustable 820–1050mm', 'Silent fill valve', 'Dual flush pneumatic actuation', 'Full front-access service panel', 'Compatible with EV-SW-001'], '[{"key": "Frame Height", "value": "820–1050mm adj."}, {"key": "Cistern Capacity", "value": "9L"}, {"key": "Flush", "value": "Pneumatic dual 3/6L"}, {"key": "Wall Thickness", "value": "100mm min."}]'::jsonb, '{"height": 1000, "width": 500, "depth": 115, "weight": 18}'::jsonb,
    22000, 29000, 'on-request', '',
    'EV-SW-002-CHR', ARRAY['concealed cistern', 'in-wall frame', 'sanitaryware'], ARRAY['EV-SW-001'],
    'Alto Concealed Cistern — EVOKE', 'In-wall concealed cistern frame with pneumatic flush for wall-hung WC installations.',
    ARRAY[]::text[]
  ),
  (
    'EV-BL-001', 'Lume Mirror Light Bar', 'bathroom-lighting', 'mirror-lighting', 'milano',
    true, true, 'in-stock',
    true, true,
    'A slender architectural LED bar for mirror-side task lighting. High-CRI output, dimmable, and IP44 rated for wet zone installation.', 'The Lume Light Bar delivers high-quality task illumination at the vanity position. Its slim profile and brushed metal housing integrate seamlessly above or beside any EVOKE mirror.',
    ARRAY['brushed-nickel', 'matte-black'], 'Extruded aluminium housing, opal diffuser', 'High-CRI LED module, IP44 driver',
    ARRAY['CRI 95+ for true colour rendering', 'IP44 splash rated', 'Dimmable 1–100%', 'Flicker-free output', 'Milano Collection compatible'], '[{"key": "CRI", "value": "95+"}, {"key": "IP Rating", "value": "IP44"}, {"key": "Power", "value": "18W"}, {"key": "Colour Temp", "value": "2700K / 4000K"}]'::jsonb, '{"height": 50, "width": 600, "depth": 80, "weight": 1.8}'::jsonb,
    14000, 18500, 'on-request', '',
    'EV-BL-001-BN', ARRAY['mirror light', 'LED bar', 'task lighting', 'bathroom'], ARRAY['EV-BL-002', 'EV-MR-001'],
    'Lume Mirror Light Bar — EVOKE Milano', 'High-CRI LED mirror light bar, IP44 rated, dimmable. From EVOKE.',
    ARRAY[]::text[]
  ),
  (
    'EV-BL-002', 'Aureo Recessed Ceiling Light', 'bathroom-lighting', 'recessed-lighting', 'como',
    true, false, 'in-stock',
    true, true,
    'A flush architectural downlight engineered for wet zone ceilings. Anti-glare optic, wide beam distribution, and IP65 rated.', 'The Aureo Recessed Light disappears into the ceiling plane while delivering refined ambient illumination. The anti-glare diffuser and wide 60° beam create an even, shadow-free wash.',
    ARRAY['brushed-nickel', 'matte-white'], 'Die-cast aluminium, anti-glare PC optic', 'IP65 LED module, dimmable driver',
    ARRAY['IP65 fully sealed', 'Anti-glare trim optic', '60° wide beam', 'Dimmable DALI compatible', 'Como Collection compatible'], '[{"key": "IP Rating", "value": "IP65"}, {"key": "Power", "value": "12W"}, {"key": "Beam Angle", "value": "60°"}, {"key": "Cut-out", "value": "Ø90mm"}]'::jsonb, '{"height": 65, "width": 110, "depth": 110, "weight": 0.9}'::jsonb,
    9500, 13000, 'on-request', '',
    'EV-BL-002-BN', ARRAY['recessed light', 'downlight', 'ceiling', 'IP65'], ARRAY['EV-BL-001'],
    'Aureo Recessed Ceiling Light — EVOKE Como', 'IP65 anti-glare recessed downlight for wet zone ceilings from EVOKE.',
    ARRAY[]::text[]
  ),
  (
    'EV-AC-001', 'Sera Towel Rail', 'accessories', 'towel-rails', 'verona',
    true, true, 'in-stock',
    true, true,
    'A wall-mounted double towel rail in solid brass. Clean horizontal geometry with concealed fixings and a fine E-monogrammed end cap.', 'The Sera Towel Rail pairs architectural restraint with enduring material quality. Solid brass construction and concealed wall fixings create a seamless profile that anchors the accessory palette.',
    ARRAY['brushed-nickel', 'chrome', 'matte-black'], 'Solid brass, PVD finish', 'Concealed wall fixings, E-monogram end caps',
    ARRAY['Solid brass construction', 'PVD finish — tarnish resistant', 'Concealed fixing system', 'E-monogram end caps', 'Verona Collection compatible'], '[{"key": "Bar Diameter", "value": "Ø22mm"}, {"key": "Projection", "value": "110mm"}, {"key": "Finish", "value": "PVD Brushed Nickel"}, {"key": "Fixing", "value": "Concealed wall plate"}]'::jsonb, '{"height": 22, "width": 600, "depth": 110, "weight": 1.2}'::jsonb,
    8500, 11500, 'on-request', '',
    'EV-AC-001-BN', ARRAY['towel rail', 'towel bar', 'accessory', 'brass'], ARRAY['EV-AC-002', 'EV-SW-001'],
    'Sera Towel Rail — EVOKE Verona', 'Solid brass double towel rail with concealed fixings and E-monogram end caps from EVOKE.',
    ARRAY[]::text[]
  ),
  (
    'EV-AC-002', 'Nera Robe Hook Set', 'accessories', 'robe-hooks', 'verona',
    true, false, 'in-stock',
    true, true,
    'A set of two double robe hooks in solid brass with a fine E-monogram impression at the base. Concealed fixing system.', 'The Nera Robe Hook Set maintains the same architectural discipline as the Sera Towel Rail. Supplied as a pair, each hook carries a discreet E-monogram impression — the defining detail of the EVOKE accessory range.',
    ARRAY['brushed-nickel', 'chrome', 'matte-black'], 'Solid brass, PVD finish', 'Concealed anchor plate, stainless fixings',
    ARRAY['Double hook per unit', 'Set of two', 'E-monogram base impression', 'Concealed wall plate fixing', 'Verona Collection compatible'], '[{"key": "Hook Projection", "value": "65mm"}, {"key": "Base Width", "value": "55mm"}, {"key": "Load Rating", "value": "5kg per hook"}, {"key": "Supplied", "value": "Pair"}]'::jsonb, '{"height": 65, "width": 55, "depth": 65, "weight": 0.4}'::jsonb,
    6000, 8000, 'on-request', '',
    'EV-AC-002-BN', ARRAY['robe hook', 'hook', 'accessory', 'brass'], ARRAY['EV-AC-001'],
    'Nera Robe Hook Set — EVOKE Verona', 'Solid brass double robe hook set with E-monogram impression from EVOKE.',
    ARRAY[]::text[]
  ),
  (
    'VH-BF-003', 'Vela Concealed Basin Mixer', 'bath-fittings', 'concealed-mixers', 'verona',
    true, false, 'made-to-order',
    true, true,
    'A fully concealed wall-mounted basin mixer from the Verona Collection. Recessed body with a minimal exposed trim plate and single-lever control in matte black.', 'The Vela Concealed Basin Mixer represents the ultimate expression of architectural restraint — the fitting disappears into the wall, leaving only a flush trim plate and lever as evidence of the infrastructure behind.',
    ARRAY['matte-black', 'satin-black'], 'Solid brass body, ceramic disc cartridge', 'Flush trim plate, concealed rough-in valve',
    ARRAY['Fully concealed installation', 'Ceramic disc cartridge', 'Compatible with standard 150mm wall rough-in', 'Verona Collection compatible', 'WRAS approved'], '[{"key": "Cartridge", "value": "Ceramic disc"}, {"key": "Rough-In", "value": "150mm standard"}, {"key": "Water Pressure", "value": "1.0–5.0 bar"}, {"key": "Finish", "value": "PVD Matte Black"}]'::jsonb, '{"height": 40, "width": 180, "depth": 12, "spoutReach": 0, "spoutHeight": 0, "weight": 1.8}'::jsonb,
    26000, 34000, 'on-request', 'Includes rough-in valve',
    'VH-BF-003-MB', ARRAY['concealed mixer', 'basin mixer', 'recessed', 'verona'], ARRAY['VH-BF-001', 'VH-WB-001'],
    'Vela Concealed Basin Mixer — EVOKE Verona', 'Fully concealed wall-mounted basin mixer with PVD matte black finish from EVOKE.',
    ARRAY[]::text[]
  ),
  (
    'VH-BF-004', 'Sento Sensor Faucet', 'bath-fittings', 'sensor-faucets', 'milano',
    true, false, 'in-stock',
    true, false,
    'Touchless infrared sensor faucet engineered for hospitality and commercial washrooms. Precision flow control, automatic shut-off, and a clean geometric profile.', 'The Sento Sensor Faucet combines the Milano Collection''s geometric discipline with touchless infrared technology. Designed for high-traffic hospitality environments where hygiene and water efficiency are equally paramount.',
    ARRAY['chrome', 'brushed-nickel'], 'Solid brass body, infrared sensor module', 'Integrated solenoid valve, battery or mains powered',
    ARRAY['Infrared touchless activation', 'Adjustable flow rate 4–6 L/min', 'Battery (6 × AA) or AC adapter', 'Anti-legionella thermal flush programmable', 'Milano Collection compatible'], '[{"key": "Sensor Range", "value": "100–200mm"}, {"key": "Flow Rate", "value": "4–6 L/min"}, {"key": "Power", "value": "6×AA / 6V AC"}, {"key": "IP Rating", "value": "IP67 sensor"}]'::jsonb, '{"height": 165, "width": 38, "depth": 155, "spoutReach": 130, "spoutHeight": 95, "weight": 1.4}'::jsonb,
    32000, 42000, 'on-request', 'Minimum 4 units for hospitality projects',
    'VH-BF-004-CHR', ARRAY['sensor faucet', 'touchless', 'hospitality', 'milano'], ARRAY['VH-BF-001', 'VH-SS-001'],
    'Sento Sensor Faucet — EVOKE Milano', 'Touchless infrared sensor faucet for hospitality environments from EVOKE.',
    ARRAY[]::text[]
  ),
  (
    'VH-SS-003', 'Bruma Handheld Shower 120mm', 'shower-systems', 'handheld-showers', 'como',
    true, false, 'in-stock',
    true, true,
    'A 120mm handheld shower handset with a soft mist spray and silicone anti-limescale nozzles. Includes 1.75m stainless braided hose and wall bracket.', 'The Bruma Handheld Shower brings the Como Collection''s fluid sensibility to the handset format. Its oval profile and brushed nickel finish pair naturally with the Palazzo deck mixer and Lago vessel basin.',
    ARRAY['brushed-nickel', 'brushed-gold'], 'ABS body, silicone nozzles, stainless steel hose', 'Wall bracket, 1.75m braided hose',
    ARRAY['3-function spray modes', 'Anti-limescale silicone nozzles', '1.75m braided stainless hose included', 'Como Collection compatible', 'WRAS approved'], '[{"key": "Head Diameter", "value": "120mm"}, {"key": "Spray Modes", "value": "3 (rain / massage / mist)"}, {"key": "Flow Rate", "value": "8 L/min at 3 bar"}, {"key": "Hose Length", "value": "1.75m"}]'::jsonb, '{"height": 240, "width": 120, "depth": 55, "spoutReach": 0, "spoutHeight": 0, "weight": 0.6}'::jsonb,
    9500, 13000, 'on-request', '',
    'VH-SS-003-BN', ARRAY['handheld shower', 'shower handset', 'como'], ARRAY['VH-SS-001', 'VH-BF-002'],
    'Bruma Handheld Shower 120mm — EVOKE Como', '3-function handheld shower handset with anti-limescale nozzles from EVOKE.',
    ARRAY[]::text[]
  ),
  (
    'VH-SS-004', 'Cascata Thermostatic Shower System', 'shower-systems', 'thermostatic-systems', 'milano',
    true, true, 'in-stock',
    true, true,
    'A wall-mounted two-outlet thermostatic shower system with a 250mm overhead rain plate and handheld outlet. Precise temperature memory and anti-scald lock.', 'The Cascata Thermostatic System delivers the reliability demanded by five-star hospitality alongside the aesthetic precision of the Milano Collection. Temperature is set once and held — every shower begins at the same perfect degree.',
    ARRAY['chrome', 'matte-black'], 'Solid brass thermostatic valve, stainless trim', '250mm rain plate, handheld handset, 1.5m hose',
    ARRAY['Temperature memory cartridge', 'Anti-scald lock at 38°C', 'Two independent volume controls', '250mm overhead rain plate', 'Handheld shower included'], '[{"key": "Thermostatic Range", "value": "20–48°C"}, {"key": "Water Pressure", "value": "1.0–5.0 bar"}, {"key": "Outlets", "value": "2 (overhead / handheld)"}, {"key": "Certification", "value": "WRAS, CE"}]'::jsonb, '{"height": 200, "width": 380, "depth": 90, "spoutReach": 0, "spoutHeight": 0, "weight": 4.2}'::jsonb,
    48000, 62000, 'on-request', '',
    'VH-SS-004-CHR', ARRAY['thermostatic shower', 'shower system', 'milano'], ARRAY['VH-SS-001', 'VH-SS-002'],
    'Cascata Thermostatic Shower System — EVOKE Milano', 'Two-outlet wall-mounted thermostatic shower system with rain plate from EVOKE.',
    ARRAY[]::text[]
  ),
  (
    'VH-WB-002', 'Pietra Counter-Top Basin', 'wash-basins', 'counter-top-basins', 'verona',
    true, false, 'in-stock',
    true, true,
    'A counter-top basin in cast mineral composite with a matte stone texture. Rectangular form with gently radiused corners and a low-profile overflow slot.', 'The Pietra Counter-Top Basin draws from the Verona Collection''s reverence for classical materials. Its mineral composite surface replicates the tactile warmth of honed stone while providing the durability required for luxury residential and hospitality use.',
    ARRAY['matte-black'], 'Cast mineral composite, matte stone texture', 'Waste and overflow fitting included',
    ARRAY['Cast mineral composite — chip and stain resistant', 'Integrated low-profile overflow', 'Pre-drilled single tap hole', 'Compatible with all EVOKE deck-mounted mixers', 'Verona Collection compatible'], '[{"key": "Material", "value": "Mineral composite"}, {"key": "Surface", "value": "Matte stone texture"}, {"key": "Overflow", "value": "Integrated slot"}, {"key": "Tap Hole", "value": "Single Ø35mm"}]'::jsonb, '{"height": 120, "width": 520, "depth": 380, "spoutReach": 0, "spoutHeight": 0, "weight": 11.5}'::jsonb,
    28000, 36000, 'on-request', '',
    'VH-WB-002-MS', ARRAY['counter top basin', 'stone basin', 'mineral composite', 'verona'], ARRAY['VH-WB-001', 'VH-BF-002'],
    'Pietra Counter-Top Basin — EVOKE Verona', 'Cast mineral composite counter-top basin with matte stone texture from EVOKE.',
    ARRAY[]::text[]
  ),
  (
    'VH-WB-003', 'Sospeso Wall-Hung Basin', 'wash-basins', 'wall-hung-basins', 'milano',
    true, false, 'in-stock',
    true, true,
    'A cantilevered wall-hung basin in high-gloss vitreous china. Slim 145mm depth profile, concealed wall brackets, and a single tap hole centred at the rear.', 'The Sospeso Wall-Hung Basin creates the illusion of floating at the wall plane — its slim depth and concealed bracket system allow the floor to read as uninterrupted. Specified across premium residential and boutique hospitality projects.',
    ARRAY['chrome'], 'Vitreous china, high-gloss white glaze', 'Concealed wall bracket set, click-clack waste',
    ARRAY['145mm slim-depth wall projection', 'Concealed stainless bracket system', 'Integrated overflow', 'Single rear tap hole Ø35mm', 'Milano Collection compatible'], '[{"key": "Material", "value": "Vitreous china"}, {"key": "Glaze", "value": "High-gloss white"}, {"key": "Projection", "value": "145mm from wall"}, {"key": "Overflow", "value": "Integrated"}]'::jsonb, '{"height": 145, "width": 560, "depth": 370, "spoutReach": 0, "spoutHeight": 0, "weight": 13}'::jsonb,
    22000, 29000, 'on-request', '',
    'VH-WB-003-W', ARRAY['wall hung basin', 'floating basin', 'vitreous china', 'milano'], ARRAY['VH-WB-001', 'VH-BF-001'],
    'Sospeso Wall-Hung Basin — EVOKE Milano', 'Slim 145mm wall-hung basin in high-gloss vitreous china from EVOKE.',
    ARRAY[]::text[]
  ),
  (
    'VH-LV-002', 'Torre Freestanding Vanity 900mm', 'luxury-vanities', 'freestanding-vanities', 'como',
    true, false, 'made-to-order',
    true, true,
    'A 900mm freestanding floor vanity in natural oak veneer with an integrated storage column. Soft-close doors, push-to-open drawers, and brushed nickel legs.', 'The Torre brings the Como Collection''s warmth and organic material language to the freestanding format. Its integrated column provides generous towel and amenity storage without the visual weight of a full-height unit.',
    ARRAY['brushed-nickel'], 'Natural oak veneer over moisture-resistant MDF', 'Brushed nickel adjustable legs, push-to-open hardware',
    ARRAY['Integrated storage column', 'Push-to-open softclose drawers', 'Adjustable brushed nickel legs ±20mm', 'FSC-certified oak veneer', 'Como Collection compatible'], '[{"key": "Carcass", "value": "MR-MDF, moisture-resistant"}, {"key": "Veneer", "value": "Natural oak, UV-lacquered"}, {"key": "Hardware", "value": "Brushed nickel"}, {"key": "Lead Time", "value": "8 weeks"}]'::jsonb, '{"height": 860, "width": 900, "depth": 460, "spoutReach": 0, "spoutHeight": 0, "weight": 52}'::jsonb,
    88000, 115000, 'on-request', 'Lead time: 8 weeks',
    'VH-LV-002-OAK', ARRAY['freestanding vanity', 'oak vanity', 'storage column', 'como'], ARRAY['VH-LV-001', 'VH-WB-001'],
    'Torre Freestanding Vanity 900mm — EVOKE Como', '900mm freestanding oak vanity with integrated storage column from EVOKE.',
    ARRAY[]::text[]
  ),
  (
    'VH-LV-003', 'Doppio Double Vanity 1500mm', 'luxury-vanities', 'double-vanities', 'milano',
    true, true, 'made-to-order',
    true, true,
    'A 1500mm wall-hung double vanity for his-and-hers specification. Smoked oak veneer, twin soft-close drawer sets, and integrated basin cut-outs for two Ø450mm vessels.', 'The Doppio Double Vanity defines the master bathroom specification. At 1500mm, it provides generous personal storage for two while maintaining the floating, weightless aesthetic that defines the Milano Collection''s approach to cabinetry.',
    ARRAY['matte-black', 'brushed-nickel'], 'Smoked oak veneer over moisture-resistant MDF', 'Matte black or brushed nickel hardware',
    ARRAY['Twin soft-close undermount drawer sets', 'Dual integrated basin cut-outs 450mm', 'Wall-hung floating installation', 'Anti-humidity sealed interior', 'Milano Collection compatible'], '[{"key": "Carcass", "value": "MR-MDF moisture-resistant"}, {"key": "Veneer", "value": "Smoked oak, UV-lacquered"}, {"key": "Basin Cut-outs", "value": "2 × Ø450mm"}, {"key": "Lead Time", "value": "10 weeks"}]'::jsonb, '{"height": 520, "width": 1500, "depth": 480, "spoutReach": 0, "spoutHeight": 0, "weight": 68}'::jsonb,
    145000, 190000, 'on-request', 'Lead time: 10 weeks',
    'VH-LV-003-MB', ARRAY['double vanity', 'his and hers', 'smoked oak', 'milano'], ARRAY['VH-LV-001', 'VH-WB-001'],
    'Doppio Double Vanity 1500mm — EVOKE Milano', '1500mm wall-hung double vanity in smoked oak for his-and-hers specification from EVOKE.',
    ARRAY[]::text[]
  ),
  (
    'EV-MR-003', 'Specchio Framed Mirror', 'mirrors', 'framed-mirrors', 'verona',
    true, false, 'in-stock',
    true, true,
    'A slim architectural frame mirror in matte black or brushed nickel. 12mm square-profile frame, concealed wall fixings, and available in four standard sizes.', 'The Specchio Framed Mirror asserts presence without excess. Its 12mm square-profile frame defines the mirror''s boundary with the same precision that the Verona Collection brings to every element of the bathroom composition.',
    ARRAY['matte-black', 'brushed-nickel'], '5mm float glass, powder-coated aluminium frame', 'Concealed wall bracket system',
    ARRAY['12mm square-profile frame', '5mm float glass', 'Concealed bracket fixing', 'Four standard sizes', 'Verona Collection compatible'], '[{"key": "Frame Profile", "value": "12mm square aluminium"}, {"key": "Glass", "value": "5mm float"}, {"key": "Fixing", "value": "Concealed bracket"}, {"key": "Sizes", "value": "600 / 750 / 900 / 1000mm"}]'::jsonb, '{"height": 900, "width": 750, "depth": 30, "weight": 9}'::jsonb,
    16000, 21000, 'on-request', '',
    'EV-MR-003-MB', ARRAY['framed mirror', 'architectural', 'slim frame', 'verona'], ARRAY['EV-MR-001', 'EV-MR-002'],
    'Specchio Framed Mirror — EVOKE Verona', 'Slim 12mm square-profile framed mirror in matte black or brushed nickel from EVOKE.',
    ARRAY[]::text[]
  ),
  (
    'EV-MR-004', 'Lente Shaving Mirror', 'mirrors', 'shaving-mirrors', 'como',
    true, false, 'in-stock',
    true, true,
    'A wall-mounted magnifying shaving mirror on an articulated arm. 5× magnification, 200mm disc, integrated LED surround, and a 300mm reach articulation.', 'The Lente Shaving Mirror elevates the daily grooming ritual with 5× magnification and a high-CRI LED surround that eliminates shadow. Its articulated arm extends 300mm from the wall and locks at any angle.',
    ARRAY['brushed-nickel', 'chrome'], 'Brass articulated arm, 5× magnification glass', 'LED surround module, IP44 driver',
    ARRAY['5× magnification', '200mm diameter disc', 'Integrated CRI 95+ LED surround', '300mm articulated arm reach', 'IP44 splash rated'], '[{"key": "Magnification", "value": "5×"}, {"key": "Disc Diameter", "value": "200mm"}, {"key": "Arm Reach", "value": "300mm"}, {"key": "IP Rating", "value": "IP44"}]'::jsonb, '{"height": 200, "width": 200, "depth": 320, "weight": 1.4}'::jsonb,
    18500, 24000, 'on-request', '',
    'EV-MR-004-BN', ARRAY['shaving mirror', 'magnifying mirror', 'LED mirror', 'como'], ARRAY['EV-MR-001', 'VH-LV-001'],
    'Lente Shaving Mirror — EVOKE Como', '5× magnification shaving mirror with LED surround and articulated arm from EVOKE.',
    ARRAY[]::text[]
  ),
  (
    'EV-SW-003', 'Puro Close-Coupled WC', 'sanitaryware', 'close-coupled-wcs', 'como',
    true, false, 'in-stock',
    true, true,
    'A close-coupled WC with an integrated cistern in high-gloss vitreous china. Rimless bowl, dual-flush push button, and a soft-close quick-release seat.', 'The Puro Close-Coupled WC achieves the impossible balance — a classic integrated form that feels entirely contemporary. Its flush curves and brilliant white glaze make it the natural centrepiece of Como Collection bathrooms.',
    ARRAY['chrome'], 'Vitreous china, high-gloss white', 'Soft-close quick-release seat, chrome push-button',
    ARRAY['Rimless flush bowl', 'Dual flush 3/6L push button', 'Soft-close quick-release seat', 'S-trap or P-trap conversion kit included', 'Como Collection compatible'], '[{"key": "Flush", "value": "Dual 3/6L push button"}, {"key": "Material", "value": "Vitreous china"}, {"key": "Trap", "value": "S-trap / P-trap (kit included)"}, {"key": "Seat", "value": "Soft-close QR"}]'::jsonb, '{"height": 780, "width": 360, "depth": 680, "weight": 30}'::jsonb,
    24000, 31000, 'on-request', '',
    'EV-SW-003-W', ARRAY['close coupled WC', 'toilet', 'rimless', 'como'], ARRAY['EV-SW-001', 'EV-SW-002'],
    'Puro Close-Coupled WC — EVOKE Como', 'Rimless close-coupled WC with soft-close seat from EVOKE.',
    ARRAY[]::text[]
  ),
  (
    'EV-SW-004', 'Fonte Wall-Hung Bidet', 'sanitaryware', 'bidets', 'milano',
    true, false, 'in-stock',
    true, true,
    'A wall-hung bidet in high-gloss vitreous china. Concealed trap, single tap hole, and an overflow to the front. Pairs with the Elara mixer series.', 'The Fonte Wall-Hung Bidet brings the Italian hygiene tradition into the Milano Collection''s geometric vocabulary. Suspended at wall height, it creates the same visual lightness as the Sospeso basin — the floor reads as continuous.',
    ARRAY['chrome'], 'Vitreous china, high-gloss white', 'Concealed waste, wall fixings included',
    ARRAY['Wall-hung installation', 'Concealed trap', 'Single tap hole Ø35mm', 'Integrated front overflow', 'Milano Collection compatible'], '[{"key": "Material", "value": "Vitreous china"}, {"key": "Trap", "value": "Concealed wall"}, {"key": "Tap Hole", "value": "Single Ø35mm"}, {"key": "Fixing Height", "value": "400mm AFF"}]'::jsonb, '{"height": 340, "width": 360, "depth": 540, "weight": 14}'::jsonb,
    18000, 24000, 'on-request', '',
    'EV-SW-004-W', ARRAY['bidet', 'wall hung bidet', 'sanitaryware', 'milano'], ARRAY['EV-SW-001', 'VH-BF-001'],
    'Fonte Wall-Hung Bidet — EVOKE Milano', 'Wall-hung bidet in high-gloss vitreous china from EVOKE.',
    ARRAY[]::text[]
  ),
  (
    'EV-BL-003', 'Volta Ceiling Fixture', 'bathroom-lighting', 'ceiling-fixtures', 'verona',
    true, false, 'in-stock',
    true, true,
    'A surface-mounted architectural ceiling fixture in die-cast aluminium. IP44 rated, 24W, opal diffuser for even shadow-free illumination across the full bathroom plane.', 'The Volta Ceiling Fixture provides the architectural backbone of the Verona Collection''s lighting palette. Circular and minimal, it delivers uniform ambient illumination from a single high-efficacy LED module — no visible lamp, no hotspots.',
    ARRAY['matte-black', 'brushed-nickel'], 'Die-cast aluminium housing, opal PMMA diffuser', '24W integrated LED module, IP44 driver',
    ARRAY['IP44 splash rated', 'Opal diffuser — shadow-free output', '24W high-efficacy LED', 'CRI 90+', 'Dimmable TRIAC compatible'], '[{"key": "IP Rating", "value": "IP44"}, {"key": "Power", "value": "24W"}, {"key": "Diameter", "value": "Ø280mm"}, {"key": "Colour Temp", "value": "2700K / 3000K"}]'::jsonb, '{"height": 80, "width": 280, "depth": 280, "weight": 1.6}'::jsonb,
    16000, 21000, 'on-request', '',
    'EV-BL-003-MB', ARRAY['ceiling light', 'surface mounted', 'IP44', 'verona'], ARRAY['EV-BL-001', 'EV-BL-002'],
    'Volta Ceiling Fixture — EVOKE Verona', 'Surface-mounted architectural ceiling fixture, IP44, 24W opal diffuser from EVOKE.',
    ARRAY[]::text[]
  ),
  (
    'EV-BL-004', 'Calda Heated Lamp', 'bathroom-lighting', 'heated-lamps', 'como',
    true, false, 'in-stock',
    true, true,
    'A ceiling-mounted infrared heated lamp providing both warmth and ambient illumination. 1200W heating element, 25W ambient lamp, and a pull-cord switch.', 'The Calda Heated Lamp brings the spa experience into the domestic bathroom. Its infrared element delivers instant radiant warmth to 3–4 sqm, while the ambient lamp provides soft, even illumination — all from a single, elegant ceiling fixture.',
    ARRAY['chrome', 'brushed-nickel'], 'Polished aluminium reflector, chrome trim ring', '1200W infrared element, 25W ambient bulb, pull cord',
    ARRAY['1200W infrared heating element', '25W integrated ambient lamp', 'Instant-on radiant heat', 'Pull-cord switch or separate switch wiring', 'IP44 rated'], '[{"key": "Heating Output", "value": "1200W infrared"}, {"key": "Coverage", "value": "3–4 sqm"}, {"key": "Ambient Light", "value": "25W"}, {"key": "IP Rating", "value": "IP44"}]'::jsonb, '{"height": 160, "width": 300, "depth": 300, "weight": 2.8}'::jsonb,
    12000, 16000, 'on-request', '',
    'EV-BL-004-CHR', ARRAY['heated lamp', 'infrared', 'bathroom heating', 'como'], ARRAY['EV-BL-003', 'EV-BL-001'],
    'Calda Heated Lamp — EVOKE Como', 'Infrared heated ceiling lamp with ambient illumination, IP44, from EVOKE.',
    ARRAY[]::text[]
  ),
  (
    'EV-AC-003', 'Deco Soap Dispenser', 'accessories', 'soap-dispensers', 'milano',
    true, false, 'in-stock',
    true, true,
    'A wall-mounted soap or lotion dispenser in solid brass with a 300ml capacity. E-monogram pump head, concealed fixing plate, and a satin-smooth pump action.', 'The Deco Soap Dispenser completes the EVOKE accessory palette. Its solid brass body and E-monogrammed pump head carry the same material and dimensional discipline as the Sera Towel Rail — delivering a unified accessory language across the space.',
    ARRAY['brushed-nickel', 'matte-black'], 'Solid brass body and pump, PVD finish', 'Concealed fixing plate, 300ml ABS reservoir',
    ARRAY['300ml capacity reservoir', 'E-monogram pump head', 'Satin-smooth pump action', 'Concealed wall fixing', 'Milano Collection compatible'], '[{"key": "Capacity", "value": "300ml"}, {"key": "Pump", "value": "Metered 1ml dose"}, {"key": "Material", "value": "Solid brass PVD"}, {"key": "Fixing", "value": "Concealed wall plate"}]'::jsonb, '{"height": 185, "width": 65, "depth": 90, "weight": 0.5}'::jsonb,
    5500, 7500, 'on-request', '',
    'EV-AC-003-BN', ARRAY['soap dispenser', 'lotion dispenser', 'accessory', 'brass'], ARRAY['EV-AC-001', 'EV-AC-002'],
    'Deco Soap Dispenser — EVOKE Milano', 'Wall-mounted solid brass soap dispenser with E-monogram pump head from EVOKE.',
    ARRAY[]::text[]
  ),
  (
    'EV-AC-004', 'Asse Toilet Roll Holder', 'accessories', 'toilet-roll-holders', 'verona',
    true, false, 'in-stock',
    true, true,
    'A surface-mounted toilet roll holder in solid brass. Sprung arm with a square-profile back plate and concealed fixings. Part of the Verona accessory set.', 'The Asse Toilet Roll Holder maintains the Verona Collection''s insistence on material quality even in the most utilitarian element. Solid brass, a sprung arm that holds without rattling, and a square back plate that aligns precisely with the Sera Towel Rail.',
    ARRAY['matte-black', 'chrome'], 'Solid brass, PVD finish', 'Concealed anchor plate, stainless fixings',
    ARRAY['Solid brass construction', 'Sprung arm — holds roll securely', 'Square back plate — aligns with Sera Rail', 'Concealed fixing system', 'Verona Collection compatible'], '[{"key": "Arm Projection", "value": "130mm"}, {"key": "Back Plate", "value": "55 × 55mm square"}, {"key": "Material", "value": "Solid brass PVD"}, {"key": "Fixing", "value": "Concealed anchor plate"}]'::jsonb, '{"height": 55, "width": 155, "depth": 130, "weight": 0.45}'::jsonb,
    5000, 6800, 'on-request', '',
    'EV-AC-004-MB', ARRAY['toilet roll holder', 'paper holder', 'accessory', 'brass'], ARRAY['EV-AC-001', 'EV-AC-002'],
    'Asse Toilet Roll Holder — EVOKE Verona', 'Solid brass surface-mounted toilet roll holder with sprung arm from EVOKE.',
    ARRAY[]::text[]
  )
ON CONFLICT (id) DO NOTHING;

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
-- on conflict (id) do nothing;-- ── Seed: collections ────────────────────────────────────────
-- collections: id, name, mood, description, sort_order, active
INSERT INTO collections (id, name, mood, description, sort_order, active) VALUES
  ('milano', 'Milano', 'Sharp geometry. Polished chrome. Milanese restraint.', '', 1, true),
  ('como',   'Como',   'Fluid curves. Brushed nickel. Lakeside serenity.',     '', 2, true),
  ('verona', 'Verona', 'Classic proportion. Matte black. Timeless authority.', '', 3, true)
ON CONFLICT (id) DO NOTHING;

-- ── Seed: finishes ────────────────────────────────────────────
-- finishes: id, label, hex, description, active, sort_order
INSERT INTO finishes (id, label, hex, description, active, sort_order) VALUES
  ('chrome',         'Chrome',         '#C8C8C8', '', true, 1),
  ('brushed-nickel', 'Brushed Nickel', '#A7A39B', '', true, 2),
  ('matte-black',    'Matte Black',    '#1C1C1C', '', true, 3),
  ('brushed-gold',   'Brushed Gold',   '#C9A96E', '', true, 4),
  ('satin-black',    'Satin Black',    '#2C2C2C', '', true, 5)
ON CONFLICT (id) DO NOTHING;

-- ── Seed: 6 top-level categories ────────────────────────────────────────
-- Subcategories live ONLY in the subcategories JSONB column.
-- Never insert subcategory IDs as separate rows — FK on products.category_id
-- must reference one of these 6 IDs only.
INSERT INTO categories (id, name, descriptor, subcategories, sort_order, active)
VALUES
  ('bath-fittings', 'Bath Fittings', 'Mixers, faucets and integrated systems', '[{"id": "wall-mounted-mixers", "name": "Wall-Mounted Mixers", "descriptor": "Precision engineered for wall installation"}, {"id": "deck-mounted-mixers", "name": "Deck-Mounted Mixers", "descriptor": "Surface-mounted basin and bath mixers"}, {"id": "concealed-mixers", "name": "Concealed Mixers", "descriptor": "Recessed systems for architectural interiors"}, {"id": "sensor-faucets", "name": "Sensor Faucets", "descriptor": "Touchless precision for hospitality spaces"}]'::jsonb, 1, true),
  ('shower-systems', 'Shower Systems', 'Rain, handheld and thermostatic', '[{"id": "rain-showerheads", "name": "Rain Showerheads", "descriptor": "Overhead rainfall experience"}, {"id": "handheld-showers", "name": "Handheld Showers", "descriptor": "Flexible precision delivery"}, {"id": "thermostatic-systems", "name": "Thermostatic Systems", "descriptor": "Precision temperature control"}, {"id": "shower-columns", "name": "Shower Columns", "descriptor": "Integrated column systems"}]'::jsonb, 2, true),
  ('wash-basins', 'Wash Basins', 'Counter, wall-hung and vessel', '[{"id": "counter-top-basins", "name": "Counter-Top Basins", "descriptor": "Surface-mounted installations"}, {"id": "wall-hung-basins", "name": "Wall-Hung Basins", "descriptor": "Clean architectural suspension"}, {"id": "vessel-basins", "name": "Vessel Basins", "descriptor": "Above-counter statement pieces"}, {"id": "under-counter-basins", "name": "Under-Counter Basins", "descriptor": "Seamless vanity integration"}]'::jsonb, 3, true),
  ('luxury-vanities', 'Vanities', 'Custom cabinetry and integrated units', '[{"id": "wall-hung-vanities", "name": "Wall-Hung Vanities", "descriptor": "Floating minimalist storage"}, {"id": "freestanding-vanities", "name": "Freestanding Vanities", "descriptor": "Statement floor-standing units"}, {"id": "double-vanities", "name": "Double Vanities", "descriptor": "His and hers specifications"}, {"id": "custom-units", "name": "Custom Units", "descriptor": "Bespoke project specifications"}]'::jsonb, 4, true),
  ('mirrors', 'Mirrors', 'Framed, frameless and illuminated', '[{"id": "led-smart-mirrors", "name": "LED Smart Mirrors", "descriptor": "Integrated illumination systems"}, {"id": "frameless-mirrors", "name": "Frameless Mirrors", "descriptor": "Edge-to-edge glass clarity"}, {"id": "framed-mirrors", "name": "Framed Mirrors", "descriptor": "Defined architectural frames"}, {"id": "shaving-mirrors", "name": "Shaving Mirrors", "descriptor": "Precision magnification"}]'::jsonb, 5, true),
  ('sanitaryware-accessories', 'Sanitaryware & Accessories', 'WCs, lighting, towel rails and bathroom accessories', '[{"id": "wall-hung-wcs", "name": "Wall-Hung WCs", "descriptor": "Floating pan installations"}, {"id": "close-coupled-wcs", "name": "Close-Coupled WCs", "descriptor": "Classic integrated cisterns"}, {"id": "bidets", "name": "Bidets", "descriptor": "Italian hygiene tradition"}, {"id": "cisterns", "name": "Cisterns", "descriptor": "Concealed and exposed systems"}, {"id": "mirror-lighting", "name": "Mirror Lighting", "descriptor": "Task and vanity illumination"}, {"id": "recessed-lighting", "name": "Recessed Lighting", "descriptor": "Flush architectural integration"}, {"id": "ceiling-fixtures", "name": "Ceiling Fixtures", "descriptor": "Overhead ambient systems"}, {"id": "heated-lamps", "name": "Heated Lamps", "descriptor": "Warmth and ambience combined"}, {"id": "towel-rails", "name": "Towel Rails", "descriptor": "Heated and unheated systems"}, {"id": "soap-dispensers", "name": "Soap Dispensers", "descriptor": "Wall-mounted and deck options"}, {"id": "robe-hooks", "name": "Robe Hooks", "descriptor": "Single and double configurations"}, {"id": "toilet-roll-holders", "name": "Toilet Roll Holders", "descriptor": "Recessed and surface-mounted"}]'::jsonb, 6, true)
ON CONFLICT (id) DO UPDATE SET
  name          = EXCLUDED.name,
  descriptor    = EXCLUDED.descriptor,
  subcategories = EXCLUDED.subcategories,
  sort_order    = EXCLUDED.sort_order,
  active        = EXCLUDED.active;

-- ── Remap legacy category_id values on existing products ─────────────────
-- Run AFTER the category seed above.
UPDATE products SET category_id = 'sanitaryware-accessories'
WHERE category_id IN ('sanitaryware', 'bathroom-lighting', 'accessories');

-- Verify: should return 12 rows updated (EV-SW-*, EV-BL-*, EV-AC-*)
-- SELECT id, name, category_id FROM products
-- WHERE category_id = 'sanitaryware-accessories'
-- ORDER BY id;

-- EVOKE products seed — 30 products in 6 batches of 5
-- Run in Supabase SQL Editor. Each batch ends with ON CONFLICT (id) DO NOTHING.

-- Batch 1: VH-BF-001, VH-BF-002, VH-SS-001, VH-SS-002, VH-WB-001
INSERT INTO products (
  id, name,
  category_id, subcategory_id, collection_id,
  published, featured, stock_status,
  project_availability, retail_availability,
  description,
  full_description,
  finishes,
  material, additional_material,
  features,
  specifications,
  dimensions,
  trade_price, mrp,
  pricing_mode, pricing_note,
  sku,
  tags,
  related_products,
  meta_title, meta_description,
  images, cad_file, bim_file, tech_data_sheet, installation_manual, dimension_diagram
) VALUES
  ('VH-BF-001', 'Elara Wall-Mounted Basin Mixer',
   'bath-fittings', 'wall-mounted-mixers', 'milano',
   true, true, 'in-stock',
   true, true,
   'A study in geometric restraint, the Elara mixer brings Milanese precision to the wash basin. Crafted from solid brass with a ceramic disc cartridge.',
   'The Elara Wall-Mounted Basin Mixer represents the finest expression of the Milano Collection — form reduced to its essential geometry, function elevated to art.',
   ARRAY['chrome', 'brushed-nickel', 'matte-black'],
   'Solid brass body, ceramic disc cartridge', 'Stainless steel braided hose',
   ARRAY['Solid brass construction', 'Ceramic disc cartridge — drip-free lifetime', 'Compatible with all EVOKE Milano sanitaryware', 'Available in 5 architectural finishes', 'WRAS approved'],
   '[{"key": "Cartridge Type", "value": "Ceramic disc"}, {"key": "Water Pressure", "value": "0.5–5.0 bar"}, {"key": "Flow Rate", "value": "5 L/min at 3 bar"}, {"key": "Certification", "value": "WRAS, CE"}]'::jsonb,
   '{"height": 192, "width": 44, "depth": 176, "spoutReach": 152, "spoutHeight": 110, "weight": 1.2}'::jsonb,
   18500, 24000,
   'on-request', '',
   'VH-BF-001-CHR',
   ARRAY['basin mixer', 'wall mounted', 'milano'],
   ARRAY['VH-BF-002', 'VH-SS-001'],
   'Elara Wall-Mounted Basin Mixer — EVOKE Milano', 'Specification-grade wall-mounted basin mixer from the EVOKE Milano Collection.',
   ARRAY[]::text[], NULL, NULL, NULL, NULL, NULL),
  ('VH-BF-002', 'Palazzo Deck-Mounted Bath Mixer',
   'bath-fittings', 'deck-mounted-mixers', 'como',
   true, false, 'in-stock',
   true, true,
   'The Palazzo deck mixer channels the fluid elegance of the Como Collection. Brushed nickel finish, organic curves, enduring form.',
   'Inspired by the gentle curves of Lake Como''s shores, the Palazzo mixer softens the geometry of the contemporary bath without sacrificing specification-grade performance.',
   ARRAY['brushed-nickel', 'brushed-gold'],
   'Solid brass body, ceramic disc cartridge', '',
   ARRAY['Fluid curve geometry', 'Single-lever precision control', 'Como Collection compatible', 'Suitable for 0.5–5 bar', 'WRAS approved'],
   '[{"key": "Cartridge Type", "value": "Ceramic disc"}, {"key": "Water Pressure", "value": "0.5–5.0 bar"}]'::jsonb,
   '{"height": 220, "width": 52, "depth": 190, "spoutReach": 168, "spoutHeight": 130, "weight": 1.5}'::jsonb,
   22000, 29000,
   'on-request', '',
   'VH-BF-002-BN',
   ARRAY['bath mixer', 'deck mounted', 'como'],
   ARRAY['VH-BF-001', 'VH-WB-001'],
   'Palazzo Deck-Mounted Bath Mixer — EVOKE Como', '',
   ARRAY[]::text[], NULL, NULL, NULL, NULL, NULL),
  ('VH-SS-001', 'Cielo Rain Showerhead 300mm',
   'shower-systems', 'rain-showerheads', 'milano',
   true, true, 'in-stock',
   true, true,
   'The Cielo 300mm overhead rain showerhead delivers a wide, enveloping rainfall experience through 120 precision-laser-cut nozzles.',
   'Engineered for five-star hospitality environments and luxury residential projects, the Cielo rain showerhead pairs architectural proportion with hydrological precision.',
   ARRAY['chrome', 'matte-black', 'brushed-nickel'],
   '316L stainless steel body, silicone nozzles', '',
   ARRAY['120 laser-cut silicone nozzles', 'Anti-limescale technology', 'Compatible with EVOKE thermostatic systems', 'Easy clean nozzle wipe'],
   '[{"key": "Spray Pattern", "value": "Full rainfall"}, {"key": "Nozzles", "value": "120 silicone"}, {"key": "Flow Rate", "value": "12 L/min at 3 bar"}]'::jsonb,
   '{"height": 8, "width": 300, "depth": 300, "spoutReach": 0, "spoutHeight": 0, "weight": 0.9}'::jsonb,
   14000, 19500,
   'on-request', '',
   'VH-SS-001-CHR',
   ARRAY['rain shower', 'overhead', 'milano'],
   ARRAY['VH-BF-001', 'VH-SS-002'],
   'Cielo Rain Showerhead 300mm — EVOKE Milano', '',
   ARRAY[]::text[], NULL, NULL, NULL, NULL, NULL),
  ('VH-SS-002', 'Terma Thermostatic Shower Column',
   'shower-systems', 'shower-columns', 'verona',
   true, false, 'made-to-order',
   true, false,
   'The Terma thermostatic column integrates overhead rain, body jets, and a handheld shower within a single architectural statement piece.',
   'Specified for the most demanding hospitality and residential projects, the Terma column embodies the Verona Collection''s commitment to classical proportion.',
   ARRAY['matte-black', 'satin-black'],
   'Solid brass thermostatic body, stainless steel column', '',
   ARRAY['Integrated thermostatic cartridge', '300mm overhead rain', '4 body jets', 'Handheld shower with 1.5m hose', 'Anti-scald safety system'],
   '[{"key": "Thermostatic Range", "value": "20–50°C"}, {"key": "Water Pressure", "value": "1.0–5.0 bar"}, {"key": "Outlets", "value": "3 (overhead / jets / handheld)"}]'::jsonb,
   '{"height": 1200, "width": 120, "depth": 120, "spoutReach": 0, "spoutHeight": 0, "weight": 8.5}'::jsonb,
   85000, 110000,
   'on-request', 'Hotel projects: minimum 10 units',
   'VH-SS-002-MB',
   ARRAY['thermostatic', 'shower column', 'verona'],
   ARRAY['VH-SS-001', 'VH-BF-001'],
   'Terma Thermostatic Shower Column — EVOKE Verona', '',
   ARRAY[]::text[], NULL, NULL, NULL, NULL, NULL),
  ('VH-WB-001', 'Lago Vessel Basin',
   'wash-basins', 'vessel-basins', 'como',
   true, true, 'in-stock',
   true, true,
   'The Lago vessel basin sits above the vanity surface like a singular sculptural object. Hand-finished ceramic in a soft matte white glaze.',
   'Drawn from the organic forms of Italian ceramic tradition, the Lago basin is produced in a single casting from vitreous ceramic, then hand-finished to a level of surface quality reserved for gallery objects.',
   ARRAY['matte-black'],
   'Vitreous ceramic, hand-finished matte white glaze', '',
   ARRAY['Single-cast vitreous ceramic', 'Hand-finished surface', 'Overflow integrated', 'Compatible with all EVOKE wall-mounted mixers'],
   '[{"key": "Material", "value": "Vitreous ceramic"}, {"key": "Glaze", "value": "Matte white, hand-finished"}, {"key": "Overflow", "value": "Integrated"}]'::jsonb,
   '{"height": 148, "width": 450, "depth": 350, "spoutReach": 0, "spoutHeight": 0, "weight": 9.2}'::jsonb,
   32000, 42000,
   'on-request', '',
   'VH-WB-001-MW',
   ARRAY['vessel basin', 'ceramic', 'como'],
   ARRAY['VH-BF-002', 'VH-LV-001'],
   'Lago Vessel Basin — EVOKE Como', '',
   ARRAY[]::text[], NULL, NULL, NULL, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- Batch 2: VH-LV-001, EV-MR-001, EV-MR-002, EV-SW-001, EV-SW-002
INSERT INTO products (
  id, name,
  category_id, subcategory_id, collection_id,
  published, featured, stock_status,
  project_availability, retail_availability,
  description,
  full_description,
  finishes,
  material, additional_material,
  features,
  specifications,
  dimensions,
  trade_price, mrp,
  pricing_mode, pricing_note,
  sku,
  tags,
  related_products,
  meta_title, meta_description,
  images, cad_file, bim_file, tech_data_sheet, installation_manual, dimension_diagram
) VALUES
  ('VH-LV-001', 'Stanza Wall-Hung Vanity 1200mm',
   'luxury-vanities', 'wall-hung-vanities', 'verona',
   true, false, 'made-to-order',
   true, true,
   'The Stanza vanity unit in American oak veneer with a floating wall-hung profile. Softclose drawers, integrated basin cut-out, matte black hardware.',
   'The Stanza 1200mm vanity represents EVOKE''s specification furniture range — architectural joinery at bathroom scale, built to the same tolerances demanded of structural elements.',
   ARRAY['matte-black', 'brushed-nickel'],
   'American oak veneer over MDF carcass, solid oak drawer fronts', 'Matte black powder-coated hardware',
   ARRAY['Wall-hung floating installation', 'Softclose undermount drawers', 'Integrated basin cut-out (500mm)', 'Matte black hardware throughout', 'FSC-certified oak veneer'],
   '[{"key": "Carcass", "value": "MDF, moisture-resistant"}, {"key": "Doors/Drawers", "value": "Solid oak veneer, softclose"}, {"key": "Hardware", "value": "Matte black powder coat"}]'::jsonb,
   '{"height": 520, "width": 1200, "depth": 480, "spoutReach": 0, "spoutHeight": 0, "weight": 42}'::jsonb,
   95000, 130000,
   'on-request', 'Lead time: 8 weeks',
   'VH-LV-001-OAK',
   ARRAY['vanity', 'wall-hung', 'oak', 'verona'],
   ARRAY['VH-WB-001', 'VH-BF-002'],
   'Stanza Wall-Hung Vanity 1200mm — EVOKE Verona', '',
   ARRAY[]::text[], NULL, NULL, NULL, NULL, NULL),
  ('EV-MR-001', 'Lumina LED Smart Mirror',
   'mirrors', 'led-smart-mirrors', 'milano',
   true, true, 'in-stock',
   true, true,
   'Integrated LED illumination with touch dimming. Anti-fog coating, backlit perimeter glow and warm/cool light temperature control.',
   'The Lumina Smart Mirror redefines bathroom illumination with precision-engineered LED technology. A perimeter backlight casts an even, flattering glow while the anti-fog system ensures clarity in all conditions.',
   ARRAY['brushed-nickel', 'matte-black'],
   'Float glass, aluminium frame, LED strip', 'IP44 rated driver, touch sensor panel',
   ARRAY['Anti-fog coating', 'Touch dimmer control', 'Warm/cool light temperature 2700–6500K', 'IP44 splash-rated', 'Milano Collection compatible'],
   '[{"key": "Glass", "value": "5mm float glass"}, {"key": "LED Life", "value": "50,000 hrs"}, {"key": "IP Rating", "value": "IP44"}, {"key": "Light Temp", "value": "2700–6500K"}]'::jsonb,
   '{"height": 800, "width": 600, "depth": 40, "weight": 8.5}'::jsonb,
   28000, 36000,
   'on-request', '',
   'EV-MR-001-BN',
   ARRAY['smart mirror', 'LED mirror', 'illuminated', 'anti-fog'],
   ARRAY['EV-MR-002', 'VH-LV-001'],
   'Lumina LED Smart Mirror — EVOKE Milano', 'Integrated LED smart mirror with anti-fog and touch dimming from EVOKE.',
   ARRAY[]::text[], NULL, NULL, NULL, NULL, NULL),
  ('EV-MR-002', 'Arco Frameless Mirror',
   'mirrors', 'frameless-mirrors', 'como',
   true, false, 'in-stock',
   true, true,
   'A pure expression of architectural restraint. Polished edge frameless glass with a concealed wall bracket system.',
   'The Arco Frameless Mirror achieves visual weightlessness through concealed bracket fixings and polished edge glass. Available in standard and bespoke sizing.',
   ARRAY['chrome', 'brushed-nickel'],
   '6mm low-iron glass, polished edge', 'Concealed stainless bracket system',
   ARRAY['Polished bevelled edge', 'Concealed bracket fixing', 'Available in custom sizes', 'Como Collection compatible'],
   '[{"key": "Glass", "value": "6mm low-iron"}, {"key": "Edge", "value": "Polished bevel 10mm"}, {"key": "Fixing", "value": "Concealed bracket"}]'::jsonb,
   '{"height": 900, "width": 700, "depth": 25, "weight": 12}'::jsonb,
   18000, 24000,
   'on-request', '',
   'EV-MR-002-PE',
   ARRAY['frameless mirror', 'architectural', 'como'],
   ARRAY['EV-MR-001', 'VH-WB-001'],
   'Arco Frameless Mirror — EVOKE Como', 'Polished-edge frameless mirror with concealed fixings from EVOKE.',
   ARRAY[]::text[], NULL, NULL, NULL, NULL, NULL),
  ('EV-SW-001', 'Forma Wall-Hung WC',
   'sanitaryware', 'wall-hung-wcs', 'verona',
   true, true, 'in-stock',
   true, true,
   'A sculptural wall-hung WC with a softly tapered form. Rimless wash technology, dual flush, and a whisper-close seat.',
   'The Forma WC pairs refined geometry with engineering precision. The rimless bowl ensures effortless hygiene while the whisper-close seat and dual-flush mechanism deliver quiet, efficient performance.',
   ARRAY['matte-white', 'matte-black'],
   'Vitreous china, high-gloss glaze', 'Soft-close PP seat, stainless fixings',
   ARRAY['Rimless flush technology', 'Dual flush 3/6L', 'Whisper-close soft seat', 'Wall-hung — floor clearance for easy cleaning', 'Verona Collection compatible'],
   '[{"key": "Flush", "value": "Dual 3/6L"}, {"key": "Material", "value": "Vitreous china"}, {"key": "Seat", "value": "Soft-close PP"}, {"key": "Fixing Height", "value": "400–430mm AFF"}]'::jsonb,
   '{"height": 350, "width": 360, "depth": 520, "weight": 22}'::jsonb,
   32000, 42000,
   'on-request', '',
   'EV-SW-001-MW',
   ARRAY['wall hung WC', 'rimless', 'sanitaryware', 'verona'],
   ARRAY['EV-SW-002', 'EV-AC-001'],
   'Forma Wall-Hung WC — EVOKE Verona', 'Rimless wall-hung WC with dual flush and whisper-close seat from EVOKE.',
   ARRAY[]::text[], NULL, NULL, NULL, NULL, NULL),
  ('EV-SW-002', 'Alto Concealed Cistern',
   'sanitaryware', 'cisterns', 'verona',
   true, false, 'in-stock',
   true, true,
   'In-wall concealed cistern frame for wall-hung WC installations. Adjustable height, pneumatic flush, and full-access service panel.',
   'The Alto Concealed Cistern provides the structural and hydraulic infrastructure for floating WC installations. Engineered for silent operation and long-term accessibility.',
   ARRAY['chrome', 'brushed-nickel', 'matte-black'],
   'Galvanised steel frame, ABS cistern', 'Dual pneumatic flush valve, service panel',
   ARRAY['Height adjustable 820–1050mm', 'Silent fill valve', 'Dual flush pneumatic actuation', 'Full front-access service panel', 'Compatible with EV-SW-001'],
   '[{"key": "Frame Height", "value": "820–1050mm adj."}, {"key": "Cistern Capacity", "value": "9L"}, {"key": "Flush", "value": "Pneumatic dual 3/6L"}, {"key": "Wall Thickness", "value": "100mm min."}]'::jsonb,
   '{"height": 1000, "width": 500, "depth": 115, "weight": 18}'::jsonb,
   22000, 29000,
   'on-request', '',
   'EV-SW-002-CHR',
   ARRAY['concealed cistern', 'in-wall frame', 'sanitaryware'],
   ARRAY['EV-SW-001'],
   'Alto Concealed Cistern — EVOKE', 'In-wall concealed cistern frame with pneumatic flush for wall-hung WC installations.',
   ARRAY[]::text[], NULL, NULL, NULL, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- Batch 3: EV-BL-001, EV-BL-002, EV-AC-001, EV-AC-002, VH-BF-003
INSERT INTO products (
  id, name,
  category_id, subcategory_id, collection_id,
  published, featured, stock_status,
  project_availability, retail_availability,
  description,
  full_description,
  finishes,
  material, additional_material,
  features,
  specifications,
  dimensions,
  trade_price, mrp,
  pricing_mode, pricing_note,
  sku,
  tags,
  related_products,
  meta_title, meta_description,
  images, cad_file, bim_file, tech_data_sheet, installation_manual, dimension_diagram
) VALUES
  ('EV-BL-001', 'Lume Mirror Light Bar',
   'bathroom-lighting', 'mirror-lighting', 'milano',
   true, true, 'in-stock',
   true, true,
   'A slender architectural LED bar for mirror-side task lighting. High-CRI output, dimmable, and IP44 rated for wet zone installation.',
   'The Lume Light Bar delivers high-quality task illumination at the vanity position. Its slim profile and brushed metal housing integrate seamlessly above or beside any EVOKE mirror.',
   ARRAY['brushed-nickel', 'matte-black'],
   'Extruded aluminium housing, opal diffuser', 'High-CRI LED module, IP44 driver',
   ARRAY['CRI 95+ for true colour rendering', 'IP44 splash rated', 'Dimmable 1–100%', 'Flicker-free output', 'Milano Collection compatible'],
   '[{"key": "CRI", "value": "95+"}, {"key": "IP Rating", "value": "IP44"}, {"key": "Power", "value": "18W"}, {"key": "Colour Temp", "value": "2700K / 4000K"}]'::jsonb,
   '{"height": 50, "width": 600, "depth": 80, "weight": 1.8}'::jsonb,
   14000, 18500,
   'on-request', '',
   'EV-BL-001-BN',
   ARRAY['mirror light', 'LED bar', 'task lighting', 'bathroom'],
   ARRAY['EV-BL-002', 'EV-MR-001'],
   'Lume Mirror Light Bar — EVOKE Milano', 'High-CRI LED mirror light bar, IP44 rated, dimmable. From EVOKE.',
   ARRAY[]::text[], NULL, NULL, NULL, NULL, NULL),
  ('EV-BL-002', 'Aureo Recessed Ceiling Light',
   'bathroom-lighting', 'recessed-lighting', 'como',
   true, false, 'in-stock',
   true, true,
   'A flush architectural downlight engineered for wet zone ceilings. Anti-glare optic, wide beam distribution, and IP65 rated.',
   'The Aureo Recessed Light disappears into the ceiling plane while delivering refined ambient illumination. The anti-glare diffuser and wide 60° beam create an even, shadow-free wash.',
   ARRAY['brushed-nickel', 'matte-white'],
   'Die-cast aluminium, anti-glare PC optic', 'IP65 LED module, dimmable driver',
   ARRAY['IP65 fully sealed', 'Anti-glare trim optic', '60° wide beam', 'Dimmable DALI compatible', 'Como Collection compatible'],
   '[{"key": "IP Rating", "value": "IP65"}, {"key": "Power", "value": "12W"}, {"key": "Beam Angle", "value": "60°"}, {"key": "Cut-out", "value": "Ø90mm"}]'::jsonb,
   '{"height": 65, "width": 110, "depth": 110, "weight": 0.9}'::jsonb,
   9500, 13000,
   'on-request', '',
   'EV-BL-002-BN',
   ARRAY['recessed light', 'downlight', 'ceiling', 'IP65'],
   ARRAY['EV-BL-001'],
   'Aureo Recessed Ceiling Light — EVOKE Como', 'IP65 anti-glare recessed downlight for wet zone ceilings from EVOKE.',
   ARRAY[]::text[], NULL, NULL, NULL, NULL, NULL),
  ('EV-AC-001', 'Sera Towel Rail',
   'accessories', 'towel-rails', 'verona',
   true, true, 'in-stock',
   true, true,
   'A wall-mounted double towel rail in solid brass. Clean horizontal geometry with concealed fixings and a fine E-monogrammed end cap.',
   'The Sera Towel Rail pairs architectural restraint with enduring material quality. Solid brass construction and concealed wall fixings create a seamless profile that anchors the accessory palette.',
   ARRAY['brushed-nickel', 'chrome', 'matte-black'],
   'Solid brass, PVD finish', 'Concealed wall fixings, E-monogram end caps',
   ARRAY['Solid brass construction', 'PVD finish — tarnish resistant', 'Concealed fixing system', 'E-monogram end caps', 'Verona Collection compatible'],
   '[{"key": "Bar Diameter", "value": "Ø22mm"}, {"key": "Projection", "value": "110mm"}, {"key": "Finish", "value": "PVD Brushed Nickel"}, {"key": "Fixing", "value": "Concealed wall plate"}]'::jsonb,
   '{"height": 22, "width": 600, "depth": 110, "weight": 1.2}'::jsonb,
   8500, 11500,
   'on-request', '',
   'EV-AC-001-BN',
   ARRAY['towel rail', 'towel bar', 'accessory', 'brass'],
   ARRAY['EV-AC-002', 'EV-SW-001'],
   'Sera Towel Rail — EVOKE Verona', 'Solid brass double towel rail with concealed fixings and E-monogram end caps from EVOKE.',
   ARRAY[]::text[], NULL, NULL, NULL, NULL, NULL),
  ('EV-AC-002', 'Nera Robe Hook Set',
   'accessories', 'robe-hooks', 'verona',
   true, false, 'in-stock',
   true, true,
   'A set of two double robe hooks in solid brass with a fine E-monogram impression at the base. Concealed fixing system.',
   'The Nera Robe Hook Set maintains the same architectural discipline as the Sera Towel Rail. Supplied as a pair, each hook carries a discreet E-monogram impression — the defining detail of the EVOKE accessory range.',
   ARRAY['brushed-nickel', 'chrome', 'matte-black'],
   'Solid brass, PVD finish', 'Concealed anchor plate, stainless fixings',
   ARRAY['Double hook per unit', 'Set of two', 'E-monogram base impression', 'Concealed wall plate fixing', 'Verona Collection compatible'],
   '[{"key": "Hook Projection", "value": "65mm"}, {"key": "Base Width", "value": "55mm"}, {"key": "Load Rating", "value": "5kg per hook"}, {"key": "Supplied", "value": "Pair"}]'::jsonb,
   '{"height": 65, "width": 55, "depth": 65, "weight": 0.4}'::jsonb,
   6000, 8000,
   'on-request', '',
   'EV-AC-002-BN',
   ARRAY['robe hook', 'hook', 'accessory', 'brass'],
   ARRAY['EV-AC-001'],
   'Nera Robe Hook Set — EVOKE Verona', 'Solid brass double robe hook set with E-monogram impression from EVOKE.',
   ARRAY[]::text[], NULL, NULL, NULL, NULL, NULL),
  ('VH-BF-003', 'Vela Concealed Basin Mixer',
   'bath-fittings', 'concealed-mixers', 'verona',
   true, false, 'made-to-order',
   true, true,
   'A fully concealed wall-mounted basin mixer from the Verona Collection. Recessed body with a minimal exposed trim plate and single-lever control in matte black.',
   'The Vela Concealed Basin Mixer represents the ultimate expression of architectural restraint — the fitting disappears into the wall, leaving only a flush trim plate and lever as evidence of the infrastructure behind.',
   ARRAY['matte-black', 'satin-black'],
   'Solid brass body, ceramic disc cartridge', 'Flush trim plate, concealed rough-in valve',
   ARRAY['Fully concealed installation', 'Ceramic disc cartridge', 'Compatible with standard 150mm wall rough-in', 'Verona Collection compatible', 'WRAS approved'],
   '[{"key": "Cartridge", "value": "Ceramic disc"}, {"key": "Rough-In", "value": "150mm standard"}, {"key": "Water Pressure", "value": "1.0–5.0 bar"}, {"key": "Finish", "value": "PVD Matte Black"}]'::jsonb,
   '{"height": 40, "width": 180, "depth": 12, "spoutReach": 0, "spoutHeight": 0, "weight": 1.8}'::jsonb,
   26000, 34000,
   'on-request', 'Includes rough-in valve',
   'VH-BF-003-MB',
   ARRAY['concealed mixer', 'basin mixer', 'recessed', 'verona'],
   ARRAY['VH-BF-001', 'VH-WB-001'],
   'Vela Concealed Basin Mixer — EVOKE Verona', 'Fully concealed wall-mounted basin mixer with PVD matte black finish from EVOKE.',
   ARRAY[]::text[], NULL, NULL, NULL, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- Batch 4: VH-BF-004, VH-SS-003, VH-SS-004, VH-WB-002, VH-WB-003
INSERT INTO products (
  id, name,
  category_id, subcategory_id, collection_id,
  published, featured, stock_status,
  project_availability, retail_availability,
  description,
  full_description,
  finishes,
  material, additional_material,
  features,
  specifications,
  dimensions,
  trade_price, mrp,
  pricing_mode, pricing_note,
  sku,
  tags,
  related_products,
  meta_title, meta_description,
  images, cad_file, bim_file, tech_data_sheet, installation_manual, dimension_diagram
) VALUES
  ('VH-BF-004', 'Sento Sensor Faucet',
   'bath-fittings', 'sensor-faucets', 'milano',
   true, false, 'in-stock',
   true, false,
   'Touchless infrared sensor faucet engineered for hospitality and commercial washrooms. Precision flow control, automatic shut-off, and a clean geometric profile.',
   'The Sento Sensor Faucet combines the Milano Collection''s geometric discipline with touchless infrared technology. Designed for high-traffic hospitality environments where hygiene and water efficiency are equally paramount.',
   ARRAY['chrome', 'brushed-nickel'],
   'Solid brass body, infrared sensor module', 'Integrated solenoid valve, battery or mains powered',
   ARRAY['Infrared touchless activation', 'Adjustable flow rate 4–6 L/min', 'Battery (6 × AA) or AC adapter', 'Anti-legionella thermal flush programmable', 'Milano Collection compatible'],
   '[{"key": "Sensor Range", "value": "100–200mm"}, {"key": "Flow Rate", "value": "4–6 L/min"}, {"key": "Power", "value": "6×AA / 6V AC"}, {"key": "IP Rating", "value": "IP67 sensor"}]'::jsonb,
   '{"height": 165, "width": 38, "depth": 155, "spoutReach": 130, "spoutHeight": 95, "weight": 1.4}'::jsonb,
   32000, 42000,
   'on-request', 'Minimum 4 units for hospitality projects',
   'VH-BF-004-CHR',
   ARRAY['sensor faucet', 'touchless', 'hospitality', 'milano'],
   ARRAY['VH-BF-001', 'VH-SS-001'],
   'Sento Sensor Faucet — EVOKE Milano', 'Touchless infrared sensor faucet for hospitality environments from EVOKE.',
   ARRAY[]::text[], NULL, NULL, NULL, NULL, NULL),
  ('VH-SS-003', 'Bruma Handheld Shower 120mm',
   'shower-systems', 'handheld-showers', 'como',
   true, false, 'in-stock',
   true, true,
   'A 120mm handheld shower handset with a soft mist spray and silicone anti-limescale nozzles. Includes 1.75m stainless braided hose and wall bracket.',
   'The Bruma Handheld Shower brings the Como Collection''s fluid sensibility to the handset format. Its oval profile and brushed nickel finish pair naturally with the Palazzo deck mixer and Lago vessel basin.',
   ARRAY['brushed-nickel', 'brushed-gold'],
   'ABS body, silicone nozzles, stainless steel hose', 'Wall bracket, 1.75m braided hose',
   ARRAY['3-function spray modes', 'Anti-limescale silicone nozzles', '1.75m braided stainless hose included', 'Como Collection compatible', 'WRAS approved'],
   '[{"key": "Head Diameter", "value": "120mm"}, {"key": "Spray Modes", "value": "3 (rain / massage / mist)"}, {"key": "Flow Rate", "value": "8 L/min at 3 bar"}, {"key": "Hose Length", "value": "1.75m"}]'::jsonb,
   '{"height": 240, "width": 120, "depth": 55, "spoutReach": 0, "spoutHeight": 0, "weight": 0.6}'::jsonb,
   9500, 13000,
   'on-request', '',
   'VH-SS-003-BN',
   ARRAY['handheld shower', 'shower handset', 'como'],
   ARRAY['VH-SS-001', 'VH-BF-002'],
   'Bruma Handheld Shower 120mm — EVOKE Como', '3-function handheld shower handset with anti-limescale nozzles from EVOKE.',
   ARRAY[]::text[], NULL, NULL, NULL, NULL, NULL),
  ('VH-SS-004', 'Cascata Thermostatic Shower System',
   'shower-systems', 'thermostatic-systems', 'milano',
   true, true, 'in-stock',
   true, true,
   'A wall-mounted two-outlet thermostatic shower system with a 250mm overhead rain plate and handheld outlet. Precise temperature memory and anti-scald lock.',
   'The Cascata Thermostatic System delivers the reliability demanded by five-star hospitality alongside the aesthetic precision of the Milano Collection. Temperature is set once and held — every shower begins at the same perfect degree.',
   ARRAY['chrome', 'matte-black'],
   'Solid brass thermostatic valve, stainless trim', '250mm rain plate, handheld handset, 1.5m hose',
   ARRAY['Temperature memory cartridge', 'Anti-scald lock at 38°C', 'Two independent volume controls', '250mm overhead rain plate', 'Handheld shower included'],
   '[{"key": "Thermostatic Range", "value": "20–48°C"}, {"key": "Water Pressure", "value": "1.0–5.0 bar"}, {"key": "Outlets", "value": "2 (overhead / handheld)"}, {"key": "Certification", "value": "WRAS, CE"}]'::jsonb,
   '{"height": 200, "width": 380, "depth": 90, "spoutReach": 0, "spoutHeight": 0, "weight": 4.2}'::jsonb,
   48000, 62000,
   'on-request', '',
   'VH-SS-004-CHR',
   ARRAY['thermostatic shower', 'shower system', 'milano'],
   ARRAY['VH-SS-001', 'VH-SS-002'],
   'Cascata Thermostatic Shower System — EVOKE Milano', 'Two-outlet wall-mounted thermostatic shower system with rain plate from EVOKE.',
   ARRAY[]::text[], NULL, NULL, NULL, NULL, NULL),
  ('VH-WB-002', 'Pietra Counter-Top Basin',
   'wash-basins', 'counter-top-basins', 'verona',
   true, false, 'in-stock',
   true, true,
   'A counter-top basin in cast mineral composite with a matte stone texture. Rectangular form with gently radiused corners and a low-profile overflow slot.',
   'The Pietra Counter-Top Basin draws from the Verona Collection''s reverence for classical materials. Its mineral composite surface replicates the tactile warmth of honed stone while providing the durability required for luxury residential and hospitality use.',
   ARRAY['matte-black'],
   'Cast mineral composite, matte stone texture', 'Waste and overflow fitting included',
   ARRAY['Cast mineral composite — chip and stain resistant', 'Integrated low-profile overflow', 'Pre-drilled single tap hole', 'Compatible with all EVOKE deck-mounted mixers', 'Verona Collection compatible'],
   '[{"key": "Material", "value": "Mineral composite"}, {"key": "Surface", "value": "Matte stone texture"}, {"key": "Overflow", "value": "Integrated slot"}, {"key": "Tap Hole", "value": "Single Ø35mm"}]'::jsonb,
   '{"height": 120, "width": 520, "depth": 380, "spoutReach": 0, "spoutHeight": 0, "weight": 11.5}'::jsonb,
   28000, 36000,
   'on-request', '',
   'VH-WB-002-MS',
   ARRAY['counter top basin', 'stone basin', 'mineral composite', 'verona'],
   ARRAY['VH-WB-001', 'VH-BF-002'],
   'Pietra Counter-Top Basin — EVOKE Verona', 'Cast mineral composite counter-top basin with matte stone texture from EVOKE.',
   ARRAY[]::text[], NULL, NULL, NULL, NULL, NULL),
  ('VH-WB-003', 'Sospeso Wall-Hung Basin',
   'wash-basins', 'wall-hung-basins', 'milano',
   true, false, 'in-stock',
   true, true,
   'A cantilevered wall-hung basin in high-gloss vitreous china. Slim 145mm depth profile, concealed wall brackets, and a single tap hole centred at the rear.',
   'The Sospeso Wall-Hung Basin creates the illusion of floating at the wall plane — its slim depth and concealed bracket system allow the floor to read as uninterrupted. Specified across premium residential and boutique hospitality projects.',
   ARRAY['chrome'],
   'Vitreous china, high-gloss white glaze', 'Concealed wall bracket set, click-clack waste',
   ARRAY['145mm slim-depth wall projection', 'Concealed stainless bracket system', 'Integrated overflow', 'Single rear tap hole Ø35mm', 'Milano Collection compatible'],
   '[{"key": "Material", "value": "Vitreous china"}, {"key": "Glaze", "value": "High-gloss white"}, {"key": "Projection", "value": "145mm from wall"}, {"key": "Overflow", "value": "Integrated"}]'::jsonb,
   '{"height": 145, "width": 560, "depth": 370, "spoutReach": 0, "spoutHeight": 0, "weight": 13}'::jsonb,
   22000, 29000,
   'on-request', '',
   'VH-WB-003-W',
   ARRAY['wall hung basin', 'floating basin', 'vitreous china', 'milano'],
   ARRAY['VH-WB-001', 'VH-BF-001'],
   'Sospeso Wall-Hung Basin — EVOKE Milano', 'Slim 145mm wall-hung basin in high-gloss vitreous china from EVOKE.',
   ARRAY[]::text[], NULL, NULL, NULL, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- Batch 5: VH-LV-002, VH-LV-003, EV-MR-003, EV-MR-004, EV-SW-003
INSERT INTO products (
  id, name,
  category_id, subcategory_id, collection_id,
  published, featured, stock_status,
  project_availability, retail_availability,
  description,
  full_description,
  finishes,
  material, additional_material,
  features,
  specifications,
  dimensions,
  trade_price, mrp,
  pricing_mode, pricing_note,
  sku,
  tags,
  related_products,
  meta_title, meta_description,
  images, cad_file, bim_file, tech_data_sheet, installation_manual, dimension_diagram
) VALUES
  ('VH-LV-002', 'Torre Freestanding Vanity 900mm',
   'luxury-vanities', 'freestanding-vanities', 'como',
   true, false, 'made-to-order',
   true, true,
   'A 900mm freestanding floor vanity in natural oak veneer with an integrated storage column. Soft-close doors, push-to-open drawers, and brushed nickel legs.',
   'The Torre brings the Como Collection''s warmth and organic material language to the freestanding format. Its integrated column provides generous towel and amenity storage without the visual weight of a full-height unit.',
   ARRAY['brushed-nickel'],
   'Natural oak veneer over moisture-resistant MDF', 'Brushed nickel adjustable legs, push-to-open hardware',
   ARRAY['Integrated storage column', 'Push-to-open softclose drawers', 'Adjustable brushed nickel legs ±20mm', 'FSC-certified oak veneer', 'Como Collection compatible'],
   '[{"key": "Carcass", "value": "MR-MDF, moisture-resistant"}, {"key": "Veneer", "value": "Natural oak, UV-lacquered"}, {"key": "Hardware", "value": "Brushed nickel"}, {"key": "Lead Time", "value": "8 weeks"}]'::jsonb,
   '{"height": 860, "width": 900, "depth": 460, "spoutReach": 0, "spoutHeight": 0, "weight": 52}'::jsonb,
   88000, 115000,
   'on-request', 'Lead time: 8 weeks',
   'VH-LV-002-OAK',
   ARRAY['freestanding vanity', 'oak vanity', 'storage column', 'como'],
   ARRAY['VH-LV-001', 'VH-WB-001'],
   'Torre Freestanding Vanity 900mm — EVOKE Como', '900mm freestanding oak vanity with integrated storage column from EVOKE.',
   ARRAY[]::text[], NULL, NULL, NULL, NULL, NULL),
  ('VH-LV-003', 'Doppio Double Vanity 1500mm',
   'luxury-vanities', 'double-vanities', 'milano',
   true, true, 'made-to-order',
   true, true,
   'A 1500mm wall-hung double vanity for his-and-hers specification. Smoked oak veneer, twin soft-close drawer sets, and integrated basin cut-outs for two Ø450mm vessels.',
   'The Doppio Double Vanity defines the master bathroom specification. At 1500mm, it provides generous personal storage for two while maintaining the floating, weightless aesthetic that defines the Milano Collection''s approach to cabinetry.',
   ARRAY['matte-black', 'brushed-nickel'],
   'Smoked oak veneer over moisture-resistant MDF', 'Matte black or brushed nickel hardware',
   ARRAY['Twin soft-close undermount drawer sets', 'Dual integrated basin cut-outs 450mm', 'Wall-hung floating installation', 'Anti-humidity sealed interior', 'Milano Collection compatible'],
   '[{"key": "Carcass", "value": "MR-MDF moisture-resistant"}, {"key": "Veneer", "value": "Smoked oak, UV-lacquered"}, {"key": "Basin Cut-outs", "value": "2 × Ø450mm"}, {"key": "Lead Time", "value": "10 weeks"}]'::jsonb,
   '{"height": 520, "width": 1500, "depth": 480, "spoutReach": 0, "spoutHeight": 0, "weight": 68}'::jsonb,
   145000, 190000,
   'on-request', 'Lead time: 10 weeks',
   'VH-LV-003-MB',
   ARRAY['double vanity', 'his and hers', 'smoked oak', 'milano'],
   ARRAY['VH-LV-001', 'VH-WB-001'],
   'Doppio Double Vanity 1500mm — EVOKE Milano', '1500mm wall-hung double vanity in smoked oak for his-and-hers specification from EVOKE.',
   ARRAY[]::text[], NULL, NULL, NULL, NULL, NULL),
  ('EV-MR-003', 'Specchio Framed Mirror',
   'mirrors', 'framed-mirrors', 'verona',
   true, false, 'in-stock',
   true, true,
   'A slim architectural frame mirror in matte black or brushed nickel. 12mm square-profile frame, concealed wall fixings, and available in four standard sizes.',
   'The Specchio Framed Mirror asserts presence without excess. Its 12mm square-profile frame defines the mirror''s boundary with the same precision that the Verona Collection brings to every element of the bathroom composition.',
   ARRAY['matte-black', 'brushed-nickel'],
   '5mm float glass, powder-coated aluminium frame', 'Concealed wall bracket system',
   ARRAY['12mm square-profile frame', '5mm float glass', 'Concealed bracket fixing', 'Four standard sizes', 'Verona Collection compatible'],
   '[{"key": "Frame Profile", "value": "12mm square aluminium"}, {"key": "Glass", "value": "5mm float"}, {"key": "Fixing", "value": "Concealed bracket"}, {"key": "Sizes", "value": "600 / 750 / 900 / 1000mm"}]'::jsonb,
   '{"height": 900, "width": 750, "depth": 30, "weight": 9}'::jsonb,
   16000, 21000,
   'on-request', '',
   'EV-MR-003-MB',
   ARRAY['framed mirror', 'architectural', 'slim frame', 'verona'],
   ARRAY['EV-MR-001', 'EV-MR-002'],
   'Specchio Framed Mirror — EVOKE Verona', 'Slim 12mm square-profile framed mirror in matte black or brushed nickel from EVOKE.',
   ARRAY[]::text[], NULL, NULL, NULL, NULL, NULL),
  ('EV-MR-004', 'Lente Shaving Mirror',
   'mirrors', 'shaving-mirrors', 'como',
   true, false, 'in-stock',
   true, true,
   'A wall-mounted magnifying shaving mirror on an articulated arm. 5× magnification, 200mm disc, integrated LED surround, and a 300mm reach articulation.',
   'The Lente Shaving Mirror elevates the daily grooming ritual with 5× magnification and a high-CRI LED surround that eliminates shadow. Its articulated arm extends 300mm from the wall and locks at any angle.',
   ARRAY['brushed-nickel', 'chrome'],
   'Brass articulated arm, 5× magnification glass', 'LED surround module, IP44 driver',
   ARRAY['5× magnification', '200mm diameter disc', 'Integrated CRI 95+ LED surround', '300mm articulated arm reach', 'IP44 splash rated'],
   '[{"key": "Magnification", "value": "5×"}, {"key": "Disc Diameter", "value": "200mm"}, {"key": "Arm Reach", "value": "300mm"}, {"key": "IP Rating", "value": "IP44"}]'::jsonb,
   '{"height": 200, "width": 200, "depth": 320, "weight": 1.4}'::jsonb,
   18500, 24000,
   'on-request', '',
   'EV-MR-004-BN',
   ARRAY['shaving mirror', 'magnifying mirror', 'LED mirror', 'como'],
   ARRAY['EV-MR-001', 'VH-LV-001'],
   'Lente Shaving Mirror — EVOKE Como', '5× magnification shaving mirror with LED surround and articulated arm from EVOKE.',
   ARRAY[]::text[], NULL, NULL, NULL, NULL, NULL),
  ('EV-SW-003', 'Puro Close-Coupled WC',
   'sanitaryware', 'close-coupled-wcs', 'como',
   true, false, 'in-stock',
   true, true,
   'A close-coupled WC with an integrated cistern in high-gloss vitreous china. Rimless bowl, dual-flush push button, and a soft-close quick-release seat.',
   'The Puro Close-Coupled WC achieves the impossible balance — a classic integrated form that feels entirely contemporary. Its flush curves and brilliant white glaze make it the natural centrepiece of Como Collection bathrooms.',
   ARRAY['chrome'],
   'Vitreous china, high-gloss white', 'Soft-close quick-release seat, chrome push-button',
   ARRAY['Rimless flush bowl', 'Dual flush 3/6L push button', 'Soft-close quick-release seat', 'S-trap or P-trap conversion kit included', 'Como Collection compatible'],
   '[{"key": "Flush", "value": "Dual 3/6L push button"}, {"key": "Material", "value": "Vitreous china"}, {"key": "Trap", "value": "S-trap / P-trap (kit included)"}, {"key": "Seat", "value": "Soft-close QR"}]'::jsonb,
   '{"height": 780, "width": 360, "depth": 680, "weight": 30}'::jsonb,
   24000, 31000,
   'on-request', '',
   'EV-SW-003-W',
   ARRAY['close coupled WC', 'toilet', 'rimless', 'como'],
   ARRAY['EV-SW-001', 'EV-SW-002'],
   'Puro Close-Coupled WC — EVOKE Como', 'Rimless close-coupled WC with soft-close seat from EVOKE.',
   ARRAY[]::text[], NULL, NULL, NULL, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- Batch 6: EV-SW-004, EV-BL-003, EV-BL-004, EV-AC-003, EV-AC-004
INSERT INTO products (
  id, name,
  category_id, subcategory_id, collection_id,
  published, featured, stock_status,
  project_availability, retail_availability,
  description,
  full_description,
  finishes,
  material, additional_material,
  features,
  specifications,
  dimensions,
  trade_price, mrp,
  pricing_mode, pricing_note,
  sku,
  tags,
  related_products,
  meta_title, meta_description,
  images, cad_file, bim_file, tech_data_sheet, installation_manual, dimension_diagram
) VALUES
  ('EV-SW-004', 'Fonte Wall-Hung Bidet',
   'sanitaryware', 'bidets', 'milano',
   true, false, 'in-stock',
   true, true,
   'A wall-hung bidet in high-gloss vitreous china. Concealed trap, single tap hole, and an overflow to the front. Pairs with the Elara mixer series.',
   'The Fonte Wall-Hung Bidet brings the Italian hygiene tradition into the Milano Collection''s geometric vocabulary. Suspended at wall height, it creates the same visual lightness as the Sospeso basin — the floor reads as continuous.',
   ARRAY['chrome'],
   'Vitreous china, high-gloss white', 'Concealed waste, wall fixings included',
   ARRAY['Wall-hung installation', 'Concealed trap', 'Single tap hole Ø35mm', 'Integrated front overflow', 'Milano Collection compatible'],
   '[{"key": "Material", "value": "Vitreous china"}, {"key": "Trap", "value": "Concealed wall"}, {"key": "Tap Hole", "value": "Single Ø35mm"}, {"key": "Fixing Height", "value": "400mm AFF"}]'::jsonb,
   '{"height": 340, "width": 360, "depth": 540, "weight": 14}'::jsonb,
   18000, 24000,
   'on-request', '',
   'EV-SW-004-W',
   ARRAY['bidet', 'wall hung bidet', 'sanitaryware', 'milano'],
   ARRAY['EV-SW-001', 'VH-BF-001'],
   'Fonte Wall-Hung Bidet — EVOKE Milano', 'Wall-hung bidet in high-gloss vitreous china from EVOKE.',
   ARRAY[]::text[], NULL, NULL, NULL, NULL, NULL),
  ('EV-BL-003', 'Volta Ceiling Fixture',
   'bathroom-lighting', 'ceiling-fixtures', 'verona',
   true, false, 'in-stock',
   true, true,
   'A surface-mounted architectural ceiling fixture in die-cast aluminium. IP44 rated, 24W, opal diffuser for even shadow-free illumination across the full bathroom plane.',
   'The Volta Ceiling Fixture provides the architectural backbone of the Verona Collection''s lighting palette. Circular and minimal, it delivers uniform ambient illumination from a single high-efficacy LED module — no visible lamp, no hotspots.',
   ARRAY['matte-black', 'brushed-nickel'],
   'Die-cast aluminium housing, opal PMMA diffuser', '24W integrated LED module, IP44 driver',
   ARRAY['IP44 splash rated', 'Opal diffuser — shadow-free output', '24W high-efficacy LED', 'CRI 90+', 'Dimmable TRIAC compatible'],
   '[{"key": "IP Rating", "value": "IP44"}, {"key": "Power", "value": "24W"}, {"key": "Diameter", "value": "Ø280mm"}, {"key": "Colour Temp", "value": "2700K / 3000K"}]'::jsonb,
   '{"height": 80, "width": 280, "depth": 280, "weight": 1.6}'::jsonb,
   16000, 21000,
   'on-request', '',
   'EV-BL-003-MB',
   ARRAY['ceiling light', 'surface mounted', 'IP44', 'verona'],
   ARRAY['EV-BL-001', 'EV-BL-002'],
   'Volta Ceiling Fixture — EVOKE Verona', 'Surface-mounted architectural ceiling fixture, IP44, 24W opal diffuser from EVOKE.',
   ARRAY[]::text[], NULL, NULL, NULL, NULL, NULL),
  ('EV-BL-004', 'Calda Heated Lamp',
   'bathroom-lighting', 'heated-lamps', 'como',
   true, false, 'in-stock',
   true, true,
   'A ceiling-mounted infrared heated lamp providing both warmth and ambient illumination. 1200W heating element, 25W ambient lamp, and a pull-cord switch.',
   'The Calda Heated Lamp brings the spa experience into the domestic bathroom. Its infrared element delivers instant radiant warmth to 3–4 sqm, while the ambient lamp provides soft, even illumination — all from a single, elegant ceiling fixture.',
   ARRAY['chrome', 'brushed-nickel'],
   'Polished aluminium reflector, chrome trim ring', '1200W infrared element, 25W ambient bulb, pull cord',
   ARRAY['1200W infrared heating element', '25W integrated ambient lamp', 'Instant-on radiant heat', 'Pull-cord switch or separate switch wiring', 'IP44 rated'],
   '[{"key": "Heating Output", "value": "1200W infrared"}, {"key": "Coverage", "value": "3–4 sqm"}, {"key": "Ambient Light", "value": "25W"}, {"key": "IP Rating", "value": "IP44"}]'::jsonb,
   '{"height": 160, "width": 300, "depth": 300, "weight": 2.8}'::jsonb,
   12000, 16000,
   'on-request', '',
   'EV-BL-004-CHR',
   ARRAY['heated lamp', 'infrared', 'bathroom heating', 'como'],
   ARRAY['EV-BL-003', 'EV-BL-001'],
   'Calda Heated Lamp — EVOKE Como', 'Infrared heated ceiling lamp with ambient illumination, IP44, from EVOKE.',
   ARRAY[]::text[], NULL, NULL, NULL, NULL, NULL),
  ('EV-AC-003', 'Deco Soap Dispenser',
   'accessories', 'soap-dispensers', 'milano',
   true, false, 'in-stock',
   true, true,
   'A wall-mounted soap or lotion dispenser in solid brass with a 300ml capacity. E-monogram pump head, concealed fixing plate, and a satin-smooth pump action.',
   'The Deco Soap Dispenser completes the EVOKE accessory palette. Its solid brass body and E-monogrammed pump head carry the same material and dimensional discipline as the Sera Towel Rail — delivering a unified accessory language across the space.',
   ARRAY['brushed-nickel', 'matte-black'],
   'Solid brass body and pump, PVD finish', 'Concealed fixing plate, 300ml ABS reservoir',
   ARRAY['300ml capacity reservoir', 'E-monogram pump head', 'Satin-smooth pump action', 'Concealed wall fixing', 'Milano Collection compatible'],
   '[{"key": "Capacity", "value": "300ml"}, {"key": "Pump", "value": "Metered 1ml dose"}, {"key": "Material", "value": "Solid brass PVD"}, {"key": "Fixing", "value": "Concealed wall plate"}]'::jsonb,
   '{"height": 185, "width": 65, "depth": 90, "weight": 0.5}'::jsonb,
   5500, 7500,
   'on-request', '',
   'EV-AC-003-BN',
   ARRAY['soap dispenser', 'lotion dispenser', 'accessory', 'brass'],
   ARRAY['EV-AC-001', 'EV-AC-002'],
   'Deco Soap Dispenser — EVOKE Milano', 'Wall-mounted solid brass soap dispenser with E-monogram pump head from EVOKE.',
   ARRAY[]::text[], NULL, NULL, NULL, NULL, NULL),
  ('EV-AC-004', 'Asse Toilet Roll Holder',
   'accessories', 'toilet-roll-holders', 'verona',
   true, false, 'in-stock',
   true, true,
   'A surface-mounted toilet roll holder in solid brass. Sprung arm with a square-profile back plate and concealed fixings. Part of the Verona accessory set.',
   'The Asse Toilet Roll Holder maintains the Verona Collection''s insistence on material quality even in the most utilitarian element. Solid brass, a sprung arm that holds without rattling, and a square back plate that aligns precisely with the Sera Towel Rail.',
   ARRAY['matte-black', 'chrome'],
   'Solid brass, PVD finish', 'Concealed anchor plate, stainless fixings',
   ARRAY['Solid brass construction', 'Sprung arm — holds roll securely', 'Square back plate — aligns with Sera Rail', 'Concealed fixing system', 'Verona Collection compatible'],
   '[{"key": "Arm Projection", "value": "130mm"}, {"key": "Back Plate", "value": "55 × 55mm square"}, {"key": "Material", "value": "Solid brass PVD"}, {"key": "Fixing", "value": "Concealed anchor plate"}]'::jsonb,
   '{"height": 55, "width": 155, "depth": 130, "weight": 0.45}'::jsonb,
   5000, 6800,
   'on-request', '',
   'EV-AC-004-MB',
   ARRAY['toilet roll holder', 'paper holder', 'accessory', 'brass'],
   ARRAY['EV-AC-001', 'EV-AC-002'],
   'Asse Toilet Roll Holder — EVOKE Verona', 'Solid brass surface-mounted toilet roll holder with sprung arm from EVOKE.',
   ARRAY[]::text[], NULL, NULL, NULL, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

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
