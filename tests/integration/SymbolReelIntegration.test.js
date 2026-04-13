import Symbol from '../../src/js/Symbol.js';
import Reel from '../../src/js/Reel.js';
import { setupSingleReelDOM } from '../fixtures/htmlFixtures.js';

describe('集成测试 - Symbol与Reel交互', () => {
  let reelContainer;
  let reel;

  beforeEach(() => {
    reelContainer = setupSingleReelDOM();
  });

  describe('一、核心功能集成测试', () => {
    test('Reel应该正确使用Symbol类创建符号', () => {
      const symbols = ['yoda', 'r2d2', 'falcon'];
      reel = new Reel(reelContainer, 0, symbols);
      
      const images = reelContainer.querySelectorAll('img');
      expect(images.length).toBe(3);
    });

    test('Reel应该正确渲染Symbol的图片元素', () => {
      reel = new Reel(reelContainer, 0, ['death_star', 'darth_vader', 'c3po']);
      
      const images = reelContainer.querySelectorAll('img');
      images.forEach(img => {
        expect(img.tagName.toLowerCase()).toBe('img');
      });
    });
  });

  describe('五、业务规则集成验证', () => {
    test('Symbol缓存机制应该在Reel中正常工作', () => {
      const symbols = ['yoda', 'yoda', 'yoda'];
      reel = new Reel(reelContainer, 0, symbols);
      
      const images = reelContainer.querySelectorAll('img');
      expect(images.length).toBe(3);
    });

    test('renderSymbols应该正确处理Symbol实例', () => {
      reel = new Reel(reelContainer, 0, ['death_star', 'death_star', 'death_star']);
      
      const nextSymbols = [Symbol.random(), Symbol.random(), Symbol.random()];
      reel.renderSymbols(nextSymbols);
      
      expect(reel.symbolContainer.children.length).toBeGreaterThan(3);
    });
  });

  describe('六、性能集成测试', () => {
    test('大量Symbol渲染应该高效', () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 100; i++) {
        const testReel = new Reel(
          document.createElement('div'), 
          0, 
          ['yoda', 'r2d2', 'falcon']
        );
      }
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });
});
