export function initParticles() {
  if (import.meta.env.MODE === 'test') return undefined;

  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return undefined;

  const ctx = canvas.getContext('2d');
  if (!ctx) return undefined;

  let frameId = 0;
  const particles = [];
  const particleCount = 50;

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  resize();

  for (let i = 0; i < particleCount; i += 1) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2 + 1,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.5 + 0.2,
    });
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((particle) => {
      particle.x += particle.speedX;
      particle.y += particle.speedY;

      if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
      if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;

      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(14, 165, 233, ${particle.opacity})`;
      ctx.fill();
    });

    frameId = requestAnimationFrame(animate);
  }

  animate();
  window.addEventListener('resize', resize);

  return () => {
    cancelAnimationFrame(frameId);
    window.removeEventListener('resize', resize);
  };
}
