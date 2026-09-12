/**
 * WebAudio synth SFX — no binary assets (DEC-001).
 * All sounds generated with oscillators + envelopes.
 */
let ctx = null;

function ensureCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone({ freq = 440, endFreq = null, type = 'sine', dur = 0.2, vol = 0.3, delay = 0, slideType = 0 }) {
  const c = ensureCtx();
  const t0 = c.currentTime + delay;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (endFreq) osc.frequency.exponentialRampToValueAtTime(Math.max(1, endFreq), t0 + dur);
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(vol, t0 + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

function noise({ dur = 0.25, vol = 0.3, filterFreq = 2000, delay = 0, type = 'lowpass' }) {
  const c = ensureCtx();
  const t0 = c.currentTime + delay;
  const buffer = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = c.createBufferSource();
  src.buffer = buffer;
  const filter = c.createBiquadFilter();
  filter.type = type;
  filter.frequency.value = filterFreq;
  const gain = c.createGain();
  gain.gain.setValueAtTime(vol, t0);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(filter).connect(gain).connect(c.destination);
  src.start(t0);
}

export const sfx = {
  charge() { tone({ freq: 200, endFreq: 900, type: 'sawtooth', dur: 0.25, vol: 0.12 }); },
  launch() {
    tone({ freq: 300, endFreq: 900, type: 'triangle', dur: 0.18, vol: 0.25 });
    noise({ dur: 0.15, vol: 0.12, filterFreq: 3000 });
  },
  thud() {
    noise({ dur: 0.2, vol: 0.3, filterFreq: 500 });
    tone({ freq: 120, endFreq: 60, type: 'sine', dur: 0.25, vol: 0.4 });
  },
  crack() { noise({ dur: 0.25, vol: 0.35, filterFreq: 2600 }); },
  poof() {
    noise({ dur: 0.3, vol: 0.3, filterFreq: 1200 });
    tone({ freq: 500, endFreq: 1000, type: 'sine', dur: 0.2, vol: 0.2 });
  },
  win() {
    [523, 659, 784, 1047].forEach((f, i) => tone({ freq: f, type: 'sine', dur: 0.3, vol: 0.3, delay: i * 0.12 }));
  },
  lose() {
    [392, 330, 262].forEach((f, i) => tone({ freq: f, type: 'triangle', dur: 0.4, vol: 0.25, delay: i * 0.2 }));
  },
  star() { tone({ freq: 1200, endFreq: 1600, type: 'sine', dur: 0.15, vol: 0.2 }); },
};
