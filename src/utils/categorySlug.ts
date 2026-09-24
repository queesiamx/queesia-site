import categoriesManifest from "../data/categories-manifest.json";

type CategoryManifestEntry = {
  name: string;
  slug: string;
  aliases: string[];
};

const categories = categoriesManifest as CategoryManifestEntry[];
const slugByCategoryNameOrAlias = new Map<string, string>();
const warnedMissingCategories = new Set<string>();

function cleanCategoryKey(category: unknown): string {
  return String(category ?? "").trim();
}

for (const category of categories) {
  const keys = [category.name, ...(Array.isArray(category.aliases) ? category.aliases : [])]
    .map(cleanCategoryKey)
    .filter(Boolean);

  for (const key of keys) {
    const existingSlug = slugByCategoryNameOrAlias.get(key);

    if (existingSlug && existingSlug !== category.slug) {
      throw new Error(
        `Categoria ambigua en categories-manifest.json: "${key}" apunta a "${existingSlug}" y "${category.slug}".`
      );
    }

    slugByCategoryNameOrAlias.set(key, category.slug);
  }
}

export function resolveCategorySlug(category: unknown): string | null {
  const key = cleanCategoryKey(category);

  if (!key) return null;

  return slugByCategoryNameOrAlias.get(key) ?? null;
}

export function getCanonicalCategoryUrl(category: unknown): string | null {
  const slug = resolveCategorySlug(category);

  return slug ? `/categorias/${slug}/` : null;
}

export function warnMissingCategorySlug(category: unknown, context: string): void {
  const key = cleanCategoryKey(category);

  if (!key || warnedMissingCategories.has(key)) return;

  warnedMissingCategories.add(key);
  console.warn(
    `[Queesia] No se encontro slug canonico para la categoria "${key}" en ${context}.`
  );
}
