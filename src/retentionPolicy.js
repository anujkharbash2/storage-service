require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const BUCKET = 'raw-html-archive';
const RETENTION_DAYS = 60; // per spec: 30-90 day default, 60 is a reasonable middle ground

async function runRetentionCleanup() {
  const { data: files, error } = await supabase.storage.from(BUCKET).list('', { limit: 1000 });

  if (error) {
    console.error('Failed to list files:', error);
    return { deleted: 0, errors: 1 };
  }

  const cutoff = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;
  const toDelete = files.filter(f => new Date(f.created_at).getTime() < cutoff);

  let deletedCount = 0;
  let errorCount = 0;
  let deletedPaths = [];

  if (toDelete.length > 0) {
    const paths = toDelete.map(f => f.name);
    const { data: deleted, error: deleteError } = await supabase.storage.from(BUCKET).remove(paths);

    if (deleteError) {
      errorCount = 1;
    } else {
      deletedCount = deleted.length;
      deletedPaths = paths;
    }
  }

  // Persist audit record regardless of outcome
  await supabase.from('retention_audit_log').insert({
    files_checked: files.length,
    files_deleted: deletedCount,
    deleted_paths: deletedPaths,
    errors: errorCount,
  });

  console.log(`Checked ${files.length}, deleted ${deletedCount}, errors ${errorCount}`);
  return { deleted: deletedCount, errors: errorCount };
}

module.exports = { runRetentionCleanup };

if (require.main === module) {
  runRetentionCleanup().then(result => {
    console.log('Retention cleanup complete:', result);
  });
}