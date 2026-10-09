import { useEffect, useState } from "react";

const API_URL =
  "https://queesia.com/api/get_active_banners.php?placement=home_catalogo_top";

// ID de la campaña institucional verificado en la API pública.
// Una nueva campaña requiere asignar explícitamente su ID a esta variante.
const INSTITUTIONAL_CAMPAIGN_ID = "4";

export default function AdBanner() {
  const [banner, setBanner] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadBanner() {
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

        console.log("Banner response:", data);

        if (
        isMounted &&
        data?.success &&
        Array.isArray(data.banners) &&
        data.banners.length > 0
        ) {
        setBanner(data.banners[0]);
        } else if (isMounted) {
        setBanner(null);
        }
      } catch (error) {
        console.error("Error cargando banner patrocinado:", error);
        if (isMounted) setBanner(null);
      } finally {
        if (isMounted) setLoaded(true);
      }
    }

    loadBanner();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!loaded || !banner) return null;

  const hasImage = Boolean(banner.image_desktop || banner.image_mobile);
  const imageSrc = banner.image_desktop || banner.image_mobile;
  const imageMobile = banner.image_mobile;
  const isInstitutional =
    String(banner.id) === INSTITUTIONAL_CAMPAIGN_ID &&
    banner.placement === "home_catalogo_top";

  return (
    <section className="ad-banner" aria-label="Anuncio destacado">
      {isInstitutional ? (
        <div className="ad-institutional">
          <div className="ad-institutional__ambience" aria-hidden="true">
            <span className="ad-institutional__orbit ad-institutional__orbit--one" />
            <span className="ad-institutional__orbit ad-institutional__orbit--two" />
          </div>

          <div className="ad-institutional__content">
            <span className="ad-institutional__badge">Espacio publicitario</span>
            <h2 className="ad-institutional__title">
              Tu app <span>aquí</span>
            </h2>
            {banner.subtitle ? (
              <p className="ad-institutional__subtitle">{banner.subtitle}</p>
            ) : null}
          </div>

          <div className="ad-institutional__visual" aria-hidden="true">
            <div className="ad-institutional__card">
              <svg viewBox="0 0 48 48" fill="none" className="ad-institutional__icon">
                <rect x="7" y="7" width="34" height="34" rx="8" />
                <circle cx="18" cy="18" r="3" />
                <path d="m8 34 10-10 7 7 6-6 10 10" />
              </svg>
              <span>TU APP AQUÍ</span>
            </div>
          </div>

          <a
            className="ad-institutional__cta"
            href={banner.target_url}
            target="_blank"
            rel="noopener noreferrer sponsored"
          >
            Reservar espacio
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12h14m-6-6 6 6-6 6" />
            </svg>
            <span className="sr-only"> (abre en una pestaña nueva)</span>
          </a>
        </div>
      ) : (
        <div
          className={`ad-banner__inner ${
            hasImage ? "ad-banner__inner--with-media" : "ad-banner__inner--text-only"
          }`}
        >
          <div className="ad-banner__content">
            {banner.badge ? (
              <span className="ad-banner__badge">{banner.badge}</span>
            ) : null}

            <h2 className="ad-banner__title">{banner.title}</h2>

            {banner.subtitle ? (
              <p className="ad-banner__subtitle">{banner.subtitle}</p>
            ) : null}

            <a
              className="ad-banner__cta ad-banner__cta--mobile"
              href={banner.target_url}
              target="_blank"
              rel="noopener noreferrer sponsored"
            >
              {banner.cta_text || "Conocer más"}
              <span aria-hidden="true">↗</span>
            </a>
          </div>

          {hasImage ? (
            <picture className="ad-banner__media">
              {imageMobile ? (
                <source media="(max-width: 760px)" srcSet={imageMobile} />
              ) : null}

              <img
                src={imageSrc}
                alt={`Imagen promocional de ${banner.title}`}
                loading="lazy"
                decoding="async"
              />
            </picture>
          ) : null}

          <a
            className="ad-banner__cta ad-banner__cta--desktop"
            href={banner.target_url}
            target="_blank"
            rel="noopener noreferrer sponsored"
          >
            {banner.cta_text || "Conocer más"}
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      )}

      <style>{`
        .ad-banner {
          width: 100%;
          margin: 0 auto;
        }

        .ad-banner__inner {
          display: grid;
          align-items: center;
          gap: 1.5rem;
          padding: 1.35rem 1.5rem;
          border: 1px solid rgba(37, 99, 235, 0.38);
          border-radius: 24px;
          background: #ffffff;
          box-shadow: inset 3px 0 0 #327ffa, 0 6px 20px rgba(15, 23, 42, 0.06);
          backdrop-filter: blur(16px);
        }

        .ad-banner__inner--with-media {
          grid-template-columns: minmax(0, 1fr) minmax(180px, 280px) auto;
        }

        .ad-banner__inner--text-only {
          grid-template-columns: minmax(0, 1fr) auto;
        }

        .ad-banner__content {
          min-width: 0;
        }

        .ad-banner__badge {
          display: inline-flex;
          align-items: center;
          width: fit-content;
          margin-bottom: 0.45rem;
          padding: 0.28rem 0.65rem;
          border-radius: 999px;
          background: #dbeafe;
          color: #1d4ed8;
          box-shadow: inset 0 0 0 1px rgba(37, 99, 235, 0.16);
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .ad-banner__title {
          margin: 0;
          color: #111827;
          font-size: clamp(1.25rem, 2vw, 1.8rem);
          line-height: 1.1;
          font-weight: 800;
          font-style: italic;
        }

        .ad-banner__subtitle {
          max-width: 680px;
          margin: 0.45rem 0 0;
          color: #4b5563;
          font-size: clamp(0.92rem, 1.3vw, 1rem);
          line-height: 1.55;
        }

        .ad-banner__media {
          display: block;
          width: 100%;
          max-width: 280px;
          justify-self: center;
        }

        .ad-banner__media img {
          display: block;
          width: 100%;
          height: auto;
          max-height: 135px;
          object-fit: contain;
          border-radius: 18px;
        }

        .ad-banner__cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          white-space: nowrap;
          padding: 0.78rem 1.05rem;
          border-radius: 999px;
          background: #0d0d0d;
          color: #ffffff;
          font-size: 0.92rem;
          font-weight: 800;
          text-decoration: none;
          box-shadow: 0 6px 14px rgba(13, 13, 13, 0.14);
          transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
        }

        .ad-banner__cta:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 18px rgba(13, 13, 13, 0.18);
          opacity: 0.95;
        }

        .ad-banner__cta--mobile {
          display: none;
        }

        @media (max-width: 900px) {
          .ad-banner__inner--with-media {
            grid-template-columns: minmax(0, 1fr) minmax(150px, 220px);
          }

          .ad-banner__inner--text-only {
            grid-template-columns: 1fr;
          }

          .ad-banner__cta--desktop {
            display: none;
          }

          .ad-banner__cta--mobile {
            display: inline-flex;
            margin-top: 1rem;
          }
        }

        @media (max-width: 760px) {
          .ad-banner {
            margin: 1.1rem auto 2rem;
          }

          .ad-banner__inner,
          .ad-banner__inner--with-media,
          .ad-banner__inner--text-only {
            grid-template-columns: 1fr;
            gap: 1rem;
            padding: 1.15rem;
            border-radius: 20px;
          }

          .ad-banner__badge {
            font-size: 0.67rem;
          }

          .ad-banner__subtitle {
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .ad-banner__media {
            max-width: 100%;
            order: -1;
          }

          .ad-banner__media img {
            max-height: 180px;
            width: 100%;
            object-fit: contain;
          }

          .ad-banner__cta--mobile {
            width: 100%;
            padding: 0.85rem 1rem;
          }
        }

        .ad-institutional {
          position: relative;
          isolation: isolate;
          overflow: hidden;
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(200px, 0.8fr) auto;
          grid-template-areas: "content visual action";
          align-items: center;
          gap: 1.5rem;
          min-height: 250px;
          padding: 2rem 2.5rem;
          border: 1px solid rgba(100, 116, 225, 0.5);
          border-radius: 24px;
          background:
            radial-gradient(ellipse at 52% 8%, rgba(210, 248, 255, 0.9), transparent 38%),
            radial-gradient(ellipse at 72% 70%, rgba(76, 104, 255, 0.5), transparent 45%),
            radial-gradient(ellipse at 100% 80%, rgba(233, 65, 207, 0.48), transparent 48%),
            linear-gradient(110deg, #edf6ff 0%, #e3efff 28%, #a9c4ff 52%, #b391f5 76%, #e597e2 100%);
          box-shadow: 0 8px 28px rgba(74, 66, 170, 0.15), inset 0 1px 0 rgba(235, 249, 255, 0.95);
        }

        .ad-institutional__ambience {
          position: absolute;
          inset: 0;
          z-index: -1;
          overflow: hidden;
          pointer-events: none;
        }

        .ad-institutional__orbit {
          position: absolute;
          display: block;
          width: 620px;
          height: 270px;
          border: 1px solid rgba(240, 250, 255, 0.88);
          border-radius: 50%;
          box-shadow: 0 0 14px rgba(220, 247, 255, 0.58), inset 0 0 8px rgba(238, 218, 255, 0.25);
        }

        .ad-institutional__orbit--one {
          top: -118px;
          left: 30%;
          transform: rotate(-19deg);
        }

        .ad-institutional__orbit--two {
          right: -170px;
          bottom: -185px;
          transform: rotate(-24deg);
        }

        .ad-institutional__content {
          grid-area: content;
          min-width: 0;
        }

        .ad-institutional__badge {
          display: inline-flex;
          padding: 0.4rem 0.75rem;
          border: 1px solid rgba(65, 92, 174, 0.2);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.65);
          color: #334b83;
          font-size: 0.68rem;
          font-weight: 800;
          line-height: 1.4;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .ad-institutional__title {
          margin: 0.85rem 0 0;
          color: #111827;
          font-size: clamp(2.4rem, 4.2vw, 4rem);
          font-weight: 800;
          font-style: normal;
          letter-spacing: -0.045em;
          line-height: 1.08;
        }

        .ad-institutional__title span {
          color: #2563eb;
        }

        .ad-institutional__subtitle {
          max-width: 30rem;
          margin: 0.8rem 0 0;
          color: #1f2d46;
          font-size: 0.9rem;
          line-height: 1.6;
          overflow-wrap: anywhere;
        }

        .ad-institutional__visual {
          grid-area: visual;
          position: relative;
          display: grid;
          place-items: center;
          min-width: 0;
          padding: 1rem;
        }

        .ad-institutional__visual::before {
          content: "";
          position: absolute;
          width: 240px;
          height: 110px;
          border-radius: 50%;
          background: radial-gradient(ellipse, rgba(79, 111, 255, 0.65), rgba(197, 77, 235, 0.45) 55%, transparent 78%);
          filter: blur(24px);
          transform: translateY(28px);
          pointer-events: none;
        }

        .ad-institutional__card {
          position: relative;
          display: grid;
          justify-items: center;
          align-content: center;
          gap: 0.75rem;
          width: 208px;
          height: 146px;
          border: 1px solid rgba(222, 252, 255, 0.98);
          border-radius: 20px;
          background:
            radial-gradient(ellipse at 15% 8%, rgba(234, 255, 255, 0.88), transparent 58%),
            linear-gradient(135deg, rgba(166, 231, 255, 0.9), rgba(183, 191, 255, 0.88) 52%, rgba(242, 177, 235, 0.9));
          box-shadow:
            0 0 0 1px rgba(174, 235, 255, 0.85),
            -7px -3px 22px rgba(34, 211, 238, 0.48),
            8px 4px 26px rgba(244, 91, 218, 0.5),
            0 16px 32px rgba(67, 79, 195, 0.26),
            inset 0 0 18px rgba(213, 246, 255, 0.8);
          backdrop-filter: blur(12px);
          transform: rotate(-7deg);
        }

        .ad-institutional__card::before {
          content: "";
          position: absolute;
          inset: 7px;
          border: 1px solid rgba(238, 253, 255, 0.92);
          border-radius: 14px;
          box-shadow: -1px -1px 7px rgba(67, 211, 255, 0.65), 1px 1px 9px rgba(255, 113, 221, 0.65);
          pointer-events: none;
        }

        .ad-institutional__card span {
          color: #263f85;
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.17em;
        }

        .ad-institutional__icon {
          width: 48px;
          height: 48px;
          stroke: #3659be;
          stroke-width: 1.6;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .ad-institutional__cta {
          grid-area: action;
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          justify-self: start;
          min-height: 50px;
          padding: 0.85rem 1.3rem;
          border: 1px solid #111827;
          border-radius: 999px;
          background: #111318;
          color: #ffffff;
          font-size: 0.9rem;
          font-weight: 700;
          line-height: 1.4;
          text-decoration: none;
          box-shadow: 0 6px 16px rgba(17, 24, 39, 0.2), 0 0 22px rgba(91, 75, 225, 0.34), 0 0 10px rgba(55, 130, 246, 0.2);
        }

        .ad-institutional__cta:hover {
          background: #000000;
          text-decoration: none;
        }

        .ad-institutional__cta:focus-visible {
          outline: 3px solid #2563eb;
          outline-offset: 4px;
        }

        .ad-institutional__cta svg {
          flex: 0 0 20px;
          width: 20px;
          height: 20px;
          stroke: currentColor;
          stroke-width: 1.8;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        @media (max-width: 1100px) {
          .ad-institutional {
            grid-template-columns: minmax(0, 1fr) 240px;
            grid-template-areas: "content visual" "action visual";
            gap: 1rem;
            padding: 1.25rem 1.75rem;
          }

          .ad-institutional__title {
            font-size: 2.6rem;
          }
        }

        @media (max-width: 600px) {
          .ad-institutional {
            grid-template-columns: minmax(0, 1fr);
            grid-template-areas: "content" "visual" "action";
            gap: 1rem;
            padding: 1.5rem;
            border-radius: 20px;
          }

          .ad-institutional__title {
            font-size: clamp(2rem, 9vw, 2.6rem);
          }

          .ad-institutional__visual {
            padding: 0.75rem 0;
          }

          .ad-institutional__card {
            width: 184px;
            height: 126px;
          }

          .ad-institutional__cta {
            justify-self: stretch;
          }

          .ad-institutional__orbit--one {
            top: 105px;
            left: -140px;
          }
        }
      `}</style>
    </section>
  );
}
