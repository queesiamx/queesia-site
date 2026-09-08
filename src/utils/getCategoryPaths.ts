export async function getStaticPaths() {
  const res = await fetch("https://queesia.com/api/obtener_categorias.php");

  if (!res.ok) {
    throw new Error("Error al obtener las categorías desde la API.");
  }

  const data = await res.json();

  if (!data.success || !Array.isArray(data.categories)) {
    throw new Error("Respuesta inválida al obtener categorías.");
  }

  const paths = data.categories
    .filter((cat: string) => typeof cat === "string" && cat.trim() !== "")
    .map((cat: string) => ({
      params: { cat: cat.trim() }
    }));

  return paths;
}
