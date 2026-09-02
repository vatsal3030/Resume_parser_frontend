/**
 * Zero-dependency HTML5 Canvas Confetti Burst
 * Draws physics-based confetti particles with brutalist colors.
 */

export function triggerConfetti() {
 if (typeof window === 'undefined') return;

 const canvas = document.createElement('canvas');
 canvas.style.position = 'fixed';
 canvas.style.top = '0';
 canvas.style.left = '0';
 canvas.style.width = '100vw';
 canvas.style.height = '100vh';
 canvas.style.pointerEvents = 'none';
 canvas.style.zIndex = '99999';
 document.body.appendChild(canvas);

 const ctx = canvas.getContext('2d');
 const dpr = window.devicePixelRatio || 1;
 const width = window.innerWidth;
 const height = window.innerHeight;
 canvas.width = width * dpr;
 canvas.height = height * dpr;
 ctx.scale(dpr, dpr);

 const colors = ['#FFE600', '#FF5E5E', '#00F0FF', '#00E699', '#B388FF', '#FF80AB', '#000000'];
 const particleCount = 120;
 const particles = [];

 for (let i = 0; i < particleCount; i++) {
 particles.push({
 x: width * 0.5,
 y: height * 0.4,
 vx: (Math.random() - 0.5) * 22,
 vy: (Math.random() - 0.7) * 20 - 4,
 size: Math.random() * 8 + 6,
 color: colors[Math.floor(Math.random() * colors.length)],
 rotation: Math.random() * 360,
 vRotation: (Math.random() - 0.5) * 12,
 shape: Math.random() > 0.4 ? 'rect' : 'circle',
 opacity: 1,
 drag: 0.96,
 gravity: 0.45
 });
 }

 let animationFrame;
 const startTime = Date.now();
 const duration = 3000; // 3 seconds

 function animate() {
 const elapsed = Date.now() - startTime;
 const progress = elapsed / duration;

 ctx.clearRect(0, 0, width, height);

 let activeParticles = 0;
 particles.forEach(p => {
 p.vx *= p.drag;
 p.vy *= p.drag;
 p.vy += p.gravity;
 p.x += p.vx;
 p.y += p.vy;
 p.rotation += p.vRotation;
 p.opacity = Math.max(0, 1 - (progress * 1.2));

 if (p.opacity > 0 && p.y < height + 50) {
 activeParticles++;
 ctx.save();
 ctx.translate(p.x, p.y);
 ctx.rotate((p.rotation * Math.PI) / 180);
 ctx.globalAlpha = p.opacity;
 ctx.fillStyle = p.color;
 ctx.strokeStyle = '#000000';
 ctx.lineWidth = 1.5;

 if (p.shape === 'rect') {
 ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
 ctx.strokeRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
 } else {
 ctx.beginPath();
 ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
 ctx.fill();
 ctx.stroke();
 }
 ctx.restore();
 }
 });

 if (activeParticles > 0 && elapsed < duration) {
 animationFrame = requestAnimationFrame(animate);
 } else {
 cancelAnimationFrame(animationFrame);
 if (canvas.parentNode) {
 canvas.parentNode.removeChild(canvas);
 }
 }
 }

 animationFrame = requestAnimationFrame(animate);
}
