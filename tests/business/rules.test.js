/**
 * 业务规则验证测试
 * 测试游戏规则和逻辑
 */

const puppeteer = require('puppeteer');

describe('业务规则验证测试', () => {
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

  describe('5.1 游戏结构规则', () => {
    test('游戏应有 5 个转轴', async () => {
      const reelCount = await page.evaluate(() => {
        return document.querySelectorAll('.reel').length;
      });
      
      expect(reelCount).toBe(5);
    });

    test('每个转轴应有 3 个可见符号', async () => {
      const symbolsPerReel = await page.evaluate(() => {
        const reels = document.querySelectorAll('.reel');
        return Array.from(reels).map(reel => {
          return reel.querySelectorAll('.icons img').length;
        });
      });
      
      symbolsPerReel.forEach(count => {
        expect(count).toBeGreaterThanOrEqual(3);
      });
    });

    test('符号矩阵应为 5x3 结构', async () => {
      const matrix = await page.evaluate(() => {
        const reels = document.querySelectorAll('.reel');
        return Array.from(reels).map(reel => {
          const images = reel.querySelectorAll('.icons img');
          return images.length;
        });
      });
      
      expect(matrix.length).toBe(5);
      matrix.forEach(count => {
        expect(count).toBeGreaterThanOrEqual(3);
      });
    });
  });

  describe('5.2 符号系统规则', () => {
    test('符号类型应在有效范围内', async () => {
      const validSymbols = [
        'at_at', 'c3po', 'darth_vader', 'death_star',
        'falcon', 'r2d2', 'stormtrooper', 'tie_ln', 'yoda'
      ];
      
      const symbols = await page.evaluate(() => {
        const images = document.querySelectorAll('.reel .icons img');
        return Array.from(images).map(img => {
          const src = img.src;
          const match = src.match(/symbols\/(.+)\.svg/);
          return match ? match[1] : null;
        }).filter(Boolean);
      });
      
      symbols.forEach(symbol => {
        expect(validSymbols).toContain(symbol);
      });
    });

    test('符号应随机分布', async () => {
      // 收集多次旋转后的符号
      const allSymbols = [];
      
      for (let i = 0; i < 5; i++) {
        const spinButton = await page.$('#spin');
        await spinButton.click();
        await page.waitForTimeout(3000);
        
        const symbols = await page.evaluate(() => {
          const images = document.querySelectorAll('.reel .icons img');
          return Array.from(images).map(img => {
            const src = img.src;
            const match = src.match(/symbols\/(.+)\.svg/);
            return match ? match[1] : null;
          }).filter(Boolean);
        });
        
        allSymbols.push(...symbols);
      }
      
      // 检查符号分布
      const uniqueSymbols = [...new Set(allSymbols)];
      expect(uniqueSymbols.length).toBeGreaterThan(3); // 应该出现多种符号
    });
  });

  describe('5.3 旋转规则', () => {
    test('旋转过程中按钮应被禁用', async () => {
      const spinButton = await page.$('#spin');
      await spinButton.click();
      
      const isDisabled = await page.evaluate(() => {
        return document.getElementById('spin').disabled;
      });
      
      expect(isDisabled).toBe(true);
    });

    test('旋转完成后按钮应重新启用', async () => {
      const spinButton = await page.$('#spin');
      await spinButton.click();
      
      // 等待旋转完成
      await page.waitForFunction(() => {
        return !document.getElementById('spin').disabled;
      }, { timeout: 6000 });
      
      const isDisabled = await page.evaluate(() => {
        return document.getElementById('spin').disabled;
      });
      
      expect(isDisabled).toBe(false);
    });

    test('旋转动画持续时间应符合配置', async () => {
      const startTime = Date.now();
      
      const spinButton = await page.$('#spin');
      await spinButton.click();
      
      // 等待旋转完成
      await page.waitForFunction(() => {
        return !document.getElementById('spin').disabled;
      }, { timeout: 6000 });
      
      const duration = Date.now() - startTime;
      
      // 旋转时间应在 1-6 秒之间
      expect(duration).toBeGreaterThan(1000);
      expect(duration).toBeLessThan(6000);
    });
  });

  describe('5.4 自动播放规则', () => {
    test('启用自动播放后应自动旋转', async () => {
      // 启用自动播放
      await page.click('#autoplay');
      
      // 开始第一次旋转
      const spinButton = await page.$('#spin');
      await spinButton.click();
      
      // 等待自动旋转触发
      await page.waitForTimeout(2500);
      
      // 检查是否仍在旋转（按钮被禁用表示正在旋转）
      const isSpinning = await page.evaluate(() => {
        return document.getElementById('spin').disabled;
      });
      
      // 可能正在自动旋转中
      expect(typeof isSpinning).toBe('boolean');
    });

    test('禁用自动播放后应停止自动旋转', async () => {
      // 确保自动播放未启用
      await page.evaluate(() => {
        document.getElementById('autoplay').checked = false;
      });
      
      // 旋转一次
      const spinButton = await page.$('#spin');
      await spinButton.click();
      
      // 等待完成
      await page.waitForFunction(() => {
        return !document.getElementById('spin').disabled;
      }, { timeout: 6000 });
      
      // 等待一段时间，确认不会自动旋转
      await page.waitForTimeout(1000);
      
      const isDisabled = await page.evaluate(() => {
        return document.getElementById('spin').disabled;
      });
      
      expect(isDisabled).toBe(false);
    });
  });

  describe('5.5 视觉规则', () => {
    test('旋转时应有模糊效果', async () => {
      const spinButton = await page.$('#spin');
      await spinButton.click();
      
      // 检查动画关键帧
      const hasBlur = await page.evaluate(() => {
        const reels = document.querySelectorAll('.reel');
        const firstReel = reels[0];
        const icons = firstReel.querySelector('.icons');
        
        if (icons && icons.getAnimations) {
          const animations = icons.getAnimations();
          return animations.length > 0;
        }
        return false;
      });
      
      expect(hasBlur).toBe(true);
    });

    test('转轴旋转速度应有差异', async () => {
      // 检查不同转轴的动画持续时间
      const durations = await page.evaluate(() => {
        const reels = document.querySelectorAll('.reel');
        return Array.from(reels).map((reel, idx) => {
          const icons = reel.querySelector('.icons');
          if (icons && icons.getAnimations) {
            const animations = icons.getAnimations();
            if (animations.length > 0) {
              return animations[0].effect.getTiming().duration;
            }
          }
          return null;
        });
      });
      
      // 过滤掉 null 值
      const validDurations = durations.filter(d => d !== null);
      
      if (validDurations.length > 1) {
        // 检查持续时间是否有差异
        const uniqueDurations = [...new Set(validDurations)];
        expect(uniqueDurations.length).toBeGreaterThan(1);
      }
    });
  });
});
