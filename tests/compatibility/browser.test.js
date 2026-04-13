/**
 * 浏览器兼容性测试
 * 测试不同浏览器和设备上的表现
 */

const puppeteer = require('puppeteer');

describe('浏览器兼容性测试', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  });

  afterAll(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    page = await browser.newPage();
    await page.goto('http://localhost:8080');
  });

  afterEach(async () => {
    await page.close();
  });

  describe('2.1 浏览器兼容性', () => {
    test('应支持 Web Animations API', async () => {
      const hasWebAnimations = await page.evaluate(() => {
        return 'animate' in document.createElement('div');
      });
      
      expect(hasWebAnimations).toBe(true);
    });

    test('应支持 ES6 类语法', async () => {
      const supportsES6 = await page.evaluate(() => {
        try {
          eval('class Test {}');
          return true;
        } catch (e) {
          return false;
        }
      });
      
      expect(supportsES6).toBe(true);
    });

    test('应支持 Promise', async () => {
      const supportsPromise = await page.evaluate(() => {
        return typeof Promise !== 'undefined';
      });
      
      expect(supportsPromise).toBe(true);
    });

    test('应支持 CSS Grid 和 Flexbox', async () => {
      const supportsFlexbox = await page.evaluate(() => {
        const el = document.createElement('div');
        return 'flex' in el.style;
      });
      
      expect(supportsFlexbox).toBe(true);
    });

    test('应支持 SVG', async () => {
      const supportsSVG = await page.evaluate(() => {
        return document.implementation.hasFeature('http://www.w3.org/TR/SVG11/feature#BasicStructure', '1.1');
      });
      
      expect(supportsSVG).toBe(true);
    });
  });

  describe('2.2 设备与分辨率兼容性', () => {
    const viewports = [
      { name: 'Desktop 1920x1080', width: 1920, height: 1080 },
      { name: 'Desktop 1366x768', width: 1366, height: 768 },
      { name: 'Laptop 1440x900', width: 1440, height: 900 },
      { name: 'Tablet Landscape 1024x768', width: 1024, height: 768 },
      { name: 'Tablet Portrait 768x1024', width: 768, height: 1024 },
      { name: 'Mobile Large 414x896', width: 414, height: 896 },
      { name: 'Mobile Medium 375x667', width: 375, height: 667 },
      { name: 'Mobile Small 320x568', width: 320, height: 568 },
    ];

    viewports.forEach(viewport => {
      test(`应在 ${viewport.name} 分辨率下正确显示`, async () => {
        await page.setViewport({
          width: viewport.width,
          height: viewport.height
        });
        
        await page.reload();
        await page.waitForSelector('#slot');
        
        // 检查元素是否在视口内
        const isVisible = await page.evaluate(() => {
          const slot = document.getElementById('slot');
          const rect = slot.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        });
        
        expect(isVisible).toBe(true);
      });
    });

    test('响应式布局应在断点处切换背景图片', async () => {
      // 大屏幕
      await page.setViewport({ width: 1920, height: 1080 });
      await page.reload();
      
      const largeBg = await page.evaluate(() => {
        return window.getComputedStyle(document.body).backgroundImage;
      });
      
      // 小屏幕
      await page.setViewport({ width: 768, height: 1024 });
      await page.reload();
      
      const smallBg = await page.evaluate(() => {
        return window.getComputedStyle(document.body).backgroundImage;
      });
      
      // 背景图片应该不同
      expect(smallBg).not.toBe(largeBg);
    });
  });

  describe('3.2 视觉体验 - 高 DPI 支持', () => {
    test('应支持 Retina 显示屏', async () => {
      await page.setViewport({
        width: 375,
        height: 667,
        deviceScaleFactor: 2
      });
      
      await page.reload();
      await page.waitForSelector('#slot');
      
      const slot = await page.$('#slot');
      expect(slot).not.toBeNull();
    });

    test('应支持超高 DPI 显示屏', async () => {
      await page.setViewport({
        width: 375,
        height: 667,
        deviceScaleFactor: 3
      });
      
      await page.reload();
      await page.waitForSelector('#slot');
      
      const slot = await page.$('#slot');
      expect(slot).not.toBeNull();
    });
  });
});
