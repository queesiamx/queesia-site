// src/components/SocialBubbles.jsx
import { useEffect, useMemo, useRef, useState } from "react";

 const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
 const easeInOutCubic = (t) =>
   t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;


export default function SocialBubbles({ sectionId, maxXvw = 40 }) {
  const containerRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [vw, setVw] = useState(0);
  const [posTop, setPosTop] = useState("50vh"); // posición segura inicial


  // 6 redes (mismas del footer)
  const ICONS = useMemo(
    () => [
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
// En tu lista ICONS, reemplaza solo la entrada de Threads:
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
    ],
    []
  );

  // medir viewport (cliente)
  useEffect(() => {
    const update = () => setVw(window.innerWidth || 0);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // progreso 0..1 a medida que el centro del viewport recorre la sección
  useEffect(() => {
    const onScroll = () => {
      const sec = document.getElementById(sectionId);
      if (!sec) return;
      const r = sec.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const p = clamp((vh / 2 - r.top) / Math.max(r.height || 1, 1));
      setProgress(p);
    };
    requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [sectionId]);

  // anclar el contenedor a ~1/3 superior de la sección (fallback visible)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    
    const updatePos = () => {
      const sec = document.getElementById(sectionId);
      if (!sec) return;
      const r = sec.getBoundingClientRect();
      // ~30% de la sección y un offset hacia arriba para no tapar el título
      const y = window.scrollY + r.top + r.height * 0.30 - 24;
      setPosTop(`${Math.max(0, y)}px`);
    };
    requestAnimationFrame(updatePos);
    window.addEventListener("scroll", updatePos, { passive: true });
    window.addEventListener("resize", updatePos);
    return () => {
      window.removeEventListener("scroll", updatePos);
      window.removeEventListener("resize", updatePos);
    };
  }, [sectionId]);

  const eased = easeInOutCubic(progress);
  // si aún no medimos viewport, usa 320px de recorrido por defecto
  const maxX = (maxXvw / 100) * (vw || 800) || 320;

    return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed left-1/2 -translate-x-1/2 z-[70]"
      style={{ top: posTop }}
      aria-hidden="false"
    >
    {/* Fila horizontal alineada y sin “saltos” verticales */}
      <ul className="relative flex flex-row items-center justify-center gap-6">
        {ICONS.map(({ href, title, Svg }, i) => {
        const n = ICONS.length > 1 ? ICONS.length - 1 : 1;
          // Repartimos de -maxX/2 a +maxX/2 para quedar centrados
          const base = lerp(- (maxX || 0) / 2, (maxX || 0) / 2, i / n);
          const t = eased + i * 0.12;
          const x = base + Math.sin(t * Math.PI * 2) * 12;
          const y = 0; // sin desplazamiento vertical para mantener alineación
           
          return (
            <li
              key={title}
              style={{ transform: `translate(${x}px, ${y}px)` }}
              className="transition-transform duration-300 will-change-transform"
            >
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              title={title}
              className="pointer-events-auto block rounded-full bg-white/70 backdrop-blur-md ring-1 ring-white/50 shadow-lg hover:shadow-xl hover:bg-white/90 transition p-3 text-primary"
               
            >
              {/* No forzamos fill/none aquí; cada icono ya define su modo */}
               <Svg className="w-5 h-5" />
               </a>

            </li>
          );
        })}
      </ul>
    </div>
  );
}
