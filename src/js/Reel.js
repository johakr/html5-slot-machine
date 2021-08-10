import Symbol from "./Symbol.js";

export default class Reel {
  constructor(reelContainer, idx, initialSymbols) {
    this.reelContainer = reelContainer;
    this.idx = idx;

    this.symbolContainer = document.createElement("div");
    this.symbolContainer.classList.add("icons");
    this.reelContainer.appendChild(this.symbolContainer);

    const height_ = this.reelContainer.clientWidth;

    this.animation = this.symbolContainer.animate(
      [
        {
          top: "0px",
          filter: "blur(0)",
        },
        {
          filter: "blur(2px)",
        },
        {
          top: `-${this.factor * 10 * height_}px`,
          filter: "blur(0)",
        },
      ],
      {
        duration: this.factor * 1000,
        easing: "ease-in-out",
      }
    );
    this.animation.cancel();

    initialSymbols.forEach((symbol) =>
      this.symbolContainer.appendChild(new Symbol(symbol).img)
    );
  }

  get factor() {
    return 2 + this.idx;
  }

  renderSymbols(nextSymbols) {
    const fragment = document.createDocumentFragment();

    for (let i = 3; i < 3 + this.factor * 10; i++) {
      const icon = new Symbol(
        i >= 10 * this.factor - 2
          ? nextSymbols[i - this.factor * 10]
          : undefined
      );
      fragment.appendChild(icon.img);
    }

    this.symbolContainer.appendChild(fragment);
  }

  spin() {
    const animationPromise = new Promise(
      (resolve) => (this.animation.onfinish = resolve)
    );
    const timeoutPromise = new Promise((resolve) =>
      setTimeout(resolve, this.factor * 1000)
    );

    this.animation.play();

    return Promise.race([animationPromise, timeoutPromise]).then(() => {
      if (this.animation.playState !== "finished") this.animation.finish();

      const max = this.symbolContainer.children.length - 3;

      for (let i = 0; i < max; i++) {
        this.symbolContainer.firstChild.remove();
      }
    });
  }
}
