import { useEffect } from 'react';

export default function InteractionEffects() {
  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return undefined;

    const dot = document.createElement('div');
    const ring = document.createElement('div');
    dot.className = 'cursor-dot';
    ring.className = 'cursor-ring';
    document.body.append(dot, ring);

    let pointerX = -100;
    let pointerY = -100;
    let ringX = -100;
    let ringY = -100;
    let frame;

    const render = () => {
      ringX += (pointerX - ringX) * 0.16;
      ringY += (pointerY - ringY) * 0.16;
      dot.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0)`;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      frame = requestAnimationFrame(render);
    };
    const move = ({ clientX, clientY }) => {
      pointerX = clientX;
      pointerY = clientY;
      document.body.classList.add('cursor-visible');
    };
    const hover = (event) => {
      ring.classList.toggle('cursor-hover', Boolean(event.target.closest('a, button, input, select, textarea, [role="button"]')));
    };
    const leave = () => document.body.classList.remove('cursor-visible');

    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerover', hover, { passive: true });
    document.documentElement.addEventListener('mouseleave', leave);
    render();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerover', hover);
      document.documentElement.removeEventListener('mouseleave', leave);
      dot.remove();
      ring.remove();
    };
  }, []);

  useEffect(() => {
    const ripple = (event) => {
      const target = event.target.closest('button, a, [role="button"]');
      if (!target) return;
      const pulse = document.createElement('span');
      pulse.className = 'click-pulse';
      pulse.style.left = `${event.clientX}px`;
      pulse.style.top = `${event.clientY}px`;
      document.body.appendChild(pulse);
      pulse.addEventListener('animationend', () => pulse.remove(), { once: true });
    };
    document.addEventListener('pointerdown', ripple);
    return () => document.removeEventListener('pointerdown', ripple);
  }, []);

  return null;
}
