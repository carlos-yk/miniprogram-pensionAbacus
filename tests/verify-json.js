const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const jsonFiles = [
  'project.config.json',
  'miniprogram/app.json',
  'miniprogram/sitemap.json'
];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }
    if (entry.isFile() && entry.name.endsWith('.json')) {
      jsonFiles.push(path.relative(root, fullPath));
    }
  }
}

walk(path.join(root, 'miniprogram/pages'));

for (const relativePath of Array.from(new Set(jsonFiles))) {
  const fullPath = path.join(root, relativePath);
  JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  console.log(`OK ${relativePath}`);
}
