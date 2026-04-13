/**
 * Jest 测试环境配置
 */

// Mock Web Animations API
global.Element.prototype.animate = jest.fn(function(keyframes, options) {
  const animation = {
    play: jest.fn(),
    pause: jest.fn(),
    cancel: jest.fn(),
    finish: jest.fn(),
    reverse: jest.fn(),
    playState: 'idle',
    effect: {
      getKeyframes: jest.fn(() => keyframes || []),
      getTiming: jest.fn(() => options || {}),
    },
    onfinish: null,
  };
  
  // 模拟动画完成
  setTimeout(() => {
    animation.playState = 'finished';
    if (animation.onfinish) {
      animation.onfinish();
    }
  }, (options?.duration || 1000));
  
  return animation;
});

// Mock getAnimations
global.Element.prototype.getAnimations = jest.fn(function() {
  return [];
});

// Mock Image
class MockImage {
  constructor() {
    this.src = '';
    this.complete = true;
    this.naturalWidth = 100;
    this.naturalHeight = 100;
    this.onload = null;
    this.onerror = null;
  }
  
  set src(value) {
    this._src = value;
    // 模拟异步加载
    setTimeout(() => {
      if (this.onload) {
        this.onload();
      }
    }, 0);
  }
  
  get src() {
    return this._src;
  }
}

global.Image = MockImage;

// Mock document.createElement for images
document.createElement = jest.fn((tagName) => {
  if (tagName.toLowerCase() === 'img') {
    return new MockImage();
  }
  return document.createElement._original(tagName);
});

document.createElement._original = document.createElement;

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn((callback) => {
  return setTimeout(callback, 16);
});

global.cancelAnimationFrame = jest.fn((id) => {
  clearTimeout(id);
});

// Mock performance API
if (!global.performance) {
  global.performance = {
    now: jest.fn(() => Date.now()),
    timing: {
      navigationStart: Date.now(),
      domContentLoadedEventEnd: Date.now() + 100,
      loadEventEnd: Date.now() + 200,
    },
  };
}

// Mock PerformanceObserver
global.PerformanceObserver = jest.fn(function(callback) {
  this.observe = jest.fn();
  this.disconnect = jest.fn();
  this.takeRecords = jest.fn(() => []);
});

global.PerformanceObserver.supportedEntryTypes = ['navigation', 'resource', 'paint', 'layout-shift', 'longtask'];

// 清理 DOM
global.beforeEach(() => {
  document.body.innerHTML = '';
});

// 清理 mocks
global.afterEach(() => {
  jest.clearAllMocks();
});
