  export function slugify(str) {
    return str
      .toLowerCase()
      .replace(/\s+/g, '-') // Reemplazar espacios con guiones
      .replace(/[^\w-]+/g, ''); // Remover caracteres especiales
  }