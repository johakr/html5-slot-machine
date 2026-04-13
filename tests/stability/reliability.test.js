/**
 * 稳定性与可靠性测试
 * 测试长时间运行和异常场景
 */

const puppeteer = require('puppeteer');

describe('稳定性与可靠性测试', () => {
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

  describe('4.1 长时间运行稳定性', () => {
    test('应能连续旋转 20 次无错误', async () => {
      const spinButton = await page.$('#spin');
      
      for (let i = 0; i < 20; i++) {
        await spinButton.click();
        // 等待旋转完成
        await page.waitForFunction(() => {
          return !document.getElementById('spin').disabled;
        }, { timeout: 6000 });
      }
      
      // 检查游戏是否仍然正常
      const slot = await page.$('#slot');
      expect(slot).not.toBeNull();
      
      const reels = await page.$$('.reel');
      expect(reels.length).toBe(5);
    });

    test('自动播放模式下应能持续运行', async () => {
      // 启用自动播放
      await page.click('#autoplay');
      
      // 开始旋转
      const spinButton = await page.$('#spin');
      await spinButton.click();
      
      // 等待 5 秒（自动播放应在此期间多次旋转）
      await page.waitForTimeout(5000);
      
      // 检查游戏是否仍在运行
      const slot = await page.$('#slot');
      expect(slot).not.toBeNull();
    });

    test('长时间运行后内存不应泄漏', async () => {
      // 获取初始内存使用
      const initialMetrics = await page.metrics();
      const initialJSHeapSize = initialMetrics.JSHeapUsedSize;
      
      // 进行多次旋转
      const spinButton = await page.$('#spin');
      for (let i = 0; i < 10; i++) {
        await spinButton.click();
        await page.waitForTimeout(2500);
      }
      
      // 强制垃圾回收（如果可用）
      await page.evaluate(() => {
        if (window.gc) window.gc();
      });
      
      // 获取最终内存使用
      const finalMetrics = await page.metrics();
      const finalJSHeapSize = finalMetrics.JSHeapUsedSize;
      
      // 内存增长应小于 50MB
      const memoryGrowth = finalJSHeapSize - initialJSHeapSize;
      expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024);
    });
  });

  describe('4.2 异常场景容错', () => {
    test('快速连续点击不应导致错误', async () => {
      const spinButton = await page.$('#spin');
      
      // 快速连续点击 10 次
      for (let i = 0; i < 10; i++) {
        await spinButton.click();
      }
      
      // 等待一段时间
      await page.waitForTimeout(100);
      
      // 页面不应崩溃
      const slot = await page.$('#slot');
      expect(slot).not.toBeNull();
      
      // 控制台不应有错误
      const logs = await page.browser().pages().then(pages => {
        return pages[0].evaluate(() => {
          return window.consoleErrors || [];
        });
      });
      
      expect(logs.length).toBe(0);
    });

    test('网络中断后应能恢复', async () => {
      // 模拟网络离线
      await page.setOfflineMode(true);
      
      // 等待一段时间
      await page.waitForTimeout(500);
      
      // 恢复网络
      await page.setOfflineMode(false);
      
      // 游戏应仍然可用
      const slot = await page.$('#slot');
      expect(slot).not.toBeNull();
    });

    test('页面可见性变化不应影响游戏', async () => {
      const spinButton = await page.$('#spin');
      await spinButton.click();
      
      // 模拟页面隐藏
      await page.evaluate(() => {
        Object.defineProperty(document, 'visibilityState', {
          value: 'hidden',
          writable: true
        });
        document.dispatchEvent(new Event('visibilitychange'));
      });
      
      // 等待
      await page.waitForTimeout(500);
      
      // 模拟页面显示
      await page.evaluate(() => {
        Object.defineProperty(document, 'visibilityState', {
          value: 'visible',
          writable: true
        });
        document.dispatchEvent(new Event('visibilitychange'));
      });
      
      // 游戏应仍然正常
      const slot = await page.$('#slot');
      expect(slot).not.toBeNull();
    });

    test('窗口大小改变不应导致布局错误', async () => {
      // 多次改变窗口大小
      const sizes = [
        { width: 1920, height: 1080 },
        { width: 1024, height: 768 },
        { width: 768, height: 1024 },
        { width: 375, height: 667 },
        { width: 1920, height: 1080 }
      ];
      
      for (const size of sizes) {
        await page.setViewport(size);
        await page.waitForTimeout(100);
      }
      
      // 检查布局是否正常
      const reels = await page.$$('.reel');
      expect(reels.length).toBe(5);
      
      // 检查转轴是否可见
      const isVisible = await page.evaluate(() => {
        const firstReel = document.querySelector('.reel');
        const rect = firstReel.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      });
      
      expect(isVisible).toBe(true);
    });

    test('控制台错误应在可接受范围内', async () => {
      const errors = [];
      
      page.on('pageerror', error => {
        errors.push(error.message);
      });
      
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      // 进行一些操作
      const spinButton = await page.$('#spin');
      for (let i = 0; i < 5; i++) {
        await spinButton.click();
        await page.waitForTimeout(2500);
      }
      
      // 错误数量应为 0
      expect(errors.length).toBe(0);
    });
  });
});
