require('dotenv').config();
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

function runBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputDir = path.join(__dirname, '..', 'backups');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  const outputFile = path.join(outputDir, `backup_${timestamp}.sql`);
  const cmd = `/opt/homebrew/opt/postgresql/bin/pg_dump "${process.env.DATABASE_URL}" --no-owner --no-privileges -f "${outputFile}"`;
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  exec(cmd, async (error, stdout, stderr) => {
  if (error) {
    console.error('Backup failed:', error.message);
    return;
  }
  console.log('Backup created:', outputFile);

  // Upload to a dedicated backups bucket (create 'db-backups' bucket first, private)
  const fileBuffer = fs.readFileSync(outputFile);
  const { error: uploadError } = await supabase.storage
    .from('db-backups')
    .upload(`backup_${timestamp}.sql`, fileBuffer, { contentType: 'application/sql' });

  if (uploadError) {
    console.error('Offsite upload failed:', uploadError);
  } else {
    console.log('Backup uploaded offsite to db-backups bucket');
  }
});

}

runBackup();