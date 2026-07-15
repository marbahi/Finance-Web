import db from './src/db.js';

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
for (const t of tables) {
  process.stdout.write('=== ' + t.name + ' ===\n');
  const cols = db.prepare('PRAGMA table_info(' + t.name + ')').all();
  process.stdout.write(JSON.stringify(cols, null, 2) + '\n');
  const sample = db.prepare('SELECT * FROM ' + t.name + ' LIMIT 2').all();
  process.stdout.write('samples: ' + JSON.stringify(sample, null, 2) + '\n\n');
}
