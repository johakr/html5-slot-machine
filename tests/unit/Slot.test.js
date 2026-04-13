/**
 * Slot 类单元测试
 * 测试游戏主逻辑的核心功能
 */

import Slot from '../../src/js/Slot.js';
import Reel from '../../src/js/Reel.js';

// Mock Symbol 类
jest.mock('../../src/js/Symbol.js', () => {
  return {
    __esModule: true,
    default: class MockSymbol {
      constructor(name) {
        this.name = name || 'death_star';
        this.img = document.createElement('img');
        this.img.src = `symbols/${this.name}.svg`;
      }
      static preload() {}
      static get symbols() {
        return ['at_at', 'c3po', 'darth_vader', 'death_star', 'falcon', 'r2d2', 'stormtrooper', 'tie_ln', 'yoda'];
      }
      static random() {
        return this.symbols[Math.floor(Math.random() * this.symbols.length)];
      }
    }
  };
});

// Mock Reel 类
jest.mock('../../src/js/Reel.js', () => {
  return {
    __esModule: true,
    default: class MockReel {
      constructor(container, idx, symbols) {
        this.container = container;
        this.idx = idx;
        this.symbols = symbols;
      }
      renderSymbols(symbols) {
        this.symbols = symbols;
      }
      spin() {
        return Promise.resolve();
      }
    }
  };
});

describe('Slot 类测试', () => {
  let mockContainer;
  let mockSpinButton;
  let mockAutoPlayCheckbox;

  beforeEach(() => {
    // 创建模拟的 DOM 结构
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
    mockSpinButton = document.getElementById('spin');
    mockAutoPlayCheckbox = document.getElementById('autoplay');
  });

  afterEach(() => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  describe('1.1 基础游戏功能 - 游戏初始化', () => {
    test('Slot 构造函数应正确初始化', () => {
      const slot = new Slot(mockContainer);
      
      expect(slot.container).toBe(mockContainer);
      expect(slot.reels).toHaveLength(5);
      expect(slot.spinButton).toBe(mockSpinButton);
      expect(slot.autoPlayCheckbox).toBe(mockAutoPlayCheckbox);
    });

    test('Slot 应初始化当前符号矩阵', () => {
      const slot = new Slot(mockContainer);
      
      expect(slot.currentSymbols).toHaveLength(5);
      slot.currentSymbols.forEach(reelSymbols => {
        expect(reelSymbols).toHaveLength(3);
      });
    });

    test('Slot 应初始化下一符号矩阵', () => {
      const slot = new Slot(mockContainer);
      
      expect(slot.nextSymbols).toHaveLength(5);
      slot.nextSymbols.forEach(reelSymbols => {
        expect(reelSymbols).toHaveLength(3);
      });
    });

    test('Slot 应绑定 spin 按钮点击事件', () => {
      const slot = new Slot(mockContainer);
      const clickEvent = new MouseEvent('click');
      
      // 模拟 spin 方法
      slot.spin = jest.fn();
      mockSpinButton.dispatchEvent(clickEvent);
      
      expect(slot.spin).toHaveBeenCalled();
    });
  });

  describe('1.1 基础游戏功能 - 旋转功能', () => {
    test('spin 方法应生成新的随机符号', async () => {
      const slot = new Slot(mockContainer);
      const oldNextSymbols = [...slot.nextSymbols];
      
      await slot.spin();
      
      // 旋转后，nextSymbols 应该改变
      expect(slot.currentSymbols).toEqual(oldNextSymbols);
    });

    test('spin 方法应禁用 spin 按钮', async () => {
      const slot = new Slot(mockContainer);
      slot.onSpinStart(slot.nextSymbols);
      
      expect(mockSpinButton.disabled).toBe(true);
    });

    test('spin 结束后应启用 spin 按钮', async () => {
      const slot = new Slot(mockContainer);
      slot.onSpinEnd(slot.nextSymbols);
      
      expect(mockSpinButton.disabled).toBe(false);
    });

    test('spin 方法应返回 Promise', () => {
      const slot = new Slot(mockContainer);
      const result = slot.spin();
      
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('1.1 基础游戏功能 - 回调函数', () => {
    test('onSpinStart 回调应在旋转开始时调用', () => {
      const onSpinStart = jest.fn();
      const config = { onSpinStart };
      const slot = new Slot(mockContainer, config);
      
      slot.onSpinStart(slot.nextSymbols);
      
      expect(onSpinStart).toHaveBeenCalledWith(slot.nextSymbols);
    });

    test('onSpinEnd 回调应在旋转结束时调用', () => {
      const onSpinEnd = jest.fn();
      const config = { onSpinEnd };
      const slot = new Slot(mockContainer, config);
      
      slot.onSpinEnd(slot.nextSymbols);
      
      expect(onSpinEnd).toHaveBeenCalledWith(slot.nextSymbols);
    });
  });

  describe('1.1 基础游戏功能 - 自动播放', () => {
    test('自动播放应在 spin 结束后触发下一次旋转', (done) => {
      jest.useFakeTimers();
      const slot = new Slot(mockContainer);
      slot.spin = jest.fn();
      
      mockAutoPlayCheckbox.checked = true;
      slot.onSpinEnd(slot.nextSymbols);
      
      jest.advanceTimersByTime(250);
      
      expect(slot.spin).toHaveBeenCalled();
      jest.useRealTimers();
      done();
    });

    test('非自动播放模式不应触发下一次旋转', () => {
      jest.useFakeTimers();
      const slot = new Slot(mockContainer);
      slot.spin = jest.fn();
      
      mockAutoPlayCheckbox.checked = false;
      slot.onSpinEnd(slot.nextSymbols);
      
      jest.advanceTimersByTime(250);
      
      expect(slot.spin).not.toHaveBeenCalled();
      jest.useRealTimers();
    });
  });

  describe('2.1 浏览器兼容性 - 配置选项', () => {
    test('inverted 配置应添加 inverted 类', () => {
      const config = { inverted: true };
      const slot = new Slot(mockContainer, config);
      
      expect(mockContainer.classList.contains('inverted')).toBe(true);
    });

    test('非 inverted 配置不应添加 inverted 类', () => {
      const config = { inverted: false };
      const slot = new Slot(mockContainer, config);
      
      expect(mockContainer.classList.contains('inverted')).toBe(false);
    });
  });

  describe('4.2 异常场景容错', () => {
    test('Slot 应处理无效的 DOM 元素', () => {
      expect(() => {
        new Slot(null);
      }).toThrow();
    });

    test('Slot 应处理缺少 reel 元素的情况', () => {
      document.body.innerHTML = '<div id="slot"></div>';
      const emptyContainer = document.getElementById('slot');
      
      const slot = new Slot(emptyContainer);
      expect(slot.reels).toHaveLength(0);
    });
  });
});
