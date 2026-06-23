/**
 * EVOKE — Supabase data layer
 * All DB reads / writes live here. App.jsx never touches supabase directly.
 *
 * Column mapping: DB snake_case ↔ JS camelCase
 */
import { supabase, uploadFile, query } from './supabase.js';

// ── Mapping helpers ──────────────────────────────────────────

/** DB row → JS product object */
function rowToProduct(row) {
  if (!row) return null;
  return {
    id:                   row.id,
    name:                 row.name,
    categoryId:           row.category_id,
    subcategoryId:        row.subcategory_id,
    collectionId:         row.collection_id,
    published:            row.published,
    featured:             row.featured,
    stockStatus:          row.stock_status,
    projectAvailability:  row.project_availability,
    retailAvailability:   row.retail_availability,
    description:          row.description        || '',
    fullDescription:      row.full_description   || '',
    finishes:             row.finishes           || [],
    material:             row.material           || '',
    additionalMaterial:   row.additional_material|| '',
    features:             row.features           || [],
    specifications:       row.specifications     || [],
    dimensions:           row.dimensions         || {},
    tradePrice:           row.trade_price,
    mrp:                  row.mrp,
    pricingMode:          row.pricing_mode       || 'on-request',
    pricingNote:          row.pricing_note       || '',
    sku:                  row.sku                || '',
    tags:                 row.tags               || [],
    images:               row.images             || [],
    cadFile:              row.cad_file           ? { url: row.cad_file }            : null,
    bimFile:              row.bim_file           ? { url: row.bim_file }            : null,
    techDataSheet:        row.tech_data_sheet    ? { url: row.tech_data_sheet }     : null,
    installationManual:   row.installation_manual? { url: row.installation_manual } : null,
    dimensionDiagram:     row.dimension_diagram  ? { url: row.dimension_diagram }   : null,
    relatedProducts:      row.related_products   || [],
    metaTitle:            row.meta_title         || '',
    metaDescription:      row.meta_description   || '',
    createdAt:            row.created_at,
    updatedAt:            row.updated_at,
  };
}

/** JS product object → DB row (snake_case).
 *  NOTE: images and file-URL columns are added by saveProduct after uploads.
 */
function productToRow(p) {
  return {
    id:                   p.id,
    name:                 p.name,
    category_id:          p.categoryId          || null,
    subcategory_id:       p.subcategoryId       || null,
    collection_id:        p.collectionId        || null,
    published:            Boolean(p.published),
    featured:             Boolean(p.featured),
    stock_status:         p.stockStatus         || 'in-stock',
    project_availability: Boolean(p.projectAvailability),
    retail_availability:  Boolean(p.retailAvailability),
    description:          p.description         || '',
    full_description:     p.fullDescription      || '',
    finishes:             Array.isArray(p.finishes)      ? p.finishes      : [],
    material:             p.material            || '',
    additional_material:  p.additionalMaterial  || '',
    features:             Array.isArray(p.features)      ? p.features      : [],
    specifications:       Array.isArray(p.specifications) ? p.specifications : [],
    dimensions:           (p.dimensions && typeof p.dimensions === 'object') ? p.dimensions : {},
    trade_price:          p.tradePrice  != null && p.tradePrice  !== '' ? Number(p.tradePrice)  : null,
    mrp:                  p.mrp         != null && p.mrp         !== '' ? Number(p.mrp)         : null,
    pricing_mode:         p.pricingMode         || 'on-request',
    pricing_note:         p.pricingNote         || '',
    sku:                  p.sku                 || '',
    tags:                 Array.isArray(p.tags)           ? p.tags          : [],
    related_products:     Array.isArray(p.relatedProducts)? p.relatedProducts: [],
    meta_title:           p.metaTitle           || '',
    meta_description:     p.metaDescription     || '',
    // images + file URL columns are merged in saveProduct after async uploads
  };
}

// ══════════════════════════════════════════════════════════════
// PRODUCTS
// ══════════════════════════════════════════════════════════════

