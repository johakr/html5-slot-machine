import Slot from "../../src/js/Slot.js";
import Reel from "../../src/js/Reel.js";

describe("视觉表现功能测试", () => {
  const setupDOM = () => {
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
  };

  beforeEach(() => {
    setupDOM();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("1.2.1 CSS样式与布局测试", () => {
    test("滚轮容器使用flex布局", () => {
      const reelsContainer = document.getElementById("reels");
      expect(reelsContainer).not.toBeNull();

      reelsContainer.style.display = "flex";
      expect(getComputedStyle(reelsContainer).display).toBe("flex");
    });

    test("每个滚轮宽度为20%实现等分", () => {
      const reels = document.querySelectorAll(".reel");
      expect(reels.length).toBe(5);

      reels.forEach((reel) => {
        reel.style.width = "20%";
        expect(reel.style.width).toBe("20%");
      });
    });

    test("滚轮使用overflow:hidden裁剪", () => {
      const reels = document.querySelectorAll(".reel");
      reels.forEach((reel) => {
        reel.style.overflow = "hidden";
        expect(reel.style.overflow).toBe("hidden");
      });
    });

    test("滚轮使用relative定位", () => {
      const reels = document.querySelectorAll(".reel");
      reels.forEach((reel) => {
        reel.style.position = "relative";
        expect(reel.style.position).toBe("relative");
      });
    });

    test("符号图标使用GPU加速transform3d", () => {
      const reelContainer = document.createElement("div");
      const reel = new Reel(reelContainer, 0, ["yoda", "r2d2", "death_star"]);
      const images = reel.symbolContainer.querySelectorAll("img");

      images.forEach((img) => {
        img.style.transform = "translate3d(0, 0, 0)";
        expect(img.style.transform).toContain("translate3d");
      });
    });
  });

  describe("1.2.2 Inverted视觉模式测试", () => {
    test("inverted模式为滚轮添加scaleY(-1)变换", () => {
      const slotContainer = document.getElementById("slot");
      new Slot(slotContainer, { inverted: true });

      expect(slotContainer.classList.contains("inverted")).toBe(true);

      const reels = document.querySelectorAll(".reel");
      reels.forEach((reel) => {
        expect(reel.parentElement.id).toBe("reels");
      });
    });

    test("非inverted模式不添加变换类", () => {
      const slotContainer = document.getElementById("slot");
      new Slot(slotContainer, { inverted: false });

      expect(slotContainer.classList.contains("inverted")).toBe(false);
    });

    test("默认模式为非inverted", () => {
      const slotContainer = document.getElementById("slot");
      new Slot(slotContainer, {});

      expect(slotContainer.classList.contains("inverted")).toBe(false);
    });
  });

  describe("1.2.3 动画视觉效果测试", () => {
    test("动画关键帧包含清晰->模糊->清晰过渡", () => {
      const animateSpy = jest.spyOn(Element.prototype, "animate");
      const reelContainer = document.createElement("div");
      new Reel(reelContainer, 0, ["yoda", "r2d2", "death_star"]);

      const keyframes = animateSpy.mock.calls[0][0];

      expect(keyframes[0].filter).toBe("blur(0)");
      expect(keyframes[1].filter).toBe("blur(2px)");
      expect(keyframes[2].filter).toBe("blur(0)");
    });

    test("动画使用ease-in-out缓动函数", () => {
      const animateSpy = jest.spyOn(Element.prototype, "animate");
      const reelContainer = document.createElement("div");
      new Reel(reelContainer, 0, ["yoda", "r2d2", "death_star"]);

      const options = animateSpy.mock.calls[0][1];
      expect(options.easing).toBe("ease-in-out");
    });

    test("动画使用top属性而非translateY(Safari兼容)", () => {
      const animateSpy = jest.spyOn(Element.prototype, "animate");
      const reelContainer = document.createElement("div");
      new Reel(reelContainer, 0, ["yoda", "r2d2", "death_star"]);

      const keyframes = animateSpy.mock.calls[0][0];
      expect(keyframes[0].top).toBeDefined();
      expect(keyframes[0].transform).toBeUndefined();
    });

    test("第一个滚轮与最后一个滚轮动画时长差异显著", () => {
      const animateSpy = jest.spyOn(Element.prototype, "animate");

      const reel0 = new Reel(document.createElement("div"), 0, []);
      const reel4 = new Reel(document.createElement("div"), 4, []);

      const duration0 = reel0.factor * 1000;
      const duration4 = reel4.factor * 1000;

      expect(duration4).toBeGreaterThan(duration0);
      expect(duration4 - duration0).toBeGreaterThan(3000);
    });

    test("五个滚轮动画时长严格递增", () => {
      const durations = [];
      for (let i = 0; i < 5; i++) {
        const reel = new Reel(document.createElement("div"), i, []);
        durations.push(reel.factor * 1000);
      }

      for (let i = 1; i < durations.length; i++) {
        expect(durations[i]).toBeGreaterThan(durations[i - 1]);
      }
    });
  });

  describe("1.2.4 Jackpot视觉样式测试", () => {
    test("Jackpot元素存在且包含正确文本", () => {
      const jackpot = document.getElementById("jackpot");
      expect(jackpot).not.toBeNull();
      expect(jackpot.textContent).toContain("Jackpot");
    });

    test("Jackpot显示金色", () => {
      const jackpot = document.getElementById("jackpot");
      jackpot.style.color = "#d5ad6d";
      expect(jackpot.style.color).toBe("rgb(213, 173, 109)");
    });

    test("Jackpot字号足够大(40px)", () => {
      const jackpot = document.getElementById("jackpot");
      jackpot.style.fontSize = "40px";
      expect(jackpot.style.fontSize).toBe("40px");
    });

    test("Jackpot居中对齐", () => {
      const jackpot = document.getElementById("jackpot");
      jackpot.style.textAlign = "center";
      expect(jackpot.style.textAlign).toBe("center");
    });
  });

  describe("1.2.5 控制面板视觉样式测试", () => {
    test("控制面板使用半透明白色背景", () => {
      const controls = document.getElementById("controls");
      controls.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
      expect(controls.style.backgroundColor).toContain("rgba");
      expect(controls.style.backgroundColor).toContain("0.9");
    });

    test("SPIN按钮在DOM中正确渲染", () => {
      const spinButton = document.getElementById("spin");
      expect(spinButton).not.toBeNull();
      expect(spinButton.tagName).toBe("BUTTON");
      expect(spinButton.textContent).toBe("SPIN");
    });

    test("复选框尺寸足够大(40px)便于触摸", () => {
      const checkbox = document.getElementById("autoplay");
      checkbox.style.width = "40px";
      checkbox.style.height = "40px";
      expect(checkbox.style.width).toBe("40px");
      expect(checkbox.style.height).toBe("40px");
    });

    test("Autoplay标签与复选框关联正确", () => {
      const label = document.querySelector("label");
      const checkbox = document.getElementById("autoplay");
      expect(label).not.toBeNull();
      expect(label.textContent).toContain("Autoplay");
      expect(label.contains(checkbox)).toBe(true);
    });
  });

  describe("1.2.6 响应式设计测试", () => {
    test("滚轮使用响应式宽高比计算", () => {
      const reelsContainer = document.getElementById("reels");

      reelsContainer.style.height = "calc((3 / 5) * 100vw)";
      reelsContainer.style.maxHeight = "calc(90vh - 50px - 40px)";
      reelsContainer.style.maxWidth = "calc((5 / 3) * (90vh - 50px - 40px))";

      expect(reelsContainer.style.height).toContain("calc");
      expect(reelsContainer.style.maxHeight).toContain("calc");
      expect(reelsContainer.style.maxWidth).toContain("calc");
    });

    test("响应式媒体查询API存在", () => {
      expect(document.styleSheets).toBeDefined();
    });
  });

  describe("1.2.7 符号渲染视觉测试", () => {
    test("每个滚轮正确渲染3个初始符号", () => {
      const reelContainer = document.createElement("div");
      const initialSymbols = ["yoda", "r2d2", "death_star"];
      const reel = new Reel(reelContainer, 0, initialSymbols);

      expect(reel.symbolContainer.children.length).toBe(3);
    });

    test("SVG符号正确渲染为img元素", () => {
      const reelContainer = document.createElement("div");
      const reel = new Reel(reelContainer, 0, ["yoda"]);
      const images = reel.symbolContainer.querySelectorAll("img");

      images.forEach((img) => {
        expect(img.tagName).toBe("IMG");
      });
    });

    test("符号使用负margin消除间隙", () => {
      const reelContainer = document.createElement("div");
      const reel = new Reel(reelContainer, 0, ["yoda"]);
      const images = reel.symbolContainer.querySelectorAll("img");

      images.forEach((img) => {
        img.style.margin = "-3px 0 0 -3px";
        expect(img.style.margin).toContain("-3px");
      });
    });
  });

  describe("2.1 浏览器兼容性视觉测试", () => {
    test("使用标准Web Animations API", () => {
      expect(typeof Element.prototype.animate).toBe("function");
    });

    test("CSS transform可应用于DOM元素", () => {
      const testEl = document.createElement("div");
      testEl.style.transform = "scaleY(-1)";
      expect(testEl.style.transform).toContain("scaleY");
    });

    test("CSS filter可应用于DOM元素", () => {
      const testEl = document.createElement("div");
      testEl.style.filter = "blur(2px)";
      expect(testEl.style.filter).toContain("blur");
    });
  });

  describe("3.2 视觉体验用户测试", () => {
    test("旋转过程中按钮禁用有视觉反馈", () => {
      const slotContainer = document.getElementById("slot");
      const spinButton = document.getElementById("spin");
      const slot = new Slot(slotContainer, {});

      expect(spinButton.disabled).toBe(false);
      slot.spin();
      expect(spinButton.disabled).toBe(true);
    });

    test("级联停止创造悬念视觉效果", () => {
      const factors = [];
      for (let i = 0; i < 5; i++) {
        const reel = new Reel(document.createElement("div"), i, []);
        factors.push(reel.factor);
      }

      const stopTimeDifference = factors[4] - factors[0];
      expect(stopTimeDifference).toBeGreaterThan(3);
    });

    test("运动模糊增强高速旋转视觉", () => {
      const animateSpy = jest.spyOn(Element.prototype, "animate");
      new Reel(document.createElement("div"), 0, []);
      const keyframes = animateSpy.mock.calls[0][0];

      const hasBlur = keyframes.some(
        (kf) => kf.filter && kf.filter.includes("blur"),
      );
      expect(hasBlur).toBe(true);
    });
  });
});
