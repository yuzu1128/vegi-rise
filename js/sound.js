// sound.js - Web Audio API sound effects for VegiRise

export class Sound {
  static ctx = null;
  static enabled = true;
  static _activeNodes = [];

  static init() {
    // Lazy init - will be created on first user interaction
  }

  static _ensureContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  static _cleanup() {
    const now = this.ctx ? this.ctx.currentTime : 0;
    this._activeNodes = this._activeNodes.filter(node => {
      try {
        if (node.endTime && now > node.endTime) {
          return false;
        }
        return true;
      } catch {
        return false;
      }
    });
  }

  static _stopCategory(category) {
    this._activeNodes = this._activeNodes.filter(node => {
      if (node.category === category) {
        try { node.osc.stop(); } catch {}
        return false;
      }
      return true;
    });
  }

  static _playTone(freq, duration, type = 'sine', volume = 0.3, category = 'default') {
    if (!this.enabled) return;
    this._ensureContext();
    this._stopCategory(category);

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = volume;

    const now = this.ctx.currentTime;
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration / 1000);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + duration / 1000);

    this._activeNodes.push({ osc, category, endTime: now + duration / 1000 });
  }

  static _playNotes(notes, interval = 150, category = 'default') {
    if (!this.enabled) return;
    this._ensureContext();
    this._stopCategory(category);

    const now = this.ctx.currentTime;

    notes.forEach((note, i) => {
      const startTime = now + (i * interval) / 1000;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = note.type || 'sine';
      osc.frequency.value = note.freq;
      const vol = note.volume !== undefined ? note.volume : 0.3;
      gain.gain.value = vol;
      gain.gain.setValueAtTime(vol, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + (note.duration || 120) / 1000);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + (note.duration || 120) / 1000);

      this._activeNodes.push({ osc, category, endTime: startTime + (note.duration || 120) / 1000 });
    });
  }

  static click() {
    this._playTone(800, 50, 'sine', 0.15, 'click');
  }

  static record() {
    this._playNotes([
      { freq: 523, duration: 120 },
      { freq: 659, duration: 120 },
      { freq: 784, duration: 120 }
    ], 150, 'record');
  }

  static goalReached(tier) {
    if (tier === 'minimum') {
      this._playNotes([
        { freq: 523, duration: 150, type: 'triangle' },
        { freq: 659, duration: 150, type: 'triangle' }
      ], 160, 'goal');
    } else if (tier === 'standard') {
      this._playNotes([
        { freq: 523, duration: 150, type: 'triangle' },
        { freq: 659, duration: 150, type: 'triangle' },
        { freq: 784, duration: 150, type: 'triangle' }
      ], 160, 'goal');
    } else if (tier === 'target') {
      this._playNotes([
        { freq: 523, duration: 150, type: 'triangle' },
        { freq: 659, duration: 150, type: 'triangle' },
        { freq: 784, duration: 150, type: 'triangle' },
        { freq: 1047, duration: 300, type: 'triangle' }
      ], 160, 'goal');
    }
  }

  static xpGain() {
    if (!this.enabled) return;
    this._ensureContext();
    this._stopCategory('xp');

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.linearRampToValueAtTime(1200, now + 0.1);
    gain.gain.value = 0.2;
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);

    this._activeNodes.push({ osc, category: 'xp', endTime: now + 0.1 });
  }

  static levelUp() {
    this._playNotes([
      { freq: 523, duration: 200, type: 'square', volume: 0.25 },
      { freq: 659, duration: 200, type: 'square', volume: 0.25 },
      { freq: 784, duration: 200, type: 'square', volume: 0.25 },
      { freq: 1047, duration: 400, type: 'square', volume: 0.3 }
    ], 220, 'levelup');
  }

  static achievementUnlock() {
    if (!this.enabled) return;
    this._ensureContext();
    this._stopCategory('achievement');

    const now = this.ctx.currentTime;
    const notes = [
      { freq: 392, type: 'sine' },    // G4
      { freq: 523, type: 'triangle' }, // C5
      { freq: 659, type: 'sine' },     // E5
      { freq: 784, type: 'triangle' }, // G5
      { freq: 1047, type: 'sine' },    // C6
      { freq: 1319, type: 'triangle' } // E6
    ];

    notes.forEach((note, i) => {
      const startTime = now + (i * 150) / 1000;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = note.type;
      osc.frequency.value = note.freq;

      const vol = 0.4;
      gain.gain.setValueAtTime(vol, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.4);

      this._activeNodes.push({ osc, category: 'achievement', endTime: startTime + 0.4 });
    });
  }

  static toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  static isEnabled() {
    return this.enabled;
  }
}
