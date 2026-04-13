import Reel from "../../src/js/Reel.js";
import Symbol from "../../src/js/Symbol.js";

describe("Reel Class - 核心功能测试", () => {
  let reelContainer;

  beforeEach(() => {
    reelContainer = document.createElement("div");
    reelContainer.className = "reel";

    global.Element.prototype.animate = jest.fn(() => ({
      cancel: jest.fn(),
      play: jest.fn(),
      finish: jest.fn(),
      playState: "idle",
      onfinish: null,
    }));
  });

  describe("1.1 基础功能 - 构造函数", () => {
    test("应正确初始化Reel实例", () => {
      const initialSymbols = ["yoda", "r2d2", "death_star"];
      const reel = new Reel(reelContainer, 0, initialSymbols);

      expect(reel.reelContainer).toBe(reelContainer);
      expect(reel.idx).toBe(0);
      expect(reel.symbolContainer).toBeDefined();
      expect(reel.symbolContainer.classList.contains("icons")).toBe(true);
    });

    test("应创建symbolContainer并添加到DOM", () => {
      const initialSymbols = ["yoda", "r2d2", "death_star"];
      new Reel(reelContainer, 0, initialSymbols);

      expect(reelContainer.querySelector(".icons")).not.toBeNull();
    });

    test("应初始化正确数量的初始符号", () => {
      const initialSymbols = ["yoda", "r2d2", "death_star"];
      const reel = new Reel(reelContainer, 0, initialSymbols);

      expect(reel.symbolContainer.children.length).toBe(3);
    });
  });

  describe("1.1 基础功能 - factor计算", () => {
    test("第一个滚轮(idx=0)factor应为1", () => {
      const reel = new Reel(reelContainer, 0, []);
      expect(reel.factor).toBe(1);
    });

    test("第二个滚轮(idx=1)factor计算正确", () => {
      const reel = new Reel(reelContainer, 1, []);
      expect(reel.factor).toBe(1 + Math.pow(1 / 2, 2));
    });

    test("第四个滚轮(idx=3)factor计算正确", () => {
      const reel = new Reel(reelContainer, 3, []);
      expect(reel.factor).toBe(1 + Math.pow(3 / 2, 2));
    });
  });

  describe("1.1 基础功能 - renderSymbols()方法", () => {
    test("应正确渲染下一组符号", () => {
      const initialSymbols = ["yoda", "r2d2", "death_star"];
      const reel = new Reel(reelContainer, 0, initialSymbols);
      const nextSymbols = ["c3po", "darth_vader", "falcon"];
      const initialChildCount = reel.symbolContainer.children.length;

      reel.renderSymbols(nextSymbols);

      expect(reel.symbolContainer.children.length).toBeGreaterThan(
        initialChildCount,
      );
    });
  });

  describe("1.1 基础功能 - spin()方法", () => {
    test("spin应返回Promise", async () => {
      const initialSymbols = ["yoda", "r2d2", "death_star"];
      const reel = new Reel(reelContainer, 0, initialSymbols);

      const result = reel.spin();
      expect(result).toBeInstanceOf(Promise);
      await result;
    });

    test("spin应调用animation.play()", async () => {
      const mockPlay = jest.fn();
      global.Element.prototype.animate = jest.fn(() => ({
        cancel: jest.fn(),
        play: mockPlay,
        finish: jest.fn(),
        playState: "finished",
        onfinish: null,
      }));

      const initialSymbols = ["yoda", "r2d2", "death_star"];
      const reel = new Reel(reelContainer, 0, initialSymbols);

      await reel.spin();

      expect(mockPlay).toHaveBeenCalled();
    });
  });

  describe("1.2 视觉表现功能", () => {
    test("不同滚轮应有不同的动画持续时间", () => {
      const reel0 = new Reel(reelContainer, 0, []);
      const reel2 = new Reel(reelContainer, 2, []);

      expect(reel0.factor).not.toBe(reel2.factor);
      expect(reel0.factor * 1000).not.toBe(reel2.factor * 1000);
    });

    test("动画配置应包含模糊效果", () => {
      const animateSpy = jest.spyOn(Element.prototype, "animate");
      new Reel(reelContainer, 0, []);

      const animationOptions = animateSpy.mock.calls[0][1];
      const keyframes = animateSpy.mock.calls[0][0];

      expect(keyframes[1].filter).toContain("blur");
      expect(animationOptions.easing).toBe("ease-in-out");
    });
  });

  describe("4.2 异常场景容错", () => {
    test("空符号数组不报错", () => {
      expect(() => {
        new Reel(reelContainer, 0, []);
      }).not.toThrow();
    });

    test("重复调用spin不崩溃", async () => {
      const reel = new Reel(reelContainer, 0, ["yoda", "r2d2", "death_star"]);

      const spin1 = reel.spin();
      const spin2 = reel.spin();

      await Promise.all([spin1, spin2]);
      expect(true).toBe(true);
    });
  });

  describe("六、性能测试", () => {
    test("创建Reel实例应在合理时间内", () => {
      const startTime = performance.now();

      for (let i = 0; i < 100; i++) {
        const container = document.createElement("div");
        new Reel(container, i % 5, ["yoda", "r2d2", "death_star"]);
      }

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(100);
    });
  });
});
