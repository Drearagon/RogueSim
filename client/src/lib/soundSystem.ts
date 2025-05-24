export class SoundSystem {
  private context: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    try {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  private createBeep(frequency: number, duration: number, type: OscillatorType = 'sine') {
    if (!this.context || !this.enabled) return;

    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.context.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.3, this.context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);

    oscillator.start(this.context.currentTime);
    oscillator.stop(this.context.currentTime + duration);
  }

  playKeypress() {
    this.createBeep(800, 0.1, 'square');
  }

  playError() {
    this.createBeep(200, 0.5, 'sawtooth');
  }

  playSuccess() {
    this.createBeep(600, 0.2);
    setTimeout(() => this.createBeep(800, 0.2), 100);
  }

  playBoot() {
    const frequencies = [400, 500, 600, 700, 800];
    frequencies.forEach((freq, index) => {
      setTimeout(() => this.createBeep(freq, 0.3), index * 200);
    });
  }

  playAlert() {
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        this.createBeep(1000, 0.1);
        setTimeout(() => this.createBeep(800, 0.1), 150);
      }, i * 300);
    }
  }
}

export const soundSystem = new SoundSystem();
