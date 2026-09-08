const MOCK_RESULTS_BY_AREA = {
  Video: [
    {
      appId: 1386,
      nombre: "Cardboard",
      categoria: "Video",
      afinidad: "Alta",
      razon:
        "Puede ayudarte a transformar videos largos en clips cortos, subtítulos y formatos listos para redes sociales.",
      url: "/app/1386/",
    },
    {
      appId: "mock-video-2",
      nombre: "Opción para clips automáticos",
      categoria: "Video",
      afinidad: "Alta",
      razon:
        "Es una alternativa útil si buscas reutilizar contenido largo y convertirlo en piezas breves para TikTok, Reels o Shorts.",
      url: "/catalogo",
    },
    {
      appId: "mock-video-3",
      nombre: "Herramienta de subtitulado",
      categoria: "Video",
      afinidad: "Media",
      razon:
        "Puede servir como complemento si tu prioridad es generar subtítulos, cortes rápidos o edición asistida.",
      url: "/catalogo",
    },
  ],

  Imagen: [
    {
      appId: "mock-image-1",
      nombre: "Generador visual para redes",
      categoria: "Imagen",
      afinidad: "Alta",
      razon:
        "Encaja si necesitas crear imágenes, piezas visuales o diseños rápidos para publicaciones digitales.",
      url: "/catalogo",
    },
    {
      appId: "mock-image-2",
      nombre: "Diseño asistido con IA",
      categoria: "Diseño",
      afinidad: "Alta",
      razon:
        "Puede ayudarte a producir contenido visual con menos trabajo manual, especialmente para marketing o redes sociales.",
      url: "/catalogo",
    },
    {
      appId: "mock-image-3",
      nombre: "Editor creativo de imágenes",
      categoria: "Imagen",
      afinidad: "Media",
      razon:
        "Funciona como apoyo para ajustar imágenes, generar variaciones o crear recursos visuales de forma rápida.",
      url: "/catalogo",
    },
  ],

  Productividad: [
    {
      appId: "mock-docs-1",
      nombre: "Asistente para documentos",
      categoria: "Productividad",
      afinidad: "Alta",
      razon:
        "Puede ayudarte a resumir documentos, extraer puntos clave y convertir textos largos en información accionable.",
      url: "/catalogo",
    },
    {
      appId: "mock-docs-2",
      nombre: "Analizador de PDFs",
      categoria: "Documentos",
      afinidad: "Alta",
      razon:
        "Es útil si trabajas con PDFs, reportes o textos extensos y necesitas entenderlos más rápido.",
      url: "/catalogo",
    },
    {
      appId: "mock-docs-3",
      nombre: "Resumen inteligente",
      categoria: "Texto",
      afinidad: "Media",
      razon:
        "Puede funcionar como alternativa para resumir, clasificar o extraer ideas principales de contenido escrito.",
      url: "/catalogo",
    },
  ],

  Marketing: [
    {
      appId: 786,
      nombre: "Meroid",
      categoria: "Marketing",
      afinidad: "Alta",
      razon:
        "Puede apoyar tareas de marketing digital, contenido SEO, análisis web y automatización de campañas.",
      url: "/app/786/",
    },
    {
      appId: "mock-marketing-2",
      nombre: "Planificador de contenido",
      categoria: "Marketing",
      afinidad: "Media",
      razon:
        "Puede ayudarte a organizar ideas, generar publicaciones y mantener una estrategia más constante en redes.",
      url: "/catalogo",
    },
    {
      appId: "mock-marketing-3",
      nombre: "Asistente SEO",
      categoria: "Marketing",
      afinidad: "Media",
      razon:
        "Es útil si buscas generar contenido optimizado, analizar palabras clave o mejorar campañas digitales.",
      url: "/catalogo",
    },
  ],

  Programación: [
    {
      appId: "mock-code-1",
      nombre: "Asistente de código",
      categoria: "Codificación",
      afinidad: "Alta",
      razon:
        "Puede ayudarte a generar, revisar o explicar código en distintos lenguajes de programación.",
      url: "/catalogo",
    },
    {
      appId: "mock-code-2",
      nombre: "Depurador asistido",
      categoria: "Codificación",
      afinidad: "Media",
      razon:
        "Puede servir para encontrar errores, proponer soluciones y acelerar tareas de desarrollo.",
      url: "/catalogo",
    },
    {
      appId: "mock-code-3",
      nombre: "Generador de scripts",
      categoria: "Automatización",
      afinidad: "Media",
      razon:
        "Es útil si buscas automatizar tareas repetitivas mediante scripts o flujos asistidos por IA.",
      url: "/catalogo",
    },
  ],

  Datos: [
    {
      appId: "mock-data-1",
      nombre: "Analizador de datos",
      categoria: "Datos",
      afinidad: "Alta",
      razon:
        "Puede ayudarte a analizar tablas, interpretar información y obtener conclusiones desde archivos o bases de datos.",
      url: "/catalogo",
    },
    {
      appId: "mock-data-2",
      nombre: "Asistente para Excel",
      categoria: "Productividad",
      afinidad: "Media",
      razon:
        "Puede servir para limpiar datos, crear fórmulas, resumir información o interpretar hojas de cálculo.",
      url: "/catalogo",
    },
    {
      appId: "mock-data-3",
      nombre: "Visualizador inteligente",
      categoria: "Análisis de datos",
      afinidad: "Media",
      razon:
        "Puede apoyar en la generación de gráficas, reportes o visualizaciones a partir de datos estructurados.",
      url: "/catalogo",
    },
  ],

    Audio: [
    {
      appId: "mock-audio-1",
      nombre: "Transcriptor de audio",
      categoria: "Audio",
      afinidad: "Alta",
      razon:
        "Puede ayudarte a convertir audio o video en texto, útil para entrevistas, clases, reuniones o contenido.",
      url: "/catalogo",
    },
    {
      appId: "mock-audio-2",
      nombre: "Generador de voz",
      categoria: "Audio",
      afinidad: "Media",
      razon:
        "Puede servir si necesitas crear narraciones, voces sintéticas o contenido hablado con IA.",
      url: "/catalogo",
    },
    {
      appId: "mock-audio-3",
      nombre: "Editor de audio IA",
      categoria: "Audio",
      afinidad: "Media",
      razon:
        "Puede apoyar en limpieza de audio, mejora de sonido o edición rápida de archivos de voz.",
      url: "/catalogo",
    },
  ],

  Chat: [
    {
      appId: 1766,
      nombre: "Anuma",
      categoria: "Chat",
      afinidad: "Alta",
      razon:
        "Encaja con búsquedas de chat multimodelo, comparación de respuestas y uso de varios modelos de IA en una sola interfaz.",
      url: "/app/1766/",
    },
    {
      appId: 1491,
      nombre: "NottoAI",
      categoria: "Chat",
      afinidad: "Alta",
      razon:
        "Puede servir para trabajar con asistentes conversacionales y explorar respuestas generadas por IA desde una experiencia tipo chat.",
      url: "/app/1491/",
    },
    {
      appId: 1371,
      nombre: "Pocket pal AI",
      categoria: "Chat",
      afinidad: "Media",
      razon:
        "Funciona como alternativa para consultas conversacionales, asistentes personales y uso práctico de modelos de IA.",
      url: "/app/1371/",
    },
  ],

  General: [
    {
      appId: 606,
      nombre: "Aisera",
      categoria: "Automatización",
      afinidad: "Media",
      razon:
        "Ayuda a automatizar procesos de soporte, atención al cliente y productividad operativa con IA generativa.",
      url: "/app/606/",
    },
    {
      appId: "mock-general-1",
      nombre: "Herramienta sugerida",
      categoria: "IA aplicada",
      afinidad: "Media",
      razon:
        "Puede funcionar como alternativa general para tareas asistidas con inteligencia artificial.",
      url: "/catalogo",
    },
    {
      appId: "mock-general-2",
      nombre: "Asistente multipropósito",
      categoria: "Productividad",
      afinidad: "Media",
      razon:
        "Puede ayudarte si tu necesidad combina redacción, búsqueda, análisis o automatización básica.",
      url: "/catalogo",
    },
  ],
};

