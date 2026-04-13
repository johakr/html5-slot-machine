/**
 * Reel 类单元测试
 * 测试转轴系统的核心功能
 */

import Reel from '../../src/js/Reel.js';
import Symbol from '../../src/js/Symbol.js';

// Mock Web Animations API
global.Element.prototype.animate = jest.fn(function(keyframes, options) {
  return {
    play: jest.fn(),
    cancel: jest.fn(),
    finish: jest.fn(),
    playState: 'finished',
    onfinish: null,
  };
});

describe('Reel 类测试', () => {
  let mockContainer;
  let reel;

  beforeEach(() => {
    // 创建模拟的 DOM 容器
    mockContainer = document.createElement('div');
    mockContainer.className = 'reel';
    document.body.appendChild(mockContainer);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  describe('1.1 基础游戏功能 - 转轴系统', () => {
    test('Reel 构造函数应正确初始化', () => {
      const initialSymbols = ['death_star', 'falcon', 'yoda'];
      reel = new Reel(mockContainer, 0, initialSymbols);
      
      expect(reel.reelContainer).toBe(mockContainer);
      expect(reel.idx).toBe(0);
      expect(reel.symbolContainer).toBeDefined();
      expect(reel.symbolContainer.classList.contains('icons')).toBe(true);
    });

    test('Reel 应正确计算 factor 值', () => {
      const testCases = [
        { idx: 0, expectedFactor: 1 },
        { idx: 1, expectedFactor: 1.25 },
        { idx: 2, expectedFactor: 2 },
        { idx: 3, expectedFactor: 3.25 },
        { idx: 4, expectedFactor: 5 },
      ];

      testCases.forEach(({ idx, expectedFactor }) => {
        const r = new Reel(mockContainer, idx, ['death_star', 'death_star', 'death_star']);
        expect(r.factor).toBe(expectedFactor);
      });
    });

    test('Reel 应创建动画实例', () => {
      reel = new Reel(mockContainer, 0, ['death_star', 'death_star', 'death_star']);
      expect(reel.animation).toBeDefined();
    });

    test('Reel 应渲染初始符号', () => {
      const initialSymbols = ['at_at', 'c3po', 'darth_vader'];
      reel = new Reel(mockContainer, 0, initialSymbols);
      
      const images = reel.symbolContainer.querySelectorAll('img');
      expect(images.length).toBe(3);
    });
  });

  describe('1.1 基础游戏功能 - 渲染系统', () => {
    test('renderSymbols 应渲染正确的符号数量', () => {
      reel = new Reel(mockContainer, 0, ['death_star', 'death_star', 'death_star']);
      const nextSymbols = ['yoda', 'falcon', 'r2d2'];
      
      reel.renderSymbols(nextSymbols);
      
      // 应该渲染 3 + factor * 10 个符号
      const expectedCount = 3 + Math.floor(reel.factor) * 10;
      expect(reel.symbolContainer.children.length).toBe(expectedCount);
    });

    test('spin 方法应返回 Promise', () => {
      reel = new Reel(mockContainer, 0, ['death_star', 'death_star', 'death_star']);
      const result = reel.spin();
      expect(result).toBeInstanceOf(Promise);
    });

    test('spin 方法应播放动画', () => {
      reel = new Reel(mockContainer, 0, ['death_star', 'death_star', 'death_star']);
      reel.spin();
      expect(reel.animation.play).toHaveBeenCalled();
    });
  });

  describe('4.2 异常场景容错', () => {
    test('Reel 应处理空容器', () => {
      expect(() => {
        new Reel(null, 0, ['death_star']);
      }).toThrow();
    });

    test('Reel 应处理无效的初始符号', () => {
      expect(() => {
        new Reel(mockContainer, 0, []);
      }).not.toThrow();
    });
  });
});
