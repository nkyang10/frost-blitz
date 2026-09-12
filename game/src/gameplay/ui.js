/**
 * HUD / DOM management: menu, level picker, HUD overlays, result modal.
 * Uses ids declared in index.html.
 */
export class UI {
  constructor() {
    this.el = {
      menu: document.getElementById('menu'),
      levelSelect: document.getElementById('level-select'),
      hud: document.getElementById('hud'),
      ammo: document.getElementById('ammo'),
      pigs: document.getElementById('pigs'),
      power: document.getElementById('power'),
      powerFill: document.getElementById('power-fill'),
      slideBar: document.getElementById('slide-bar'),
      slideKnob: document.getElementById('slide-knob'),
      result: document.getElementById('result'),
      resultTitle: document.getElementById('result-title'),
      resultStars: document.getElementById('result-stars'),
      resultSub: document.getElementById('result-sub'),
      restartBtn: document.getElementById('restart-btn'),
      nextBtn: document.getElementById('next-btn'),
      menuBtn: document.getElementById('menu-btn'),
      menuBtn2: document.getElementById('menu-btn2'),
    };
    this.onLevelPicked = null;
    this.onRestart = null;
    this.onNext = null;
    this.onMenu = null;
    this._bind();
  }

  _bind() {
    const levels = ['第一關 · First Frost', '第二關 · Ring of Ice', '第三關 · Three-Ring Circus', '第四關 · Frostworks', '第五關 · Pig Palace', '第六關 · The Big Chill'];
    if (this.el.levelSelect) {
      this.el.levelSelect.innerHTML = '';
      levels.forEach((label, i) => {
        const btn = document.createElement('button');
        btn.className = 'level-btn';
        btn.textContent = label;
        btn.addEventListener('click', () => this.onLevelPicked?.(i + 1));
        this.el.levelSelect.appendChild(btn);
      });
    }
    this.el.restartBtn?.addEventListener('click', () => this.onRestart?.());
    this.el.nextBtn?.addEventListener('click', () => this.onNext?.());
    this.el.menuBtn?.addEventListener('click', () => this.onMenu?.());
    this.el.menuBtn2?.addEventListener('click', () => this.onMenu?.());
  }

  showMenu() {
    this.el.menu?.classList.remove('hidden');
    this.el.hud?.classList.add('hidden');
    this.el.result?.classList.add('hidden');
  }

  hideMenu() {
    this.el.menu?.classList.add('hidden');
    this.el.hud?.classList.remove('hidden');
  }

  showHud() {
    this.el.hud?.classList.remove('hidden');
  }

  setAmmo(n) {
    if (this.el.ammo) this.el.ammo.textContent = `❄ x${n}`;
  }

  setPigs(n) {
    if (this.el.pigs) this.el.pigs.textContent = `🐷 x${n}`;
  }

  setPower(p) {
    if (this.el.powerFill) this.el.powerFill.style.width = `${Math.round(p * 100)}%`;
  }

  setThetaDeg(deg) {
    if (this.el.slideKnob) this.el.slideKnob.style.left = `${(deg / 360) * 100}%`;
  }

  showResult(title, stars, sub) {
    if (this.el.resultTitle) this.el.resultTitle.textContent = title;
    if (this.el.resultStars) this.el.resultStars.textContent = '⭐'.repeat(stars);
    if (this.el.resultSub) this.el.resultSub.textContent = sub;
    this.el.result?.classList.remove('hidden');
  }

  hideResult() {
    this.el.result?.classList.add('hidden');
  }
}