export function buildPayload(text, preset = {}) {
  const areaUso = preset.areaUso || inferArea(text);
  const resultadoEsperado = preset.resultadoEsperado || inferResultado(text);
  const preferenciaPrecio =
    preset.preferenciaPrecio || inferPrecio(text) || "Cualquiera";

  return {
    descripcion: text,
    areaUso,
    resultadoEsperado,
    nivelUsuario: preset.nivelUsuario || inferNivel(text),
    preferenciaPrecio,
    restricciones: preset.restricciones || inferRestricciones(text),
    source: "queesia_bot_widget",
    createdAt: new Date().toISOString(),
  };
}

export function getMockResults(payload) {
  const area = payload.areaUso || "General";

  if (MOCK_RESULTS_BY_AREA[area]) {
    return MOCK_RESULTS_BY_AREA[area];
  }

  return MOCK_RESULTS_BY_AREA.General;
}



function inferArea(text) {
  const value = normalizeText(text);

  if (isMultiModelChatIntent(value)) {
    return "Chat";
  }

  if (isCodeTestingIntent(value)) {
    return "Programación";
  }

  if (isPaidAdvertisingIntent(value)) {
    return "Marketing";
  }

  const isSocialPublishing = includesAny(value, [
    "publicaciones",
    "publicacion",
    "publicación",
    "posts",
    "redes sociales",
    "social media",
    "linkedin",
    "instagram",
    "facebook",
    "tiktok",
  ]);

  const isAutomationIntent = includesAny(value, [
    "automatizar",
    "automatizacion",
    "automatización",
    "programar",
    "calendarizar",
    "agendar",
    "planificar",
    "publicar",
  ]);

  if (isSocialPublishing && isAutomationIntent) {
    return "Marketing";
  }

  if (
    includesAny(value, [
      "video",
      "videos",
      "clip",
      "clips",
      "subtitulo",
      "subtitulos",
      "tiktok",
      "reels",
      "shorts",
      "youtube",
    ])
  ) {
    return "Video";
  }

  if (
    includesAny(value, [
      "imagen",
      "imagenes",
      "diseno",
      "diseño",
      "visual",
      "logo",
      "post",
      "redes sociales",
    ])
  ) {
    return "Imagen";
  }

  if (
    includesAny(value, [
      "documento",
      "documentos",
      "pdf",
      "texto",
      "resumen",
      "resumir",
      "leer",
      "extraer",
    ])
  ) {
    return "Productividad";
  }

  if (
    includesAny(value, [
      "marketing",
      "seo",
      "campana",
      "campaña",
      "publicidad",
      "linkedin",
      "contenido",
    ])
  ) {
    return "Marketing";
  }

  if (
    includesAny(value, [
      "codigo",
      "código",
      "programar",
      "programacion",
      "programación",
      "desarrollo",
      "javascript",
      "python",
    ])
  ) {
    return "Programación";
  }

  if (
    includesAny(value, [
      "excel",
      "datos",
      "analisis",
      "análisis",
      "base de datos",
      "tabla",
      "csv",
    ])
  ) {
    return "Datos";
  }

  if (
    includesAny(value, [
      "audio",
      "voz",
      "transcribir",
      "transcripcion",
      "transcripción",
      "podcast",
    ])
  ) {
    return "Audio";
  }

  return "General";
}

