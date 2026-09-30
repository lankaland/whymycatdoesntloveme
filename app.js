// Placeholder logic to prove the deploy pipeline end-to-end.
// The real spinning-wheel animation gets built once the visual style is picked;
// for now, "Spin" just picks a weighted result and shows it, and unlocks audio.

let options = [];
let musicStarted = false;

const music = document.getElementById('bg-music');
const muteBtn = document.getElementById('mute-btn');
const spinBtn = document.getElementById('spin-btn');
const spinAgainBtn = document.getElementById('spin-again-btn');
const resultDiv = document.getElementById('result');
const resultText = document.getElementById('result-text');

async function loadOptions() {
  const res = await fetch('wheel-options.json');
  return res.json();
}

function pickWeighted(items) {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let r = Math.random() * total;
  for (const item of items) {
    if (r < item.weight) return item;
    r -= item.weight;
  }
  return items[items.length - 1];
}

loadOptions().then((data) => {
  options = data;
});

function spin() {
  if (!musicStarted) {
    music.play().catch(() => {
      // Autoplay can still fail silently on some browsers; that's fine,
      // the mute button state stays in sync either way.
    });
    musicStarted = true;
  }

  if (options.length === 0) return;

  const winner = pickWeighted(options);
  resultText.textContent = winner.label;
  resultDiv.hidden = false;
}

spinBtn.addEventListener('click', spin);
spinAgainBtn.addEventListener('click', spin);

muteBtn.addEventListener('click', () => {
  music.muted = !music.muted;
  muteBtn.textContent = music.muted ? '🔈' : '🔊';
});
