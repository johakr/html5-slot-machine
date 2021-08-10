import Slot from "./Slot.js";

window.onload = () => {
  const config = {
    inverted: false, // true: reels spin from top to bottom; false: reels spin from bottom to top
    award: "at_at",
  };

  const slot = new Slot(document.getElementById("slot"), config);
  slot.award = "c3po";
};
