const fs = require('fs');

// 读取数据
const data = JSON.parse(fs.readFileSync('data.json', 'utf-8'));

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

function countAllItems(category) {
  let count = category.items?.length || 0;
  if (category.categories) {
    category.categories.forEach(sub => {
      count += countAllItems(sub);
    });
  }
  return count;
}

function renderCategory(category, depth = 0) {
  console.log(`渲染类别: ${category.name}, 深度: ${depth}, 子类别数: ${category.categories?.length || 0}, 项目数: ${category.items?.length || 0}`);

  const itemCount = (category.items?.length || 0) +
    (category.categories?.reduce((sum, c) => sum + countAllItems(c), 0) || 0);

  let html = `
    <div class="category">
      <div class="category-header">
        <h2 class="category-title">${category.name}</h2>
        <span class="category-count">${itemCount} 项</span>
      </div>
  `;

  // 渲染当前类别的项目
  if (category.items && category.items.length > 0) {
    html += `
      <div class="items-grid">
        ${category.items.map(item => `
          <a href="${item.path}" class="item-card">
            <h3 class="item-title">${item.title}</h3>
            ${item.description ? `<p class="item-description">${item.description}</p>` : ''}
            <div class="item-meta">
              <span class="item-date">${formatDate(item.modified)}</span>
              ${item.tags.length > 0 ? `
                <div class="item-tags">
                  ${item.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
              ` : ''}
            </div>
          </a>
        `).join('')}
      </div>
    `;
  }

  // 递归渲染子类别（在父div关闭之前）
  if (category.categories && category.categories.length > 0) {
    console.log(`${category.name} 有 ${category.categories.length} 个子类别，开始渲染...`);
    const subCatsHtml = category.categories.map(subCat => renderCategory(subCat, depth + 1)).join('');
    console.log(`子类别HTML长度: ${subCatsHtml.length}`);
    html += subCatsHtml;
  }

  html += `</div>`;

  return html;
}

// 渲染所有类别
console.log('=== 开始渲染 ===\n');
const html = data.map(cat => renderCategory(cat)).join('');

console.log('\n=== HTML输出（前1500字符）===');
console.log(html.substring(0, 1500));

console.log('\n=== 检查"题目"是否存在 ===');
console.log('包含"题目":', html.includes('题目'));
console.log('包含"光学练习题":', html.includes('光学练习题'));
console.log('包含"力学练习题":', html.includes('力学练习题'));
