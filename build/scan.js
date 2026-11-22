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

// 扫描单个类别目录（包括所有子文件夹中的HTML）
function scanCategory(categoryDir, categoryName) {
  const items = [];

  function scanFiles(dirPath, relativePath = '') {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    entries.forEach(entry => {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        // 递归扫描子文件夹
        scanFiles(fullPath, path.join(relativePath, entry.name));
      } else if (entry.name.endsWith('.html')) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const meta = extractMetadata(content);
        const stats = getFileStats(fullPath);

        const relativeFilePath = relativePath
          ? `categories/${categoryName}/${relativePath}/${entry.name}`
          : `categories/${categoryName}/${entry.name}`;

        items.push({
          filename: entry.name,
          path: relativeFilePath.replace(/\\/g, '/'),
          title: meta?.title || entry.name.replace('.html', ''),
          description: meta?.description || '',
          tags: meta?.tags ? meta.tags.split(',').map(t => t.trim()) : [],
          date: meta?.date || stats.modified,
          modified: stats.modified,
          pinned: meta?.pinned === 'true' || meta?.pinned === '1'
        });
      }
    });
  }

  scanFiles(categoryDir);

  // 分离置顶和非置顶项目
  const pinnedItems = items.filter(item => item.pinned);
  const normalItems = items.filter(item => !item.pinned);

  // 分别按修改时间排序
  pinnedItems.sort((a, b) => new Date(b.modified) - new Date(a.modified));
  normalItems.sort((a, b) => new Date(b.modified) - new Date(a.modified));

  // 置顶项目在前
  const sortedItems = [...pinnedItems, ...normalItems];

  return {
    name: categoryName,
    items: sortedItems,
    lastModified: sortedItems.length > 0
      ? sortedItems[0].modified
      : new Date().toISOString()
  };
}

function main() {
  console.log('Scanning categories...');

  if (!fs.existsSync(CATEGORIES_DIR)) {
    console.log('Categories directory not found. Creating...');
    fs.mkdirSync(CATEGORIES_DIR, { recursive: true });
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify([], null, 2), 'utf-8');
    console.log('Created empty data.json');
    return;
  }

  const categories = [];
  const entries = fs.readdirSync(CATEGORIES_DIR, { withFileTypes: true });

  // 扫描每个顶层类别目录
  entries
    .filter(entry => entry.isDirectory())
    .forEach(entry => {
      const categoryPath = path.join(CATEGORIES_DIR, entry.name);
      const category = scanCategory(categoryPath, entry.name);
      categories.push(category);
    });

  // 按最新修改时间排序类别
  categories.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(categories, null, 2), 'utf-8');
  console.log(`Generated ${OUTPUT_FILE} with ${categories.length} categories`);

  categories.forEach(cat => {
    console.log(`- ${cat.name}: ${cat.items.length} items`);
  });
}

main();
