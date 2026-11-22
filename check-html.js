const fs = require('fs');
const { JSDOM } = require('jsdom');

async function checkHTML() {
  // 读取 HTML 和数据
  const html = fs.readFileSync('index.html', 'utf-8');
  const data = JSON.parse(fs.readFileSync('data.json', 'utf-8'));
  
  const dom = new JSDOM(html, { 
    runScripts: "dangerously",
    resources: "usable",
    url: "http://localhost:8080"
  });
  
  const { window } = dom;
  
  // 等待脚本执行
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 检查渲染的内容
  const content = window.document.getElementById('content');
  console.log('=== 渲染的HTML结构 ===');
  console.log(content.innerHTML.substring(0, 2000));
  
  // 查找"题目"
  const hasSubCategory = content.innerHTML.includes('题目');
  console.log('\n=== 检查结果 ===');
  console.log('是否包含"题目":', hasSubCategory);
  
  // 统计 .category 元素数量
  const categories = content.querySelectorAll('.category');
  console.log('找到的 .category 元素数量:', categories.length);
  categories.forEach((cat, i) => {
    const title = cat.querySelector('.category-title');
    console.log(`  ${i + 1}. ${title ? title.textContent : '无标题'}`);
  });
}

checkHTML().catch(console.error);
