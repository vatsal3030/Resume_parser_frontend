/**
 * Web Audio API Sound Effects for Gamified Mock Interview
 * Zero external audio files required — synthesizes clean high-tech sounds in-browser.
 */

let audioCtx = null;

const getAudioContext = () => {
 if (typeof window === 'undefined') return null;
 if (!audioCtx) {
 const AudioContext = window.AudioContext || window.webkitAudioContext;
 if (AudioContext) {
 audioCtx = new AudioContext();
 }
 }
 if (audioCtx && audioCtx.state === 'suspended') {
 audioCtx.resume();
 }
 return audioCtx;
};

export const interviewAudio = {
 isMuted: false,

 setMuted(muted) {
 this.isMuted = muted;
 },

 toggleMute() {
 this.isMuted = !this.isMuted;
 return this.isMuted;
 },

 // Correct answer chime (2-tone uplifting chime: C5 -> G5)
 playCorrect() {
 if (this.isMuted) return;
 const ctx = getAudioContext();
 if (!ctx) return;

 try {
 const now = ctx.currentTime;
 // Tone 1: 523.25 Hz (C5)
 const osc1 = ctx.createOscillator();
 const gain1 = ctx.createGain();
 osc1.type = 'sine';
 osc1.frequency.setValueAtTime(523.25, now);
 gain1.gain.setValueAtTime(0.15, now);
 gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
 osc1.connect(gain1);
 gain1.connect(ctx.destination);
 osc1.start(now);
 osc1.stop(now + 0.25);

 // Tone 2: 783.99 Hz (G5)
 const osc2 = ctx.createOscillator();
 const gain2 = ctx.createGain();
 osc2.type = 'sine';
 osc2.frequency.setValueAtTime(783.99, now + 0.12);
 gain2.gain.setValueAtTime(0.18, now + 0.12);
 gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
 osc2.connect(gain2);
 gain2.connect(ctx.destination);
 osc2.start(now + 0.12);
 osc2.stop(now + 0.45);
 } catch {}
 },

 // Incorrect answer tone (gentle soft low buzz)
 playIncorrect() {
 if (this.isMuted) return;
 const ctx = getAudioContext();
 if (!ctx) return;

 try {
 const now = ctx.currentTime;
 const osc = ctx.createOscillator();
 const gain = ctx.createGain();
 osc.type = 'triangle';
 osc.frequency.setValueAtTime(220, now);
 osc.frequency.linearRampToValueAtTime(160, now + 0.25);
 gain.gain.setValueAtTime(0.12, now);
 gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
 osc.connect(gain);
 gain.connect(ctx.destination);
 osc.start(now);
 osc.stop(now + 0.25);
 } catch {}
 },

 // Success victory fanfare on interview submission
 playSuccessFanfare() {
 if (this.isMuted) return;
 const ctx = getAudioContext();
 if (!ctx) return;

 try {
 const now = ctx.currentTime;
 const notes = [
 { freq: 440.00, time: 0.0, dur: 0.12 }, // A4
 { freq: 554.37, time: 0.12, dur: 0.12 }, // C#5
 { freq: 659.25, time: 0.24, dur: 0.12 }, // E5
 { freq: 880.00, time: 0.36, dur: 0.45 }, // A5
 ];

 notes.forEach(({ freq, time, dur }) => {
 const osc = ctx.createOscillator();
 const gain = ctx.createGain();
 osc.type = 'triangle';
 osc.frequency.setValueAtTime(freq, now + time);
 gain.gain.setValueAtTime(0.2, now + time);
 gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);
 osc.connect(gain);
 gain.connect(ctx.destination);
 osc.start(now + time);
 osc.stop(now + time + dur);
 });
 } catch {}
 },

 // XP gain notification sound
 playXpGain() {
 if (this.isMuted) return;
 const ctx = getAudioContext();
 if (!ctx) return;

 try {
 const now = ctx.currentTime;
 const osc = ctx.createOscillator();
 const gain = ctx.createGain();
 osc.type = 'sine';
 osc.frequency.setValueAtTime(600, now);
 osc.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
 gain.gain.setValueAtTime(0.12, now);
 gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
 osc.connect(gain);
 gain.connect(ctx.destination);
 osc.start(now);
 osc.stop(now + 0.15);
 } catch {}
 },

 // Badge unlock celebration sound
 playBadgeUnlocked() {
 if (this.isMuted) return;
 const ctx = getAudioContext();
 if (!ctx) return;

 try {
 const now = ctx.currentTime;
 const notes = [659.25, 783.99, 1046.50];
 notes.forEach((freq, idx) => {
 const osc = ctx.createOscillator();
 const gain = ctx.createGain();
 osc.type = 'sine';
 osc.frequency.setValueAtTime(freq, now + (idx * 0.08));
 gain.gain.setValueAtTime(0.15, now + (idx * 0.08));
 gain.gain.exponentialRampToValueAtTime(0.001, now + (idx * 0.08) + 0.25);
 osc.connect(gain);
 gain.connect(ctx.destination);
 osc.start(now + (idx * 0.08));
 osc.stop(now + (idx * 0.08) + 0.25);
 });
 } catch {}
 },

 // UI button click
 playClick() {
 if (this.isMuted) return;
 const ctx = getAudioContext();
 if (!ctx) return;

 try {
 const now = ctx.currentTime;
 const osc = ctx.createOscillator();
 const gain = ctx.createGain();
 osc.type = 'sine';
 osc.frequency.setValueAtTime(800, now);
 gain.gain.setValueAtTime(0.04, now);
 gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
 osc.connect(gain);
 gain.connect(ctx.destination);
 osc.start(now);
 osc.stop(now + 0.03);
 } catch {}
 },

 // Gentle timer warning alert
 playTimerAlert() {
 if (this.isMuted) return;
 const ctx = getAudioContext();
 if (!ctx) return;

 try {
 const now = ctx.currentTime;
 const osc = ctx.createOscillator();
 const gain = ctx.createGain();
 osc.type = 'sine';
 osc.frequency.setValueAtTime(440, now);
 gain.gain.setValueAtTime(0.08, now);
 gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
 osc.connect(gain);
 gain.connect(ctx.destination);
 osc.start(now);
 osc.stop(now + 0.08);
 } catch {}
 }
};
