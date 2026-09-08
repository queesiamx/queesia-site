import { useEffect, useState } from "react";

export default function CaseCatalog() {
  const [casos, setCasos] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("https://queesia.com/api/obtener_casos.php")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setCasos(data.data);
        }
      });
  }, []);

  const categorias = Array.from(
    new Set(casos.map((c) => c.category).filter(Boolean))
  ).sort();

  const casosFiltrados = query.trim()
    ? casos.filter((c) =>
        [c.name, c.title, c.description, c.success_type, c.category].some((field) =>
          field.toLowerCase().includes(query.toLowerCase())
        )
      )
    : [];

  const casosAgrupados = query.trim()
    ? {}
    : categorias.reduce((acc, cat) => {
        acc[cat] = casos
          .filter((c) => c.category === cat)
          .slice(0, 3);
        return acc;
      }, {});

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-6">Quesos de éxito 🧀</h1>

      {/* Barra de búsqueda */}
      <div className="flex justify-center mb-10">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre, categoría o palabra clave..."
          className="w-full max-w-xl px-4 py-2 rounded-md border border-gray-300 shadow-sm"
        />
      </div>

      {/* Modo búsqueda */}
      {query.trim() && (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {casosFiltrados.length > 0 ? (
            casosFiltrados.map((caso, i) => <CasoCard key={i} caso={caso} />)
          ) : (
            <p className="text-center col-span-full text-gray-600">
              No se encontraron resultados.
            </p>
          )}
        </div>
      )}

      {/* Modo catálogo por categoría */}
      {!query.trim() && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Categorías */}
          <div className="md:col-span-1">
            <div className="grid grid-cols-2 gap-2 sticky top-6">
              {categorias.map((cat) => (
                <a
                  key={cat}
                  href={`#cat-${cat.replace(/\s+/g, "-").toLowerCase()}`}
                  className="bg-primary text-white text-sm px-3 py-2 rounded-md text-center hover:bg-primary-strong"
                >
                  {cat}
                </a>
              ))}
            </div>
          </div>

          {/* Casos por categoría */}
          <div className="md:col-span-2 space-y-12">
            {categorias.map((cat) => (
              <div key={cat} id={`cat-${cat.replace(/\s+/g, "-").toLowerCase()}`}>
                <h2 className="text-xl font-semibold mb-4">{cat}</h2>
                <div className="grid gap-6 sm:grid-cols-2">
                  {(casosAgrupados[cat] || []).map((caso, i) => (
                    <CasoCard key={i} caso={caso} />
                  ))}
                </div>
                <div className="mt-3 text-right">
                  <a
                    href={`#`} // Ajusta si hay ruta completa por categoría
                    className="text-blue-600 underline text-sm font-medium"
                  >
                    Ver todos los casos →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CasoCard({ caso }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-5 hover:shadow-xl transition">
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
          <h2 className="text-xl font-semibold text-gray-800">{caso.name}</h2>
          <p className="text-sm text-gray-500 italic">{caso.category}</p>
        </div>
      </div>
      <p className="text-xs font-semibold text-blue-600 mb-2">{caso.success_type}</p>
      <h3 className="text-lg font-bold text-black mb-2">{caso.title}</h3>
      <p className="text-sm text-gray-700 mb-3">{caso.description}</p>
      {caso.url !== "NA" && (
        <a
          href={caso.url}
          target="_blank"
          className="text-blue-600 underline text-sm"
        >
          Ver caso completo →
        </a>
      )}
    </div>
  );
}
