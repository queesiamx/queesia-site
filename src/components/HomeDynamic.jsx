import { useEffect, useMemo, useState } from "react";
import { getLogoUrl, handleLogoError } from "../utils/logoUtils";

const NEW_SINCE_ID = 1475;

export default function HomeDynamic() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todas");

  useEffect(() => {
    const apiUrl = `https://queesia.com/api/obtener_datos.php?all=true&sort=recent&_nocache=${Date.now()}`;

    fetch(apiUrl)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.tools)) {
          setApps(data.tools);
        } else {
          setApps([]);
          setError(data.message || "No se pudieron cargar las aplicaciones.");
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Error al cargar el catálogo.");
        setLoading(false);
      });
  }, []);

  const categories = useMemo(() => {
    const unique = new Set();

    apps.forEach((app) => {
      if (app.category) unique.add(app.category);
    });

    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [apps]);

  const newApps = useMemo(() => {
    return apps
      .filter((app) => Number(app.id) > NEW_SINCE_ID)
      .sort((a, b) => Number(b.id) - Number(a.id))
      .slice(0, 8);
  }, [apps]);

  const filteredApps = useMemo(() => {
    const q = search.trim().toLowerCase();

    return apps.filter((app) => {
      const matchesCategory =
        activeCategory === "Todas" || app.category === activeCategory;

      const tagsText = Array.isArray(app.tags) ? app.tags.join(" ") : "";

      const matchesSearch =
        !q ||
        app.name?.toLowerCase().includes(q) ||
        app.category?.toLowerCase().includes(q) ||
        app.short_description?.toLowerCase().includes(q) ||
        tagsText.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [apps, search, activeCategory]);

  const displayedApps = filteredApps.slice(0, 24);

  

  const getCategoryUrl = (category) => {
    return `/categorias/${encodeURIComponent(category)}/`;
  };

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="card p-6 text-center">
          <p className="text-default-soft">Cargando catálogo dinámico...</p>
        </div>
      </section>
    );
  }

  if (error && apps.length === 0) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="card p-6 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            No se pudo cargar el catálogo
          </h2>
          <p className="text-default-soft">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full">
      

      {/* APPS RECIÉN AGREGADAS */}
      {newApps.length > 0 && (
        <section id="nuevas" className="max-w-7xl mx-auto px-4 pb-12">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-2xl font-bold text-default">
                Aplicaciones <span className="text-primary">recién agregadas</span>
              </h2>
              <p className="text-sm text-default-soft">
                Se muestran dinámicamente desde la base de datos.
              </p>
            </div>

            <a
              href="/apps/nuevas/"
              className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-default-soft transition"
            >
              Ver todas
            </a>
          </div>

          <AppGrid apps={newApps} />
        </section>
      )}

      {/* EXPLORAR POR CATEGORÍA */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        <h2 className="text-2xl font-bold text-default mb-5">
          Explora por <span className="text-primary">categoría</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category) => {
            const count = apps.filter((app) => app.category === category).length;

            return (
              <a
                key={category}
                href={getCategoryUrl(category)}
                className="card p-5 hover:shadow-lg transition block"
              >
                <h3 className="font-bold text-default">{category}</h3>
                <p className="text-sm text-default-soft mt-1">
                  {count} aplicación{count === 1 ? "" : "es"}
                </p>
              </a>
            );
          })}
        </div>
      </section>

      {/* CATÁLOGO / BÚSQUEDA */}
      <section id="catalogo" className="max-w-7xl mx-auto px-4 pb-16">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-default">
            Catálogo de <span className="text-primary">herramientas IA</span>
          </h2>

          <p className="text-sm text-default-soft mt-1">
            Busca por nombre, categoría, descripción o etiqueta.
          </p>
        </div>

        <div className="card p-4 mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar aplicaciones de IA..."
            className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30"
          />

          <div className="flex flex-wrap gap-2 mt-4">
            <button
              type="button"
              onClick={() => setActiveCategory("Todas")}
              className={`px-3 py-1 rounded-full text-sm border ${
                activeCategory === "Todas"
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-default border-gray-200"
              }`}
            >
              Todas
            </button>

            {categories.map((category) => (
              <button
                type="button"
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-3 py-1 rounded-full text-sm border ${
                  activeCategory === category
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-default border-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm text-default-soft mb-5">
          {filteredApps.length} resultado{filteredApps.length === 1 ? "" : "s"}.
          {filteredApps.length > displayedApps.length &&
            ` Mostrando ${displayedApps.length} en el home.`}
        </p>

        {displayedApps.length > 0 ? (
          <AppGrid apps={displayedApps} />
        ) : (
          <div className="card p-6 text-center">
            <p className="text-default-soft">
              No se encontraron aplicaciones con esos filtros.
            </p>
          </div>
        )}
      </section>
    </section>
  );
}

function AppGrid({ apps }) {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {apps.map((app) => (
        <article
          key={app.id}
          className="relative bg-white border border-gray-200 rounded-xl shadow hover:shadow-lg transition duration-200 flex flex-col items-center text-center p-4 w-full max-w-xs mx-auto"
        >
          <div className="w-24 h-24 bg-white rounded-xl shadow flex items-center justify-center overflow-hidden mb-4">
            <img
              src={getLogoUrl(app.logo_filename)}
              alt={`Logo de ${app.name}`}
              className="max-w-[80%] max-h-[80%] object-contain"
              loading="lazy"
              onError={handleLogoError}
            />
          </div>

          <h3 className="text-lg font-semibold text-default mb-1">
            {app.name}
          </h3>

          <p className="text-sm text-default-soft italic mb-1">
            {app.category}
          </p>

          <p className="text-sm mb-2 text-yellow-600 font-medium">
            ⭐ {app.rate ? app.rate : "N/A"} / 5
          </p>

          <div className="flex flex-wrap justify-center gap-2 my-2">
            {Array.isArray(app.tags) && app.tags.length > 0 ? (
              app.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="bg-primary text-white text-xs px-2 py-1 rounded"
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
              href={`/app/${app.id}/`}
              className="bg-black text-white hover:bg-default-soft hover:scale-105 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300"
            >
              Derrite tu curiosidad
            </a>
          </div>
        </article>
      ))}
    </section>
  );
}