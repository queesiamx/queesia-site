import { useEffect, useMemo, useState } from "react";
import CategoryPreview from "./CategoryPreview.tsx";

export default function HomeCategoryGridDynamic() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(
      `https://queesia.com/api/obtener_datos.php?all=1&limit=5000&page=1&_nocache=${Date.now()}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data.tools)) {
          setApps(data.tools);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error cargando categorías dinámicas del home:", error);
        setLoading(false);
      });
  }, []);

  const categories = useMemo(() => {
    const unique = new Set();

    apps.forEach((app) => {
      if (app.category && String(app.category).trim() !== "") {
        unique.add(String(app.category).trim());
      }
    });

    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [apps]);

  const appsByCategory = useMemo(() => {
    const grouped = {};

    categories.forEach((category) => {
      const categoryApps = apps
        .filter((app) => app.category === category)
        .sort((a, b) => {
          const rateA = Number(a.rate) || 0;
          const rateB = Number(b.rate) || 0;

          if (rateB !== rateA) return rateB - rateA;

          return Number(b.id || 0) - Number(a.id || 0);
        });

      grouped[category] = categoryApps.slice(0, 5);
    });

    return grouped;
  }, [apps, categories]);

  const countsByCategory = useMemo(() => {
    const counts = {};

    categories.forEach((category) => {
      counts[category] = apps.filter((app) => app.category === category).length;
    });

    return counts;
  }, [apps, categories]);

  const getSlug = (category) =>
    category
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto mt-4 px-4 text-center text-default-soft">
        Cargando categorías...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 px-4 items-stretch">
      {categories.map((category) => (
        <div id={`cat-${getSlug(category)}`} key={category}>
          <CategoryPreview
            categoria={category}
            apps={appsByCategory[category] ?? []}
            totalEnCategoria={countsByCategory[category] ?? 0}
          />
        </div>
      ))}
    </div>
  );
}