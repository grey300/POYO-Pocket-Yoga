import { useEffect } from 'react';

export default function InteractionEffects() {
  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    if (reducedMotion || !finePointer) return undefined;

    let current = window.scrollY;
    let target = current;
    let lastWrittenY = current; // last position we wrote, to tell our scroll from the user's
    let frame = null;

    const maxScroll = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const hasScrollableParent = (node, delta) => {
      let element = node instanceof Element ? node : null;
      while (element && element !== document.body) {
        const style = window.getComputedStyle(element);
        if (/(auto|scroll)/.test(style.overflowY) && element.scrollHeight > element.clientHeight) {
          const canScrollDown = delta > 0 && element.scrollTop + element.clientHeight < element.scrollHeight;
          const canScrollUp = delta < 0 && element.scrollTop > 0;
          if (canScrollDown || canScrollUp) return true;
        }
        element = element.parentElement;
      }
      return false;
    };

    const animate = () => {
      // Re-clamp every frame so lazily loaded content / the 3D hero changing
      // the page height can't strand the target past the scrollable range.
      target = Math.min(maxScroll(), Math.max(0, target));
      current += (target - current) * 0.14;
      if (Math.abs(target - current) < 0.4) current = target;
      lastWrittenY = current;
      // `behavior: 'instant'` bypasses CSS `scroll-behavior: smooth`, so the
      // browser doesn't try to smooth-animate toward each frame — that double
      // animation is what made momentum stall.
      window.scrollTo({ top: current, left: 0, behavior: 'instant' });
      frame = current !== target ? requestAnimationFrame(animate) : null;
    };

    const onWheel = (event) => {
      if (event.ctrlKey || event.metaKey || hasScrollableParent(event.target, event.deltaY)) return;
      event.preventDefault();
      const multiplier = event.deltaMode === 1 ? 18 : event.deltaMode === 2 ? window.innerHeight : 1;
      if (!frame) current = window.scrollY; // resync before a fresh gesture
      target = Math.min(maxScroll(), Math.max(0, target + event.deltaY * multiplier));
      if (!frame) frame = requestAnimationFrame(animate);
    };

    // If the user scrolls another way (scrollbar drag, keyboard, touch, anchor
    // jump), adopt that position and drop the momentum instead of fighting it.
    const onScroll = () => {
      if (Math.abs(window.scrollY - lastWrittenY) < 2) return; // our own write
      if (frame) { cancelAnimationFrame(frame); frame = null; }
      current = target = lastWrittenY = window.scrollY;
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

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
