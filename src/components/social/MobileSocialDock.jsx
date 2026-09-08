// src/components/social/MobileSocialDock.jsx
import React, { useEffect, useRef, useState } from "react";
import { IG, FB, Threads, TikTok, XLogo, YT } from "./Icons";

// Helpers seguros para SSR
const isBrowser = () => typeof window !== "undefined";

const loadPos = () => {
  if (!isBrowser()) return null;
  try {
    return JSON.parse(localStorage.getItem("qs_social_pos") || "null");
  } catch {
    return null;
  }
};

const savePos = (pos) => {
  if (!isBrowser()) return;
  try {
    localStorage.setItem("qs_social_pos", JSON.stringify(pos));
  } catch {}
};

const LINKS = [
  { href: "https://www.instagram.com/quees_ia", title: "Instagram", Svg: IG },
  { href: "https://www.facebook.com/share/16tCkmXBzp/", title: "Facebook", Svg: FB },
  { href: "https://www.threads.net/@quees_ia", title: "Threads", Svg: Threads },
  { href: "https://www.tiktok.com/@quees_ia", title: "TikTok", Svg: TikTok },
  { href: "https://x.com/quees_ia", title: "X", Svg: XLogo },
  { href: "https://www.youtube.com/@Quees_IA", title: "YouTube", Svg: YT },
];

// Misma posición inicial en SSR y primer render del cliente
const getInitialPos = () => ({ x: 16, y: 400 });


export default function MobileSocialDock() {
  const [pos, setPos] = useState(getInitialPos);
  const [open, setOpen] = useState(false);
  const dragRef = useRef(null);
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

    // Al montar en el navegador, ajusta la posición usando window/localStorage
  useEffect(() => {
    if (!isBrowser()) return;

    const saved = loadPos();
    const h = window.innerHeight || 800;
    const initial = saved || { x: 16, y: h * 0.6 };

    setPos(initial);
  }, []);


  useEffect(() => {
    savePos(pos);
  }, [pos]);

  useEffect(() => {
    if (!isBrowser()) return;
    const el = dragRef.current;
    if (!el) return;

    const onDown = (e) => {
      dragging.current = true;
      const p = "touches" in e ? e.touches[0] : e;
      offset.current = { x: p.clientX - pos.x, y: p.clientY - pos.y };
      e.preventDefault();
    };

    const onMove = (e) => {
      if (!dragging.current) return;
      const p = "touches" in e ? e.touches[0] : e;
      const w = window.innerWidth || 360;
      const h = window.innerHeight || 640;
      const x = Math.max(8, Math.min(w - 64, p.clientX - offset.current.x));
      const y = Math.max(8, Math.min(h - 64, p.clientY - offset.current.y));
      setPos({ x, y });
    };

    const onUp = () => {
      dragging.current = false;
    };

    el.addEventListener("pointerdown", onDown, { passive: false });
    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onUp, { passive: true });

    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [pos]);

  return (
    <>
      {/* FAB arrastrable solo móvil */}
      <button
        type="button"
        ref={dragRef}
        onClick={() => setOpen((v) => !v)}
        aria-label="Redes sociales"
        className="fixed z-[95] md:hidden select-none touch-none"
        style={{ left: pos.x, top: pos.y }}
      >
        <span className="relative grid h-12 w-12 rounded-full bg-white/90 backdrop-blur-md ring-1 ring-white/60 shadow-lg place-items-center">
          <span
            role="img"
            aria-label="Redes sociales"
            className="text-[22px] leading-none select-none"
            style={{
              fontFamily:
                '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif',
            }}
          >
            🔔
          </span>
          <span className="absolute inset-0 rounded-full animate-ping bg-blue-500/10" />
        </span>
      </button>

      {/* Panel inferior */}
      <div
        className={`fixed inset-x-0 bottom-0 z-[94] md:hidden transition-transform duration-300 ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mx-auto max-w-md rounded-t-2xl bg-white/95 backdrop-blur-md shadow-2xl ring-1 ring-slate-200 p-4">
          <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-slate-200" />
          <div className="grid grid-cols-6 gap-3 place-items-center">
            {LINKS.map(({ href, title, Svg }) => (
              <a
                key={title}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                title={title}
                className="p-3 rounded-full bg-white shadow ring-1 ring-slate-200 active:scale-95 transition text-blue-600"
                onClick={() => setOpen(false)}
              >
                <Svg className="w-5 h-5" />
              </a>
            ))}
          </div>
          <button
            onClick={() => setOpen(false)}
            className="mt-4 w-full h-10 rounded-xl bg-slate-900 text-white text-sm font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </>
  );
}
