import Slot from "./Slot.js";

const config = {
  inverted: false, // true: reels spin from top to bottom; false: reels spin from bottom to top
  onSpinStart: (symbols) => {},
  onSpinEnd: (symbols) => {},
};

const slot = new Slot(document.getElementById("slot"), config);
