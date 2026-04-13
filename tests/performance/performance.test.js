import Slot from '../../src/js/Slot.js';
import Symbol from '../../src/js/Symbol.js';
import Reel from '../../src/js/Reel.js';
import { setupSlotDOM, setupSingleReelDOM, setupSimpleSlotDOM } from '../fixtures/htmlFixtures.js';

describe('性能测试套件', () => {
  let container;

  beforeEach(() => {
    container = setupSlotDOM();
  });

  describe('六、性能测试', () => {
    describe('6.1 Symbol性能测试', () => {
      test('Symbol创建性能 - 应该在100ms内创建1000个实例', () => {
        const startTime = performance.now();
        
        for (let i = 0; i < 1000; i++) {
          new Symbol(Symbol.random());
        }
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        console.log(`创建1000个Symbol实例耗时: ${duration.toFixed(2)}ms`);
        expect(duration).toBeLessThan(100);
      });

      test('Symbol缓存效果测试', () => {
        const withoutCache = [];
        const withCache = [];
        
        Symbol.preload();
        
        const start1 = performance.now();
        for (let i = 0; i < 1000; i++) {
          withoutCache.push(new Symbol('yoda'));
        }
        const end1 = performance.now();
        
        const start2 = performance.now();
        for (let i = 0; i < 1000; i++) {
          withCache.push(new Symbol('yoda'));
        }
        const end2 = performance.now();
        
        const time1 = end1 - start1;
        const time2 = end2 - start2;
        
        console.log(`首次创建1000个Symbol: ${time1.toFixed(2)}ms`);
        console.log(`缓存后创建1000个Symbol: ${time2.toFixed(2)}ms`);
        
        expect(time2).toBeLessThanOrEqual(time1);
      });

      test('Symbol.random()性能测试', () => {
        const startTime = performance.now();
        
        for (let i = 0; i < 10000; i++) {
          Symbol.random();
        }
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        console.log(`调用random() 10000次耗时: ${duration.toFixed(2)}ms`);
        expect(duration).toBeLessThan(50);
      });
    });

    describe('6.2 Reel性能测试', () => {
      test('Reel创建性能测试', () => {
        const reelContainer = document.createElement('div');
        const symbols = ['yoda', 'r2d2', 'falcon'];
        
        const startTime = performance.now();
        
        for (let i = 0; i < 100; i++) {
          new Reel(document.createElement('div'), i % 5, symbols);
        }
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        console.log(`创建100个Reel实例耗时: ${duration.toFixed(2)}ms`);
        expect(duration).toBeLessThan(500);
      });

      test('Reel spin性能测试', async () => {
        const reelContainer = setupSingleReelDOM();
        const reel = new Reel(reelContainer, 0, ['yoda', 'r2d2', 'falcon']);
        
        const spinTimes = [];
        
        for (let i = 0; i < 10; i++) {
          const startTime = performance.now();
          reel.renderSymbols([Symbol.random(), Symbol.random(), Symbol.random()]);
          await reel.spin();
          const endTime = performance.now();
          spinTimes.push(endTime - startTime);
        }
        
        const avgTime = spinTimes.reduce((a, b) => a + b, 0) / spinTimes.length;
        const maxTime = Math.max(...spinTimes);
        const minTime = Math.min(...spinTimes);
        
        console.log(`Reel spin平均耗时: ${avgTime.toFixed(2)}ms`);
        console.log(`Reel spin最大耗时: ${maxTime.toFixed(2)}ms`);
        console.log(`Reel spin最小耗时: ${minTime.toFixed(2)}ms`);
        
        expect(avgTime).toBeLessThan(1500);
      });

      test('renderSymbols性能测试', () => {
        const reelContainer = setupSingleReelDOM();
        const reel = new Reel(reelContainer, 0, ['yoda', 'r2d2', 'falcon']);
        
        const startTime = performance.now();
        
        for (let i = 0; i < 100; i++) {
          reel.renderSymbols([Symbol.random(), Symbol.random(), Symbol.random()]);
        }
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        console.log(`renderSymbols调用100次耗时: ${duration.toFixed(2)}ms`);
        expect(duration).toBeLessThan(200);
      });
    });

    describe('6.3 Slot性能测试', () => {
      test('Slot初始化性能测试', () => {
        const times = [];
        
        for (let i = 0; i < 10; i++) {
          document.body.innerHTML = `
            <div id="slot">
              <div id="reels">
                <div class="reel"></div>
                <div class="reel"></div>
                <div class="reel"></div>
                <div class="reel"></div>
                <div class="reel"></div>
              </div>
              <div id="controls">
                <button type="button" id="spin">SPIN</button>
                <input type="checkbox" id="autoplay" />
              </div>
            </div>
          `;
          
          const startTime = performance.now();
          new Slot(document.getElementById('slot'));
          const endTime = performance.now();
          
          times.push(endTime - startTime);
        }
        
        const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
        console.log(`Slot初始化平均耗时: ${avgTime.toFixed(2)}ms`);
        expect(avgTime).toBeLessThan(100);
      });

      test('完整spin周期性能测试', async () => {
        const slot = new Slot(container);
        const spinTimes = [];
        
        for (let i = 0; i < 10; i++) {
          const startTime = performance.now();
          await slot.spin();
          const endTime = performance.now();
          spinTimes.push(endTime - startTime);
        }
        
        const avgTime = spinTimes.reduce((a, b) => a + b, 0) / spinTimes.length;
        const maxTime = Math.max(...spinTimes);
        const minTime = Math.min(...spinTimes);
        
        console.log(`完整spin周期平均耗时: ${avgTime.toFixed(2)}ms`);
        console.log(`完整spin周期最大耗时: ${maxTime.toFixed(2)}ms`);
        console.log(`完整spin周期最小耗时: ${minTime.toFixed(2)}ms`);
        
        expect(avgTime).toBeLessThan(6000);
        expect(maxTime).toBeLessThan(7000);
      });

      test('内存使用测试', async () => {
        const slot = new Slot(container);
        
        const initialMemory = process.memoryUsage();
        
        for (let i = 0; i < 100; i++) {
          await slot.spin();
        }
        
        const finalMemory = process.memoryUsage();
        const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
        
        console.log(`100次spin后内存增加: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
        expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
      });
    });

    describe('6.4 动画性能测试', () => {
      test('Web Animations API性能测试', () => {
        const element = document.createElement('div');
        document.body.appendChild(element);
        
        const startTime = performance.now();
        
        for (let i = 0; i < 100; i++) {
          const animation = element.animate([
            { top: '0px' },
            { top: '100px' }
          ], {
            duration: 1000,
            easing: 'ease-in-out'
          });
          animation.cancel();
        }
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        console.log(`创建100个动画实例耗时: ${duration.toFixed(2)}ms`);
        expect(duration).toBeLessThan(100);
      });

      test('并发动画性能测试', async () => {
        const elements = [];
        for (let i = 0; i < 5; i++) {
          const el = document.createElement('div');
          document.body.appendChild(el);
          elements.push(el);
        }
        
        const startTime = performance.now();
        
        const animations = elements.map(el => {
          const animation = el.animate([
            { top: '0px' },
            { top: '100px' }
          ], {
            duration: 1000,
            easing: 'ease-in-out'
          });
          
          return new Promise(resolve => {
            animation.onfinish = resolve;
          });
        });
        
        await Promise.all(animations);
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        console.log(`5个并发动画完成耗时: ${duration.toFixed(2)}ms`);
        expect(duration).toBeLessThan(1200);
      });
    });

    describe('6.5 DOM操作性能测试', () => {
      test('DOM元素创建性能测试', () => {
        const startTime = performance.now();
        
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < 1000; i++) {
          const img = document.createElement('img');
          img.src = 'test.svg';
          fragment.appendChild(img);
        }
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        console.log(`创建1000个DOM元素耗时: ${duration.toFixed(2)}ms`);
        expect(duration).toBeLessThan(50);
      });

      test('DOM查询性能测试', () => {
        const slot = new Slot(container);
        
        const startTime = performance.now();
        
        for (let i = 0; i < 1000; i++) {
          document.querySelectorAll('#reels .reel');
          document.getElementById('spin');
          document.getElementsByClassName('icons');
        }
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        console.log(`1000次DOM查询耗时: ${duration.toFixed(2)}ms`);
        expect(duration).toBeLessThan(100);
      });

      test('DOM更新性能测试', async () => {
        const slot = new Slot(container);
        
        const startTime = performance.now();
        
        for (let i = 0; i < 50; i++) {
          await slot.spin();
        }
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        console.log(`50次完整spin周期耗时: ${duration.toFixed(2)}ms`);
        console.log(`平均每次spin: ${(duration / 50).toFixed(2)}ms`);
        
        expect(duration).toBeLessThan(300000);
      });
    });

    describe('6.6 压力测试', () => {
      test('高频率spin操作压力测试', async () => {
        const slot = new Slot(container);
        const errors = [];
        
        const spinPromises = [];
        for (let i = 0; i < 20; i++) {
          spinPromises.push(
            slot.spin().catch(err => {
              errors.push(err);
              return null;
            })
          );
        }
        
        await Promise.allSettled(spinPromises);
        
        console.log(`压力测试完成，错误数: ${errors.length}`);
        expect(errors.length).toBe(0);
      }, 120000);

      test('长时间运行稳定性测试', async () => {
        const slot = new Slot(container);
        const results = [];
        
        for (let i = 0; i < 100; i++) {
          const startTime = performance.now();
          await slot.spin();
          const endTime = performance.now();
          results.push(endTime - startTime);
        }
        
        const avgTime = results.reduce((a, b) => a + b, 0) / results.length;
        const variance = results.reduce((sum, time) => sum + Math.pow(time - avgTime, 2), 0) / results.length;
        const stdDev = Math.sqrt(variance);
        
        console.log(`100次spin平均耗时: ${avgTime.toFixed(2)}ms`);
        console.log(`标准差: ${stdDev.toFixed(2)}ms`);
        
        expect(stdDev).toBeLessThan(1000);
      }, 600000);
    });
  });
});
