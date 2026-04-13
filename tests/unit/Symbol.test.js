/**
 * Symbol 类单元测试
 * 测试符号系统的核心功能
 */

import Symbol from '../../src/js/Symbol.js';

describe('Symbol 类测试', () => {
  beforeEach(() => {
    // 清理缓存
    Object.keys(Symbol.cache || {}).forEach(key => {
      delete Symbol.cache[key];
    });
  });

  describe('1.1 基础游戏功能 - 符号系统', () => {
    test('Symbol.symbols 应返回所有可用的符号类型', () => {
      const symbols = Symbol.symbols;
      expect(symbols).toHaveLength(9);
      expect(symbols).toContain('at_at');
      expect(symbols).toContain('c3po');
      expect(symbols).toContain('darth_vader');
      expect(symbols).toContain('death_star');
      expect(symbols).toContain('falcon');
      expect(symbols).toContain('r2d2');
      expect(symbols).toContain('stormtrooper');
      expect(symbols).toContain('tie_ln');
      expect(symbols).toContain('yoda');
    });

    test('Symbol.random() 应返回有效的符号', () => {
      const randomSymbol = Symbol.random();
      expect(Symbol.symbols).toContain(randomSymbol);
    });

    test('Symbol.random() 应能随机返回所有符号类型', () => {
      const results = new Set();
      for (let i = 0; i < 100; i++) {
        results.add(Symbol.random());
      }
      expect(results.size).toBe(9);
    });

    test('创建 Symbol 实例时应使用指定名称', () => {
      const symbol = new Symbol('yoda');
      expect(symbol.name).toBe('yoda');
    });

    test('创建 Symbol 实例时无参数应使用随机符号', () => {
      const symbol = new Symbol();
      expect(Symbol.symbols).toContain(symbol.name);
    });

    test('Symbol 实例应包含有效的 img 元素', () => {
      const symbol = new Symbol('death_star');
      expect(symbol.img).toBeDefined();
      expect(symbol.img.tagName.toLowerCase()).toBe('img');
    });
  });

  describe('1.2 视觉表现功能 - 资源加载', () => {
    test('Symbol 应缓存已加载的图片', () => {
      const symbol1 = new Symbol('falcon');
      const symbol2 = new Symbol('falcon');
      expect(symbol1.img).toBe(symbol2.img);
    });

    test('Symbol.preload() 应预加载所有符号', () => {
      Symbol.preload();
      Symbol.symbols.forEach(symbolName => {
        expect(Symbol.cache[symbolName]).toBeDefined();
      });
    });

    test('Symbol 图片应有正确的 src 属性', () => {
      const symbol = new Symbol('r2d2');
      expect(symbol.img.src).toContain('r2d2.svg');
    });
  });
});
