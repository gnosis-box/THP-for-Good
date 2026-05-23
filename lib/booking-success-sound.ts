/** Short success chime via Web Audio (no asset file). Fails silently if blocked. */
export function playBookingSuccessSound(): void {
  if (typeof window === 'undefined') return;

  try {
    const AudioCtx = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.setValueAtTime(659.25, now + 0.1);
    osc.frequency.setValueAtTime(783.99, now + 0.2);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

    osc.start(now);
    osc.stop(now + 0.45);
    osc.onended = () => {
      void ctx.close();
    };
  } catch {
    // Autoplay policy or unsupported — ignore
  }
}
