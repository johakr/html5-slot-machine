export const SLOT_HTML = `
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

export const SIMPLE_SLOT_HTML = `
<div id="slot">
  <div id="reels">
    <div class="reel"></div>
    <div class="reel"></div>
    <div class="reel"></div>
    <div class="reel"></div>
    <div class="reel"></div>
  </div>
  <div id="controls">
    <button type="button" id="spin">SPIN</button>
    <input type="checkbox" id="autoplay" />
  </div>
</div>
`;

export const INCOMPLETE_SLOT_HTML = `
<div id="slot">
  <div id="reels">
    <div class="reel"></div>
  </div>
  <div id="controls">
    <button type="button" id="spin">SPIN</button>
  </div>
</div>
`;

export const SINGLE_REEL_HTML = '<div class="reel"></div>';

export function setupSlotDOM(html = SLOT_HTML) {
  document.body.innerHTML = html;
  return document.getElementById('slot');
}

export function setupSimpleSlotDOM() {
  return setupSlotDOM(SIMPLE_SLOT_HTML);
}

export function setupIncompleteSlotDOM() {
  return setupSlotDOM(INCOMPLETE_SLOT_HTML);
}

export function setupSingleReelDOM() {
  document.body.innerHTML = SINGLE_REEL_HTML;
  return document.querySelector('.reel');
}