export async function fetchProducts({ publishedOnly = false } = {}) {
  let q = supabase.from('products').select('*').order('created_at', { ascending: true });
  if (publishedOnly) q = q.eq('published', true);
  const rows = await query(q, []);
  return rows.map(rowToProduct);
}

export async function saveProduct(productData, existingId = null) {
  const productId = existingId || productData.id;
  if (!productId) {
    console.error('[saveProduct] No product ID provided');
    return null;
  }

  const row = productToRow({ ...productData, id: productId });

  // ── Handle image uploads ─────────────────────────────────
  // Collect final image URLs: existing string URLs pass through,
  // File objects and dataUrl objects get uploaded to Storage.
  const imageUrls = [];
  if (Array.isArray(productData.images)) {
    for (const img of productData.images) {
      if (!img) continue;
      if (typeof img === 'string') {
        imageUrls.push(img);
      } else if (img instanceof File) {
        const path = `${productId}/${Date.now()}-${img.name}`;
        const url = await uploadFile('product-images', path, img);
        if (url) imageUrls.push(url);
        else console.error('[saveProduct] Image upload failed for', img.name);
      } else if (img.dataUrl) {
        const file = dataUrlToFile(img.dataUrl, img.name || 'image.jpg');
        const path = `${productId}/${Date.now()}-${file.name}`;
        const url = await uploadFile('product-images', path, file);
        if (url) imageUrls.push(url);
        else console.error('[saveProduct] dataUrl image upload failed for', img.name);
      }
    }
  }
  // Always write images array (even if empty) so existing images aren't dropped
  row.images = imageUrls;

  // ── Handle file uploads (CAD, BIM, etc.) ─────────────────
  const fileFields = [
    ['cadFile',            'cad_file'],
    ['bimFile',            'bim_file'],
    ['techDataSheet',      'tech_data_sheet'],
    ['installationManual', 'installation_manual'],
    ['dimensionDiagram',   'dimension_diagram'],
  ];
  for (const [jsKey, dbKey] of fileFields) {
    const f = productData[jsKey];
    if (!f) {
      row[dbKey] = null;
    } else if (typeof f === 'string') {
      row[dbKey] = f;
    } else if (f.url) {
      row[dbKey] = f.url;
    } else if (f.dataUrl) {
      const file = dataUrlToFile(f.dataUrl, f.name || 'file');
      const bucket = dbKey === 'dimension_diagram' ? 'product-images' : 'downloads';
      const path = `${productId}/${Date.now()}-${file.name}`;
      const url = await uploadFile(bucket, path, file);
      if (url) row[dbKey] = url;
      else console.error('[saveProduct] File upload failed for', jsKey);
    }
  }

  // ── Upsert ───────────────────────────────────────────────
  console.log('[saveProduct] upserting', productId, 'published=', row.published);
  const { data, error } = await supabase
    .from('products')
    .upsert(row, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.error('[saveProduct] Supabase error:', error.code, error.message, error.details);
    return null;
  }

  console.log('[saveProduct] saved OK:', data.id);
  return rowToProduct(data);
}

export async function deleteProduct(id) {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) {
    console.error('[deleteProduct] Supabase error:', error.code, error.message);
    return false;
  }
  return true;
}

// ══════════════════════════════════════════════════════════════
// COLLECTIONS
// ══════════════════════════════════════════════════════════════

export async function fetchCollections() {
  return query(
    supabase.from('collections').select('*').order('sort_order'),
    []
  );
}

export async function saveCollection(col) {
  if (!col.id) {
    console.error('[saveCollection] Missing id');
    return null;
  }
  const { data, error } = await supabase
    .from('collections')
    .upsert({
      id:          col.id,
      name:        col.name        || '',
      mood:        col.mood        || '',
      description: col.description || '',
      sort_order:  col.sort_order  ?? 0,
      active:      col.active      !== false,
    }, { onConflict: 'id' })
    .select()
    .single();
  if (error) {
    console.error('[saveCollection] Supabase error:', error.code, error.message);
    return null;
  }
  return data;
}

