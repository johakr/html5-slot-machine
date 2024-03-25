import Slot from "./Slot.js";

const config = {
  inverted: false, // true: reels spin from top to bottom; false: reels spin from bottom to top
  onSpinStart: (symbols) => {
    console.log("onSpinStart", symbols);
  },
  onSpinEnd: (symbols) => {
    console.log("onSpinEnd", symbols);
  },
};

let INIT_BALANCE = 500;
let CURRENT_BET = 0;

const balanceElement = document.querySelector("#balance #bl");
balanceElement.innerHTML = INIT_BALANCE;

function initValue() {
  const buttons = document.querySelectorAll("button");

  // Add click event listener to each button
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      console.log("Button clicked:", button.id);

      switch (button.id) {
        case "bt_10":
          CURRENT_BET = INIT_BALANCE * 0.1;
          break;
        case "bt_25":
          CURRENT_BET = (INIT_BALANCE * 25) / 100;
          break;
        case "bt_50":
          CURRENT_BET = INIT_BALANCE / 2;
          break;
        case "bt_100":
          CURRENT_BET = INIT_BALANCE;
          break;
      }
      console.log("current bet: ", CURRENT_BET);
    });
  });
}

initValue();

const slot = new Slot(document.getElementById("slot"), config);
