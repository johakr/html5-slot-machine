/**
 * 用户体验测试
 * 测试操作体验和视觉体验
 */

const puppeteer = require('puppeteer');

describe('用户体验测试', () => {
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

  describe('3.1 操作体验', () => {
    test('SPIN 按钮应有良好的点击区域', async () => {
      const spinButton = await page.$('#spin');
      const box = await spinButton.boundingBox();
      
      // 按钮尺寸应足够大以便点击
      expect(box.width).toBeGreaterThan(80);
      expect(box.height).toBeGreaterThan(30);
    });

    test('自动播放复选框应易于点击', async () => {
      const checkbox = await page.$('#autoplay');
      const box = await checkbox.boundingBox();
      
      // 复选框尺寸应符合可访问性标准
      expect(box.width).toBeGreaterThanOrEqual(40);
      expect(box.height).toBeGreaterThanOrEqual(40);
    });

    test('按钮在悬停时应有视觉反馈', async () => {
      const spinButton = await page.$('#spin');
      
      // 获取默认样式
      const defaultStyle = await spinButton.evaluate(el => {
        return window.getComputedStyle(el).cursor;
      });
      
      expect(defaultStyle).toBe('pointer');
    });

    test('旋转过程中应显示加载状态', async () => {
      const spinButton = await page.$('#spin');
      await spinButton.click();
      
      // 检查按钮是否被禁用
      const isDisabled = await page.evaluate(() => {
        return document.getElementById('spin').disabled;
      });
      
      expect(isDisabled).toBe(true);
    });

    test('键盘导航应正常工作', async () => {
      // 聚焦到 SPIN 按钮
      await page.focus('#spin');
      
      // 按 Enter 键
      await page.keyboard.press('Enter');
      
      // 检查旋转是否开始
      const isDisabled = await page.evaluate(() => {
        return document.getElementById('spin').disabled;
      });
      
      expect(isDisabled).toBe(true);
    });

    test('Tab 键导航顺序应合理', async () => {
      // 按 Tab 键
      await page.keyboard.press('Tab');
      
      const activeElement = await page.evaluate(() => {
        return document.activeElement.id;
      });
      
      // 第一个可聚焦元素应该是 SPIN 按钮或自动播放复选框
      expect(['spin', 'autoplay']).toContain(activeElement);
    });
  });

  describe('3.2 视觉体验', () => {
    test('游戏界面应有良好的对比度', async () => {
      const jackpot = await page.$('#jackpot');
      const styles = await jackpot.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          color: computed.color,
          fontSize: computed.fontSize
        };
      });
      
      // 字体大小应足够大
      const fontSize = parseInt(styles.fontSize);
      expect(fontSize).toBeGreaterThanOrEqual(24);
    });

    test('转轴应有清晰的边界', async () => {
      const reel = await page.$('.reel');
      const styles = await reel.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          overflow: computed.overflow,
          position: computed.position
        };
      });
      
      expect(styles.overflow).toBe('hidden');
      expect(styles.position).toBe('relative');
    });

    test('符号图片应正确显示', async () => {
      const images = await page.$$('.reel .icons img');
      expect(images.length).toBeGreaterThan(0);
      
      // 检查图片是否加载成功
      for (const img of images) {
        const isLoaded = await img.evaluate(el => el.complete);
        expect(isLoaded).toBe(true);
      }
    });

    test('动画应流畅无卡顿', async () => {
      const spinButton = await page.$('#spin');
      
      // 测量动画期间的帧率
      const frameCount = await page.evaluate(async () => {
        let frames = 0;
        const startTime = performance.now();
        
        const countFrame = () => {
          frames++;
          if (performance.now() - startTime < 1000) {
            requestAnimationFrame(countFrame);
          }
        };
        
        requestAnimationFrame(countFrame);
        
        // 开始旋转
        document.getElementById('spin').click();
        
        // 等待 1 秒
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return frames;
      });
      
      // 帧率应大于 30fps
      expect(frameCount).toBeGreaterThan(30);
    });

    test('颜色方案应一致', async () => {
      const jackpot = await page.$('#jackpot');
      const color = await jackpot.evaluate(el => {
        return window.getComputedStyle(el).color;
      });
      
      // Jackpot 颜色应为金色系
      expect(color).toContain('rgb(213, 173, 109)');
    });
  });

  describe('7. 易用性测试', () => {
    test('界面元素应有适当的间距', async () => {
      const controls = await page.$('#controls');
      const styles = await controls.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          padding: computed.padding,
          height: computed.height
        };
      });
      
      // 控制栏高度应合理
      const height = parseInt(styles.height);
      expect(height).toBeGreaterThanOrEqual(50);
    });

    test('文字应清晰可读', async () => {
      const body = await page.$('body');
      const fontSize = await body.evaluate(el => {
        return parseInt(window.getComputedStyle(el).fontSize);
      });
      
      // 基础字体大小应至少 16px
      expect(fontSize).toBeGreaterThanOrEqual(16);
    });

    test('交互元素应有足够的间距', async () => {
      const spinButton = await page.$('#spin');
      const autoPlayLabel = await page.$('label');
      
      const buttonBox = await spinButton.boundingBox();
      const labelBox = await autoPlayLabel.boundingBox();
      
      // 计算元素之间的距离
      const distance = Math.abs(buttonBox.x - labelBox.x);
      expect(distance).toBeGreaterThan(20);
    });
  });
});
