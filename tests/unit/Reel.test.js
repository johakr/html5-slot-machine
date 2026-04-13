import Reel from '../../src/js/Reel.js';
import Symbol from '../../src/js/Symbol.js';
import { setupSingleReelDOM } from '../fixtures/htmlFixtures.js';

describe('Reel 类测试', () => {
  let reelContainer;
  let reel;
  const initialSymbols = ['death_star', 'death_star', 'death_star'];

  beforeEach(() => {
    reelContainer = setupSingleReelDOM();
    reel = new Reel(reelContainer, 0, initialSymbols);
  });

  describe('一、核心功能测试', () => {
    describe('1.1 基础游戏功能', () => {
      test('应该正确创建Reel实例', () => {
        expect(reel).toBeDefined();
        expect(reel.idx).toBe(0);
        expect(reel.reelContainer).toBe(reelContainer);
      });

      test('应该正确计算factor属性', () => {
        expect(reel.factor).toBe(1);
        
        const reel2 = new Reel(document.createElement('div'), 2, initialSymbols);
        expect(reel2.factor).toBe(2);
        
        const reel4 = new Reel(document.createElement('div'), 4, initialSymbols);
        expect(reel4.factor).toBe(5);
      });

      test('应该正确创建symbolContainer', () => {
        const iconsContainer = reelContainer.querySelector('.icons');
        expect(iconsContainer).toBeDefined();
      });

      test('应该正确渲染初始符号', () => {
        const icons = reelContainer.querySelectorAll('.icons img');
        expect(icons.length).toBe(3);
      });
    });

    describe('1.2 视觉表现功能', () => {
      test('动画对象应该正确初始化', () => {
        expect(reel.animation).toBeDefined();
      });

      test('动画应该有正确的持续时间', () => {
        const expectedDuration = reel.factor * 1000;
        expect(reel.animation.effect.getTiming().duration).toBe(expectedDuration);
      });
    });
  });

  describe('二、兼容性测试', () => {
    describe('2.1 浏览器兼容性', () => {
      test('应该使用Web Animations API', () => {
        expect(typeof reelContainer.animate).toBe('function');
      });
    });
  });

  describe('三、用户体验测试', () => {
    describe('3.1 操作体验', () => {
      test('spin方法应该返回Promise', () => {
        const result = reel.spin();
        expect(result).toBeInstanceOf(Promise);
      });

      test('renderSymbols应该正确添加新符号', () => {
        const nextSymbols = ['yoda', 'r2d2', 'falcon'];
        const initialCount = reel.symbolContainer.children.length;
        reel.renderSymbols(nextSymbols);
        expect(reel.symbolContainer.children.length).toBeGreaterThan(initialCount);
      });
    });
  });

  describe('四、稳定性与可靠性测试', () => {
    describe('4.1 长时间运行稳定性', () => {
      test('多次spin操作应该正常完成', async () => {
        for (let i = 0; i < 10; i++) {
          const nextSymbols = [Symbol.random(), Symbol.random(), Symbol.random()];
          reel.renderSymbols(nextSymbols);
          await reel.spin();
        }
        expect(true).toBe(true);
      });
    });

    describe('4.2 异常场景容错', () => {
      test('动画未完成时调用finish应该正常处理', async () => {
        reel.animation.play();
        reel.animation.finish();
        expect(reel.animation.playState).toBe('finished');
      });
    });
  });

  describe('五、业务规则验证', () => {
    test('不同索引的Reel应该有不同的factor', () => {
      const factors = [];
      for (let i = 0; i < 5; i++) {
        const testReel = new Reel(document.createElement('div'), i, initialSymbols);
        factors.push(testReel.factor);
      }
      
      for (let i = 1; i < factors.length; i++) {
        expect(factors[i]).toBeGreaterThan(factors[i-1]);
      }
    });
  });

  describe('六、性能测试', () => {
    test('spin操作应该及时完成', async () => {
      const startTime = performance.now();
      const nextSymbols = [Symbol.random(), Symbol.random(), Symbol.random()];
      reel.renderSymbols(nextSymbols);
      await reel.spin();
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(reel.factor * 1000 + 100);
    });
  });
});
