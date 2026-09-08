import { useEffect, useState } from "react";
import Comments from "./Comments.jsx";
import RatingStars from "./RatingStars.jsx";
import TechList from "./TechList.jsx";
import { getLogoUrl, handleLogoError } from "../utils/logoUtils";

export default function AppDetailDynamic() {
  const [appId, setAppId] = useState(null);
  const [app, setApp] = useState(null);
  const [news, setNews] = useState([]);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const match = window.location.pathname.match(/\/app\/(\d+)/);
    const currentId = match?.[1];

    if (!currentId) {
      setError("No se encontró el ID de la aplicación.");
      setLoading(false);
      return;
    }

    setAppId(currentId);

    fetch(`https://queesia.com/api/obtener_app.php?id=${currentId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.app) {
          setApp(data.app);
          setNews(Array.isArray(data.news) ? data.news : []);
          setSources(Array.isArray(data.sources) ? data.sources : []);
        } else {
          setError(data.message || "No se encontró la aplicación.");
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Error al obtener los datos de la aplicación.");
        setLoading(false);
      });
  }, []);

    const cleanTag = (tag) => {
    return String(tag || "")
      .replace(/^#/, "")
      .replace(/,+$/g, "")
      .trim();
  };

  const getTags = () => {
    if (!app?.tags) return [];

    if (Array.isArray(app.tags)) {
      return app.tags
        .map(cleanTag)
        .filter(Boolean)
        .slice(0, 6);
    }

    return String(app.tags)
      .split(/[,\n;#]+/)
      .map(cleanTag)
      .filter(Boolean)
      .slice(0, 6);
  };


  const validNews = Array.isArray(news)
    ? news.filter(
        (n) =>
          !(n?.title && n.title.toLowerCase().includes("no hay casos de éxito")) &&
          n?.description !== "NA" &&
          n?.url !== "NA"
      )
    : [];

  if (loading) {
    return (
      <div className="card p-6 text-center">
        <p className="text-default-soft">Cargando aplicación...</p>
      </div>
    );
  }

  if (error || !app) {
    return (
      <div className="card p-6">
        <h1 className="text-3xl font-bold text-red-600 mb-4">
          Aplicación no encontrada
        </h1>
        <p className="text-gray-700">{error}</p>
      </div>
    );
  }

  return (
    <>
      <nav className="max-w-4xl mx-auto px-4 py-3 text-sm">
        <a href="/#catalogo" className="text-default-soft hover:text-primary">
          ← Volver al Catálogo
        </a>
      </nav>

      <article className="space-y-8 max-w-4xl mx-auto px-4">
  {/* HERO */}
  <section className="card p-6 sm:p-8">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
      <div className="flex items-center gap-4">
        <img
          src={getLogoUrl(app.logo_filename)}
          alt={`Logo de ${app.name}`}
          className="h-16 w-16 rounded-xl bg-white ring-1 ring-black/5 object-contain"
          loading="lazy"
          onError={handleLogoError}
        />
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">
            {app.name}
          </h1>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
            {app.category && (
              <span className="px-2 py-0.5 rounded-full border border-line bg-white">
                {app.category}
              </span>
            )}

            {getTags().map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

            {app.url && (
              <div className="flex flex-col items-start md:items-end gap-3">
                <a
                  href={app.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary rounded-xl px-4 py-2"
                >
                  Ir al sitio oficial
                </a>
              </div>
            )}
          </div>
        </section>

        {/* CALIFICACIÓN */}
        {appId && (
          <section className="card p-5">
            <div className="text-center">
              <p className="text-sm text-default-soft">
                ¿Cuánto le das a este queso? 🧐
              </p>
              <div className="mt-2">
                <RatingStars appId={appId} />
              </div>
            </div>
          </section>
        )}

        {/* CONTENIDO + SIDEBAR */}
        <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6">
          <div className="space-y-6">
            <div className="card p-5">
              <h2 className="font-bold mb-1">¿Qué es?</h2>
              <p className="text-sm text-default">
                {app.what_is || "—"}
              </p>
            </div>

            <div className="card p-5">
              <h2 className="font-bold mb-1">Propósito</h2>
              <p className="text-sm text-default">
                {app.purpose || "—"}
              </p>
            </div>

            {app.use_cases && (
              <div className="card p-5">
                <h2 className="font-bold mb-1">Casos de uso</h2>
                <p className="text-sm text-default whitespace-pre-line">
                  {app.use_cases}
                </p>
              </div>
            )}

            {app.main_advantages && (
              <div className="card p-5">
                <h2 className="font-bold mb-1">Ventajas principales</h2>
                <p className="text-sm text-default whitespace-pre-line">
                  {app.main_advantages}
                </p>
              </div>
            )}

            {app.long_description && (
              <div className="card p-5">
                <h2 className="font-bold mb-1">Descripción</h2>
                <p className="text-sm text-default whitespace-pre-line">
                  {app.long_description}
                </p>
              </div>
            )}

            {validNews.length > 0 && (
              <div className="card p-5">
                <h2 className="font-bold mb-3 flex items-center gap-2">
                  📰 Noticias relacionadas
                </h2>

                <div className="space-y-3">
                  {validNews.map((n, index) => (
                    <article
                      key={n.id || index}
                      className="border border-line rounded-xl p-3"
                    >
                      <h3 className="font-semibold text-sm">
                        {n.title || "Sin título"}
                      </h3>

                      <p className="text-xs text-default-soft mt-1">
                        {n.success_type || "—"}
                      </p>

                      <p className="text-sm mt-1">
                        {n.description || "—"}
                      </p>

                      {n.url && n.url !== "NA" && (
                        <a
                          href={n.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary underline mt-1 inline-block"
                        >
                          Ver más
                        </a>
                      )}
                    </article>
                  ))}
                </div>
              </div>
            )}

            {Array.isArray(sources) && sources.length > 0 && (
              <div className="card p-5">
                <h2 className="font-bold mb-3">🔗 Fuentes</h2>

                <ul className="space-y-2 text-sm">
                  {sources.map((s, index) => (
                    <li key={s.id || index} className="truncate">
                      <a
                        href={s.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline break-all"
                        title={s.source_url}
                      >
                        {s.source_url}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {appId && (
              <div className="card p-5">
                <h2 className="font-bold mb-2">Déjanos saber tu opinión</h2>

                <section className="card p-5">
                  <div className="text-center">
                    <p className="text-sm text-default-soft">
                      ¿Ya la probaste? 🧀 Califícala aquí también:
                    </p>
                    <div className="mt-2">
                      <RatingStars appId={appId} />
                    </div>
                  </div>
                </section>

                <Comments appId={appId} />
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <aside className="space-y-6">
            <div className="card p-5">
              <h3 className="font-bold mb-3">Información técnica</h3>

              <TechList
                release_date={app.release_date}
                developer={app.developer}
                main_model={app.main_model}
                license={app.license}
              />

              {(app.integration || app.security_privacy) && (
                <div className="mt-4 pt-4 border-t border-line text-sm">
                  {app.integration && (
                    <p>
                      <strong>Integración:</strong> {app.integration}
                    </p>
                  )}

                  {app.security_privacy && (
                    <p className="mt-1">
                      <strong>Seguridad/Privacidad:</strong>{" "}
                      {app.security_privacy}
                    </p>
                  )}
                </div>
              )}
            </div>

            {app.pricing_plans && (
              <div className="card p-5">
                <h3 className="font-bold mb-3">Plan de precios</h3>
                <p className="text-sm whitespace-pre-line">
                  {app.pricing_plans}
                </p>
              </div>
            )}
          </aside>
        </section>
      </article>
    </>
  );
}