export async function deleteCollection(id) {
  const { error } = await supabase.from('collections').delete().eq('id', id);
  if (error) {
    console.error('[deleteCollection] Supabase error:', error.code, error.message);
    return false;
  }
  return true;
}

// ══════════════════════════════════════════════════════════════
// FINISHES
// ══════════════════════════════════════════════════════════════

export async function fetchFinishes() {
  return query(
    supabase.from('finishes').select('*').order('sort_order'),
    []
  );
}

export async function saveFinish(finish) {
  if (!finish.id) {
    console.error('[saveFinish] Missing id');
    return null;
  }
  const { data, error } = await supabase
    .from('finishes')
    .upsert({
      id:          finish.id,
      label:       finish.label       || '',
      hex:         finish.hex         || '#C8C8C8',
      description: finish.description || '',
      active:      finish.active      !== false,
      sort_order:  finish.sort_order  ?? 0,
    }, { onConflict: 'id' })
    .select()
    .single();
  if (error) {
    console.error('[saveFinish] Supabase error:', error.code, error.message);
    return null;
  }
  return data;
}

export async function deleteFinish(id) {
  const { error } = await supabase.from('finishes').delete().eq('id', id);
  if (error) {
    console.error('[deleteFinish] Supabase error:', error.code, error.message);
    return false;
  }
  return true;
}

// ══════════════════════════════════════════════════════════════
// CATEGORIES
// ══════════════════════════════════════════════════════════════

// The 6 canonical top-level category IDs.
// Subcategories live only in the subcategories JSONB column, never as separate rows.
const TOP_LEVEL_CATEGORY_IDS = [
  'bath-fittings', 'shower-systems', 'wash-basins',
  'luxury-vanities', 'mirrors', 'sanitaryware-accessories',
];

export async function fetchCategories() {
  return query(
    supabase
      .from('categories')
      .select('*')
      .in('id', TOP_LEVEL_CATEGORY_IDS)
      .order('sort_order'),
    []
  );
}

export async function saveCategory(cat) {
  if (!cat.id) {
    console.error('[saveCategory] Missing id');
    return null;
  }
  const { data, error } = await supabase
    .from('categories')
    .upsert({
      id:            cat.id,
      name:          cat.name          || '',
      descriptor:    cat.descriptor    || '',
      subcategories: Array.isArray(cat.subcategories) ? cat.subcategories : [],
      sort_order:    cat.sort_order    ?? 0,
      active:        cat.active        !== false,
    }, { onConflict: 'id' })
    .select()
    .single();
  if (error) {
    console.error('[saveCategory] Supabase error:', error.code, error.message);
    return null;
  }
  return data;
}

// ══════════════════════════════════════════════════════════════
// CONTACT ENQUIRIES
// ══════════════════════════════════════════════════════════════

export async function submitEnquiry(form) {
  const { error } = await supabase.from('contact_enquiries').insert({
    name:         form.name         || '',
    company:      form.company      || '',
    project_type: form.projectType  || '',
    city:         form.city         || '',
    country:      form.country      || '',
    email:        form.email        || '',
    phone:        form.phone        || '',
    message:      form.message      || '',
  });
  if (error) {
    console.error('[submitEnquiry] Supabase error:', error.code, error.message);
    return false;
  }
  return true;
}

export async function fetchEnquiries() {
  return query(
    supabase.from('contact_enquiries').select('*').order('created_at', { ascending: false }),
    []
  );
}

// ══════════════════════════════════════════════════════════════
// SEED
// ══════════════════════════════════════════════════════════════

/**
 * Push default collections, finishes, categories to Supabase on first run.
 * Uses ignoreDuplicates so it's safe to call on every app mount.
 */
