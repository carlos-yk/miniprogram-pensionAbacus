const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const forbidden = [
  /打败全国/,
  /排行榜/,
  /真实用户排名/,
  /官方认证/,
  /精确测算/,
  /保证领取/,
  /准确率/,
  /准确度\s*\d/,
  /较准/,
  /烟花/
  ,
  /内部预览/,
  /内部测试/,
  /发布模式/,
  /参数版本/,
  /参数凭证/,
  /待补字段/,
  /二次复核/,
  /数据复核中/,
  /历史参数补齐中/
];

const extensions = new Set(['.js', '.json', '.wxml', '.wxss']);
const matches = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name === 'data') {
      continue;
    }
    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }
    if (!entry.isFile() || !extensions.has(path.extname(entry.name))) {
      continue;
    }

    const content = fs.readFileSync(fullPath, 'utf8');
    const lines = content.split(/\r?\n/);
    lines.forEach((line, index) => {
      for (const pattern of forbidden) {
        if (pattern.test(line)) {
          matches.push(`${path.relative(root, fullPath)}:${index + 1}: ${line.trim()}`);
        }
      }
    });
  }
}

walk(path.join(root, 'miniprogram'));

if (matches.length > 0) {
  console.error(matches.join('\n'));
  process.exit(1);
}

console.log('OK no forbidden default UI copy in miniprogram');
