const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const miniRoot = path.join(root, 'miniprogram');
const appJson = JSON.parse(fs.readFileSync(path.join(miniRoot, 'app.json'), 'utf8'));
const extensions = ['.js', '.json', '.wxml', '.wxss'];
const missing = [];

for (const page of appJson.pages) {
  for (const extension of extensions) {
    const file = path.join(miniRoot, `${page}${extension}`);
    if (!fs.existsSync(file)) {
      missing.push(path.relative(root, file));
    }
  }
}

if (missing.length > 0) {
  console.error(`Missing page files:\n${missing.join('\n')}`);
  process.exit(1);
}

console.log(`OK ${appJson.pages.length} registered pages have js/json/wxml/wxss files`);