export async function seedDefaults(defaultCollections, defaultFinishes, defaultCategories, defaultProducts = []) {
  const errors = [];

  // ── Collections ──────────────────────────────────────────
  for (const col of defaultCollections) {
    const { error } = await supabase.from('collections').upsert(
      { id: col.id, name: col.name, mood: col.mood || '', description: '', sort_order: 0, active: true },
      { onConflict: 'id', ignoreDuplicates: true }
    );
    if (error) errors.push(`collections/${col.id}: ${error.message}`);
  }

  // ── Finishes ─────────────────────────────────────────────
  for (const fin of defaultFinishes) {
    const { error } = await supabase.from('finishes').upsert(
      { id: fin.id, label: fin.label, hex: fin.hex, description: '', active: true, sort_order: 0 },
      { onConflict: 'id', ignoreDuplicates: true }
    );
    if (error) errors.push(`finishes/${fin.id}: ${error.message}`);
  }

  // ── Categories ───────────────────────────────────────────
  for (const cat of defaultCategories) {
    const { error } = await supabase.from('categories').upsert(
      {
        id: cat.id, name: cat.name, descriptor: cat.descriptor || '',
        subcategories: cat.subcategories || [], sort_order: 0, active: true,
      },
      { onConflict: 'id', ignoreDuplicates: true }
    );
    if (error) errors.push(`categories/${cat.id}: ${error.message}`);
  }

  // ── Products ─────────────────────────────────────────────
  // ignoreDuplicates: true means we never overwrite a product the admin has edited.
  // Images are intentionally left empty here — the bundled asset paths in the
  // local JS build are hashed filenames that aren't valid Supabase Storage URLs.
  // Admins upload real images via the product editor.
  for (const p of defaultProducts) {
    const row = {
      id:                   p.id,
      name:                 p.name,
      category_id:          p.categoryId          || null,
      subcategory_id:       p.subcategoryId       || null,
      collection_id:        p.collectionId        || null,
      published:            Boolean(p.published),
      featured:             Boolean(p.featured),
      stock_status:         p.stockStatus         || 'in-stock',
      project_availability: Boolean(p.projectAvailability !== false),
      retail_availability:  Boolean(p.retailAvailability  !== false),
      description:          p.description         || '',
      full_description:     p.fullDescription      || '',
      finishes:             Array.isArray(p.finishes)      ? p.finishes      : [],
      material:             p.material            || '',
      additional_material:  p.additionalMaterial  || '',
      features:             Array.isArray(p.features)      ? p.features      : [],
      specifications:       Array.isArray(p.specifications)? p.specifications : [],
      dimensions:           (p.dimensions && typeof p.dimensions === 'object') ? p.dimensions : {},
      trade_price:          (p.tradePrice  != null && p.tradePrice  !== '') ? Number(p.tradePrice)  : null,
      mrp:                  (p.mrp         != null && p.mrp         !== '') ? Number(p.mrp)         : null,
      pricing_mode:         p.pricingMode         || 'on-request',
      pricing_note:         p.pricingNote         || '',
      sku:                  p.sku                 || '',
      tags:                 Array.isArray(p.tags)            ? p.tags           : [],
      related_products:     Array.isArray(p.relatedProducts) ? p.relatedProducts : [],
      meta_title:           p.metaTitle           || '',
      meta_description:     p.metaDescription     || '',
      images:               [],   // no bundled asset paths — admins upload via editor
      cad_file:             null,
      bim_file:             null,
      tech_data_sheet:      null,
      installation_manual:  null,
      dimension_diagram:    null,
    };
    const { error } = await supabase.from('products').upsert(row, {
      onConflict: 'id',
      ignoreDuplicates: true,   // ← preserve any admin edits
    });
    if (error) errors.push(`products/${p.id}: ${error.message}`);
  }

  if (errors.length) console.error('[seedDefaults] errors:', errors);
  else console.log(`[seedDefaults] seeded ${defaultCollections.length} collections, ${defaultFinishes.length} finishes, ${defaultCategories.length} categories, ${defaultProducts.length} products`);
}

// ── Utility ──────────────────────────────────────────────────

function dataUrlToFile(dataUrl, filename) {
  const [header, base64] = dataUrl.split(',');
  const mime  = header.match(/:(.*?);/)?.[1] || 'application/octet-stream';
  const bytes = atob(base64);
  const buf   = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) buf[i] = bytes.charCodeAt(i);
  return new File([buf], filename, { type: mime });
}
