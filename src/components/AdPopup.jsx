import { useEffect, useState } from "react";

const API_URL =
  "https://queesia.com/api/get_active_banners.php?placement=home_popup&type=popup";

const STORAGE_KEY = "queesia_ad_popup_closed";

export default function AdPopup() {
    const [popups, setPopups] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [visible, setVisible] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const alreadyClosed = sessionStorage.getItem(STORAGE_KEY);
    if (alreadyClosed === "1") return;

    async function loadPopup() {
      try {
        const res = await fetch(`${API_URL}&_nocache=${Date.now()}`, {
          headers: {
            Accept: "application/json",
          },
        });

        if (!res.ok) {
          throw new Error(`Error HTTP ${res.status}`);
        }

        const data = await res.json();

        if (
          isMounted &&
          data?.success &&
          Array.isArray(data.banners) &&
          data.banners.length > 0
        ) {

          setPopups(data.banners);
            setActiveIndex(0);

            setTimeout(() => {
            if (isMounted) setVisible(true);
            }, 1200);
        }
      } catch (error) {
        console.error("Error cargando pop-up patrocinado:", error);
      }
    }

    loadPopup();

    return () => {
      isMounted = false;
    };
  }, []);

  function closePopup() {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  useEffect(() => {
    if (!visible || popups.length <= 1) return;

    const interval = setInterval(() => {
        setActiveIndex((current) => (current + 1) % popups.length);
    }, 6000);

    return () => clearInterval(interval);
    }, [visible, popups.length]);

    if (!visible || popups.length === 0) return null;

    const popup = popups[activeIndex];

    const hasImage = Boolean(popup.image_desktop || popup.image_mobile);
    const imageSrc = popup.image_desktop || popup.image_mobile;

  return (
    <div className="ad-popup" role="dialog" aria-modal="true" aria-label="Anuncio patrocinado">
      <div className="ad-popup__overlay" onClick={closePopup}></div>

      <div className={`ad-popup__card ${hasImage ? "ad-popup__card--image-only" : ""}`}>
  <button
    className="ad-popup__close"
    type="button"
    aria-label="Cerrar anuncio"
    onClick={closePopup}
  >
    ×
  </button>

  {hasImage ? (
  <>
    <a
      href={popup.target_url}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={closePopup}
      className="ad-popup__image-link"
      aria-label={popup.cta_text || popup.title || "Ver anuncio"}
    >
      <picture className="ad-popup__media">
        {popup.image_mobile ? (
          <source media="(max-width: 640px)" srcSet={popup.image_mobile} />
        ) : null}

        <img
          src={imageSrc}
          alt={`Imagen promocional de ${popup.title}`}
          loading="lazy"
          decoding="async"
        />
      </picture>
    </a>

    <div className="ad-popup__actions">
      <a
        className="ad-popup__cta"
        href={popup.target_url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={closePopup}
      >
        {popup.cta_text || "Solicitar información"}
        <span aria-hidden="true">↗</span>
      </a>
    </div>
  </>
) : (
  <div className="ad-popup__body">
    {popup.badge ? <span className="ad-popup__badge">{popup.badge}</span> : null}

    <h2 className="ad-popup__title">{popup.title}</h2>

    {popup.subtitle ? (
      <p className="ad-popup__subtitle">{popup.subtitle}</p>
    ) : null}

    <a
      className="ad-popup__cta"
      href={popup.target_url}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={closePopup}
    >
      {popup.cta_text || "Conocer más"}
      <span aria-hidden="true">↗</span>
    </a>
  </div>
)}
</div>

      <style>{`
        .ad-popup {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: grid;
          place-items: center;
          padding: 1rem;
        }

        .ad-popup__overlay {
          position: absolute;
          inset: 0;
          background: rgba(15, 23, 42, 0.48);
          backdrop-filter: blur(6px);
        }

        .ad-popup__card {
          position: relative;
          z-index: 1;
          width: min(100%, 720px);
          overflow: hidden;
          border-radius: 28px;
          border: 1px solid rgba(255, 255, 255, 0.65);
          background:
            radial-gradient(circle at top left, rgba(124, 58, 237, 0.14), transparent 38%),
            radial-gradient(circle at bottom right, rgba(14, 165, 233, 0.14), transparent 38%),
            rgba(255, 255, 255, 0.92);
          box-shadow: 0 30px 80px rgba(15, 23, 42, 0.28);
          animation: adPopupIn 0.22s ease-out;
        }

        .ad-popup__card--image-only {
          padding: 0;
          background: transparent;
          border: 0;
          box-shadow: 0 30px 80px rgba(15, 23, 42, 0.32);
        }

        .ad-popup__image-link {
          display: block;
          text-decoration: none;
        }

        .ad-popup__actions {
          padding: 0.85rem 1.1rem 1.05rem;
          background: rgba(255, 255, 255, 0.94);
          border-radius: 0 0 24px 24px;
        }

        .ad-popup__card--image-only .ad-popup__media {
          display: block;
          width: 100%;
          overflow: hidden;
          background: transparent;
          line-height: 0;
        }

        .ad-popup__card--image-only .ad-popup__media img {
          display: block;
          width: 100%;
          height: auto;
          max-height: min(76vh, 640px);
          object-fit: cover;
          border-radius: 24px 24px 0 0;
        }

        .ad-popup__close {
          position: absolute;
          top: 0.8rem;
          right: 0.8rem;
          z-index: 2;
          width: 2rem;
          height: 2rem;
          border: 0;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.86);
          color: #111827;
          font-size: 1.35rem;
          line-height: 1;
          cursor: pointer;
          box-shadow: 0 8px 18px rgba(15, 23, 42, 0.12);
        }

        .ad-popup__media {
          display: block;
          width: 100%;
          background: rgba(255, 255, 255, 0.45);
        }

        .ad-popup__media img {
          display: block;
          width: 100%;
          max-height: 290px;
          object-fit: cover;
        }

        .ad-popup__body {
          padding: 1.35rem;
        }

        .ad-popup__badge {
          display: inline-flex;
          width: fit-content;
          margin-bottom: 0.55rem;
          padding: 0.28rem 0.65rem;
          border-radius: 999px;
          background: rgba(124, 58, 237, 0.1);
          color: #6d28d9;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .ad-popup__title {
          margin: 0;
          color: #111827;
          font-size: clamp(1.6rem, 4vw, 2.15rem);
          line-height: 1.05;
          font-weight: 900;
          font-style: italic;
        }

        .ad-popup__subtitle {
          margin: 0.7rem 0 0;
          color: #4b5563;
          font-size: 1rem;
          line-height: 1.55;
        }

        .ad-popup__cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          margin-top: 1.15rem;
          width: 100%;
          padding: 0.9rem 1rem;
          border-radius: 999px;
          background: #111827;
          color: #ffffff;
          font-size: 0.95rem;
          font-weight: 850;
          text-decoration: none;
          box-shadow: 0 16px 30px rgba(17, 24, 39, 0.2);
        }

        .ad-popup__dots {
        display: flex;
        justify-content: center;
        gap: 0.45rem;
        margin-top: 0.9rem;
        }

        .ad-popup__dot {
        width: 0.55rem;
        height: 0.55rem;
        border: 0;
        border-radius: 999px;
        background: rgba(107, 114, 128, 0.35);
        cursor: pointer;
        transition: width 0.18s ease, background 0.18s ease;
        }

        .ad-popup__dot--active {
        width: 1.35rem;
        background: #6d28d9;
        }

        @keyframes adPopupIn {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

       @media (max-width: 640px) {
        .ad-popup {
          place-items: center;
          padding: 1rem;
        }

        .ad-popup__card {
          width: min(100%, 340px);
          max-height: calc(100vh - 2rem);
          overflow: hidden;
          border-radius: 24px;
        }

        .ad-popup__card--image-only {
          background: transparent;
          border: 0;
        }

        .ad-popup__card--image-only .ad-popup__media {
          width: 100%;
          overflow: hidden;
          line-height: 0;
        }

        .ad-popup__card--image-only .ad-popup__media img {
          display: block;
          width: 100%;
          height: auto;
          max-height: 72vh;
          object-fit: cover;
          border-radius: 22px 22px 0 0;
        }

        .ad-popup__actions {
          padding: 0.8rem 0.9rem calc(0.95rem + env(safe-area-inset-bottom));
          background: rgba(255, 255, 255, 0.94);
          border-radius: 0 0 22px 22px;
        }

        .ad-popup__media img {
          max-height: 220px;
        }

        .ad-popup__body {
          padding: 1.15rem;
        }
      }
      `}</style>
    </div>
  );
}