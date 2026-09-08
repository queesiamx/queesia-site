// src/components/SocialBubblesManager.jsx
import { useEffect, useMemo, useRef, useState } from "react";

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// --- Íconos (los 6 del footer) ---
const ICONS = [
  {
    href: "https://www.instagram.com/quees_ia",
    title: "Instagram",
    Svg: (p) => (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...p}>
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    href: "https://www.facebook.com/share/16tCkmXBzp/",
    title: "Facebook",
    Svg: (p) => (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...p}>
        <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" fill="currentColor" />
      </svg>
    ),
  },
  {
    href: "https://www.threads.net/@quees_ia",
    title: "Threads",
    Svg: (p) => (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" {...p}>
        <path d="M254.5 32C136.6 32 64 111.6 64 215.5c0 72.3 48.1 138.6 132.5 160.2 9.3-6.4 18.1-13.7 26.3-21.9-49.1-12.2-81.4-52.6-81.4-106.7 0-80.3 60.4-137.3 145.1-137.3 73.6 0 130.6 52.1 130.6 129.3 0 92.8-78.4 168.1-185.1 168.1-21.4 0-44.6-3.5-63.2-8.6-9.4 11.6-21.4 22.3-34.5 30.7 32.3 9.7 70.7 14.6 102.4 14.6 130.3 0 224.1-88.3 224.1-203.4C446.3 116.7 361.9 32 254.5 32z" fill="currentColor" />
      </svg>
    ),
  },
  {
    href: "https://www.tiktok.com/@quees_ia",
    title: "TikTok",
    Svg: (p) => (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...p}>
        <path d="M16.75 3a4.75 4.75 0 004.75 4.75v3.07a7.82 7.82 0 01-4.75-1.57v6.64a6.25 6.25 0 11-6.25-6.25c.25 0 .5.02.75.05v3.2a2.91 2.91 0 00-.75-.1 2.75 2.75 0 102.75 2.75V3h3.5Z" fill="currentColor" />
      </svg>
    ),
  },
  {
    href: "https://x.com/quees_ia",
    title: "X",
    Svg: (p) => (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...p}>
        <path d="M20.39 3H17.6l-4.9 6.31L7.74 3H3l6.92 9.43L3 21h3.37l5.4-6.98L16.9 21H21l-7.28-9.94L20.39 3Z" fill="currentColor" />
      </svg>
    ),
  },
  {
    href: "https://www.youtube.com/@Quees_IA",
    title: "YouTube",
    Svg: (p) => (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...p}>
        <path d="M21.8 8.001s-.2-1.4-.8-2a3.292 3.292 0 00-2.3-.801C16.2 5 12 5 12 5h-.1s-4.2 0-6.7.2c-.9 0-1.7.2-2.3.8-.6.6-.8 2-.8 2S2 9.6 2 11.2v1.6c0 1.6.2 3.2.2 3.2s.2 1.4.8 2c.6.6 1.5.8 2.3.9 1.7.2 7.5.3 7.5.3s4.2 0 6.7-.2a3.292 3.292 0 002.3-.8c.6-.6.8-2 .8-2s.2-1.6.2-3.2v-1.6c0-1.6-.2-3.2-.2-3.2zM9.8 14.7V9.3l5.2 2.7-5.2 2.7z" fill="currentColor" />
      </svg>
    ),
  },
];

