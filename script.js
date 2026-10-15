(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.getElementById("year").textContent = new Date().getFullYear();

  // Mobile nav
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open);
  });
  links.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      links.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    })
  );

  // Typing effect
  const typed = document.querySelector(".typed");
  const words = typed.dataset.words.split("|");
  if (reduceMotion) {
    typed.textContent = words[0];
  } else {
    let w = 0, i = 0, deleting = false;
    const tick = () => {
      const word = words[w];
      typed.textContent = word.slice(0, i);
      if (!deleting && i === word.length) {
        deleting = true;
        return setTimeout(tick, 1800);
      }
      if (deleting && i === 0) {
        deleting = false;
        w = (w + 1) % words.length;
      }
      i += deleting ? -1 : 1;
      setTimeout(tick, deleting ? 40 : 85);
    };
    tick();
  }

  // Scroll reveal + stat counters
  const countUp = (el) => {
    const target = +el.dataset.count;
    if (reduceMotion) return (el.textContent = target);
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / 1400, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("visible");
        e.target.querySelectorAll("[data-count]").forEach(countUp);
        io.unobserve(e.target);
      });
    },
    { threshold: 0.15 }
  );
  document.querySelectorAll(".reveal").forEach((el, idx) => {
    el.style.transitionDelay = `${(idx % 4) * 80}ms`;
    io.observe(el);
  });

  // Cursor glow + card spotlight
  const glow = document.querySelector(".cursor-glow");
  window.addEventListener("pointermove", (e) => {
    glow.style.opacity = 1;
    glow.style.left = e.clientX + "px";
    glow.style.top = e.clientY + "px";
  });
  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });

  // Hero network canvas
  const canvas = document.getElementById("network");
  const ctx = canvas.getContext("2d");
  let pts = [], W = 0, H = 0, dpr = 1;
  const mouse = { x: -9999, y: -9999 };

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.offsetWidth;
    H = canvas.offsetHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.min(90, Math.floor((W * H) / 16000));
    pts = Array.from({ length: n }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
    }));
  };

  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    for (const p of pts) {
      if (!reduceMotion) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
      }
    }
    for (let a = 0; a < pts.length; a++) {
      const p = pts[a];
      for (let b = a + 1; b < pts.length; b++) {
        const q = pts[b];
        const d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < 130) {
          ctx.strokeStyle = `rgba(139, 92, 246, ${0.35 * (1 - d / 130)})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        }
      }
      const md = Math.hypot(p.x - mouse.x, p.y - mouse.y);
      if (md < 180) {
        ctx.strokeStyle = `rgba(34, 211, 238, ${0.5 * (1 - md / 180)})`;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
      }
      ctx.fillStyle = "rgba(34, 211, 238, 0.85)";
      ctx.beginPath(); ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2); ctx.fill();
    }
    if (!reduceMotion) requestAnimationFrame(draw);
  };

  canvas.parentElement.addEventListener("pointermove", (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  });
  canvas.parentElement.addEventListener("pointerleave", () => { mouse.x = mouse.y = -9999; });
  window.addEventListener("resize", () => { resize(); if (reduceMotion) draw(); });

  resize();
  draw();
})();
