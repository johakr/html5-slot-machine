import Slot from '../../src/js/Slot.js';
import Symbol from '../../src/js/Symbol.js';
import { setupSlotDOM } from '../fixtures/htmlFixtures.js';

describe('Slot 类测试', () => {
  let container;
  let slot;

  beforeEach(() => {
    container = setupSlotDOM();
  });

  describe('一、核心功能测试', () => {
    describe('1.1 基础游戏功能', () => {
      test('应该正确创建Slot实例', () => {
        slot = new Slot(container);
        expect(slot).toBeDefined();
        expect(slot.container).toBe(container);
      });

      test('应该正确初始化5个Reel', () => {
        slot = new Slot(container);
        expect(slot.reels.length).toBe(5);
      });

      test('应该正确初始化currentSymbols', () => {
        slot = new Slot(container);
        expect(slot.currentSymbols.length).toBe(5);
        slot.currentSymbols.forEach(symbols => {
          expect(symbols.length).toBe(3);
        });
      });

      test('应该正确初始化nextSymbols', () => {
        slot = new Slot(container);
        expect(slot.nextSymbols.length).toBe(5);
        slot.nextSymbols.forEach(symbols => {
          expect(symbols.length).toBe(3);
        });
      });

      test('spin方法应该返回Promise', () => {
        slot = new Slot(container);
        const result = slot.spin();
        expect(result).toBeInstanceOf(Promise);
      });

      test('spin按钮点击应该触发spin方法', () => {
        slot = new Slot(container);
        const spinSpy = jest.spyOn(slot, 'spin');
        document.getElementById('spin').click();
        expect(spinSpy).toHaveBeenCalled();
      });
    });

    describe('1.2 视觉表现功能', () => {
      test('inverted配置应该添加相应CSS类', () => {
        slot = new Slot(container, { inverted: true });
        expect(container.classList.contains('inverted')).toBe(true);
      });

      test('默认不应该有inverted类', () => {
        slot = new Slot(container);
        expect(container.classList.contains('inverted')).toBe(false);
      });
    });
  });

  describe('三、用户体验测试', () => {
    describe('3.1 操作体验', () => {
      test('spin开始时按钮应该被禁用', () => {
        slot = new Slot(container);
        const spinButton = document.getElementById('spin');
        slot.onSpinStart([['yoda'], ['r2d2'], ['falcon'], ['c3po'], ['yoda']]);
        expect(spinButton.disabled).toBe(true);
      });

      test('spin结束时按钮应该被启用', () => {
        slot = new Slot(container);
        const spinButton = document.getElementById('spin');
        slot.onSpinStart([['yoda'], ['r2d2'], ['falcon'], ['c3po'], ['yoda']]);
        slot.onSpinEnd([['yoda'], ['r2d2'], ['falcon'], ['c3po'], ['yoda']]);
        expect(spinButton.disabled).toBe(false);
      });

      test('autoplay选中时应该自动再次spin', (done) => {
        slot = new Slot(container);
        const autoplayCheckbox = document.getElementById('autoplay');
        autoplayCheckbox.checked = true;
        
        const spinSpy = jest.spyOn(slot, 'spin');
        slot.onSpinEnd([['yoda'], ['r2d2'], ['falcon'], ['c3po'], ['yoda']]);
        
        setTimeout(() => {
          expect(spinSpy).toHaveBeenCalled();
          done();
        }, 300);
      });
    });

    describe('3.2 视觉体验', () => {
      test('jackpot显示应该正确', () => {
        slot = new Slot(container);
        const jackpot = document.getElementById('jackpot');
        expect(jackpot.textContent).toContain('Jackpot');
        expect(document.getElementById('jp').textContent).toBe('5.555.555');
      });
    });
  });

  describe('四、稳定性与可靠性测试', () => {
    describe('4.1 长时间运行稳定性', () => {
      test('连续多次spin应该正常完成', async () => {
        slot = new Slot(container);
        for (let i = 0; i < 5; i++) {
          await slot.spin();
        }
        expect(true).toBe(true);
      });
    });

    describe('4.2 异常场景容错', () => {
      test('没有配置回调时应该正常工作', () => {
        slot = new Slot(container, {});
        expect(() => slot.onSpinStart([])).not.toThrow();
        expect(() => slot.onSpinEnd([])).not.toThrow();
      });
    });
  });

  describe('五、业务规则验证', () => {
    test('onSpinStart回调应该被正确调用', () => {
      const mockCallback = jest.fn();
      slot = new Slot(container, { onSpinStart: mockCallback });
      const symbols = [['yoda'], ['r2d2'], ['falcon'], ['c3po'], ['yoda']];
      slot.onSpinStart(symbols);
      expect(mockCallback).toHaveBeenCalledWith(symbols);
    });

    test('onSpinEnd回调应该被正确调用', () => {
      const mockCallback = jest.fn();
      slot = new Slot(container, { onSpinEnd: mockCallback });
      const symbols = [['yoda'], ['r2d2'], ['falcon'], ['c3po'], ['yoda']];
      slot.onSpinEnd(symbols);
      expect(mockCallback).toHaveBeenCalledWith(symbols);
    });

    test('每次spin应该生成新的随机符号', async () => {
      slot = new Slot(container);
      await slot.spin();
      const firstSymbols = slot.currentSymbols;
      await slot.spin();
      const secondSymbols = slot.currentSymbols;
      expect(firstSymbols).not.toBe(secondSymbols);
    });
  });

  describe('六、性能测试', () => {
    test('spin操作应该在合理时间内完成', async () => {
      slot = new Slot(container);
      const startTime = performance.now();
      await slot.spin();
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(6000);
    });
  });

  describe('七、易用性测试', () => {
    test('spin按钮应该有正确的文本', () => {
      slot = new Slot(container);
      const spinButton = document.getElementById('spin');
      expect(spinButton.textContent).toBe('SPIN');
    });

    test('autoplay复选框应该正确初始化', () => {
      slot = new Slot(container);
      const autoplayCheckbox = document.getElementById('autoplay');
      expect(autoplayCheckbox.type).toBe('checkbox');
      expect(autoplayCheckbox.checked).toBe(false);
    });
  });
});
