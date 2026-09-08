import { useEffect, useState } from "react";

const API_URL =
  "https://queesia.com/api/get_active_banners.php?placement=home_catalogo_top";

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

  return (
    <section className="ad-banner" aria-label="Anuncio destacado">
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
          border: 1px solid rgba(139, 92, 246, 0.22);
          border-radius: 24px;
          background:
            radial-gradient(circle at top left, rgba(124, 58, 237, 0.13), transparent 34%),
            radial-gradient(circle at bottom right, rgba(14, 165, 233, 0.12), transparent 34%),
            rgba(255, 255, 255, 0.74);
          box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
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
          background: rgba(124, 58, 237, 0.09);
          color: #6d28d9;
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
          background: #111827;
          color: #ffffff;
          font-size: 0.92rem;
          font-weight: 800;
          text-decoration: none;
          box-shadow: 0 12px 24px rgba(17, 24, 39, 0.16);
          transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
        }

        .ad-banner__cta:hover {
          transform: translateY(-1px);
          box-shadow: 0 16px 28px rgba(17, 24, 39, 0.22);
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
      `}</style>
    </section>
  );
}