class ErrorSound {
  private audioContext: AudioContext | null = null;
  private isInitialized = false;

  private async initialize() {
    if (!this.audioContext) {
      const AudioContextConstructor = window.AudioContext;
      this.audioContext = new AudioContextConstructor();
    }
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
    this.isInitialized = true;
  }

  public async play() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const context = this.audioContext;
    if (!context) return;

    await context.resume();

    const oscillator1 = context.createOscillator();
    const oscillator2 = context.createOscillator();
    const oscillator3 = context.createOscillator();
    const gainNode = context.createGain();

    // Connect oscillators to gain node
    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    oscillator3.connect(gainNode);
    gainNode.connect(context.destination);

    // Set frequencies for a quick error tone (C major chord)
    oscillator1.frequency.value = 261.63; // C4
    oscillator2.frequency.value = 329.63; // E4
    oscillator3.frequency.value = 392.00; // G4

    // Set gain envelope
    gainNode.gain.setValueAtTime(0, context.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, context.currentTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, context.currentTime + 0.2);

    // Start oscillators
    oscillator1.start();
    oscillator2.start();
    oscillator3.start();

    // Stop oscillators after 200ms
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        oscillator1.stop();
        oscillator2.stop();
        oscillator3.stop();
        // Disconnect all nodes
        oscillator1.disconnect();
        oscillator2.disconnect();
        oscillator3.disconnect();
        gainNode.disconnect();
        void context.suspend();
        resolve();
      }, 200);
    });
  }

  public async cleanup() {
    if (this.audioContext) {
      await this.audioContext.close();
      this.audioContext = null;
      this.isInitialized = false;
    }
  }
}

// Export a singleton instance
export const errorSound = new ErrorSound(); 