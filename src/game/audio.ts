/**
 * GRAVFLIP Web Audio Synthesizer & Procedural Ambient Music Engine
 * Zero external audio files. 100% pure Web Audio API.
 * Soft, lowpass-filtered, non-harsh sound design.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;

  // Settings
  private sfxMuted: boolean = false;
  private musicMuted: boolean = false;
  private sfxVolume: number = 0.65;
  private musicVolume: number = 0.35;

  // Music state
  private currentWorld: number = 1;
  private isMusicPlaying: boolean = false;
  private musicIntervalId: number | null = null;
  private step: number = 0;
  private activeMusicNodes: AudioNode[] = [];

  constructor() {
    // Load persisted audio preferences
    try {
      const savedSfx = localStorage.getItem('gravflip_sfx');
      const savedMusic = localStorage.getItem('gravflip_music');
      const savedSfxVol = localStorage.getItem('gravflip_sfx_vol');
      const savedMusicVol = localStorage.getItem('gravflip_music_vol');
      if (savedSfx !== null) this.sfxMuted = savedSfx === 'false';
      if (savedMusic !== null) this.musicMuted = savedMusic === 'false';
      if (savedSfxVol !== null) this.sfxVolume = parseFloat(savedSfxVol);
      if (savedMusicVol !== null) this.musicVolume = parseFloat(savedMusicVol);
    } catch (_) {}
  }

  /**
   * Stage A: Juicy spring bounce pad launch sound.
   */
  public playBounce(): void {
    if (this.sfxMuted || !this.ctx || !this.sfxGain) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1500, now);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(540, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.22);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.28, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch (_) {}
  }

  /**
   * Stage A: Neon speed boost strip surge sound.
   */
  public playBoost(): void {
    if (this.sfxMuted || !this.ctx || !this.sfxGain) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(1800, now + 0.16);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(620, now + 0.18);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.24);
    } catch (_) {}
  }

  /**
   * Stage A: Teleport portal warp sound.
   */
  public playTeleport(): void {
    if (this.sfxMuted || !this.ctx || !this.sfxGain) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.09);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.2);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.23);
    } catch (_) {}
  }

  /**
   * Stage A: Tactile switch toggle click.
   */
  public playSwitch(on: boolean = true): void {
    if (this.sfxMuted || !this.ctx || !this.sfxGain) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(on ? 440 : 280, now);
      osc.frequency.exponentialRampToValueAtTime(on ? 880 : 220, now + 0.06);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch (_) {}
  }

  /**
   * Stage A: Heavy blast door servo sliding sound.
   */
  public playDoor(open: boolean = true): void {
    if (this.sfxMuted || !this.ctx || !this.sfxGain) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, now);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(open ? 120 : 160, now);
      osc.frequency.linearRampToValueAtTime(open ? 240 : 90, now + 0.25);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch (_) {}
  }

  /**
   * Stage A: Platform crumbling noise.
   */
  public playCrumble(): void {
    if (this.sfxMuted || !this.ctx || !this.sfxGain) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(250, now);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(95, now);
      osc.frequency.linearRampToValueAtTime(45, now + 0.2);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.24);
    } catch (_) {}
  }

  /**
   * Stage A: Sticky wall suction touch sound.
   */
  public playSticky(): void {
    if (this.sfxMuted || !this.ctx || !this.sfxGain) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.07);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.16, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch (_) {}
  }

  /**
   * Stage C: Bright star illumination sound (pitches up for 1st, 2nd, 3rd star).
   */
  public playStar(starIndex: number = 0): void {
    if (this.sfxMuted || !this.ctx || !this.sfxGain) return;
    try {
      const now = this.ctx.currentTime;
      const pitches = [523.25, 659.25, 783.99]; // C5, E5, G5
      const freq = pitches[Math.min(pitches.length - 1, starIndex)];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.08);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.24, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.32);
    } catch (_) {}
  }

  /**
   * Stage C: Crystal jackpot / Daily reward fanfare.
   */
  public playClaimReward(): void {
    if (this.sfxMuted || !this.ctx || !this.sfxGain) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.sfxGain) return;
        const noteStart = now + idx * 0.06;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.001, noteStart);
        gain.gain.linearRampToValueAtTime(0.22, noteStart + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.35);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(noteStart);
        osc.stop(noteStart + 0.38);
      });
    } catch (_) {}
  }

  /**
   * Stage C: Rare golden Star Crystal fanfare (shimmering multi-harmonic chime).
   */
  public playStarCrystal(): void {
    if (this.sfxMuted || !this.ctx || !this.sfxGain) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [1046.5, 1318.51, 1567.98, 2093.0]; // C6, E6, G6, C7
      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.sfxGain) return;
        const noteStart = now + idx * 0.055;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.001, noteStart);
        gain.gain.linearRampToValueAtTime(0.24, noteStart + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.42);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(noteStart);
        osc.stop(noteStart + 0.45);
      });
    } catch (_) {}
  }

  /**
   * Stage C: Combo multiplier rising chime with ascending pitch.
   */
  public playCombo(multiplier: number = 2): void {
    if (this.sfxMuted || !this.ctx || !this.sfxGain) return;
    try {
      const now = this.ctx.currentTime;
      const baseFreq = 587.33; // D5
      const semitoneShift = Math.min(18, (multiplier - 1) * 2.5);
      const freq1 = baseFreq * Math.pow(2, semitoneShift / 12);
      const freq2 = freq1 * 1.5;

      [freq1, freq2].forEach((freq, idx) => {
        if (!this.ctx || !this.sfxGain) return;
        const noteStart = now + idx * 0.045;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.001, noteStart);
        gain.gain.linearRampToValueAtTime(0.2, noteStart + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.26);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(noteStart);
        osc.stop(noteStart + 0.28);
      });
    } catch (_) {}
  }

  /**
   * Stage C: Time Slow pickup - deep pitch warp and temporal dilation sound.
   */
  public playTimeSlow(): void {
    if (this.sfxMuted || !this.ctx || !this.sfxGain) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.frequency.exponentialRampToValueAtTime(320, now + 0.45);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.4);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.52);
    } catch (_) {}
  }

  /**
   * Stage C: Shield pickup - resonant force-field hum.
   */
  public playShieldPickup(): void {
    if (this.sfxMuted || !this.ctx || !this.sfxGain) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(740, now + 0.18);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.22, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.38);
    } catch (_) {}
  }

  /**
   * Stage C: Shield hit / shatter - crisp crystalline barrier break.
   */
  public playShieldBreak(): void {
    if (this.sfxMuted || !this.ctx || !this.sfxGain) return;
    try {
      const now = this.ctx.currentTime;
      // High glass ping
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1800, now);
      osc.frequency.exponentialRampToValueAtTime(350, now + 0.18);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch (_) {}
  }

  /**
   * Stage C: Double-flip pickup - uplifting twin wing chime.
   */
  public playDoubleFlipPickup(): void {
    if (this.sfxMuted || !this.ctx || !this.sfxGain) return;
    try {
      const now = this.ctx.currentTime;
      [523.25, 783.99, 1046.5].forEach((freq, i) => {
        if (!this.ctx || !this.sfxGain) return;
        const noteStart = now + i * 0.05;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.001, noteStart);
        gain.gain.linearRampToValueAtTime(0.2, noteStart + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.28);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(noteStart);
        osc.stop(noteStart + 0.3);
      });
    } catch (_) {}
  }

  /**
   * Stage B: Bright bell chime on activating a checkpoint beacon.
   */
  public playCheckpoint(): void {
    if (this.sfxMuted || !this.ctx || !this.sfxGain) return;
    try {
      const now = this.ctx.currentTime;
      [880, 1174.66].forEach((freq, i) => {
        if (!this.ctx || !this.sfxGain) return;
        const noteStart = now + i * 0.08;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.001, noteStart);
        gain.gain.linearRampToValueAtTime(0.25, noteStart + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.35);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(noteStart);
        osc.stop(noteStart + 0.38);
      });
    } catch (_) {}
  }

  /**
   * Stage B: Heavy impact thud when a falling block drops and lands.
   */
  public playFallingBlock(): void {
    if (this.sfxMuted || !this.ctx || !this.sfxGain) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(160, now);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.15);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.28, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch (_) {}
  }

  /**
   * Stage B: Soft electronic repulsion bump when touching a patrol drone.
   */
  public playDroneBump(): void {
    if (this.sfxMuted || !this.ctx || !this.sfxGain) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.05);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.12);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch (_) {}
  }

  /**
   * Stage B: Subtle warning beep for timed laser flicker.
   */
  public playLaserFlicker(): void {
    if (this.sfxMuted || !this.ctx || !this.sfxGain) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.06, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch (_) {}
  }

  /**
   * Initializes AudioContext upon the first user interaction (touch/click).
   */
  public initOnGesture(): void {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxMuted ? 0 : this.sfxVolume, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.musicMuted ? 0 : this.musicVolume, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      if (!this.musicMuted && !this.isMusicPlaying) {
        this.startMusicLoop();
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // ==========================================
  // SOUND EFFECTS
  // ==========================================

  /**
   * Short soft "whoosh" with pitch rising for UP, falling for DOWN.
   */
  public playFlip(direction: 'UP' | 'DOWN'): void {
    if (this.sfxMuted || !this.ctx || !this.sfxGain) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, now);

      osc.type = 'triangle';
      const isUp = direction === 'UP';
      const startFreq = isUp ? 180 : 360;
      const endFreq = isUp ? 360 : 180;

      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.11);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.24, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch (_) {}
  }

  /**
   * Bright soft two-note chime, pitch rising with consecutive crystals.
   */
  public playCrystal(consecutiveCount: number = 0): void {
    if (this.sfxMuted || !this.ctx || !this.sfxGain) return;
    try {
      const now = this.ctx.currentTime;
      // Musical pentatonic scale base offsets
      const baseFrequencies = [523.25, 659.25, 783.99, 1046.5, 1318.5]; // C5, E5, G5, C6, E6
      const rootIdx = Math.min(baseFrequencies.length - 1, consecutiveCount % baseFrequencies.length);
      const freq1 = baseFrequencies[rootIdx];
      const freq2 = freq1 * 1.5; // Perfect fifth

      const playChimeNote = (freq: number, startTime: number) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2400, startTime);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.22, startTime + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.28);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(startTime);
        osc.stop(startTime + 0.3);
      };

      playChimeNote(freq1, now);
      playChimeNote(freq2, now + 0.06);
    } catch (_) {}
  }

  /**
   * Soft landing thud, volume scaled based on impact speed.
   */
  public playLand(impactSpeed: number): void {
    if (this.sfxMuted || !this.ctx || !this.sfxGain) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      const intensity = Math.min(1.0, Math.max(0.15, impactSpeed / 900));

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, now);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(80, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.08);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.25 * intensity, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch (_) {}
  }

  /**
   * Low buzz plus short noise burst for hazard collisions.
   */
  public playHazard(): void {
    if (this.sfxMuted || !this.ctx || !this.sfxGain) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, now);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(85, now);
      osc.frequency.linearRampToValueAtTime(50, now + 0.18);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.22);
    } catch (_) {}
  }

  /**
   * Rising sweep followed by sparkle when entering portal.
   */
  public playPortal(): void {
    this.playPortalEnter();
  }

  public playPortalEnter(): void {
    if (this.sfxMuted || !this.ctx || !this.sfxGain) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1600, now);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.35);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.26, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.45);
    } catch (_) {}
  }

  /**
   * Short 4-note victory jingle.
   */
  public playLevelComplete(): void {
    if (this.sfxMuted || !this.ctx || !this.sfxGain) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.sfxGain) return;
        const noteStart = now + idx * 0.1;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteStart);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, noteStart);

        const duration = idx === notes.length - 1 ? 0.45 : 0.22;
        gain.gain.setValueAtTime(0.001, noteStart);
        gain.gain.linearRampToValueAtTime(0.22, noteStart + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(noteStart);
        osc.stop(noteStart + duration + 0.05);
      });
    } catch (_) {}
  }

  /**
   * Tiny UI tap / click.
   */
  public playClick(): void {
    if (this.sfxMuted || !this.ctx || !this.sfxGain) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.exponentialRampToValueAtTime(450, now + 0.02);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.03);
    } catch (_) {}
  }

  /**
   * Stage D: Secret passage discovered shimmer chime.
   */
  public playSecretDiscovered(): void {
    if (this.sfxMuted || !this.ctx || !this.sfxGain) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [587.33, 739.99, 880.0, 1174.66]; // D5, F#5, A5, D6
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const noteTime = now + idx * 0.07;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.001, noteTime);
        gain.gain.linearRampToValueAtTime(0.18, noteTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.35);

        osc.connect(gain);
        gain.connect(this.sfxGain!);

        osc.start(noteTime);
        osc.stop(noteTime + 0.38);
      });
    } catch (_) {}
  }

  /**
   * Stage D: Boss encounter intro cyber-warning.
   */
  public playBossIntro(): void {
    if (this.sfxMuted || !this.ctx || !this.sfxGain) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.exponentialRampToValueAtTime(82.4, now + 0.4);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.52);
    } catch (_) {}
  }

  /**
   * Stage D: Special Boss victory fanfare.
   */
  public playBossDefeated(): void {
    if (this.sfxMuted || !this.ctx || !this.sfxGain) return;
    try {
      const now = this.ctx.currentTime;
      const chords = [
        [261.63, 329.63, 392.0], // C
        [293.66, 369.99, 440.0], // D
        [329.63, 415.3, 493.88], // E
        [523.25, 659.25, 783.99], // C5
      ];
      chords.forEach((chord, step) => {
        const stepTime = now + step * 0.14;
        chord.forEach((freq) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, stepTime);

          gain.gain.setValueAtTime(0.001, stepTime);
          gain.gain.linearRampToValueAtTime(0.18, stepTime + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, stepTime + (step === 3 ? 0.6 : 0.22));

          osc.connect(gain);
          gain.connect(this.sfxGain!);

          osc.start(stepTime);
          osc.stop(stepTime + 0.65);
        });
      });
    } catch (_) {}
  }

  // ==========================================
  // PROCEDURAL BACKGROUND MUSIC (AMBIENT SYNTH)
  // ==========================================

  public setWorld(worldId: number): void {
    if (this.currentWorld !== worldId) {
      this.currentWorld = worldId;
      this.step = 0;
    }
  }

  public startMusic(worldId?: number): void {
    if (worldId) this.currentWorld = worldId;
    this.initOnGesture();
    if (!this.isMusicPlaying && !this.musicMuted) {
      this.startMusicLoop();
    }
  }

  public pauseMusic(): void {
    if (this.musicIntervalId !== null) {
      window.clearInterval(this.musicIntervalId);
      this.musicIntervalId = null;
    }
    this.isMusicPlaying = false;
  }

  public resumeMusic(): void {
    if (!this.isMusicPlaying && !this.musicMuted && this.ctx) {
      this.startMusicLoop();
    }
  }

  private startMusicLoop(): void {
    if (this.musicIntervalId !== null) {
      window.clearInterval(this.musicIntervalId);
    }
    this.isMusicPlaying = true;
    // Step sequencer runs every 350ms (ambient tempo ~85 BPM)
    this.musicIntervalId = window.setInterval(() => {
      this.tickMusic();
    }, 360);
  }

  private tickMusic(): void {
    if (!this.ctx || !this.musicGain || this.musicMuted || this.ctx.state !== 'running') return;
    const now = this.ctx.currentTime;
    const s = this.step % 16;
    this.step++;

    // World scale chords & moods:
    // W1 Calm (C Major / Am): C, Em, Am, F
    // W2 Dreamy (D Minor / F Maj): Dm9, Bbmaj7, C, Fmaj7
    // W3 Tense (E Minor): Em, Cmaj7, B7, Em
    // W4 Epic (F# Minor / A): F#m, D, A, E
    const worldPatterns: Record<number, { chords: number[][]; arps: number[] }> = {
      1: {
        chords: [
          [261.63, 329.63, 392.0], // C4, E4, G4
          [220.0, 261.63, 329.63], // A3, C4, E4
          [174.61, 261.63, 329.63], // F3, C4, E4
          [196.0, 246.94, 293.66], // G3, B3, D4
        ],
        arps: [523.25, 659.25, 783.99, 987.77, 1046.5, 783.99, 659.25, 523.25],
      },
      2: {
        chords: [
          [293.66, 349.23, 440.0], // D4, F4, A4
          [233.08, 293.66, 349.23], // Bb3, D4, F4
          [261.63, 329.63, 392.0], // C4, E4, G4
          [349.23, 440.0, 523.25], // F4, A4, C5
        ],
        arps: [587.33, 698.46, 880.0, 1046.5, 880.0, 698.46, 587.33, 440.0],
      },
      3: {
        chords: [
          [164.81, 246.94, 329.63], // E3, B3, E4
          [130.81, 261.63, 329.63], // C3, C4, E4
          [123.47, 246.94, 293.66], // B2, B3, D4
          [164.81, 196.0, 246.94], // E3, G3, B3
        ],
        arps: [329.63, 392.0, 493.88, 587.33, 493.88, 392.0, 329.63, 246.94],
      },
      4: {
        chords: [
          [185.0, 277.18, 369.99], // F#3, C#4, F#4
          [146.83, 220.0, 293.66], // D3, A3, D4
          [220.0, 277.18, 329.63], // A3, C#4, E4
          [164.81, 246.94, 329.63], // E3, B3, E4
        ],
        arps: [739.99, 880.0, 1108.73, 1318.51, 1108.73, 880.0, 739.99, 554.37],
      },
      5: {
        // W5 Ice & Wind: Eb Major / Glacial Frost
        chords: [
          [155.56, 233.08, 311.13], // Eb3, Bb3, Eb4
          [196.0, 293.66, 392.0], // G3, D4, G4
          [130.81, 261.63, 311.13], // C3, C4, Eb4
          [207.65, 261.63, 311.13], // Ab3, C4, Eb4
        ],
        arps: [622.25, 783.99, 932.33, 1244.5, 932.33, 783.99, 622.25, 466.16],
      },
      6: {
        // W6 Machine Factory: G Minor / Driving Pulse
        chords: [
          [196.0, 293.66, 392.0], // G3, D4, G4
          [155.56, 233.08, 311.13], // Eb3, Bb3, Eb4
          [174.61, 261.63, 349.23], // F3, C4, F4
          [146.83, 220.0, 293.66], // D3, A3, D4
        ],
        arps: [392.0, 587.33, 783.99, 880.0, 783.99, 587.33, 392.0, 293.66],
      },
      7: {
        // W7 Dark Lab: Ab Minor / Suspended Mystery
        chords: [
          [207.65, 311.13, 415.3], // Ab3, Eb4, Ab4
          [164.81, 246.94, 329.63], // E3, B3, E4
          [185.0, 277.18, 369.99], // F#3, C#4, F#4
          [155.56, 233.08, 311.13], // Eb3, Bb3, Eb4
        ],
        arps: [415.3, 493.88, 622.25, 830.61, 622.25, 493.88, 415.3, 311.13],
      },
      8: {
        // W8 Chaos Core: D Minor / Fast Climactic Arp
        chords: [
          [146.83, 220.0, 293.66], // D3, A3, D4
          [233.08, 293.66, 349.23], // Bb3, D4, F4
          [261.63, 329.63, 392.0], // C4, E4, G4
          [220.0, 277.18, 329.63], // A3, C#4, E4
        ],
        arps: [587.33, 698.46, 880.0, 1174.66, 1396.91, 1174.66, 880.0, 587.33],
      },
    };

    const pattern = worldPatterns[this.currentWorld] || worldPatterns[1];
    const chordIndex = Math.floor(s / 4) % pattern.chords.length;

    // Trigger soft ambient pad chord every 4 steps
    if (s % 4 === 0) {
      const chord = pattern.chords[chordIndex];
      chord.forEach((freq) => {
        this.playPadVoice(freq, now, 1.4);
      });
    }

    // Gentle soft arpeggio note every 2 steps
    if (s % 2 === 0) {
      const arpNote = pattern.arps[s % pattern.arps.length];
      this.playArpNote(arpNote, now);
    }

    // Light deep pulse beat on step 0 and 8
    if (s === 0 || s === 8) {
      this.playSubPulse(now);
    }
  }

  private playPadVoice(freq: number, now: number, duration: number): void {
    if (!this.ctx || !this.musicGain) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.07, now + 0.35);
      gain.gain.linearRampToValueAtTime(0.001, now + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      osc.start(now);
      osc.stop(now + duration + 0.1);
    } catch (_) {}
  }

  private playArpNote(freq: number, now: number): void {
    if (!this.ctx || !this.musicGain) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.045, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch (_) {}
  }

  private playSubPulse(now: number): void {
    if (!this.ctx || !this.musicGain) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(65, now);
      osc.frequency.exponentialRampToValueAtTime(38, now + 0.18);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(120, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.06, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch (_) {}
  }

  // ==========================================
  // VOLUME & TOGGLE CONTROLS
  // ==========================================

  public setSfxMuted(muted: boolean): void {
    this.sfxMuted = muted;
    try {
      localStorage.setItem('gravflip_sfx', muted ? 'false' : 'true');
    } catch (_) {}
    if (this.ctx && this.sfxGain) {
      this.sfxGain.gain.setValueAtTime(muted ? 0 : this.sfxVolume, this.ctx.currentTime);
    }
  }

  public setMusicMuted(muted: boolean): void {
    this.musicMuted = muted;
    try {
      localStorage.setItem('gravflip_music', muted ? 'false' : 'true');
    } catch (_) {}
    if (this.ctx && this.musicGain) {
      this.musicGain.gain.setValueAtTime(muted ? 0 : this.musicVolume, this.ctx.currentTime);
    }
    if (muted) {
      this.pauseMusic();
    } else {
      this.resumeMusic();
    }
  }

  /**
   * Stage E: Hint activation sparkling chime.
   */
  public playHint(): void {
    if (this.sfxMuted || !this.ctx || !this.sfxGain) return;
    try {
      const now = this.ctx.currentTime;
      [659.25, 830.61, 987.77].forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.001, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.28);

        osc.connect(gain);
        gain.connect(this.sfxGain!);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.3);
      });
    } catch (_) {}
  }

  /**
   * Stage E: Achievement unlocked celebratory fanfare.
   */
  public playAchievement(): void {
    if (this.sfxMuted || !this.ctx || !this.sfxGain) return;
    try {
      const now = this.ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);

        gain.gain.setValueAtTime(0.001, now + idx * 0.07);
        gain.gain.linearRampToValueAtTime(0.22, now + idx * 0.07 + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.35);

        osc.connect(gain);
        gain.connect(this.sfxGain!);

        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.38);
      });
    } catch (_) {}
  }

  public setSfxVolume(vol: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    try {
      localStorage.setItem('gravflip_sfx_vol', this.sfxVolume.toString());
    } catch (_) {}
    if (this.ctx && this.sfxGain && !this.sfxMuted) {
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
    }
  }

  public setMusicVolume(vol: number): void {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    try {
      localStorage.setItem('gravflip_music_vol', this.musicVolume.toString());
    } catch (_) {}
    if (this.ctx && this.musicGain && !this.musicMuted) {
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
    }
  }

  public getSettings() {
    return {
      sfxMuted: this.sfxMuted,
      musicMuted: this.musicMuted,
      sfxVolume: this.sfxVolume,
      musicVolume: this.musicVolume,
    };
  }
}

export const audio = new SoundEngine();
