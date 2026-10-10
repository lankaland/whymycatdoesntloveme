// whymycatdoesntloveme.com — wheel logic.
// Outcomes and their odds live in wheel-options.json, not here — edit
// that file to change what the wheel says, no code changes needed.

function drawCatHub(ctx, cx, cy, r) {
  ctx.fillStyle = '#ffd2c2';
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.7, cy - r * 0.4);
  ctx.lineTo(cx - r * 0.95, cy - r * 1.15);
  ctx.lineTo(cx - r * 0.25, cy - r * 0.75);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + r * 0.7, cy - r * 0.4);
  ctx.lineTo(cx + r * 0.95, cy - r * 1.15);
  ctx.lineTo(cx + r * 0.25, cy - r * 0.75);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#3a2a1f';
  ctx.beginPath();
  ctx.arc(cx - r * 0.3, cy - r * 0.05, r * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + r * 0.3, cy - r * 0.05, r * 0.08, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#e8544f';
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.1, cy + r * 0.15);
  ctx.lineTo(cx + r * 0.1, cy + r * 0.15);
  ctx.lineTo(cx, cy + r * 0.3);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#3a2a1f';
  ctx.lineWidth = 1.2;
  [-1, 1].forEach((side) => {
    [-0.08, 0, 0.08].forEach((offset) => {
      ctx.beginPath();
      ctx.moveTo(cx + side * r * 0.15, cy + r * 0.2 + offset * r);
      ctx.lineTo(cx + side * r * 0.9, cy + r * 0.1 + offset * r * 1.3);
      ctx.stroke();
    });
  });
}

const theme = {
  colors: [
    '#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#FF9F45', '#C780FA',
    '#4DCCBD', '#FF8FAB', '#A3D977', '#6C9BCF', '#F67280', '#F8B400', '#9B7EDE',
  ],
  sliceBorder: 3,
  sliceBorderColor: '#ffffff',
  rimWidth: 2,
  hubRadius: 30,
  hubColor: '#ffffff',
  pegColor: '#ffffff',
  pegRadius: 3,
  pegInset: 4,
  drawHub: drawCatHub,
};

function buildWheel(canvas, options, theme) {
  const ctx = canvas.getContext('2d');
  const size = canvas.width;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - theme.rimWidth;

  const total = options.reduce((s, o) => s + o.weight, 0);
  let cursor = 0;
  const slices = options.map((o) => {
    const angle = (o.weight / total) * 360;
    const slice = { ...o, start: cursor, end: cursor + angle, mid: cursor + angle / 2 };
    cursor += angle;
    return slice;
  });

  function toCanvasAngle(deg) {
    return ((deg - 90) * Math.PI) / 180;
  }

  ctx.clearRect(0, 0, size, size);
  slices.forEach((s, i) => {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.fillStyle = theme.colors[i % theme.colors.length];
    ctx.arc(cx, cy, radius, toCanvasAngle(s.start), toCanvasAngle(s.end));
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = theme.sliceBorder;
    ctx.strokeStyle = theme.sliceBorderColor;
    ctx.stroke();
  });

  if (theme.pegColor) {
    slices.forEach((s) => {
      const a = toCanvasAngle(s.start);
      const px = cx + Math.cos(a) * (radius - theme.pegInset);
      const py = cy + Math.sin(a) * (radius - theme.pegInset);
      ctx.beginPath();
      ctx.arc(px, py, theme.pegRadius, 0, Math.PI * 2);
      ctx.fillStyle = theme.pegColor;
      ctx.fill();
    });
  }

  ctx.beginPath();
  ctx.arc(cx, cy, theme.hubRadius, 0, Math.PI * 2);
  ctx.fillStyle = theme.hubColor;
  ctx.fill();
  ctx.lineWidth = theme.sliceBorder;
  ctx.strokeStyle = theme.sliceBorderColor;
  ctx.stroke();
  if (theme.drawHub) theme.drawHub(ctx, cx, cy, theme.hubRadius);

  return { slices };
}

