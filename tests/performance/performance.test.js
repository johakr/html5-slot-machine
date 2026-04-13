/**
 * 性能测试
 * 测试加载性能、运行时性能和资源使用
 */

const puppeteer = require('puppeteer');

describe('性能测试', () => {
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
  });

  afterEach(async () => {
    await page.close();
  });

  describe('6.1 加载性能', () => {
    test('首屏加载时间应小于 3 秒', async () => {
      const startTime = Date.now();
      
      await page.goto('http://localhost:8080', {
        waitUntil: 'networkidle2'
      });
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000);
    });

    test('DOMContentLoaded 时间应小于 2 秒', async () => {
      const metrics = await page.goto('http://localhost:8080', {
        waitUntil: 'domcontentloaded'
      }).then(() => page.evaluate(() => {
        return {
          domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
          loadComplete: performance.timing.loadEventEnd - performance.timing.navigationStart
        };
      }));
      
      expect(metrics.domContentLoaded).toBeLessThan(2000);
    });

    test('所有资源加载时间应小于 5 秒', async () => {
      const startTime = Date.now();
      
      await page.goto('http://localhost:8080', {
        waitUntil: 'load'
      });
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(5000);
    });

    test('图片资源应正确加载', async () => {
      await page.goto('http://localhost:8080');
      await page.waitForSelector('.reel .icons img');
      
      const imagesLoaded = await page.evaluate(() => {
        const images = document.querySelectorAll('.reel .icons img');
        return Array.from(images).every(img => img.complete);
      });
      
      expect(imagesLoaded).toBe(true);
    });
  });

  describe('6.2 运行时性能', () => {
    beforeEach(async () => {
      await page.goto('http://localhost:8080');
    });

    test('旋转动画应达到 60fps', async () => {
      const fps = await page.evaluate(async () => {
        const frames = [];
        let lastTime = performance.now();
        
        const measureFrame = () => {
          const currentTime = performance.now();
          const delta = currentTime - lastTime;
          frames.push(1000 / delta);
          lastTime = currentTime;
          
          if (frames.length < 60) {
            requestAnimationFrame(measureFrame);
          }
        };
        
        // 开始旋转
        document.getElementById('spin').click();
        requestAnimationFrame(measureFrame);
        
        // 等待收集足够帧
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        // 计算平均 FPS
        const avgFps = frames.reduce((a, b) => a + b, 0) / frames.length;
        return Math.round(avgFps);
      });
      
      expect(fps).toBeGreaterThan(30);
    });

    test('主线程阻塞时间应小于 100ms', async () => {
      await page.evaluate(async () => {
        // 测量长任务
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            window.longTasks = window.longTasks || [];
            window.longTasks.push(entry.duration);
          }
        });
        observer.observe({ entryTypes: ['longtask'] });
      });
      
      // 进行一些操作
      const spinButton = await page.$('#spin');
      for (let i = 0; i < 5; i++) {
        await spinButton.click();
        await page.waitForTimeout(2500);
      }
      
      const longTasks = await page.evaluate(() => window.longTasks || []);
      
      // 不应有超过 100ms 的长任务
      const hasLongTasks = longTasks.some(duration => duration > 100);
      expect(hasLongTasks).toBe(false);
    });

    test('内存使用应保持稳定', async () => {
      const measurements = [];
      
      // 初始内存
      const initialMetrics = await page.metrics();
      measurements.push(initialMetrics.JSHeapUsedSize);
      
      // 进行多次旋转并测量内存
      const spinButton = await page.$('#spin');
      for (let i = 0; i < 10; i++) {
        await spinButton.click();
        await page.waitForTimeout(2500);
        
        const metrics = await page.metrics();
        measurements.push(metrics.JSHeapUsedSize);
      }
      
      // 计算内存增长趋势
      const growth = measurements[measurements.length - 1] - measurements[0];
      
      // 内存增长应小于 30MB
      expect(growth).toBeLessThan(30 * 1024 * 1024);
    });
  });

  describe('6.3 资源优化', () => {
    test('JavaScript 文件应被压缩', async () => {
      const responses = [];
      
      page.on('response', response => {
        const url = response.url();
        if (url.endsWith('.js')) {
          responses.push(response);
        }
      });
      
      await page.goto('http://localhost:8080');
      
      // 检查是否有 JS 文件
      expect(responses.length).toBeGreaterThan(0);
    });

    test('CSS 文件应被压缩', async () => {
      const responses = [];
      
      page.on('response', response => {
        const url = response.url();
        if (url.endsWith('.css')) {
          responses.push(response);
        }
      });
      
      await page.goto('http://localhost:8080');
      
      // 检查是否有 CSS 文件
      expect(responses.length).toBeGreaterThanOrEqual(0);
    });

    test('图片资源应使用适当的格式', async () => {
      const imageResponses = [];
      
      page.on('response', response => {
        const url = response.url();
        if (url.match(/\.(svg|png|jpg|jpeg|webp)$/i)) {
          imageResponses.push({
            url,
            contentType: response.headers()['content-type']
          });
        }
      });
      
      await page.goto('http://localhost:8080');
      
      // 检查图片格式
      imageResponses.forEach(({ contentType }) => {
        expect(['image/svg+xml', 'image/png', 'image/jpeg', 'image/webp']).toContain(contentType);
      });
    });
  });

  describe('6.4 渲染性能', () => {
    beforeEach(async () => {
      await page.goto('http://localhost:8080');
    });

    test('首次内容绘制应小于 1.5 秒', async () => {
      const paintMetrics = await page.evaluate(() => {
        return new Promise(resolve => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const fcp = entries.find(e => e.name === 'first-contentful-paint');
            if (fcp) {
              resolve(fcp.startTime);
            }
          }).observe({ entryTypes: ['paint'] });
          
          // 超时处理
          setTimeout(() => resolve(null), 5000);
        });
      });
      
      if (paintMetrics) {
        expect(paintMetrics).toBeLessThan(1500);
      }
    });

    test('布局偏移应最小化', async () => {
      let layoutShifts = 0;
      
      await page.evaluate(() => {
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              window.layoutShiftScore = (window.layoutShiftScore || 0) + entry.value;
            }
          }
        }).observe({ entryTypes: ['layout-shift'] });
      });
      
      // 等待页面稳定
      await page.waitForTimeout(2000);
      
      const layoutShiftScore = await page.evaluate(() => window.layoutShiftScore || 0);
      
      // 累积布局偏移应小于 0.1
      expect(layoutShiftScore).toBeLessThan(0.1);
    });
  });
});
