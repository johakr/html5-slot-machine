class MockAnimation {
  constructor() {
    this.playState = 'idle';
    this.onfinish = null;
  }

  play() {
    this.playState = 'running';
    if (this.onfinish) {
      setTimeout(() => {
        this.playState = 'finished';
        this.onfinish();
      }, 0);
    }
  }

  pause() {
    this.playState = 'paused';
  }

  cancel() {
    this.playState = 'idle';
  }

  finish() {
    this.playState = 'finished';
    if (this.onfinish) {
      this.onfinish();
    }
  }
}

if (typeof window !== 'undefined') {
  window.Animation = MockAnimation;
  window.setTimeout = global.setTimeout;
  window.clearTimeout = global.clearTimeout;
}

HTMLDivElement.prototype.animate = function() {
  return new MockAnimation();
};
