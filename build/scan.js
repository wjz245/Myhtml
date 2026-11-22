const fs = require('fs');
const path = require('path');

const CATEGORIES_DIR = path.join(__dirname, '..', 'categories');
const OUTPUT_FILE = path.join(__dirname, '..', 'data.json');

function extractMetadata(htmlContent) {
  const metaRegex = /<!--\s*([\s\S]*?)\s*-->/;
  const match = htmlContent.match(metaRegex);

  if (!match) return null;

  const meta = {};
  const lines = match[1].split('\n');

  lines.forEach(line => {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length > 0) {
      const trimmedKey = key.trim();
      const value = valueParts.join(':').trim();
      meta[trimmedKey] = value;
    }
  });

  return meta;
}

function getFileStats(filePath) {
  const stats = fs.statSync(filePath);
  return {
    created: stats.birthtime.toISOString(),
    modified: stats.mtime.toISOString()
  };
}

function scanCategories() {
  const result = [];

  if (!fs.existsSync(CATEGORIES_DIR)) {
    console.log('Categories directory not found. Creating...');
    fs.mkdirSync(CATEGORIES_DIR, { recursive: true });
    return result;
  }

  const categories = fs.readdirSync(CATEGORIES_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  categories.forEach(category => {
    const categoryPath = path.join(CATEGORIES_DIR, category);
    const files = fs.readdirSync(categoryPath)
      .filter(file => file.endsWith('.html'));

    const items = [];

    files.forEach(file => {
      const filePath = path.join(categoryPath, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const meta = extractMetadata(content);
      const stats = getFileStats(filePath);

      items.push({
        filename: file,
        path: `categories/${category}/${file}`,
        title: meta?.title || file.replace('.html', ''),
        description: meta?.description || '',
        tags: meta?.tags ? meta.tags.split(',').map(t => t.trim()) : [],
        date: meta?.date || stats.modified,
        modified: stats.modified,
        category: category
      });
    });

    // 按修改时间排序，最新的在前
    items.sort((a, b) => new Date(b.modified) - new Date(a.modified));

    result.push({
      name: category,
      items: items
    });
  });

  // 按类别中最新项目的时间排序
  result.sort((a, b) => {
    const aLatest = a.items[0]?.modified || '';
    const bLatest = b.items[0]?.modified || '';
    return new Date(bLatest) - new Date(aLatest);
  });

  return result;
}

function main() {
  console.log('Scanning categories...');
  const data = scanCategories();

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`Generated ${OUTPUT_FILE} with ${data.length} categories`);

  data.forEach(cat => {
    console.log(`  - ${cat.name}: ${cat.items.length} items`);
  });
}

main();
