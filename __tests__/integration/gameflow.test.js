import Slot from "../../src/js/Slot.js";

describe("游戏流程集成测试", () => {
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

  describe("1. 基础游戏流程测试", () => {
    test("完整游戏流程：初始化 -> 点击spin -> 旋转开始", () => {
      const slotContainer = document.getElementById("slot");
      const spinButton = document.getElementById("spin");

      const slot = new Slot(slotContainer, {});

      expect(spinButton.disabled).toBe(false);
      expect(slot.reels.length).toBe(5);

      slot.spin();
      expect(spinButton.disabled).toBe(true);
    });

    test("游戏创建5个滚轮", () => {
      const slotContainer = document.getElementById("slot");
      const slot = new Slot(slotContainer, {});

      expect(slot.reels.length).toBe(5);
      slot.reels.forEach((reel) => {
        expect(reel).toBeDefined();
      });
    });
  });

  describe("2. 用户交互测试", () => {
    test("用户点击spin按钮触发游戏", () => {
      const slotContainer = document.getElementById("slot");
      const spinButton = document.getElementById("spin");
      const slot = new Slot(slotContainer, {});
      const spinSpy = jest.spyOn(slot, "spin");

      spinButton.click();

      expect(spinSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe("3. 自动播放功能集成测试", () => {
    test("自动播放复选框可正常勾选", () => {
      const autoPlayCheckbox = document.getElementById("autoplay");
      autoPlayCheckbox.checked = true;
      expect(autoPlayCheckbox.checked).toBe(true);
    });
  });

  describe("4. 视觉表现集成测试", () => {
    test("inverted模式正确应用样式", () => {
      const slotContainer = document.getElementById("slot");
      new Slot(slotContainer, { inverted: true });

      expect(slotContainer.classList.contains("inverted")).toBe(true);
    });
  });

  describe("5. 回调函数集成测试", () => {
    test("onSpinStart回调在旋转开始时触发", () => {
      const onSpinStartMock = jest.fn();
      const slotContainer = document.getElementById("slot");

      const slot = new Slot(slotContainer, {
        onSpinStart: onSpinStartMock,
      });

      slot.spin();
      expect(onSpinStartMock).toHaveBeenCalled();
    });
  });
});