// --- Dock lateral (cuando no hay zona activa) ---
function Dock() {
  const ref = useRef(null);
  // pequeña ondulación permanente
  useEffect(() => {
    let raf;
    const start = performance.now();
    const loop = (t) => {
      const el = ref.current;
      if (!el) return;
      const s = (t - start) / 1000;
      el.style.transform = `translateY(${Math.sin(s) * 2}px)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div
      className="fixed left-4 top-1/2 -translate-y-1/2 z-[80] pointer-events-none"
      ref={ref}
    >
      <ul className="flex flex-col gap-3">
        {ICONS.map(({ href, title, Svg }) => (
          <li key={title}>
            <a
              className="pointer-events-auto block p-3 rounded-full bg-white/70 backdrop-blur-md ring-1 ring-white/50 shadow-lg hover:shadow-xl hover:bg-white/90 transition text-primary"
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              title={title}
            >
            {/* Deja que cada SVG defina su propio fill/stroke; heredará text-slate-900 via currentColor */}
           <Svg className="w-5 h-5" />
           </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

// --- Fila ondulante dentro de una sección ---
function SectionWave({ sectionId, maxXvw = 40, anchor, anchorMode }) {
  const containerRef = useRef(null);
  const [vw, setVw] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const upd = () => setVw(window.innerWidth || 0);
    upd();
    window.addEventListener("resize", upd);
    return () => window.removeEventListener("resize", upd);
  }, []);

  // progreso seccional y top (fixed) relativo al viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.style.top = "50vh";
    el.style.opacity = "0";
    const onScroll = () => {
      const sec = document.getElementById(sectionId);
      if (!sec) return;
      const r = sec.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const p = clamp((vh / 2 - r.top) / Math.max(r.height || 1, 1));
      setProgress(p);

    // --- Posicionamiento relativo a "anchor" (slot) ---
      let targetTop = r.top + r.height * 0.35;
      if (anchor) {
        const localAnchor = sec.querySelector(anchor);
        const globalAnchor = !localAnchor && document.querySelector(anchor);
        const a = localAnchor || globalAnchor;
        if (a) {
          const ar = a.getBoundingClientRect();
        if (anchorMode === "center") {
            // Centrar dentro del slot
           targetTop = ar.top + ar.height / 2 - 24; // 24px ≈ mitad del alto de la burbuja (p-3)
         } else {
            // Fallback: un poco por encima del anchor
            targetTop = ar.top - 32;
          }
        }
      }
      // Límites dentro del viewport para que no se pegue ni al header ni al footer
      const min = 72;          // margen superior seguro
      const max = vh - 140;    // margen inferior seguro
      el.style.top = `${Math.min(max, Math.max(min, targetTop))}px`;

      const visible = r.bottom > 0 && r.top < vh;
      el.style.opacity = visible ? "1" : "0";
    };
    requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [sectionId]);

  const eased = easeInOutCubic(progress);
  const maxX = (maxXvw / 100) * (vw || 800);

  return (
    <div
      ref={containerRef}
      className="fixed left-1/2 -translate-x-1/2 z-[90] pointer-events-none"
    >
      <ul className="relative flex flex-row items-center justify-center gap-6">
        {ICONS.map(({ href, title, Svg }, i) => {
          const n = ICONS.length - 1 || 1;
          // Reparto centrado: de -maxX/2 a +maxX/2
          const base = lerp(-(maxX || 0) / 2, (maxX || 0) / 2, i / n);
          const t = eased + i * 0.12;
          // Solo onda horizontal (más sutil)
          const x = base + Math.sin(t * Math.PI * 2) * 12;
          const y = 0; // sin desplazamiento vertical para mantener alineación
          return (
            <li
              key={title}
              style={{ transform: `translate(${x}px, ${y}px)` }}
              className="will-change-transform transition-transform duration-300"
            >
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                title={title}
                className="pointer-events-auto block p-3 rounded-full bg-white/70 backdrop-blur-md ring-1 ring-white/50 shadow-lg hover:shadow-xl hover:bg-white/90 transition text-primary"
              >
              {/* Igual que en Dock: sin overrides de fill/stroke */}
                <Svg className="w-5 h-5" /></a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// --- Orquestador ---
export default function SocialBubblesManager({ sections }) {
  const [active, setActive] = useState(null); // id de la sección visible

  useEffect(() => {
    if (!Array.isArray(sections) || sections.length === 0) return;
    const obs = new IntersectionObserver(
      (entries) => {
        // elegimos la que más intersección tenga
        let best = null;
        let bestRatio = 0;
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio > bestRatio) {
            bestRatio = e.intersectionRatio;
            best = e.target.id;
          } else if (!e.isIntersecting && e.target.id === active) {
            // si la activa dejó de intersectar, la apagamos
            best = null;
          }
        }
        if (best !== null) setActive(best);
        else {
          // comprobar si alguna sigue intersectando
          const still = entries.find((e) => e.isIntersecting)?.target?.id || null;
          if (!still) setActive(null);
        }
      },
      { threshold: [0.2, 0.5, 0.8] }
    );
    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [sections]);

  // Render según estado
  if (!active) return <Dock />;

  const cfg = sections.find((s) => s.id === active) || { id: active, maxXvw: 40 };
  return (
    <SectionWave
      sectionId={cfg.id}
      maxXvw={cfg.maxXvw}
      anchor={cfg.anchor}
      anchorMode={cfg.anchorMode}
    />
  );

}