function inferResultado(text) {
  const value = normalizeText(text);

  if (isMultiModelChatIntent(value)) {
    return "Búsqueda";
  }

  if (isCodeTestingIntent(value)) {
    return "Código";
  }

  if (isPaidAdvertisingIntent(value)) {
    return "Automatización";
  }

  if (includesAny(value, ["video", "clip", "clips", "reels", "shorts"])) {
    return "Video";
  }

  if (includesAny(value, ["imagen", "imagenes", "diseño", "diseno", "visual"])) {
    return "Imagen";
  }

  if (includesAny(value, ["resumen", "resumir", "sintetizar"])) {
    return "Resumen";
  }

  const isSocialPublishingIntent =
  includesAny(value, [
    "publicaciones",
    "publicacion",
    "posts",
    "post",
    "redes sociales",
    "social media",
    "linkedin",
    "instagram",
    "facebook",
    "twitter",
    "x",
    "tiktok",
  ]) &&
  includesAny(value, [
    "programar",
    "calendarizar",
    "agendar",
    "automatizar",
    "publicar",
    "planificar",
  ]);

if (isSocialPublishingIntent) {
  return "Automatización";
}

  if (includesAny(value, ["codigo", "código", "programar", "script"])) {
    return "Código";
  }

  if (includesAny(value, ["automatizar", "automatizacion", "automatización"])) {
    return "Automatización";
  }

  if (includesAny(value, ["excel", "datos", "analisis", "análisis"])) {
    return "Análisis de datos";
  }

  if (includesAny(value, ["audio", "voz", "transcribir"])) {
    return "Audio";
  }

  return "Búsqueda";
}

