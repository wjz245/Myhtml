const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:8080/index.html');

  // 等待内容加载
  await page.waitForSelector('#content');
  await page.waitForTimeout(1000);

  // 获取所有 .category 元素
  const categories = await page.$$eval('.category', elements => {
    return elements.map((el, i) => {
      const title = el.querySelector('.category-title')?.textContent || '无标题';
      const isVisible = window.getComputedStyle(el).display !== 'none' &&
                       window.getComputedStyle(el).visibility !== 'hidden' &&
                       el.offsetHeight > 0;
      const parent = el.parentElement?.className || '无父元素';
      return { index: i, title, isVisible, parent };
    });
  });

  console.log('=== 找到的类别元素 ===');
  categories.forEach(cat => {
    console.log(`${cat.index + 1}. "${cat.title}" - 可见: ${cat.isVisible}, 父元素: ${cat.parent}`);
  });

  // 截图
  await page.screenshot({ path: 'screenshot.png', fullPage: true });
  console.log('\n截图已保存到 screenshot.png');

  await browser.close();
})();
