import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Bot,
  ChevronRight,
  Search,
  SlidersHorizontal,
  Star,
} from "lucide-react";
import { iconMap, descriptionMap } from "../utils/categoryInfo.tsx";

const API_URL = "https://queesia.com/api/obtener_datos.php";
const DEFAULT_LIMIT = 15;
const ALL_CATEGORY_LIMIT = 5;

const normalize = (value = "") =>
  String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const getSlug = (category = "") =>
  normalize(category)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const compact = (n) => {
  const num = typeof n === "number" ? n : typeof n === "string" ? Number(n) : NaN;
  if (!Number.isFinite(num) || num <= 0) return null;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(num % 1_000_000 ? 1 : 0)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(num % 1_000 ? 1 : 0)}K`;
  return String(num);
};

const getLogoSrc = (app) => {
  if (!app?.logo_filename) return "/default-logo.png";

  const filename = String(app.logo_filename).split("/").pop();
  const hasExtension = /\.(png|jpe?g|webp|svg)$/i.test(filename);

  return `https://queesia.com/logos/${filename}${hasExtension ? "" : ".png"}`;
};

const getRate = (app) => {
  const rate = typeof app?.rate === "number" ? app.rate : Number(app?.rate);
  return Number.isFinite(rate) && rate > 0 ? rate.toFixed(rate % 1 === 0 ? 0 : 1) : "N/A";
};

const getKeywordLine = (app) => {
  const tags = Array.isArray(app?.tags) ? app.tags.filter(Boolean).slice(0, 3) : [];
  if (tags.length > 0) return tags.join(" · ");

  const parts = [app?.category, app?.main_functionality]
    .filter(Boolean)
    .map((item) => String(item).trim())
    .filter(Boolean)
    .slice(0, 3);

  return parts.length > 0 ? parts.join(" · ") : "Herramienta de IA";
};

const sortApps = (items = []) =>
  [...items].sort((a, b) => {
    const rateA = Number(a?.rate) || 0;
    const rateB = Number(b?.rate) || 0;
    if (rateB !== rateA) return rateB - rateA;
    return Number(b?.id || 0) - Number(a?.id || 0);
  });

