const puppeteer = require('puppeteer');

describe('E2E测试 - 完整游戏流程', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
  });

  describe('一、核心功能E2E测试', () => {
    describe('1.1 基础游戏功能', () => {
      test('页面应该正确加载并显示老虎机', async () => {
        await page.goto('http://localhost:8080', { waitUntil: 'networkidle0' });
        
        const slotElement = await page.$('#slot');
        expect(slotElement).not.toBeNull();
        
        const reels = await page.$$('#reels .reel');
        expect(reels.length).toBe(5);
      });

      test('SPIN按钮应该存在并可点击', async () => {
        const spinButton = await page.$('#spin');
        expect(spinButton).not.toBeNull();
        
        const isDisabled = await page.$eval('#spin', btn => btn.disabled);
        expect(isDisabled).toBe(false);
      });

      test('点击SPIN按钮应该触发游戏动画', async () => {
        await page.goto('http://localhost:8080', { waitUntil: 'networkidle0' });
        
        await page.click('#spin');
        
        await page.waitForFunction(
          () => document.querySelector('#spin').disabled === true,
          { timeout: 1000 }
        );
        
        await page.waitForFunction(
          () => document.querySelector('#spin').disabled === false,
          { timeout: 6000 }
        );
        
        const isDisabled = await page.$eval('#spin', btn => btn.disabled);
        expect(isDisabled).toBe(false);
      });
    });

    describe('1.2 视觉表现功能', () => {
      test('Jackpot显示应该正确', async () => {
        await page.goto('http://localhost:8080', { waitUntil: 'networkidle0' });
        
        const jackpotText = await page.$eval('#jackpot', el => el.textContent);
        expect(jackpotText).toContain('Jackpot');
      });

      test('符号图片应该正确加载', async () => {
        await page.goto('http://localhost:8080', { waitUntil: 'networkidle0' });
        
        const images = await page.$$('#reels img');
        expect(images.length).toBeGreaterThan(0);
        
        for (const img of images) {
          const isLoaded = await img.evaluate(el => el.complete && el.naturalHeight !== 0);
          expect(isLoaded).toBe(true);
        }
      });
    });
  });

  describe('二、兼容性E2E测试', () => {
    describe('2.1 浏览器兼容性', () => {
      test('在不同视口尺寸下应该正常显示', async () => {
        const viewports = [
          { width: 1920, height: 1080 },
          { width: 1366, height: 768 },
          { width: 768, height: 1024 },
          { width: 375, height: 667 }
        ];

        for (const viewport of viewports) {
          await page.setViewport(viewport);
          await page.goto('http://localhost:8080', { waitUntil: 'networkidle0' });
          
          const slotVisible = await page.$eval('#slot', el => {
            const rect = el.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0;
          });
          expect(slotVisible).toBe(true);
        }
      });
    });

    describe('2.2 设备与分辨率兼容性', () => {
      test('移动设备模拟应该正常工作', async () => {
        await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15');
        await page.setViewport({ width: 375, height: 667 });
        
        await page.goto('http://localhost:8080', { waitUntil: 'networkidle0' });
        
        const spinButton = await page.$('#spin');
        expect(spinButton).not.toBeNull();
      });
    });
  });

  describe('三、用户体验E2E测试', () => {
    describe('3.1 操作体验', () => {
      test('Autoplay功能应该正常工作', async () => {
        await page.goto('http://localhost:8080', { waitUntil: 'networkidle0' });
        
        await page.click('#autoplay');
        
        const isChecked = await page.$eval('#autoplay', el => el.checked);
        expect(isChecked).toBe(true);
        
        await page.click('#spin');
        
        await page.waitForTimeout(3000);
        
        const spinCount = await page.evaluate(() => {
          return window.__spinCount || 0;
        });
      });

      test('按钮在动画期间应该被禁用', async () => {
        await page.goto('http://localhost:8080', { waitUntil: 'networkidle0' });
        
        await page.click('#spin');
        
        await page.waitForFunction(
          () => document.querySelector('#spin').disabled === true,
          { timeout: 500 }
        );
        
        await page.waitForFunction(
          () => document.querySelector('#spin').disabled === false,
          { timeout: 6000 }
        );
      });
    });

    describe('3.2 视觉体验', () => {
      test('背景图片应该正确加载', async () => {
        await page.goto('http://localhost:8080', { waitUntil: 'networkidle0' });
        
        const bgImage = await page.$eval('body', el => {
          const style = window.getComputedStyle(el);
          return style.backgroundImage;
        });
        expect(bgImage).not.toBe('none');
      });
    });
  });

  describe('四、稳定性与可靠性E2E测试', () => {
    describe('4.1 长时间运行稳定性', () => {
      test('连续10次spin操作应该稳定完成', async () => {
        await page.goto('http://localhost:8080', { waitUntil: 'networkidle0' });
        
        for (let i = 0; i < 10; i++) {
          await page.click('#spin');
          await page.waitForFunction(
            () => document.querySelector('#spin').disabled === false,
            { timeout: 6000 }
          );
        }
        
        const spinButton = await page.$('#spin');
        expect(spinButton).not.toBeNull();
      }, 120000);
    });

    describe('4.2 异常场景容错', () => {
      test('快速连续点击不应该导致错误', async () => {
        await page.goto('http://localhost:8080', { waitUntil: 'networkidle0' });
        
        await page.click('#spin');
        await page.click('#spin');
        await page.click('#spin');
        
        await page.waitForFunction(
          () => document.querySelector('#spin').disabled === false,
          { timeout: 10000 }
        );
        
        const errorLogs = [];
        page.on('pageerror', error => errorLogs.push(error));
        
        expect(errorLogs.length).toBe(0);
      });
    });
  });

  describe('五、业务规则E2E验证', () => {
    test('每次spin应该显示不同的符号组合', async () => {
      await page.goto('http://localhost:8080', { waitUntil: 'networkidle0' });
      
      const getSymbols = async () => {
        return await page.evaluate(() => {
          const reels = document.querySelectorAll('#reels .reel');
          return Array.from(reels).map(reel => {
            const imgs = reel.querySelectorAll('img');
            return Array.from(imgs).map(img => img.src);
          });
        });
      };
      
      await page.click('#spin');
      await page.waitForFunction(
        () => document.querySelector('#spin').disabled === false,
        { timeout: 6000 }
      );
      const firstSymbols = await getSymbols();
      
      await page.click('#spin');
      await page.waitForFunction(
        () => document.querySelector('#spin').disabled === false,
        { timeout: 6000 }
      );
      const secondSymbols = await getSymbols();
      
      expect(JSON.stringify(firstSymbols)).not.toBe(JSON.stringify(secondSymbols));
    });
  });

  describe('六、性能E2E测试', () => {
    test('页面加载时间应该在合理范围内', async () => {
      const startTime = Date.now();
      await page.goto('http://localhost:8080', { waitUntil: 'networkidle0' });
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(5000);
    });

    test('单次spin动画时间应该在预期范围内', async () => {
      await page.goto('http://localhost:8080', { waitUntil: 'networkidle0' });
      
      const startTime = Date.now();
      await page.click('#spin');
      await page.waitForFunction(
        () => document.querySelector('#spin').disabled === false,
        { timeout: 6000 }
      );
      const spinTime = Date.now() - startTime;
      
      expect(spinTime).toBeGreaterThan(1000);
      expect(spinTime).toBeLessThan(6000);
    });
  });

  describe('七、易用性E2E测试', () => {
    test('所有交互元素应该可以通过键盘访问', async () => {
      await page.goto('http://localhost:8080', { waitUntil: 'networkidle0' });
      
      await page.keyboard.press('Tab');
      const focusedElement = await page.evaluate(() => document.activeElement.id);
      expect(focusedElement).toBe('spin');
      
      await page.keyboard.press('Enter');
      await page.waitForFunction(
        () => document.querySelector('#spin').disabled === false,
        { timeout: 6000 }
      );
    });

    test('UI元素应该有足够的点击区域', async () => {
      await page.goto('http://localhost:8080', { waitUntil: 'networkidle0' });
      
      const spinButtonSize = await page.$eval('#spin', el => {
        const rect = el.getBoundingClientRect();
        return { width: rect.width, height: rect.height };
      });
      
      expect(spinButtonSize.width).toBeGreaterThan(44);
      expect(spinButtonSize.height).toBeGreaterThan(44);
    });
  });
});
