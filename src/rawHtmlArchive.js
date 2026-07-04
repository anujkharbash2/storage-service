const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const BUCKET = 'raw-html-archive';

/**
 * Store raw HTML from a fetch result, keyed by request ID.
 * This is what Team 1's fetch output eventually lands in.
 */
async function storeRawHtml(requestId, html) {
  if (!html) return { success: false, reason: 'NO_HTML' };

  const path = `${requestId}.html`;
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(path, html, {
      contentType: 'text/html',
      upsert: false, // don't silently overwrite — each request ID should be unique
    });

  if (error) {
    console.error('Failed to store raw HTML:', error);
    return { success: false, reason: error.message };
  }

  return { success: true, path: data.path };
}

/**
 * Retrieve raw HTML by request ID (e.g., for debugging or reprocessing).
 */
async function getRawHtml(requestId) {
  const path = `${requestId}.html`;
  const { data, error } = await supabase.storage.from(BUCKET).download(path);

  if (error) {
    return { success: false, reason: error.message };
  }

  const html = await data.text();
  return { success: true, html };
}

module.exports = { storeRawHtml, getRawHtml };