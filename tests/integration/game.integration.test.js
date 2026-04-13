/**
 * 游戏集成测试
 * 测试完整的游戏流程和交互
 */

import Slot from '../../src/js/Slot.js';
import Reel from '../../src/js/Reel.js';
import Symbol from '../../src/js/Symbol.js';

describe('游戏集成测试', () => {
  let slot;
  let mockContainer;

  beforeEach(() => {
    // 创建完整的 DOM 结构
    document.body.innerHTML = `
      <div id="slot">
        <div id="jackpot">Jackpot: <span id="jp">5.555.555</span></div>
        <div id="reels">
          <div class="reel"></div>
          <div class="reel"></div>
          <div class="reel"></div>
          <div class="reel"></div>
          <div class="reel"></div>
        </div>
        <div id="controls">
          <button type="button" id="spin">SPIN</button>
          <label>
            <input type="checkbox" name="autoplay" id="autoplay" />
            Autoplay
          </label>
        </div>
      </div>
    `;
    
    mockContainer = document.getElementById('slot');
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('1.1 基础游戏功能 - 完整游戏流程', () => {
    test('用户点击 SPIN 按钮后应开始游戏', async () => {
      const config = {
        onSpinStart: jest.fn(),
        onSpinEnd: jest.fn()
      };
      
      slot = new Slot(mockContainer, config);
      const spinButton = document.getElementById('spin');
      
      // 模拟点击
      spinButton.click();
      
      // 验证回调被调用
      expect(config.onSpinStart).toHaveBeenCalled();
    });

    test('游戏应正确渲染 5 个转轴', () => {
      slot = new Slot(mockContainer);
      const reels = document.querySelectorAll('.reel');
      expect(reels.length).toBe(5);
    });

    test('每个转轴应渲染 3 个符号', () => {
      slot = new Slot(mockContainer);
      const reels = document.querySelectorAll('.reel');
      
      reels.forEach(reel => {
        const icons = reel.querySelectorAll('.icons img');
        expect(icons.length).toBeGreaterThanOrEqual(3);
      });
    });
  });

  describe('1.2 视觉表现功能 - 动画效果', () => {
    test('旋转时应应用模糊效果', async () => {
      slot = new Slot(mockContainer);
      const reel = slot.reels[0];
      
      // 检查动画关键帧是否包含模糊效果
      expect(reel.animation.effect.getKeyframes()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ filter: expect.any(String) })
        ])
      );
    });

    test('旋转动画应有正确的持续时间', () => {
      slot = new Slot(mockContainer);
      const reel = slot.reels[0];
      const expectedDuration = reel.factor * 1000;
      
      expect(reel.animation.effect.getTiming().duration).toBe(expectedDuration);
    });
  });

  describe('3.1 操作体验 - 用户交互', () => {
    test('旋转过程中 SPIN 按钮应被禁用', () => {
      slot = new Slot(mockContainer);
      const spinButton = document.getElementById('spin');
      
      slot.onSpinStart(slot.nextSymbols);
      expect(spinButton.disabled).toBe(true);
    });

    test('旋转结束后 SPIN 按钮应被启用', () => {
      slot = new Slot(mockContainer);
      const spinButton = document.getElementById('spin');
      
      slot.onSpinEnd(slot.nextSymbols);
      expect(spinButton.disabled).toBe(false);
    });

    test('自动播放复选框应可切换', () => {
      slot = new Slot(mockContainer);
      const autoPlayCheckbox = document.getElementById('autoplay');
      
      autoPlayCheckbox.checked = true;
      expect(autoPlayCheckbox.checked).toBe(true);
      
      autoPlayCheckbox.checked = false;
      expect(autoPlayCheckbox.checked).toBe(false);
    });
  });

  describe('5. 业务规则验证', () => {
    test('符号矩阵应为 5x3 结构', () => {
      slot = new Slot(mockContainer);
      
      expect(slot.currentSymbols).toHaveLength(5);
      slot.currentSymbols.forEach(reel => {
        expect(reel).toHaveLength(3);
      });
    });

    test('所有符号应为有效类型', () => {
      slot = new Slot(mockContainer);
      const validSymbols = Symbol.symbols;
      
      slot.currentSymbols.forEach(reel => {
        reel.forEach(symbol => {
          expect(validSymbols).toContain(symbol);
        });
      });
    });

    test('旋转后应生成新的符号矩阵', async () => {
      slot = new Slot(mockContainer);
      const oldSymbols = JSON.stringify(slot.currentSymbols);
      
      await slot.spin();
      
      const newSymbols = JSON.stringify(slot.currentSymbols);
      expect(newSymbols).not.toBe(oldSymbols);
    });
  });
});
