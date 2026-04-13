import Slot from "../../src/js/Slot.js";
import Symbol from "../../src/js/Symbol.js";

jest.mock("../../src/js/Reel.js", () => {
  return jest.fn().mockImplementation((container, idx, symbols) => ({
    reelContainer: container,
    idx: idx,
    renderSymbols: jest.fn(),
    spin: jest.fn(() => Promise.resolve()),
  }));
});

jest.mock("../../src/js/Symbol.js", () => ({
  default: {
    preload: jest.fn(),
    random: jest.fn(() => "test_symbol"),
    symbols: ["yoda", "r2d2", "death_star"],
  },
  __esModule: true,
}));

describe("Slot Class - 核心功能测试", () => {
  let slotContainer;
  let spinButton;
  let autoPlayCheckbox;

  beforeEach(() => {
    slotContainer = document.createElement("div");
    slotContainer.id = "slot";

    for (let i = 0; i < 5; i++) {
      const reel = document.createElement("div");
      reel.className = "reel";
      slotContainer.appendChild(reel);
    }

    spinButton = document.createElement("button");
    spinButton.id = "spin";
    document.body.appendChild(spinButton);

    autoPlayCheckbox = document.createElement("input");
    autoPlayCheckbox.id = "autoplay";
    autoPlayCheckbox.type = "checkbox";
    document.body.appendChild(autoPlayCheckbox);
  });

  afterEach(() => {
    document.body.innerHTML = "";
    jest.clearAllMocks();
  });

  describe("1.1 基础功能 - 构造函数", () => {
    test("应正确初始化Slot实例", () => {
      const config = { inverted: false };
      const slot = new Slot(slotContainer, config);

      expect(Symbol.preload).toHaveBeenCalled();
      expect(slot.reels.length).toBe(5);
      expect(slot.spinButton).toBe(spinButton);
    });

    test("inverted模式应添加CSS类", () => {
      const config = { inverted: true };
      const slot = new Slot(slotContainer, config);

      expect(slotContainer.classList.contains("inverted")).toBe(true);
    });

    test("应初始化5个滚轮，每个滚轮3个符号", () => {
      const slot = new Slot(slotContainer, {});

      expect(slot.currentSymbols.length).toBe(5);
      slot.currentSymbols.forEach((reel) => {
        expect(reel.length).toBe(3);
      });
    });
  });

  describe("1.1 基础功能 - spin()方法", () => {
    test("点击spin按钮应触发spin", () => {
      const slot = new Slot(slotContainer, {});
      const spinSpy = jest.spyOn(slot, "spin");

      spinButton.click();

      expect(spinSpy).toHaveBeenCalled();
    });

    test("spin应返回Promise", async () => {
      const slot = new Slot(slotContainer, {});
      const result = slot.spin();

      expect(result).toBeInstanceOf(Promise);
      await result;
    });

    test("每个滚轮都应调用spin方法", async () => {
      const slot = new Slot(slotContainer, {});
      await slot.spin();

      slot.reels.forEach((reel) => {
        expect(reel.spin).toHaveBeenCalled();
      });
    });

    test("每个滚轮都应调用renderSymbols", async () => {
      const slot = new Slot(slotContainer, {});
      await slot.spin();

      slot.reels.forEach((reel) => {
        expect(reel.renderSymbols).toHaveBeenCalled();
      });
    });
  });

  describe("1.1 基础功能 - onSpinStart/onSpinEnd回调", () => {
    test("开始旋转时应禁用spin按钮", async () => {
      const slot = new Slot(slotContainer, {});
      slot.spin();

      expect(spinButton.disabled).toBe(true);
    });

    test("旋转结束时应启用spin按钮", async () => {
      const slot = new Slot(slotContainer, {});
      await slot.spin();

      expect(spinButton.disabled).toBe(false);
    });

    test("应调用配置的onSpinStart回调", () => {
      const onSpinStartMock = jest.fn();
      const config = { onSpinStart: onSpinStartMock };
      const slot = new Slot(slotContainer, config);

      slot.spin();

      expect(onSpinStartMock).toHaveBeenCalled();
    });

    test("应调用配置的onSpinEnd回调", async () => {
      const onSpinEndMock = jest.fn();
      const config = { onSpinEnd: onSpinEndMock };
      const slot = new Slot(slotContainer, config);

      await slot.spin();

      expect(onSpinEndMock).toHaveBeenCalled();
    });
  });

  describe("1.1 基础功能 - 自动播放", () => {
    test("勾选autoplay时旋转结束应自动开始下一次", async () => {
      jest.useFakeTimers();
      autoPlayCheckbox.checked = true;

      const slot = new Slot(slotContainer, {});
      const spinSpy = jest.spyOn(slot, "spin").mockClear();

      await slot.spin();
      jest.runAllTimers();

      expect(spinSpy).toHaveBeenCalled();
      jest.useRealTimers();
    });

    test("未勾选autoplay时不自动开始下一次", async () => {
      jest.useFakeTimers();
      autoPlayCheckbox.checked = false;
      const setTimeoutSpy = jest.spyOn(window, "setTimeout");

      const slot = new Slot(slotContainer, {});
      await slot.spin();
      jest.runAllTimers();

      expect(setTimeoutSpy).not.toHaveBeenCalled();
      jest.useRealTimers();
    });
  });

  describe("3.1 操作体验", () => {
    test("旋转过程中spin按钮应禁用，防止重复点击", async () => {
      const slot = new Slot(slotContainer, {});

      const spinPromise = slot.spin();
      expect(spinButton.disabled).toBe(true);

      await spinPromise;
      expect(spinButton.disabled).toBe(false);
    });
  });

  describe("4.1 长时间运行稳定性", () => {
    test("连续多次spin状态应保持一致", async () => {
      const slot = new Slot(slotContainer, {});

      for (let i = 0; i < 20; i++) {
        await slot.spin();
        expect(spinButton.disabled).toBe(false);
      }
    }, 10000);
  });

  describe("五、业务规则验证", () => {
    test("旋转结果应包含随机符号", async () => {
      Symbol.random.mockReturnValue("yoda");
      const slot = new Slot(slotContainer, {});

      await slot.spin();

      slot.nextSymbols.forEach((reel) => {
        reel.forEach((symbol) => {
          expect(symbol).toBe("yoda");
        });
      });
    });

    test("spin时nextSymbols由随机符号生成", () => {
      Symbol.random.mockClear();
      const slot = new Slot(slotContainer, {});

      slot.spin();

      expect(Symbol.random).toHaveBeenCalledTimes(15);
    });
  });

  describe("4.2 异常场景容错", () => {
    test("无滚轮元素时优雅降级", () => {
      const emptyContainer = document.createElement("div");
      emptyContainer.id = "empty-slot";

      expect(() => {
        new Slot(emptyContainer, {});
      }).not.toThrow();
    });

    test("无配置参数时使用默认值", () => {
      expect(() => {
        new Slot(slotContainer);
      }).not.toThrow();
    });
  });
});
