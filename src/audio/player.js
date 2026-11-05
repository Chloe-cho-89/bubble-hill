import { SOUND } from '../config.js';

const soundFiles = {
  dusk: 'assets/audio/dusk.wav',
  meadow: 'assets/audio/meadow.wav',
  breath: 'assets/audio/breath.wav',
  pop: 'assets/audio/pop.wav',
  pour: 'assets/audio/pour.wav',
  stir: 'assets/audio/stir.wav'
};

export class HillAudio {
  constructor(storage, createContext = () => new (window.AudioContext || window.webkitAudioContext)(),
              readFile = async path => {
                const response = await fetch(path);
                if (!response.ok) throw new Error('Audio unavailable');
                return response.arrayBuffer();
              }) {
    this.storage = storage;
    this.createContext = createContext;
    this.readFile = readFile;
    this.buffers = new Map();
    this.effects = new Set();
    this.visible = true;
    this.active = false;
    this.revision = 0;
    let saved;
    try { saved = JSON.parse(storage?.getItem(SOUND.key)); } catch {}
    this.settings = {music:saved?.music !== false, effects:saved?.effects !== false,
                     track:saved?.track === 'meadow' ? 'meadow' : 'dusk'};
  }

  start() {
    try { this.ctx ??= this.createContext(); } catch { return; }
    this.active = true;
    this.sync();
    for (const name of ['breath','pop','pour','stir']) this.load(name).catch(() => {});
  }

  load(name) {
    if (!this.buffers.has(name)) {
      const pending = this.readFile(soundFiles[name]).then(bytes => this.ctx.decodeAudioData(bytes))
        .catch(error => { this.buffers.delete(name); throw error; });
      this.buffers.set(name, pending);
    }
    return this.buffers.get(name);
  }

  configure(next) {
    const old = this.settings;
    this.settings = {...old, ...next};
    try { this.storage?.setItem(SOUND.key, JSON.stringify(this.settings)); } catch {}
    if (!this.settings.effects) this.stopEffects();
    if (old.track !== this.settings.track || old.music !== this.settings.music) this.sync();
  }

  setVisible(visible) { this.visible = visible; this.sync(); }
  leave() { this.active = false; this.sync(); }

  stopEffects() {
    this.effectEpoch = (this.effectEpoch || 0) + 1;
    for (const source of this.effects) source.stop();
    this.effects.clear();
    this.lastEffect = {};
  }

  async sync() {
    const revision = ++this.revision;
    if (this.music) { this.music.stop(); this.music = null; }
    if (!this.ctx) return;
    if (!this.visible || !this.active) {
      this.stopEffects();
      this.ctx.suspend().catch(() => {});
      return;
    }
    try {
      await this.ctx.resume();
      if (revision !== this.revision || !this.settings.music) return;
      const buffer = await this.load(this.settings.track);
      if (revision !== this.revision) return;
      const source = this.ctx.createBufferSource();
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0,this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(SOUND.musicGain,this.ctx.currentTime + .8);
      source.buffer = buffer;
      source.loop = true;
      source.connect(gain);
      gain.connect(this.ctx.destination);
      source.onended = () => { source.disconnect(); gain.disconnect(); };
      this.music = source;
      source.start();
    } catch { /* Audio may be unavailable while the game is still playable. */ }
  }

  async effect(name) {
    if (!this.active || !this.visible || !this.settings.effects || this.ctx?.state !== 'running') return;
    this.lastEffect ??= {};
    const now = this.ctx.currentTime;
    if (now - (this.lastEffect[name] ?? -Infinity) < SOUND.cooldown[name]) return;
    this.lastEffect[name] = now;
    const epoch = this.effectEpoch;
    try {
      const buffer = await this.load(name);
      if (epoch !== this.effectEpoch || this.effects.size >= SOUND.maxEffects) return;
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(this.ctx.destination);
      this.effects.add(source);
      source.onended = () => { this.effects.delete(source); source.disconnect(); };
      source.start();
    } catch {}
  }
}
