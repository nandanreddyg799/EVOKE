import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const configured = Boolean(
  supabaseUrl && supabaseKey &&
  supabaseUrl !== 'https://your-project-ref.supabase.co' &&
  supabaseKey !== 'your-anon-public-key-here'
);

if (!configured) {
  console.warn(
    '[EVOKE] Supabase not configured — running in local-only mode.\n' +
    'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local to enable persistence.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-anon-key'
);

// ── Storage helpers ──────────────────────────────────────────

/**
 * Upload a File to Supabase Storage.
 * Returns the public URL on success, null on failure.
 */
export async function uploadFile(bucket, path, file) {
  if (!configured) {
    console.warn('[uploadFile] Supabase not configured — skipping upload for', path);
    return null;
  }
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
    cacheControl: '3600',
  });
  if (error) {
    console.error('[uploadFile] Storage error:', bucket, path, error.message);
    return null;
  }
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/** Delete a file from storage. */
export async function deleteFile(bucket, path) {
  if (!configured) return;
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) console.error('[deleteFile] Storage error:', bucket, path, error.message);
}

/** Get public URL for an existing path without uploading. */
export function getPublicUrl(bucket, path) {
  if (!path) return null;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

// ── DB query helper ──────────────────────────────────────────

/**
 * Await a Supabase query and return data, logging any error.
 * @param {Promise} promise  — the supabase query promise
 * @param {*}       fallback — returned if query fails (default [])
 */
export async function query(promise, fallback = []) {
  const { data, error } = await promise;
  if (error) {
    console.error('[Supabase query] error:', error.code, error.message, error.details);
    return fallback;
  }
  return data ?? fallback;
}
