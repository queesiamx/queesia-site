import { useEffect, useState } from "react";
import { iconMap } from "../utils/categoryInfo.tsx";
import * as Icons from "lucide-react";

/**
 * @param {{ categoryFilter?: string | null }} props
 */
export default function CaseExplorer({ categoryFilter = null }) {
  const [casos, setCasos] = useState([]);
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("https://queesia.com/api/obtener_categorias.php")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.categories)) {
          const ordenadas = data.categories
            .filter((cat) => typeof cat === "string")
            .map((cat) => cat.trim())
            .sort((a, b) => a.localeCompare(b));
          setCategories(ordenadas);
        }
      })
      .catch((err) => {
        console.error("Error al obtener categorías:", err);
      });
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const url = categoryFilter
      ? `https://queesia.com/api/obtener_casos_por_categoria.php?category=${encodeURIComponent(
          categoryFilter
        )}`
      : "https://queesia.com/api/obtener_casos.php";

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        console.log("🔎 Casos recibidos:", data.cases);
        if (data.success && Array.isArray(data.cases)) {
          setCasos(data.cases);
        } else {
          console.error("Respuesta inesperada:", data);
          setError("Los datos no son válidos");
        }
      })
      .catch((err) => {
        console.error("Error al obtener casos:", err);
        setError("Hubo un problema al cargar los casos.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [categoryFilter]);

  const filtered =
    query.trim() === ""
      ? null
      : casos.filter((c) =>
          [c.name, c.title, c.description, c.success_type].some(
            (field) =>
              typeof field === "string" &&
              field.toLowerCase().includes(query.toLowerCase())
          )
        );

  // Extra: filtra categorías que tienen al menos 1 caso válido
  const categoriasConCasos = categories.filter((cat) => {
    const casosDeCategoria = casos.filter(
      (c) =>
        c.category?.trim().toLowerCase() === cat.trim().toLowerCase() &&
        typeof c.title === "string" &&
        !c.title.toLowerCase().includes("no hay quesos de éxito") &&
        typeof c.description === "string" &&
        !["na", "n/a", ""].includes(c.description.toLowerCase()) &&
        typeof c.url === "string" &&
        !["na", "n/a", ""].includes(c.url.toLowerCase())
    );
    return casosDeCategoria.length > 0;
  });

  const sortedCategories = categoryFilter
    ? categoriasConCasos.filter((cat) => cat === categoryFilter)
    : categoriasConCasos;

  const handleCategoryClick = (category) => {
    const section = document.getElementById(`categoria-${category}`);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (loading) {
    return (
      <div className="w-full text-center py-10">
        <p className="text-gray-500 text-lg italic">
          Cargando quesos de éxito...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full text-center py-10">
        <p className="text-red-500 text-lg italic">{error}</p>
      </div>
    );
  }

  return (
  <div className="w-full">
    {/* Buscador */}
    <div className="mb-4">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar quesos de éxito..."
        className="w-full p-3 mb-4 border border-gray-300 rounded-xl shadow-sm text-lg bg-white"
      />

      {/* Chips de categorías */}
      <div className="flex flex-nowrap gap-2 overflow-x-auto no-scrollbar py-1 whitespace-nowrap">
        {sortedCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryClick(cat)}
            className="px-3 py-1.5 rounded-full text-sm border border-slate-200 bg-white text-slate-700 hover:bg-primary hover:text-white hover:border-primary transition shrink-0"
          >
            {cat}
          </button>
        ))}
      </div>
    </div>

    {filtered ? (
      filtered.length === 0 ? (
        <div className="text-center text-gray-600 flex flex-col items-center gap-4 mt-8">
          <img
            src="/ohno-cheese.png"
            alt="Sin resultados"
            className="w-20 h-20 opacity-60"
          />
          <p className="text-lg">
            No se encontraron resultados con ese criterio de búsqueda.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((caso, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-lg p-5 hover:shadow-xl transition"
            >
              <div className="flex items-center gap-4 mb-3">
                <img
                  src={`https://queesia.com/logos/${caso.logo_filename}`}
                  alt={caso.name}
                  className="w-16 h-16 md:w-20 md:h-20 object-contain rounded-xl self-start pt-1"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/default-logo.png";
                  }}
                />
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 italic">
                    {caso.name}
                  </h2>
                  <p className="text-sm text-gray-500 italic">
                    {caso.category}
                  </p>
                </div>
              </div>

              <p className="text-xs font-semibold text-blue-600 mb-2">
                {caso.success_type}
              </p>
              <h3 className="text-lg font-bold text-black mb-2 italic">
                {caso.title}
              </h3>
              <p className="text-sm text-gray-700 mb-3">
                {caso.description}
              </p>

              {caso.url !== "NA" && (
                <a
                  href={caso.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline text-sm"
                >
                  Ver caso completo →
                </a>
              )}
            </div>
          ))}
        </div>
      )
    ) : (
      sortedCategories.map((cat) => {
        const casosDeCategoria = casos
          .filter(
            (c) =>
              c.category?.trim().toLowerCase() === cat.trim().toLowerCase()
          )
          .filter(
            (c) =>
              typeof c.title === "string" &&
              !c.title
                .toLowerCase()
                .includes("no hay quesos de éxito identificados") &&
              typeof c.description === "string" &&
              !["na", "n/a", ""].includes(c.description.toLowerCase()) &&
              typeof c.url === "string" &&
              !["na", "n/a", ""].includes(c.url.toLowerCase())
          )
          .slice(0, 4);

        if (casosDeCategoria.length === 0) return null;

        return (
          <section key={cat} id={`categoria-${cat}`} className="mb-10">
            <h2 className="text-xl font-bold text-default mb-3 italic">
              {cat}
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {casosDeCategoria.map((caso, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl shadow-lg p-5 hover:shadow-xl transition"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <img
                      src={`https://queesia.com/logos/${caso.logo_filename}`}
                      alt={caso.name}
                      className="w-12 h-12 object-contain rounded self-start pt-1"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/default-logo.png";
                      }}
                    />
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800 italic">
                        {caso.name}
                      </h2>
                      <p className="text-sm text-gray-500 italic">
                        {caso.category}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-blue-600 mb-2">
                    {caso.success_type}
                  </p>
                  <h3 className="text-lg font-bold text-black mb-2 italic">
                    {caso.title}
                  </h3>
                  <p className="text-sm text-gray-700 mb-3">
                    {caso.description}
                  </p>

                  {caso.url !== "NA" && (
                    <a
                      href={caso.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline text-sm"
                    >
                      Ver caso completo →
                    </a>
                  )}
                </div>
              ))}
            </div>

            <div className="w-full mt-4">
              <a
                href={`/casos/categoria/${encodeURIComponent(cat)}`}
                className="text-base text-blue-600 hover:underline font-medium"
              >
                Ver todos los casos →
              </a>
            </div>
          </section>
        );
      })
    )}

    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 z-50 bg-black text-white px-4 py-2 rounded-full shadow-lg hover:bg-primary-dark transition"
      aria-label="Subir al inicio"
    >
      ⬆️
    </button>
  </div>
);

}