function inferPrecio(text) {
  const value = normalizeText(text);

  if (includesAny(value, ["gratis", "gratuita", "free"])) {
    return "Gratis";
  }

  if (includesAny(value, ["freemium"])) {
    return "Freemium";
  }

  if (includesAny(value, ["pago", "premium", "suscripcion", "suscripción"])) {
    return "De pago";
  }

  return "Cualquiera";
}

function inferNivel(text) {
  const value = normalizeText(text);

  if (
    includesAny(value, [
      "principiante",
      "facil",
      "fácil",
      "simple",
      "sencillo",
    ])
  ) {
    return "Principiante";
  }

  if (includesAny(value, ["avanzado", "api", "integracion", "integración"])) {
    return "Avanzado";
  }

  return "No especificado";
}

function inferRestricciones(text) {
  const value = normalizeText(text);
  const restrictions = [];

  if (includesAny(value, ["español", "espanol"])) {
    restrictions.push("Que funcione bien en español");
  }

  if (includesAny(value, ["sin instalar", "web", "navegador"])) {
    restrictions.push("Que funcione desde navegador o sin instalación compleja");
  }

  if (includesAny(value, ["api", "integracion", "integración"])) {
    restrictions.push("Que tenga API o posibilidad de integración");
  }

  return restrictions.join(". ");
}

function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function includesAny(text, terms) {
  return terms.some((term) => text.includes(normalizeText(term)));
}

function isMultiModelChatIntent(value) {
  const hasDirectMultiModelIntent = includesAny(value, [
    "chat multimodelo",
    "multi-model chat",
    "multimodelo",
    "multi model",
    "multi-model",
    "varios modelos",
    "multiples modelos",
    "múltiples modelos",
    "usar multiples modelos",
    "usar múltiples modelos",
    "modelos de ia en un solo chat",
  ]);

  const hasModelNames = includesAny(value, [
    "chatgpt",
    "claude",
    "gemini",
    "llama",
    "mistral",
  ]);

  const hasComparisonIntent = includesAny(value, [
    "comparar",
    "comparacion",
    "comparación",
    "respuestas",
    "diferentes modelos",
    "varios modelos",
    "multiples modelos",
    "múltiples modelos",
  ]);

  const hasPrivacyOrMemoryIntent = includesAny(value, [
    "memoria entre modelos",
    "memoria entre conversaciones",
    "chat privado",
    "privacidad en chat",
    "privacidad en chat ia",
    "asistente privado",
  ]);

  return (
    hasDirectMultiModelIntent ||
    hasPrivacyOrMemoryIntent ||
    (hasModelNames && hasComparisonIntent)
  );
}

function isCodeTestingIntent(value) {
  const hasStrongTestingIntent = includesAny(value, [
    "pruebas unitarias",
    "prueba unitaria",
    "unit tests",
    "unit test",
    "testing agent",
    "automatizar unit tests",
    "generar pruebas unitarias",
    "crear pruebas para codigo",
    "crear pruebas para código",
    "generar pruebas para codigo",
    "generar pruebas para código",
    "cobertura de codigo",
    "cobertura de código",
    "code coverage",
  ]);

  const hasTestingTerms = includesAny(value, [
    "testing",
    "tests",
    "pruebas",
    "qa",
    "quality assurance",
    "cobertura",
    "coverage",
  ]);

  const hasCodeContext = includesAny(value, [
    "codigo",
    "código",
    "programacion",
    "programación",
    "desarrollo",
    "developer",
    "java",
    "javascript",
    "python",
    "software",
    "repositorio",
    "repositorios",
  ]);

  return hasStrongTestingIntent || (hasTestingTerms && hasCodeContext);
}

function isPaidAdvertisingIntent(value) {
  return includesAny(value, [
    "anuncio",
    "anuncios",
    "ads",
    "ad",
    "meta ads",
    "facebook ads",
    "instagram ads",
    "facebook e instagram",
    "facebook instagram",
    "campaña publicitaria",
    "campañas publicitarias",
    "campana publicitaria",
    "campanas publicitarias",
    "campaña",
    "campañas",
    "campana",
    "campanas",
    "publicidad",
    "publicitario",
    "publicitaria",
    "publicitarias",
    "paid ads",
    "paid media",
    "marketing pagado",
    "creativos publicitarios",
    "ad creatives",
    "ad copy",
    "performance marketing",
    "optimizar campañas",
    "optimizar campanas",
    "crear campañas",
    "crear campanas",
    "generar campañas",
    "generar campanas",
    "crear anuncios",
    "generar anuncios",
  ]);
}