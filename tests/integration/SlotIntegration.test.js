import Slot from '../../src/js/Slot.js';
import Symbol from '../../src/js/Symbol.js';
import Reel from '../../src/js/Reel.js';
import { setupSlotDOM } from '../fixtures/htmlFixtures.js';

describe('集成测试 - Slot与Reel交互', () => {
  let container;
  let slot;

  beforeEach(() => {
    container = setupSlotDOM();
  });

  describe('一、核心功能集成测试', () => {
    describe('1.1 基础游戏功能集成', () => {
      test('Slot应该正确创建并管理所有Reel实例', () => {
        slot = new Slot(container);
        expect(slot.reels.length).toBe(5);
        slot.reels.forEach((reel, index) => {
          expect(reel).toBeInstanceOf(Reel);
          expect(reel.idx).toBe(index);
        });
      });

      test('spin操作应该更新所有Reel的符号', async () => {
        slot = new Slot(container);
        const initialSymbols = slot.reels.map(reel => 
          reel.symbolContainer.children.length
        );
        
        await slot.spin();
        
        slot.reels.forEach((reel, index) => {
          expect(reel.symbolContainer.children.length).toBeGreaterThanOrEqual(initialSymbols[index]);
        });
      });

      test('所有Reel应该按照正确的顺序完成动画', async () => {
        slot = new Slot(container);
        const finishOrder = [];
        
        slot.reels.forEach((reel, index) => {
          const originalFinish = reel.animation.finish.bind(reel.animation);
          reel.animation.finish = function() {
            finishOrder.push(index);
            return originalFinish();
          };
        });
        
        await slot.spin();
        
        for (let i = 0; i < finishOrder.length - 1; i++) {
          expect(finishOrder[i]).toBeLessThan(finishOrder[i + 1]);
        }
      });
    });

    describe('1.2 视觉表现集成', () => {
      test('所有Reel应该正确渲染符号图片', () => {
        slot = new Slot(container);
        slot.reels.forEach(reel => {
          const images = reel.symbolContainer.querySelectorAll('img');
          expect(images.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('三、用户体验集成测试', () => {
    describe('3.1 操作体验集成', () => {
      test('完整spin周期应该正确触发所有回调', async () => {
        const startCallback = jest.fn();
        const endCallback = jest.fn();
        
        slot = new Slot(container, {
          onSpinStart: startCallback,
          onSpinEnd: endCallback
        });
        
        await slot.spin();
        
        expect(startCallback).toHaveBeenCalledTimes(1);
        expect(endCallback).toHaveBeenCalledTimes(1);
        expect(endCallback).toHaveBeenCalledAfter(startCallback);
      });

      test('按钮状态应该在整个spin周期中正确变化', async () => {
        slot = new Slot(container);
        const spinButton = document.getElementById('spin');
        
        expect(spinButton.disabled).toBe(false);
        
        const spinPromise = slot.spin();
        expect(spinButton.disabled).toBe(true);
        
        await spinPromise;
        expect(spinButton.disabled).toBe(false);
      });
    });
  });

  describe('四、稳定性与可靠性集成测试', () => {
    describe('4.1 长时间运行稳定性', () => {
      test('连续50次spin操作应该稳定完成', async () => {
        slot = new Slot(container);
        
        for (let i = 0; i < 50; i++) {
          await slot.spin();
        }
        
        expect(slot.reels.length).toBe(5);
      }, 30000);

      test('快速连续点击spin按钮应该被正确处理', async () => {
        slot = new Slot(container);
        const spinButton = document.getElementById('spin');
        
        spinButton.click();
        spinButton.click();
        spinButton.click();
        
        await new Promise(resolve => setTimeout(resolve, 6000));
        
        expect(spinButton.disabled).toBe(false);
      });
    });

    describe('4.2 异常场景容错', () => {
      test('DOM结构异常时应该优雅处理', () => {
        document.body.innerHTML = `
          <div id="slot">
            <div id="reels">
              <div class="reel"></div>
            </div>
            <div id="controls">
              <button type="button" id="spin">SPIN</button>
            </div>
          </div>
        `;
        
        container = document.getElementById('slot');
        slot = new Slot(container);
        
        expect(slot.reels.length).toBe(1);
      });
    });
  });

  describe('五、业务规则集成验证', () => {
    test('每次spin应该生成完全随机的符号组合', async () => {
      slot = new Slot(container);
      const allSymbols = [];
      
      for (let i = 0; i < 10; i++) {
        await slot.spin();
        allSymbols.push([...slot.currentSymbols]);
      }
      
      const uniqueCombinations = new Set(
        allSymbols.map(s => JSON.stringify(s))
      );
      expect(uniqueCombinations.size).toBe(10);
    });

    test('Symbol预加载应该在Slot初始化时完成', () => {
      const preloadSpy = jest.spyOn(Symbol, 'preload');
      slot = new Slot(container);
      expect(preloadSpy).toHaveBeenCalled();
    });
  });

  describe('六、性能集成测试', () => {
    test('完整游戏循环应该在合理时间内完成', async () => {
      slot = new Slot(container);
      const startTime = performance.now();
      
      for (let i = 0; i < 5; i++) {
        await slot.spin();
      }
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(30000);
    });
  });
});
