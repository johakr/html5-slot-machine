import "@testing-library/jest-dom";
import { jest } from "@jest/globals";

global.Image = class {
  constructor() {
    const img = document.createElement("img");
    img.src = "";
    return img;
  }
};

global.require = (path) => path;

window.resizeTo = jest.fn();

global.Element.prototype.animate = jest.fn(() => ({
  cancel: jest.fn(),
  play: jest.fn(),
  finish: jest.fn(),
  playState: "finished",
  onfinish: null,
}));

jest.setTimeout(30000);
