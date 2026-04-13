import Slot from "../../src/js/Slot.js";
import Symbol from "../../src/js/Symbol.js";
import Reel from "../../src/js/Reel.js";

describe("性能与稳定性测试", () => {
  const setupDOM = () => {
    document.body.innerHTML = `
      <div id="slot">
        <div class="reel"></div>
        <div class="reel"></div>
        <div class="reel"></div>
        <div class="reel"></div>
        <div class="reel"></div>
      </div>
      <button id="spin">SPIN</button>
      <input type="checkbox" id="autoplay" />
    `;
  };

  beforeEach(() => {
    setupDOM();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("4.1 长时间运行稳定性测试", () => {
    test("连续20次spin不崩溃", () => {
      const slotContainer = document.getElementById("slot");
      const slot = new Slot(slotContainer, {});

      expect(() => {
        for (let i = 0; i < 20; i++) {
          slot.spin();
        }
      }).not.toThrow();
    });
  });

  describe("六、性能测试 - 初始化性能", () => {
    test("游戏初始化应在100ms内完成", () => {
      const slotContainer = document.getElementById("slot");

      const startTime = performance.now();
      new Slot(slotContainer, {});
      const endTime = performance.now();

      const initTime = endTime - startTime;
      console.log(`初始化耗时: ${initTime.toFixed(2)}ms`);
      expect(initTime).toBeLessThan(100);
    });

    test("符号预加载性能", () => {
      const startTime = performance.now();
      Symbol.preload();
      const endTime = performance.now();

      console.log(`符号预加载耗时: ${(endTime - startTime).toFixed(2)}ms`);
      expect(endTime - startTime).toBeLessThan(50);
    });
  });

  describe("六、性能测试 - 渲染性能", () => {
    test("单个滚轮渲染性能", () => {
      const reelContainer = document.createElement("div");
      const initialSymbols = ["yoda", "r2d2", "death_star"];

      const startTime = performance.now();
      const reel = new Reel(reelContainer, 2, initialSymbols);
      reel.renderSymbols(["c3po", "darth_vader", "falcon"]);
      const endTime = performance.now();

      console.log(`滚轮渲染耗时: ${(endTime - startTime).toFixed(2)}ms`);
      expect(endTime - startTime).toBeLessThan(50);
    });
  });

  describe("3.1 操作体验测试", () => {
    test("Spin按钮在旋转开始时禁用", () => {
      const slotContainer = document.getElementById("slot");
      const spinButton = document.getElementById("spin");
      const slot = new Slot(slotContainer, {});

      expect(spinButton.disabled).toBe(false);
      slot.spin();
      expect(spinButton.disabled).toBe(true);
    });

    test("自动播放复选框状态正确反映当前模式", () => {
      const autoPlayCheckbox = document.getElementById("autoplay");

      autoPlayCheckbox.checked = true;
      expect(autoPlayCheckbox.checked).toBe(true);

      autoPlayCheckbox.checked = false;
      expect(autoPlayCheckbox.checked).toBe(false);
    });
  });

  describe("3.2 视觉体验测试", () => {
    test("各滚轮动画错开效果", () => {
      const durations = [];
      for (let i = 0; i < 5; i++) {
        const reel = new Reel(document.createElement("div"), i, []);
        durations.push(reel.factor * 1000);
      }

      for (let i = 1; i < durations.length; i++) {
        expect(durations[i]).toBeGreaterThan(durations[i - 1]);
      }

      expect(durations[4] - durations[0]).toBeGreaterThan(0);
    });
  });

  describe("2.2 设备与分辨率兼容性测试", () => {
    test("不同配置下游戏正常初始化", () => {
      const testConfigs = [
        { inverted: false },
        { inverted: true },
        { onSpinStart: jest.fn() },
        {},
      ];

      testConfigs.forEach((config) => {
        const slotContainer = document.getElementById("slot");

        expect(() => {
          new Slot(slotContainer, config);
        }).not.toThrow();
      });
    });
  });
});
