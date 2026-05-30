const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const targets = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }
    if (entry.isFile() && entry.name.endsWith('.js')) {
      targets.push(fullPath);
    }
  }
}

walk(path.join(root, 'miniprogram'));
walk(path.join(root, 'tests'));

for (const file of targets) {
  const result = spawnSync(process.execPath, ['--check', file], {
    cwd: root,
    encoding: 'utf8'
  });

  if (result.status !== 0) {
    process.stderr.write(result.stderr || result.stdout);
    process.exit(result.status);
  }

  console.log(`OK ${path.relative(root, file)}`);
}