export default function CatalogoResponsive() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todas");
  const [showAllSelected, setShowAllSelected] = useState(false);

  useEffect(() => {
    let mounted = true;

    fetch(`${API_URL}?all=1&limit=5000&page=1&_nocache=${Date.now()}`)
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;

        if (data?.success && Array.isArray(data.tools)) {
          setApps(data.tools);
        } else {
          setApps([]);
          setError(data?.message || "No se pudieron cargar las aplicaciones.");
        }
      })
      .catch((err) => {
        console.error("Error cargando catálogo:", err);
        if (mounted) setError("Error al cargar el catálogo.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const categories = useMemo(() => {
    const unique = new Set();
    apps.forEach((app) => {
      const category = String(app?.category || "").trim();
      if (category) unique.add(category);
    });
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [apps]);

  const filteredApps = useMemo(() => {
    const q = normalize(search);

    return sortApps(
      apps.filter((app) => {
        const matchesCategory =
          activeCategory === "Todas" || String(app?.category || "").trim() === activeCategory;

        const tagsText = Array.isArray(app?.tags) ? app.tags.join(" ") : "";
        const searchableText = normalize(
          [
            app?.name,
            app?.category,
            app?.short_description,
            app?.main_functionality,
            tagsText,
          ]
            .filter(Boolean)
            .join(" ")
        );

        return matchesCategory && (!q || searchableText.includes(q));
      })
    );
  }, [apps, search, activeCategory]);

  const appsByCategory = useMemo(() => {
    const grouped = {};
    categories.forEach((category) => {
      grouped[category] = sortApps(apps.filter((app) => app?.category === category));
    });
    return grouped;
  }, [apps, categories]);

  const isSearching = search.trim().length > 0;
  const selectedApps = showAllSelected ? filteredApps : filteredApps.slice(0, DEFAULT_LIMIT);

  const handleSelectCategory = (category) => {
    setActiveCategory(category);
    setShowAllSelected(false);

    window.requestAnimationFrame(() => {
      document.getElementById("catalogo-results")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const scrollToTop = () => {
    document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollToBottom = () => {
    document.getElementById("catalogo-bottom")?.scrollIntoView({ behavior: "smooth", block: "end" });
  };

  return (
    <section id="catalogo" className="relative px-4 pt-6 pb-12 md:pt-10 md:pb-16">
      <div className="mx-auto max-w-6xl">
        <div
          className="sticky top-[var(--header-h)] z-30 -mx-4 border-y border-white/60 bg-white/70 px-4 py-4 shadow-[0_18px_35px_-28px_rgba(15,23,42,.55)] backdrop-blur-xl md:mx-0 md:rounded-3xl md:border md:px-6 md:py-5"
        >
          <div className="text-center">
            <h2 className="text-2xl font-extrabold tracking-tight text-gray-950 md:text-4xl">
              Catálogo de Aplicaciones
            </h2>
            <p className="mx-auto mt-1 hidden max-w-2xl text-sm text-default-soft sm:block md:text-base">
              Descubre el queso de la Inteligencia Artificial en el catálogo de apps más fresco del día.
            </p>
          </div>

          <div className="mx-auto mt-4 max-w-3xl">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-default-soft" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nombre, categoría o etiqueta..."
                className="h-12 w-full rounded-2xl border border-white/70 bg-white/90 py-3 pl-12 pr-12 text-[15px] text-default shadow-sm outline-none transition placeholder:text-default-soft focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
              <SlidersHorizontal className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
            </div>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 no-scrollbar whitespace-nowrap">
            <CategoryChip
              label="Todas"
              active={activeCategory === "Todas"}
              onClick={() => handleSelectCategory("Todas")}
            />
            {categories.map((category) => (
              <CategoryChip
                key={category}
                label={category}
                active={activeCategory === category}
                onClick={() => handleSelectCategory(category)}
              />
            ))}
          </div>
        </div>

        <div id="catalogo-results" className="scroll-mt-56 pt-6 md:scroll-mt-48">
          {loading ? (
            <CatalogMessage title="Cargando catálogo..." text="Estamos preparando las aplicaciones." />
          ) : error && apps.length === 0 ? (
            <CatalogMessage title="No se pudo cargar el catálogo" text={error} tone="error" />
          ) : isSearching ? (
            <SearchResults apps={filteredApps} query={search} />
          ) : activeCategory === "Todas" ? (
            <AllCategoriesView
              categories={categories}
              appsByCategory={appsByCategory}
              onViewAll={(category) => {
                setActiveCategory(category);
                setShowAllSelected(true);
                window.requestAnimationFrame(() => {
                  document.getElementById("catalogo-results")?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                });
              }}
            />
          ) : (
            <SelectedCategoryView
              category={activeCategory}
              apps={selectedApps}
              total={filteredApps.length}
              expanded={showAllSelected}
              onToggleExpanded={() => setShowAllSelected((value) => !value)}
            />
          )}
        </div>

        <div id="catalogo-bottom" />
      </div>

      <div className="fixed bottom-20 right-4 z-40 flex flex-col gap-2 md:hidden">
        <button
          type="button"
          onClick={scrollToTop}
          className="grid h-11 w-11 place-items-center rounded-full border border-white/70 bg-white/85 text-primary shadow-lg backdrop-blur-xl active:scale-95"
          aria-label="Volver al inicio del catálogo"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={scrollToBottom}
          className="grid h-11 w-11 place-items-center rounded-full border border-white/70 bg-primary text-white shadow-lg backdrop-blur-xl active:scale-95"
          aria-label="Ir al final del catálogo"
        >
          <ArrowDown className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
}

function CategoryChip({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
        active
          ? "bg-primary text-white shadow-lg shadow-blue-500/25"
          : "border border-white/70 bg-white/85 text-primary shadow-sm hover:bg-white"
      }`}
    >
      {label}
    </button>
  );
}

function CatalogMessage({ title, text, tone = "default" }) {
  return (
    <div className="rounded-3xl border border-white/70 bg-white/70 p-6 text-center shadow-card backdrop-blur-xl">
      <h3 className={`text-xl font-bold ${tone === "error" ? "text-red-600" : "text-gray-950"}`}>
        {title}
      </h3>
      <p className="mt-2 text-sm text-default-soft">{text}</p>
    </div>
  );
}

function AllCategoriesView({ categories, appsByCategory, onViewAll }) {
  return (
    <div className="space-y-5 md:space-y-6">
      {categories.map((category) => {
        const categoryApps = appsByCategory[category] || [];
        if (categoryApps.length === 0) return null;

        return (
          <CategorySection
            key={category}
            category={category}
            apps={categoryApps.slice(0, ALL_CATEGORY_LIMIT)}
            total={categoryApps.length}
            onViewAll={() => onViewAll(category)}
          />
        );
      })}
    </div>
  );
}

function SearchResults({ apps, query }) {
  return (
    <section className="rounded-3xl border border-white/70 bg-white/45 p-4 shadow-card backdrop-blur-xl md:p-6">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-primary">Resultados de búsqueda</p>
          <h3 className="text-xl font-extrabold text-gray-950 md:text-2xl">
            {apps.length} resultado{apps.length === 1 ? "" : "s"}
          </h3>
          <p className="mt-1 text-sm text-default-soft">Búsqueda: “{query}”</p>
        </div>
      </div>

      {apps.length > 0 ? (
        <div className="space-y-3">
          {apps.map((app) => (
            <AppRow key={app.id ?? app.name} app={app} />
          ))}
        </div>
      ) : (
        <CatalogMessage
          title="No encontramos resultados"
          text="Intenta con otro nombre, categoría o etiqueta."
        />
      )}
    </section>
  );
}

function SelectedCategoryView({ category, apps, total, expanded, onToggleExpanded }) {
  const Icon = iconMap[category] ?? Bot;
  const descripcion = descriptionMap[category] ?? "Explora herramientas de esta categoría.";

  return (
    <section className="rounded-3xl border border-white/70 bg-white/45 p-4 shadow-card backdrop-blur-xl md:p-6">
      <header className="mb-5 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white text-primary shadow-sm ring-1 ring-black/5">
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-primary">{total} aplicaciones</p>
            <h3 className="text-2xl font-extrabold text-gray-950">{category}</h3>
            <p className="mt-1 text-sm text-default-soft">{descripcion}</p>
          </div>
        </div>
      </header>

      <div className="space-y-3">
        {apps.map((app) => (
          <AppRow key={app.id ?? app.name} app={app} />
        ))}
      </div>

      {total > DEFAULT_LIMIT && (
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={onToggleExpanded}
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:bg-primary-600 active:scale-95"
          >
            {expanded ? "Ver menos" : `Ver todas (${total})`}
          </button>
        </div>
      )}
    </section>
  );
}

function CategorySection({ category, apps, total, onViewAll }) {
  const Icon = iconMap[category] ?? Bot;
  const descripcion = descriptionMap[category] ?? "Explora herramientas de esta categoría.";

  return (
    <section id={`cat-${getSlug(category)}`} className="scroll-mt-56 rounded-3xl border border-white/70 bg-white/45 p-4 shadow-card backdrop-blur-xl md:p-5">
      <header className="mb-4 flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-primary shadow-sm ring-1 ring-black/5">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xl font-extrabold text-gray-950 md:text-2xl">{category}</h3>
            <p className="mt-1 text-sm text-default-soft">{descripcion}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onViewAll}
          className="hidden shrink-0 rounded-full border border-white/70 bg-white/80 px-4 py-2 text-sm font-semibold text-primary shadow-sm transition hover:bg-white sm:inline-flex"
        >
          Ver todas
          <ChevronRight className="ml-1 h-4 w-4" />
        </button>
      </header>

      <div className="space-y-3">
        {apps.map((app) => (
          <AppRow key={app.id ?? app.name} app={app} />
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onViewAll}
          className="rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-primary shadow-sm ring-1 ring-white/70 transition hover:bg-white"
        >
          Ver todas ({total})
        </button>
        <span className="text-sm font-semibold text-default-soft">
          Top 5 mostrado
        </span>
      </div>
    </section>
  );
}

function AppRow({ app }) {
  const users =
    app?.users_pretty ||
    compact(app?.users) ||
    compact(app?.installs) ||
    compact(app?.downloads) ||
    compact(app?.monthly_users) ||
    compact(app?.user_count);

  return (
    <article className="group rounded-2xl border border-white/70 bg-white/85 p-3 shadow-sm transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md">
      <a href={`/app/${app?.id ?? ""}/`} className="flex items-center gap-3 text-inherit hover:no-underline">
        <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
          <img
            src={getLogoSrc(app)}
            alt={`Logo de ${app?.name ?? "aplicación"}`}
            loading="lazy"
            className="max-h-[76%] max-w-[76%] object-contain"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = "/default-logo.png";
            }}
          />
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="truncate text-base font-extrabold text-gray-950 md:text-lg">
            {app?.name ?? "Aplicación"}
          </h4>
          <p className="mt-0.5 line-clamp-1 text-sm text-default-soft">
            {getKeywordLine(app)}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-default-soft">
            <span className="inline-flex items-center gap-1 font-semibold text-gray-700">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              {getRate(app)}
            </span>
            {users && <span>• {users}+ usuarios</span>}
          </div>
        </div>

        <span className="hidden rounded-full bg-primary-soft px-4 py-2 text-sm font-semibold text-primary transition group-hover:bg-primary group-hover:text-white sm:inline-flex">
          Ver
        </span>
        <ChevronRight className="h-5 w-5 shrink-0 text-primary sm:hidden" />
      </a>
    </article>
  );
}
