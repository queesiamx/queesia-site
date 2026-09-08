import { useEffect, useState } from "react";
import { getLogoUrl, handleLogoError } from "../utils/logoUtils";

const NEW_SINCE_ID = 1475;

export default function NewAppsDynamic() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {
    const apiUrl = `https://queesia.com/api/obtener_nuevas_apps.php?limit=100&_nocache=${Date.now()}`;

    fetch(apiUrl)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.tools)) {
          setApps(data.tools);
        } else {
          setApps([]);
          setError(data.message || "No se encontraron aplicaciones nuevas.");
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Error al cargar las aplicaciones recién agregadas.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-12">
        <p className="text-center text-default-soft">
          Cargando aplicaciones recién agregadas...
        </p>
      </section>
    );
  }

  return (
    <section className="relative w-full bg-primary-soft min-h-screen overflow-hidden pt-24 md:pt-28">
      <section className="max-w-7xl mx-auto px-4 pb-10 md:pb-14">
        <h1 className="text-3xl font-bold text-default mb-2">
          Aplicaciones <span className="text-primary">recién agregadas</span>
        </h1>

        <a
          href="/#nuevas"
          className="inline-block bg-black text-white px-4 py-2 rounded hover:bg-default-soft transition mb-6"
        >
          Volver
        </a>

        {error && apps.length === 0 ? (
          <div className="card p-6 text-center">
            <p className="text-default-soft">{error}</p>
          </div>
        ) : apps.length > 0 ? (
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

                <h2 className="text-lg font-semibold text-default mb-1">
                  {app.name}
                </h2>

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
        ) : (
          <div className="card p-6 text-center">
            <p className="text-default-soft">
              No se encontraron aplicaciones nuevas.
            </p>
          </div>
        )}
      </section>
    </section>
  );
}