function pickWeighted(slices) {
  const total = slices.reduce((s, o) => s + o.weight, 0);
  let r = Math.random() * total;
  for (let i = 0; i < slices.length; i++) {
    if (r < slices[i].weight) return i;
    r -= slices[i].weight;
  }
  return slices.length - 1;
}

function easeOutQuint(t) {
  return 1 - Math.pow(1 - t, 5);
}

function initWheel({ canvas, rotor, options, theme, pointerEl, spinBtn, resultBox, resultText, onFirstSpin }) {
  const wheel = buildWheel(canvas, options, theme);
  let currentTotal = 0;
  let spinning = false;
  let started = false;

  function fireTick() {
    pointerEl.classList.remove('tick');
    void pointerEl.offsetWidth; // restart the CSS animation even if it's mid-flight
    pointerEl.classList.add('tick');
  }

  function spin() {
    if (spinning) return;
    spinning = true;
    spinBtn.disabled = true;
    resultBox.hidden = true;

    if (!started) {
      started = true;
      if (onFirstSpin) onFirstSpin();
    }

    const winnerIdx = pickWeighted(wheel.slices);
    const s = wheel.slices[winnerIdx];
    const margin = Math.min(4, (s.end - s.start) / 4);
    const span = Math.max(0, (s.end - s.start) - margin * 2);
    const jitter = span > 0 ? (Math.random() - 0.5) * span : 0;
    const targetMid = s.mid + jitter;

    const currentMod = ((currentTotal % 360) + 360) % 360;
    const targetAlign = (((360 - targetMid) % 360) + 360) % 360;
    let delta = targetAlign - currentMod;
    if (delta < 0) delta += 360;

    const extraSpins = 5 + Math.floor(Math.random() * 3);
    const startTotal = currentTotal;
    const targetTotal = currentTotal + extraSpins * 360 + delta;
    currentTotal = targetTotal;

    const spanDeg = targetTotal - startTotal;
    const maxK = Math.ceil(spanDeg / 360) + 1;
    const triggers = [];
    wheel.slices.forEach((sl) => {
      const base = ((360 - sl.start) % 360 + 360) % 360;
      for (let k = 0; k <= maxK; k++) {
        const r = base + 360 * k;
        if (r > startTotal && r <= targetTotal) triggers.push(r);
      }
    });
    triggers.sort((a, b) => a - b);
    let nextTrigger = 0;

    const duration = 4600;
    const startTime = performance.now();

    function frame(now) {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = easeOutQuint(t);
      const rot = startTotal + (targetTotal - startTotal) * eased;
      rotor.style.transform = `rotate(${rot}deg)`;

      while (nextTrigger < triggers.length && triggers[nextTrigger] <= rot) {
        fireTick();
        nextTrigger++;
      }

      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        resultText.textContent = s.label;
        resultBox.hidden = false;
        spinning = false;
        spinBtn.disabled = false;
      }
    }

    requestAnimationFrame(frame);
  }

  spinBtn.addEventListener('click', spin);
}

const music = document.getElementById('bg-music');
const muteBtn = document.getElementById('mute-btn');
let muted = false;
muteBtn.addEventListener('click', () => {
  muted = !muted;
  music.muted = muted;
  muteBtn.textContent = muted ? '🔈' : '🔊';
});

fetch('wheel-options.json')
  .then((res) => res.json())
  .then((options) => {
    initWheel({
      canvas: document.getElementById('wheel'),
      rotor: document.getElementById('wheel-rotor'),
      options,
      theme,
      pointerEl: document.getElementById('pointer'),
      spinBtn: document.getElementById('spin-btn'),
      resultBox: document.getElementById('result'),
      resultText: document.getElementById('result-text'),
      onFirstSpin: () => {
        music.play().catch(() => {
          // Autoplay can still be blocked in rare cases; the mute
          // button still works regardless.
        });
      },
    });
  });
