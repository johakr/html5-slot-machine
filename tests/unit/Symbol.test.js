import Symbol from '../../src/js/Symbol.js';

describe('Symbol 类测试', () => {
  describe('一、核心功能测试', () => {
    describe('1.1 基础游戏功能', () => {
      test('应该正确创建Symbol实例', () => {
        const symbol = new Symbol('death_star');
        expect(symbol).toBeDefined();
        expect(symbol.name).toBe('death_star');
        expect(symbol.img).toBeInstanceOf(HTMLImageElement);
      });

      test('应该正确返回所有可用符号列表', () => {
        const symbols = Symbol.symbols;
        expect(Array.isArray(symbols)).toBe(true);
        expect(symbols.length).toBe(9);
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

      test('应该正确生成随机符号', () => {
        const randomSymbol = Symbol.random();
        expect(Symbol.symbols).toContain(randomSymbol);
      });

      test('多次调用random应该返回不同结果', () => {
        const results = new Set();
        for (let i = 0; i < 100; i++) {
          results.add(Symbol.random());
        }
        expect(results.size).toBeGreaterThan(1);
      });
    });

    describe('1.2 视觉表现功能', () => {
      test('Symbol实例应该包含有效的图片元素', () => {
        const symbol = new Symbol('yoda');
        expect(symbol.img.tagName.toLowerCase()).toBe('img');
      });

      test('图片src应该包含正确的符号名称', () => {
        const symbol = new Symbol('r2d2');
        expect(symbol.img.src).toContain('r2d2');
      });
    });
  });

  describe('四、稳定性与可靠性测试', () => {
    describe('4.2 异常场景容错', () => {
      test('未提供名称时应该生成随机符号', () => {
        const symbol = new Symbol();
        expect(symbol.name).toBeDefined();
        expect(Symbol.symbols).toContain(symbol.name);
      });

      test('静态方法preload应该正确执行', () => {
        expect(() => Symbol.preload()).not.toThrow();
      });
    });
  });

  describe('五、业务规则验证', () => {
    test('符号缓存机制应该正常工作', () => {
      const symbol1 = new Symbol('falcon');
      const symbol2 = new Symbol('falcon');
      expect(symbol1.img).toBeDefined();
      expect(symbol2.img).toBeDefined();
    });
  });

  describe('六、性能测试', () => {
    test('创建大量Symbol实例应该高效', () => {
      const startTime = performance.now();
      for (let i = 0; i < 1000; i++) {
        new Symbol(Symbol.random());
      }
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });
});
