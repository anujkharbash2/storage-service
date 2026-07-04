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

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error('Backup failed:', error.message);
      return;
    }
    console.log('Backup created:', outputFile);
  });
}

runBackup();