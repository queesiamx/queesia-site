import { useEffect, useState } from "react";
import { getLogoUrl, handleLogoError } from "../utils/logoUtils";

const API_BASE = "https://queesia.com/api";

function cleanTag(tag) {
  return String(tag || "")
    .replace(/^#/, "")
    .replace(/,+$/g, "")
    .trim();
}

function getTags(app) {
  if (!app?.tags) return [];

  if (Array.isArray(app.tags)) {
    return app.tags.map(cleanTag).filter(Boolean).slice(0, 6);
  }

  return String(app.tags)
    .split(/[,\n;#]+/)
    .map(cleanTag)
    .filter(Boolean)
    .slice(0, 6);
}

export default function HomeNewAppsDynamic() {
  const [apps, setApps] = useState([]);

  useEffect(() => {
    const url = `${API_BASE}/obtener_nuevas_apps.php?limit=4&_nocache=${Date.now()}`;

    fetch(url, { headers: { Accept: "application/json" } })
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data.tools)) {
          setApps(data.tools.slice(0, 4));
        }
      })
      .catch((error) => {
        console.error("Error cargando apps nuevas dinámicas:", error);
      });
  }, []);

  if (!apps.length) return null;

  return (
    <section id="nuevas" className="relative py-6 md:py-12 px-4 bg-transparent">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between gap-4 mb-4 md:mb-6">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-primary/80 font-semibold">
              Nuevas en Queesia
            </p>

            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Recién agregadas
            </h2>

            <p className="mt-2 text-default/70 max-w-2xl">
              Explora las últimas aplicaciones que se sumaron al catálogo.
            </p>
          </div>

          <a
            href="/apps/nuevas"
            className="hidden sm:inline-flex items-center rounded-xl border border-line bg-white px-4 py-2 text-sm font-semibold text-default hover:border-primary hover:text-primary transition"
          >
            Ver todas
          </a>
        </div>

        {/* Desktop / tablet */}
        <section className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-6">
          {apps.map((app) => (
            <DynamicToolCard key={app.id} app={app} />
          ))}
        </section>

        {/* Móvil */}
        <section className="grid md:hidden grid-cols-1 gap-4">
          {apps.map((app) => (
            <DynamicMiniToolCard key={app.id} app={app} />
          ))}
        </section>

        <div className="mt-5 sm:hidden">
          <a
            href="/apps/nuevas"
            className="inline-flex items-center rounded-xl border border-line bg-white px-4 py-2 text-sm font-semibold text-default hover:border-primary hover:text-primary transition"
          >
            Ver todas
          </a>
        </div>
      </div>
    </section>
  );
}

function DynamicToolCard({ app }) {
  const logoURL = getLogoUrl(app.logo_filename);
  const tags = getTags(app);

  return (
    <div className="relative bg-white border border-gray-200 rounded-xl shadow hover:shadow-lg transition duration-200 flex flex-col items-center text-center p-4 w-full max-w-xs mx-auto">
      <div className="w-24 h-24 bg-white rounded-xl shadow flex items-center justify-center overflow-hidden mb-4">
        <img
          src={logoURL}
          alt={`Logo de ${app.name}`}
          className="max-w-[80%] max-h-[80%] object-contain"
          loading="lazy"
          onError={handleLogoError}
        />
      </div>

      <h2 className="text-lg font-semibold text-default mb-1">{app.name}</h2>

      <p className="text-sm text-default-soft italic mb-1">
        {app.category || "Categoría no disponible"}
      </p>

      <p className="text-sm mb-2 text-yellow-600 font-medium">
        ⭐ {app.rate ? app.rate : "N/A"} / 5
      </p>

      <div className="flex flex-wrap justify-center gap-2 my-2">
        {tags.length > 0 ? (
          tags.map((tag) => (
            <span
              key={tag}
              className="bg-primary text-white text-xs px-2 py-1 rounded animate-fade-in"
            >
              {tag}
            </span>
          ))
        ) : (
          <span className="bg-gray-400 text-white text-xs px-2 py-1 rounded">
            Sin etiquetas
          </span>
        )}
      </div>

      <p className="text-sm text-default mt-3 min-h-[70px]">
        {app.short_description || "Descripción no disponible"}
      </p>

      <div className="pt-4 w-full flex justify-center mt-auto">
        <a
          href={`/app/${app.id}`}
          className="bg-black text-white hover:bg-default-soft hover:scale-105 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300"
        >
          Derrite tu curiosidad
        </a>
      </div>
    </div>
  );
}

function DynamicMiniToolCard({ app }) {
  const logoURL = getLogoUrl(app.logo_filename);

  return (
    <a
      href={`/app/${app.id}`}
      className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/70 backdrop-blur-sm border border-white/60 shadow-sm transition-transform duration-200 hover:scale-105 min-w-[220px] h-10"
    >
      <img
        src={logoURL}
        alt={`Logo de ${app.name}`}
        className="w-7 h-7 object-contain rounded-md"
        loading="lazy"
        onError={handleLogoError}
      />

      <div className="flex-1 overflow-hidden">
        <h4 className="text-[13px] font-semibold whitespace-nowrap overflow-hidden text-ellipsis text-black">
          {app.name}
        </h4>
      </div>
    </a>
  );
}