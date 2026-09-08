import { useEffect, useState } from "react";

export default function HomeCategoryChipsDynamic() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch(`https://queesia.com/api/obtener_categorias.php?_nocache=${Date.now()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data.categories)) {
          setCategories(
            data.categories
              .filter((c) => typeof c === "string" && c.trim() !== "")
              .map((c) => c.trim())
          );
        }
      })
      .catch((error) => {
        console.error("Error cargando chips de categorías:", error);
      });
  }, []);

  const getSlug = (category) =>
    category
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  return (
    <div className="max-w-7xl mx-auto px-4 -mt-2">
      <div className="flex flex-nowrap gap-2 overflow-x-auto no-scrollbar py-2 whitespace-nowrap">
        <a
          href="#catalogo"
          className="px-3 py-1 rounded-full text-sm bg-blue-600 text-white"
        >
          Todas
        </a>

        {categories.map((category) => (
          <a
            key={category}
            href={`#cat-${getSlug(category)}`}
            className="px-3 py-1 rounded-full text-sm border bg-white hover:bg-black hover:text-white transition"
          >
            {category}
          </a>
        ))}
      </div>
    </div>
  );
}