// Theme toggle: dark by default; the choice is shared with the lab.
(() => {
  const button = document.querySelector(".theme-toggle");
  if (!button) return;
  const root = document.documentElement;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const label = () => button.setAttribute("aria-label", root.dataset.theme === "light" ? "Switch to dark mode" : "Switch to light mode");
  function apply(theme) {
    if (theme === "light") root.dataset.theme = "light";
    else delete root.dataset.theme;
    try { localStorage.setItem("theme", theme); } catch (e) {}
    label();
  }
  button.addEventListener("click", () => {
    const next = root.dataset.theme === "light" ? "dark" : "light";
    if (document.startViewTransition && !reduceMotion.matches) document.startViewTransition(() => apply(next));
    else apply(next);
  });
  label();
})();

// Passwords: drawn with the browser's secure random generator, then each
// character rolls through a few random glyphs before it settles, left to
// right. Tap a password to copy it.
(() => {
  const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const NUMBERS = "0123456789";
  const SYMBOLS = "~`!@#$%^&*()_-+={[}],|:;<>.?/";

  const form = document.getElementById("controls");
  const length = document.getElementById("length");
  const lengthOut = document.getElementById("length-out");
  const numbers = document.getElementById("numbers");
  const symbols = document.getElementById("symbols");
  const plates = [...document.querySelectorAll(".password")];
  const bits = document.getElementById("bits");
  const verdict = document.getElementById("verdict");
  const fill = document.querySelector(".strength-fill");
  const status = document.getElementById("status");
  const motion = document.documentElement.classList.contains("motion");

  // a fair random index below max (no modulo bias)
  function randomIndex(max) {
    const limit = Math.floor(0x100000000 / max) * max;
    const buf = new Uint32Array(1);
    do crypto.getRandomValues(buf); while (buf[0] >= limit);
    return buf[0] % max;
  }

  function pool() {
    return LETTERS + (numbers.checked ? NUMBERS : "") + (symbols.checked ? SYMBOLS : "");
  }

  function makePassword(chars, n) {
    let out = "";
    for (let i = 0; i < n; i++) out += chars[randomIndex(chars.length)];
    return out;
  }

  function showStrength(chars, n) {
    const b = Math.round(n * Math.log2(chars.length));
    bits.textContent = b;
    verdict.textContent = b < 60 ? "weak" : b < 80 ? "fair" : b < 100 ? "strong" : "very strong";
    fill.style.width = Math.min(100, (b / 128) * 100) + "%";
  }

  // each character settles 28ms after the one before it; the rest keep
  // rolling, a new glyph every 40ms
  function roll(el, value, chars, delay) {
    const n = value.length;
    const start = performance.now() + delay;
    const settle = (i) => 120 + i * 28;
    let last = 0;
    cancelAnimationFrame(el.frame);
    function frame(now) {
      const t = now - start;
      if (now - last < 40 && t < settle(n - 1)) {
        el.frame = requestAnimationFrame(frame);
        return;
      }
      last = now;
      let settled = "";
      let rolling = "";
      for (let i = 0; i < n; i++) {
        if (t >= settle(i)) settled += value[i];
        else rolling += chars[randomIndex(chars.length)];
      }
      el.textContent = settled;
      if (rolling) {
        const span = document.createElement("span");
        span.className = "is-rolling";
        span.textContent = rolling;
        el.append(span);
        el.frame = requestAnimationFrame(frame);
      }
    }
    el.frame = requestAnimationFrame(frame);
  }

  function generate() {
    const chars = pool();
    const n = Number(length.value);
    plates.forEach((plate, i) => {
      const value = makePassword(chars, n);
      plate.dataset.value = value;
      plate.querySelector(".password-value").textContent = `Password ${i + 1}: ${value}. Select to copy.`;
      const text = plate.querySelector(".password-text");
      if (motion) roll(text, value, chars, i * 80);
      else text.textContent = value;
    });
    showStrength(chars, n);
    status.textContent = "Two new passwords generated.";
  }

  async function copy(plate) {
    const value = plate.dataset.value;
    if (!value) return;
    const label = plate.querySelector(".password-copy");
    try {
      await navigator.clipboard.writeText(value);
      label.textContent = "copied";
      status.textContent = "Copied to clipboard.";
    } catch (e) {
      // no clipboard access: select the text so it can be copied by hand
      const range = document.createRange();
      range.selectNodeContents(plate.querySelector(".password-text"));
      getSelection().removeAllRanges();
      getSelection().addRange(range);
      label.textContent = "selected";
    }
    plate.classList.add("is-copied");
    clearTimeout(plate.timer);
    plate.timer = setTimeout(() => {
      plate.classList.remove("is-copied");
      label.textContent = "copy";
    }, 1400);
  }

  length.addEventListener("input", () => {
    lengthOut.textContent = length.value;
    showStrength(pool(), Number(length.value));
  });
  [numbers, symbols].forEach((box) =>
    box.addEventListener("change", () => showStrength(pool(), Number(length.value)))
  );
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    generate();
  });
  plates.forEach((plate) => plate.addEventListener("click", () => copy(plate)));

  generate();
})();
