/**
 * Input manager:
 *  - slide bar (mouse drag + touch) → theta
 *  - keyboard A/D → theta nudge
 *  - hold mouse/touch on fire zone / spacebar → charge
 */
export class Input {
  constructor(callbacks) {
    this.cb = callbacks;
    this.keys = {};

    // Slide bar DOM
    this.slideBar = document.getElementById('slide-bar');
    this.slideKnob = document.getElementById('slide-knob');

    this._bindKeyboard();
    this._bindMouse();
    this._bindTouch();
  }

  _bindKeyboard() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      if (e.code === 'Space') {
        e.preventDefault();
        this.cb.onChargeStart?.();
      }
    });
    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
      if (e.code === 'Space') this.cb.onChargeEnd?.();
    });
  }

  _bindMouse() {
    this._dragging = false;
    const bar = this.slideBar;
    const updateFromClientX = (clientX) => {
      if (!bar) return;
      const rect = bar.getBoundingClientRect();
      const t = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      this.cb.onTheta?.(t * Math.PI * 2);
    };

    bar?.addEventListener('pointerdown', (e) => {
      this._dragging = true;
      bar.setPointerCapture(e.pointerId);
      updateFromClientX(e.clientX);
    });
    bar?.addEventListener('pointermove', (e) => {
      if (this._dragging) updateFromClientX(e.clientX);
    });
    const end = (e) => { this._dragging = false; };
    bar?.addEventListener('pointerup', end);
    bar?.addEventListener('pointercancel', end);

    // Fire zone: right-click or hold on canvas lower area / hold space
    const canvas = document.getElementById('game-canvas');
    canvas?.addEventListener('pointerdown', (e) => {
      if (e.button === 2) {
        e.preventDefault();
        this.cb.onChargeStart?.();
      }
    });
    canvas?.addEventListener('pointerup', (e) => {
      if (e.button === 2) this.cb.onChargeEnd?.();
    });
    canvas?.addEventListener('contextmenu', (e) => e.preventDefault());
    // Left drag on canvas also charges (for touch simplicity)
    canvas?.addEventListener('pointerdown', (e) => {
      if (e.button === 0 && !this._dragging) this.cb.onChargeStart?.();
    });
    canvas?.addEventListener('pointerup', (e) => {
      if (e.button === 0) this.cb.onChargeEnd?.();
    });
  }

  _bindTouch() {
    const canvas = document.getElementById('game-canvas');
    canvas?.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.cb.onChargeStart?.();
    }, { passive: false });
    canvas?.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.cb.onChargeEnd?.();
    }, { passive: false });
  }

  /** Per-frame: returns true when a charge key is held. */
  isCharging() {
    return !!this.keys['Space'] || this._dragging;
  }
}
