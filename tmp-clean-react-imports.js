const fs = require('fs');
const path = require('path');

const root = path.join(process.cwd(), 'src');

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
      continue;
    }
    if (!['.ts', '.tsx', '.js', '.jsx'].includes(path.extname(entry.name))) continue;

    const text = fs.readFileSync(full, 'utf8');
    let next = text
      .replace(/import\s+React\s+from\s+['"]react['"];?\n/g, '')
      .replace(/import\s+React\s*,\s*\{/g, 'import {');

    if (next !== text) {
      fs.writeFileSync(full, next, 'utf8');
      console.log('updated', path.relative(process.cwd(), full));
    }
  }
}

walk(root);
