import Symbol from "../../src/js/Symbol.js";

describe("Symbol Class - 核心功能测试", () => {
  describe("1.1 基础功能 - symbols属性", () => {
    test("应包含所有9个正确的符号名称", () => {
      const expectedSymbols = [
        "at_at",
        "c3po",
        "darth_vader",
        "death_star",
        "falcon",
        "r2d2",
        "stormtrooper",
        "tie_ln",
        "yoda",
      ];
      expect(Symbol.symbols).toEqual(expectedSymbols);
      expect(Symbol.symbols.length).toBe(9);
    });

    test("symbols应为只读属性", () => {
      const originalSymbols = [...Symbol.symbols];
      expect(() => {
        Symbol.symbols = ["test"];
      }).toThrow();
      expect(Symbol.symbols).toEqual(originalSymbols);
    });
  });

  describe("1.1 基础功能 - random()方法", () => {
    test("应返回有效的符号名称", () => {
      for (let i = 0; i < 100; i++) {
        const symbol = Symbol.random();
        expect(Symbol.symbols).toContain(symbol);
      }
    });

    test("多次调用应生成随机分布的符号", () => {
      const distribution = {};
      const iterations = 1000;

      for (let i = 0; i < iterations; i++) {
        const symbol = Symbol.random();
        distribution[symbol] = (distribution[symbol] || 0) + 1;
      }

      Symbol.symbols.forEach((symbol) => {
        expect(distribution[symbol]).toBeGreaterThan(0);
      });

      const expectedCount = iterations / Symbol.symbols.length;
      const tolerance = expectedCount * 0.5;
      Symbol.symbols.forEach((symbol) => {
        expect(Math.abs(distribution[symbol] - expectedCount)).toBeLessThan(
          tolerance,
        );
      });
    });
  });

  describe("1.1 基础功能 - 构造函数", () => {
    test("不带参数时应创建随机符号", () => {
      const symbol = new Symbol();
      expect(Symbol.symbols).toContain(symbol.name);
    });

    test("带参数时应创建指定符号", () => {
      const symbol = new Symbol("yoda");
      expect(symbol.name).toBe("yoda");
    });

    test("应创建img元素", () => {
      const symbol = new Symbol("r2d2");
      expect(symbol.img).toBeDefined();
    });
  });

  describe("1.1 基础功能 - preload()方法", () => {
    test("应预加载所有符号到缓存", () => {
      Symbol.preload();
      Symbol.symbols.forEach((symbolName) => {
        const symbol = new Symbol(symbolName);
        expect(symbol.img).toBeDefined();
      });
    });
  });

  describe("4.2 异常场景容错", () => {
    test("创建不存在的符号时不报错", () => {
      expect(() => {
        const symbol = new Symbol("non_existent_symbol");
        expect(symbol.name).toBe("non_existent_symbol");
      }).not.toThrow();
    });
  });

  describe("七、易用性测试", () => {
    test("Symbol实例可被重复创建", () => {
      const symbols = [];
      for (let i = 0; i < 100; i++) {
        symbols.push(new Symbol());
      }
      expect(symbols.length).toBe(100);
    });
  });
});
