// Procedural fabric patterns (grayscale tiles used as bump maps) — no image assets needed.
const cache = {};

export function patternCanvas(kind) {
  if (cache[kind]) return cache[kind];
  const S = 256;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d');
  g.fillStyle = '#808080';
  g.fillRect(0, 0, S, S);
  const rnd = mulberry(kind.length * 97 + 13);

  if (kind === 'jersey' || kind === 'knit') {
    const step = kind === 'knit' ? 8 : 4;
    for (let y = 0; y < S; y += step) {
      for (let x = 0; x < S; x += step) {
        const v = 110 + rnd() * 50;
        g.fillStyle = `rgb(${v},${v},${v})`;
        g.beginPath();
        g.ellipse(x + step / 2, y + step / 2, step * 0.32, step * 0.5, 0, 0, Math.PI * 2);
        g.fill();
      }
    }
  } else if (kind === 'twill') {
    g.lineWidth = 2;
    for (let i = -S; i < S * 2; i += 5) {
      const v = 90 + rnd() * 90;
      g.strokeStyle = `rgb(${v},${v},${v})`;
      g.beginPath(); g.moveTo(i, 0); g.lineTo(i + S, S); g.stroke();
    }
  } else if (kind === 'ripstop') {
    for (let i = 0; i < 3000; i++) {
      const v = 115 + rnd() * 25;
      g.fillStyle = `rgb(${v},${v},${v})`;
      g.fillRect(rnd() * S, rnd() * S, 2, 2);
    }
    g.strokeStyle = '#b0b0b0'; g.lineWidth = 1.5;
    for (let i = 0; i <= S; i += 32) {
      g.beginPath(); g.moveTo(i, 0); g.lineTo(i, S); g.stroke();
      g.beginPath(); g.moveTo(0, i); g.lineTo(S, i); g.stroke();
    }
  } else if (kind === 'grain') {
    for (let i = 0; i < 1400; i++) {
      const v = 60 + rnd() * 120;
      g.fillStyle = `rgba(${v},${v},${v},0.55)`;
      g.beginPath();
      g.arc(rnd() * S, rnd() * S, 1 + rnd() * 4, 0, Math.PI * 2);
      g.fill();
    }
  }
  cache[kind] = c;
  return c;
}

function mulberry(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
