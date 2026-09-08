// Parallax simple por data-speed; acelera/desacelera según scroll
(function () {
  if (typeof window === "undefined") return;

  const items = Array.from(document.querySelectorAll("[data-parallax]"));
  if (!items.length) return;

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY || 0;
      const h = window.innerHeight || 1;
      for (const el of items) {
        const speed = parseFloat(el.getAttribute("data-speed") || "0.15");
        const rect = el.getBoundingClientRect();
        const progress = (rect.top + rect.height * 0.5) / h; // 0..1
        const translate = (progress - 0.5) * -80 * speed;    // rango suave
        el.style.transform = `translate3d(0, ${translate.toFixed(2)}px, 0)`;
      }
      ticking = false;
    });
  };

  document.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  onScroll();
})();
