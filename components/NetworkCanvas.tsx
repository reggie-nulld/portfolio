"use client";

import { useEffect, useRef } from "react";

type Point = { x: number; y: number; vx: number; vy: number };

const LINK_DIST = 130;
const MOUSE_DIST = 180;
// Lines are drawn in a few opacity steps, one path per step, instead of one
// stroke() call per line. That's what keeps this cheap on big, sharp screens.
const ALPHA_STEPS = 4;
// The motion is slow, so ~40 frames a second looks the same as 144 and costs far less.
const FRAME_MS = 1000 / 40;
const SPEED = 0.02; // pixels per millisecond

export default function NetworkCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !host || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mouse = { x: -9999, y: -9999 };
    let pts: Point[] = [];
    let W = 0;
    let H = 0;
    let raf = 0;
    let last = 0;
    let onScreen = true;
    const buckets: number[][] = Array.from({ length: ALPHA_STEPS }, () => []);

    const resize = () => {
      // 1.5x is sharp enough for thin lines and draws ~45% fewer pixels than 2x.
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.min(70, Math.floor((W * H) / 20000));
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * SPEED,
        vy: (Math.random() - 0.5) * SPEED,
      }));
    };

    const render = (dt: number) => {
      ctx.clearRect(0, 0, W, H);
      for (const p of pts) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
      }

      for (const b of buckets) b.length = 0;
      const linkSq = LINK_DIST * LINK_DIST;
      for (let a = 0; a < pts.length; a++) {
        const p = pts[a];
        for (let b = a + 1; b < pts.length; b++) {
          const q = pts[b];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dSq = dx * dx + dy * dy;
          if (dSq < linkSq) {
            const step = Math.min(ALPHA_STEPS - 1, Math.floor((1 - Math.sqrt(dSq) / LINK_DIST) * ALPHA_STEPS));
            buckets[step].push(p.x, p.y, q.x, q.y);
          }
        }
      }
      ctx.lineWidth = 1;
      buckets.forEach((lines, step) => {
        if (!lines.length) return;
        ctx.strokeStyle = `rgba(64, 160, 112, ${(0.35 * (step + 1)) / ALPHA_STEPS})`;
        ctx.beginPath();
        for (let i = 0; i < lines.length; i += 4) {
          ctx.moveTo(lines[i], lines[i + 1]);
          ctx.lineTo(lines[i + 2], lines[i + 3]);
        }
        ctx.stroke();
      });

      // Lines to the cursor.
      if (mouse.x > -9999) {
        const mouseSq = MOUSE_DIST * MOUSE_DIST;
        ctx.strokeStyle = "rgba(111, 207, 151, 0.3)";
        ctx.beginPath();
        for (const p of pts) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          if (dx * dx + dy * dy < mouseSq) {
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
          }
        }
        ctx.stroke();
      }

      ctx.fillStyle = "rgba(111, 207, 151, 0.8)";
      ctx.beginPath();
      for (const p of pts) {
        ctx.moveTo(p.x + 1.6, p.y);
        ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
      }
      ctx.fill();
    };

    const loop = (now: number) => {
      raf = 0;
      if (!onScreen || document.hidden) return;
      raf = requestAnimationFrame(loop);
      const dt = now - last;
      if (dt < FRAME_MS) return;
      last = now;
      render(Math.min(dt, 100));
    };
    const start = () => {
      if (reduced || raf || !onScreen || document.hidden) return;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };

    // Only animate while the hero is on screen.
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      start();
    });
    const onVisibility = () => start();
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    const onLeave = () => {
      mouse.x = mouse.y = -9999;
    };
    let resizeTimer = 0;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        resize();
        if (reduced) render(0);
      }, 150);
    };

    // Wait until the page has painted, so the animation never delays it.
    const begin = () => {
      resize();
      render(0);
      io.observe(host);
      host.addEventListener("pointermove", onMove);
      host.addEventListener("pointerleave", onLeave);
      window.addEventListener("resize", onResize);
      document.addEventListener("visibilitychange", onVisibility);
    };
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
    const cancelIdle = window.cancelIdleCallback ?? window.clearTimeout;
    const idleId = idle(begin, { timeout: 1500 });

    return () => {
      cancelIdle(idleId);
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      io.disconnect();
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={ref} id="network" aria-hidden="true" />;
}
