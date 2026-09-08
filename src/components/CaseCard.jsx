// src/components/CaseCard.jsx
export default function CaseCard({ caso, variant = "compact" }) {
  const logo =
    caso?.logo_filename
      ? `https://queesia.com/logos/${caso.logo_filename}`
      : "/default-logo.png";

  // Usamos el título como “pill” si tiene un %; si no, caemos al success_type.
  const pillLabel =
    typeof caso?.title === "string" && /\d+%/.test(caso.title)
      ? caso.title
      : (caso?.success_type || "Mejora obtenida");

  const cardBase =
    variant === "large"
      ? "rounded-2xl bg-white ring-1 ring-black/5 shadow-sm hover:shadow-md transition p-6 h-full flex flex-col"
      : "bg-white rounded-2xl shadow-lg p-5 hover:shadow-xl transition h-full flex flex-col";

  const titleClass =
    variant === "large" ? "text-xl font-bold text-black mb-2 italic" : "text-lg font-bold text-black mb-2 italic";

  const pillClass =
    "mt-3 rounded-xl bg-emerald-50 text-emerald-700 " +
    (variant === "large" ? "p-4" : "p-3");

  return (
    <article className={cardBase}>
      {/* Header */}
      <div className="flex items-center gap-4 mb-3">
        <img
          src={logo}
          alt={caso?.name || "Caso"}
          className="w-12 h-12 md:w-14 md:h-14 object-contain rounded-xl self-start pt-1 ring-1 ring-black/5 bg-white"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/default-logo.png";
          }}
        />
        <div className="min-w-0">
          <h2 className="text-xl font-semibold text-gray-800 italic truncate">
            {caso?.name}
          </h2>
          <p className="text-sm text-gray-500 italic truncate">{caso?.category}</p>
        </div>
      </div>

      {/* Kicker / tipo */}
      {caso?.success_type && (
        <p className="text-xs font-semibold text-blue-600 mb-2">{caso.success_type}</p>
      )}

      {/* Título del caso */}
      <h3 className={titleClass}>{caso?.title}</h3>

      {/* Resumen */}
      {caso?.description && (
        <p className="text-sm text-gray-700 mb-3">{caso.description}</p>
      )}

      {/* Pill de mejora */}
      <div className={pillClass}>
        <div className={variant === "large" ? "text-2xl font-extrabold" : "text-lg font-bold"}>
          {pillLabel}
        </div>
        <div className="text-[12px] opacity-80">Mejora obtenida</div>
      </div>

      {/* Link al caso */}
      {caso?.url && caso.url.toLowerCase() !== "na" && (
        <a
          href={caso.url}
          target="_blank"
          className="mt-4 ml-auto text-sm text-blue-600 hover:underline"
        >
          Ver caso completo →
        </a>
      )}
    </article>
  );
}
