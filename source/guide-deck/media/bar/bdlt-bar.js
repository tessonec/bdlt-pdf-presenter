/* bdlt-bar.js -- chips keep the width of their widest content, so nothing next to them moves.
 *   <span class="chip" id="cB" data-max="block 12 / 12"></span>      BDLT.chip('cB', 'block 3 / 12')
 * A minimal copy written for the guide deck of BDLT PDF Presenter (the release v3.4.1 has no bar/). */
(function () {
  var B = window.BDLT = window.BDLT || {};
  function size() {
    document.querySelectorAll('.chip[data-max]').forEach(function (c) {
      var t = c.textContent; c.style.width = ''; c.textContent = c.dataset.max;
      var w = Math.ceil(c.getBoundingClientRect().width) + 1;
      c.textContent = t; c.style.width = w + 'px';
    });
  }
  B.chip = function (id, text) { var c = document.getElementById(id); if (c && c.textContent !== text) c.textContent = text; };
  B.sizeChips = size;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', size); else size();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(size);
})();
