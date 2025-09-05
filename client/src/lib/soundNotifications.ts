// Sound notification utility for service requests
class SoundNotificationManager {
  private audioContext: AudioContext | null = null;
  private isInitialized = false;

  constructor() {
    this.initializeAudioContext();
  }

  private initializeAudioContext() {
    try {
      // Create audio context on user interaction
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.isInitialized = true;
    } catch (error) {
      console.warn('Audio context not supported:', error);
    }
  }

  // Create a bell sound using Web Audio API
  private createBellSound() {
    if (!this.audioContext) return;

    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Bell-like sound configuration
    oscillator.frequency.setValueAtTime(800, now);
    oscillator.frequency.exponentialRampToValueAtTime(400, now + 0.1);
    oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.3);

    // Volume envelope for bell effect
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1.0);

    // Play the sound
    oscillator.start(now);
    oscillator.stop(now + 1.0);
  }

  // Alternative: Use HTML5 Audio with a data URL for a simple beep
  private createSimpleBeep() {
    try {
      // Create a simple beep sound using data URL
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (error) {
      console.warn('Could not create audio notification:', error);
    }
  }

  // Play notification sound for new service request
  public playNewRequestNotification() {
    try {
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume().then(() => {
          this.createBellSound();
        });
      } else if (this.audioContext) {
        this.createBellSound();
      } else {
        // Fallback to simple beep
        this.createSimpleBeep();
      }
    } catch (error) {
      console.warn('Error playing notification sound:', error);
      // Final fallback - try system beep
      this.fallbackNotification();
    }
  }

  // Fallback notification using system sounds
  private fallbackNotification() {
    try {
      // Try to use a data URL for a simple tone
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvWoobFVjdJivqZJgNjZfodDbq2EcBj+a2/LDciUGLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwGJHfH8N2QQAoUXrTp66hVFApGn+DyvWooaXNgQDNjNDVjYE53+HU3v++ZU1j2/JGhXzZndF2vq5JgNjZfodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvWopYF5jdF2vq5JgNjZfodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvWoVVOLx8NvzxWcnhsBxNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvWopL0DLpQDpA0=');
      audio.play().catch(() => {
        // Even the fallback failed, just log it
        console.warn('All audio notification methods failed');
      });
    } catch (error) {
      console.warn('Fallback notification failed:', error);
    }
  }

  // Initialize audio context on user interaction (required for autoplay policies)
  public initializeOnUserInteraction() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }
}

// Create singleton instance
export const soundNotifications = new SoundNotificationManager();

// Helper function to enable sound notifications after user interaction
export function enableSoundNotifications() {
  soundNotifications.initializeOnUserInteraction();
}