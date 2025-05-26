export class SoundSystem {
  private context: AudioContext | null = null;
  private enabled: boolean = true;
  private ambientGain: GainNode | null = null;
  private currentAmbient: OscillatorNode | null = null;
  private ambientNoiseBuffer: AudioBuffer | null = null;
  private ambientSource: AudioBufferSourceNode | null = null;
  private masterVolume: number = 0.6;

  constructor() {
    try {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.setupAmbientSystem();
      this.generateWhiteNoise();
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  private setupAmbientSystem() {
    if (!this.context) return;
    
    this.ambientGain = this.context.createGain();
    this.ambientGain.connect(this.context.destination);
    this.ambientGain.gain.value = 0.1; // Low ambient volume
  }

  private generateWhiteNoise() {
    if (!this.context) return;

    const bufferSize = this.context.sampleRate * 2; // 2 seconds of noise
    this.ambientNoiseBuffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
    const output = this.ambientNoiseBuffer.getChannelData(0);

    // Generate filtered white noise for cyberpunk ambience
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.1; // Low volume white noise
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled) {
      this.stopAmbient();
    }
  }

  setMasterVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  // Resume audio context (required for modern browsers)
  async resumeContext() {
    if (this.context && this.context.state === 'suspended') {
      await this.context.resume();
    }
  }

  // Start ambient cyberpunk atmosphere
  startAmbient() {
    if (!this.context || !this.enabled || !this.ambientGain) return;
    
    this.stopAmbient(); // Stop any existing ambient sounds
    
    // Create low-frequency cyberpunk drone
    this.createAmbientDrone();
    
    // Add subtle white noise for computer hum
    this.playAmbientNoise();
    
    // Schedule random cyberpunk glitches
    this.scheduleRandomGlitches();
  }

  stopAmbient() {
    if (this.currentAmbient) {
      this.currentAmbient.stop();
      this.currentAmbient = null;
    }
    if (this.ambientSource) {
      this.ambientSource.stop();
      this.ambientSource = null;
    }
  }

  private createAmbientDrone() {
    if (!this.context || !this.ambientGain) return;

    this.currentAmbient = this.context.createOscillator();
    const filter = this.context.createBiquadFilter();
    const ambientGainNode = this.context.createGain();

    // Create a low, evolving drone
    this.currentAmbient.frequency.setValueAtTime(55, this.context.currentTime); // Low A
    this.currentAmbient.type = 'sawtooth';
    
    // Slowly modulate the frequency for an evolving feel
    this.currentAmbient.frequency.exponentialRampToValueAtTime(45, this.context.currentTime + 20);
    this.currentAmbient.frequency.exponentialRampToValueAtTime(65, this.context.currentTime + 40);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, this.context.currentTime);
    filter.Q.setValueAtTime(2, this.context.currentTime);
    
    ambientGainNode.gain.setValueAtTime(0, this.context.currentTime);
    ambientGainNode.gain.linearRampToValueAtTime(0.05 * this.masterVolume, this.context.currentTime + 2);

    this.currentAmbient.connect(filter);
    filter.connect(ambientGainNode);
    ambientGainNode.connect(this.ambientGain);

    this.currentAmbient.start();
  }

  private playAmbientNoise() {
    if (!this.context || !this.ambientGain || !this.ambientNoiseBuffer) return;

    this.ambientSource = this.context.createBufferSource();
    this.ambientSource.buffer = this.ambientNoiseBuffer;
    this.ambientSource.loop = true;
    
    const noiseGain = this.context.createGain();
    const filter = this.context.createBiquadFilter();
    
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(8000, this.context.currentTime); // High-frequency hiss
    
    noiseGain.gain.setValueAtTime(0.02 * this.masterVolume, this.context.currentTime);
    
    this.ambientSource.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ambientGain);
    
    this.ambientSource.start();
  }

  private scheduleRandomGlitches() {
    if (!this.enabled) return;
    
    const scheduleNext = () => {
      const delay = Math.random() * 15000 + 5000; // 5-20 seconds
      setTimeout(() => {
        if (Math.random() < 0.3) { // 30% chance
          this.playDataGlitch();
        }
        scheduleNext();
      }, delay);
    };
    
    scheduleNext();
  }

  private createBeep(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) {
    if (!this.context || !this.enabled) return;

    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.context.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    const adjustedVolume = volume * this.masterVolume;
    gainNode.gain.setValueAtTime(adjustedVolume, this.context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);

    oscillator.start(this.context.currentTime);
    oscillator.stop(this.context.currentTime + duration);
  }

  // Enhanced terminal interaction sounds
  playKeypress() {
    this.createBeep(800 + Math.random() * 200, 0.08, 'square', 0.15);
  }

  playError() {
    this.createBeep(180, 0.6, 'sawtooth', 0.4);
    setTimeout(() => this.createBeep(120, 0.4, 'sawtooth', 0.3), 200);
  }

  playSuccess() {
    this.createBeep(600, 0.15, 'sine', 0.3);
    setTimeout(() => this.createBeep(800, 0.15, 'sine', 0.25), 100);
    setTimeout(() => this.createBeep(1000, 0.2, 'sine', 0.2), 200);
  }

  playBoot() {
    const frequencies = [200, 300, 450, 600, 800, 1000];
    frequencies.forEach((freq, index) => {
      setTimeout(() => this.createBeep(freq, 0.25, 'sawtooth', 0.3), index * 150);
    });
    // Add final boot complete sound
    setTimeout(() => {
      this.createBeep(1200, 0.3, 'sine', 0.4);
    }, frequencies.length * 150 + 200);
  }

  playAlert() {
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        this.createBeep(1000, 0.12, 'triangle', 0.5);
        setTimeout(() => this.createBeep(800, 0.12, 'triangle', 0.4), 150);
      }, i * 400);
    }
  }

  // New cyberpunk-specific sound effects
  playHack() {
    // Rapid sequence of tones suggesting data transfer
    const frequencies = [800, 1200, 600, 1000, 400, 900];
    frequencies.forEach((freq, index) => {
      setTimeout(() => this.createBeep(freq, 0.08, 'square', 0.2), index * 50);
    });
  }

  playConnection() {
    // Modem-like connection sound
    this.createBeep(300, 0.2, 'sawtooth', 0.3);
    setTimeout(() => this.createBeep(800, 0.15, 'sine', 0.25), 200);
    setTimeout(() => this.createBeep(1200, 0.1, 'triangle', 0.2), 350);
  }

  playDisconnection() {
    this.createBeep(1200, 0.1, 'triangle', 0.3);
    setTimeout(() => this.createBeep(800, 0.15, 'sawtooth', 0.25), 100);
    setTimeout(() => this.createBeep(300, 0.3, 'sine', 0.2), 250);
  }

  playDataTransfer() {
    // Digital data transfer sounds
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        const freq = 600 + Math.random() * 800;
        this.createBeep(freq, 0.05, 'square', 0.15);
      }, i * 60);
    }
  }

  playSystemBreach() {
    // Dramatic breach sound
    this.createBeep(200, 0.5, 'sawtooth', 0.6);
    setTimeout(() => this.createBeep(150, 0.4, 'triangle', 0.5), 100);
    setTimeout(() => this.createBeep(100, 0.6, 'sine', 0.4), 200);
  }

  playMissionComplete() {
    // Victory fanfare
    const melody = [600, 800, 1000, 1200, 1000, 1200, 1400];
    melody.forEach((freq, index) => {
      setTimeout(() => this.createBeep(freq, 0.2, 'triangle', 0.3), index * 150);
    });
  }

  playGlitch() {
    // Random glitch effect
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const freq = Math.random() * 2000 + 100;
        this.createBeep(freq, 0.03, Math.random() > 0.5 ? 'square' : 'sawtooth', 0.4);
      }, i * 20);
    }
  }

  playDataGlitch() {
    // Subtle ambient glitch for atmosphere
    if (!this.context || !this.enabled) return;
    
    const oscillator = this.context.createOscillator();
    const filter = this.context.createBiquadFilter();
    const gainNode = this.context.createGain();
    
    oscillator.frequency.setValueAtTime(Math.random() * 1000 + 200, this.context.currentTime);
    oscillator.type = 'square';
    
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(Math.random() * 2000 + 500, this.context.currentTime);
    filter.Q.setValueAtTime(5, this.context.currentTime);
    
    gainNode.gain.setValueAtTime(0, this.context.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1 * this.masterVolume, this.context.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.15);
    
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.context.destination);
    
    oscillator.start();
    oscillator.stop(this.context.currentTime + 0.15);
  }

  playTyping() {
    // Realistic typing sound with variation
    const freq = 400 + Math.random() * 200;
    this.createBeep(freq, 0.05, 'square', 0.1);
  }

  playEnter() {
    // Distinctive enter key sound
    this.createBeep(600, 0.1, 'triangle', 0.2);
    setTimeout(() => this.createBeep(400, 0.05, 'sine', 0.15), 50);
  }

  // Mission-specific sounds
  playScan() {
    // Scanning/radar-like sound
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        this.createBeep(800 + i * 200, 0.3, 'sine', 0.2);
      }, i * 100);
    }
  }

  playInject() {
    // Payload injection sound
    this.createBeep(1000, 0.1, 'square', 0.3);
    setTimeout(() => this.createBeep(1200, 0.1, 'triangle', 0.25), 100);
    setTimeout(() => this.createBeep(800, 0.2, 'sine', 0.2), 200);
  }

  playDecrypt() {
    // Decryption progress sound
    const frequencies = [300, 400, 500, 600, 700, 800];
    frequencies.forEach((freq, index) => {
      setTimeout(() => this.createBeep(freq, 0.15, 'triangle', 0.2), index * 100);
    });
  }
}

export const soundSystem = new SoundSystem();
