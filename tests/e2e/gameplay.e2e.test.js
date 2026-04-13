/**
 * 端到端游戏测试
 * 使用 Puppeteer 进行真实浏览器测试
 */

const puppeteer = require('puppeteer');

describe('游戏端到端测试', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    page = await browser.newPage();
    await page.goto('http://localhost:8080');
  });

  afterAll(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    // 刷新页面以重置游戏状态
    await page.reload();
    await page.waitForSelector('#slot');
  });

  describe('1.1 基础游戏功能', () => {
    test('页面应正确加载游戏', async () => {
      const slot = await page.$('#slot');
      expect(slot).not.toBeNull();
    });

    test('应显示 5 个转轴', async () => {
      const reels = await page.$$('.reel');
      expect(reels.length).toBe(5);
    });

    test('应显示 SPIN 按钮', async () => {
      const spinButton = await page.$('#spin');
      expect(spinButton).not.toBeNull();
    });

    test('应显示 Jackpot', async () => {
      const jackpot = await page.$('#jackpot');
      expect(jackpot).not.toBeNull();
      
      const jackpotText = await page.evaluate(() => {
        return document.getElementById('jackpot').textContent;
      });
      expect(jackpotText).toContain('Jackpot');
    });

    test('点击 SPIN 按钮应开始旋转', async () => {
      const spinButton = await page.$('#spin');
      
      // 点击 SPIN 按钮
      await spinButton.click();
      
      // 检查按钮是否被禁用
      const isDisabled = await page.evaluate(() => {
        return document.getElementById('spin').disabled;
      });
      
      expect(isDisabled).toBe(true);
    });

    test('旋转结束后按钮应重新启用', async () => {
      const spinButton = await page.$('#spin');
      await spinButton.click();
      
      // 等待旋转完成（最长 6 秒）
      await page.waitForFunction(() => {
        return !document.getElementById('spin').disabled;
      }, { timeout: 6000 });
      
      const isDisabled = await page.evaluate(() => {
        return document.getElementById('spin').disabled;
      });
      
      expect(isDisabled).toBe(false);
    });
  });

  describe('1.2 视觉表现功能', () => {
    test('转轴应有正确的样式', async () => {
      const reel = await page.$('.reel');
      const styles = await reel.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          overflow: computed.overflow,
          width: computed.width,
          height: computed.height
        };
      });
      
      expect(styles.overflow).toBe('hidden');
      expect(styles.width).toBe('20%');
    });

    test('背景图片应正确加载', async () => {
      const bodyStyles = await page.evaluate(() => {
        const computed = window.getComputedStyle(document.body);
        return {
          backgroundImage: computed.backgroundImage
        };
      });
      
      expect(bodyStyles.backgroundImage).toContain('bg');
    });
  });

  describe('2.1 浏览器兼容性', () => {
    test('页面应在不同视口大小下正确显示', async () => {
      // 测试桌面视图
      await page.setViewport({ width: 1920, height: 1080 });
      const slotDesktop = await page.$('#slot');
      expect(slotDesktop).not.toBeNull();
      
      // 测试平板视图
      await page.setViewport({ width: 768, height: 1024 });
      const slotTablet = await page.$('#slot');
      expect(slotTablet).not.toBeNull();
      
      // 测试手机视图
      await page.setViewport({ width: 375, height: 667 });
      const slotMobile = await page.$('#slot');
      expect(slotMobile).not.toBeNull();
    });
  });

  describe('3.1 操作体验', () => {
    test('自动播放功能应正常工作', async () => {
      // 启用自动播放
      await page.click('#autoplay');
      
      const isChecked = await page.evaluate(() => {
        return document.getElementById('autoplay').checked;
      });
      
      expect(isChecked).toBe(true);
    });

    test('连续点击 SPIN 按钮不应导致错误', async () => {
      const spinButton = await page.$('#spin');
      
      // 快速连续点击
      await spinButton.click();
      await spinButton.click();
      await spinButton.click();
      
      // 等待页面稳定
      await page.waitForTimeout(100);
      
      // 页面不应崩溃
      const slot = await page.$('#slot');
      expect(slot).not.toBeNull();
    });
  });

  describe('4.1 长时间运行稳定性', () => {
    test('多次旋转后游戏应保持稳定', async () => {
      const spinButton = await page.$('#spin');
      
      // 进行 5 次旋转
      for (let i = 0; i < 5; i++) {
        await spinButton.click();
        await page.waitForTimeout(2500);
      }
      
      // 检查游戏是否仍然正常
      const slot = await page.$('#slot');
      expect(slot).not.toBeNull();
      
      const reels = await page.$$('.reel');
      expect(reels.length).toBe(5);
    });
  });

  describe('6. 性能测试', () => {
    test('页面加载时间应小于 3 秒', async () => {
      const startTime = Date.now();
      await page.reload();
      await page.waitForSelector('#slot');
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(3000);
    });

    test('旋转动画应流畅运行', async () => {
      const spinButton = await page.$('#spin');
      
      // 记录 FPS
      const fps = await page.evaluate(async () => {
        let frames = 0;
        const startTime = performance.now();
        
        const countFrames = () => {
          frames++;
          if (performance.now() - startTime < 1000) {
            requestAnimationFrame(countFrames);
          }
        };
        
        requestAnimationFrame(countFrames);
        
        // 开始旋转
        document.getElementById('spin').click();
        
        // 等待 1 秒
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return frames;
      });
      
      // FPS 应大于 30
      expect(fps).toBeGreaterThan(30);
    });
  });
});
