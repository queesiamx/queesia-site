import { getMockResults } from "./mockRecommendations";

const API_BASE = "https://queesia.com/api";

export async function recommendApps(payload, token) {
  try {
    const realResults = await searchCatalogApps(payload, token);

    if (realResults.length > 0) {
      const response = {
        success: true,
        provider: "queesia_catalog_api",
        mode: "catalog_search",
        results: realResults,
        remainingToday: payload.remainingToday,
        dailyLimit: payload.dailyLimit,
      };

      saveChatbotQuery(payload, response, token);

      return response;
    }

    const fallbackResponse = {
      success: true,
      provider: "mock",
      mode: "fallback_no_results",
      results: getMockResults(payload),
    };

    saveChatbotQuery(payload, fallbackResponse, token);

    return fallbackResponse;
  } catch (error) {
    console.error("Error consultando API del catálogo:", error);

    if (error?.type === "DAILY_LIMIT_REACHED") {
      return {
        success: false,
        provider: "queesia_catalog_api",
        mode: "daily_limit_reached",
        limitReached: true,
        message: error.message,
        dailyLimit: error.dailyLimit,
        dailyCount: error.dailyCount,
        results: [],
      };
    }

    const fallbackResponse = {
      success: true,
      provider: "mock",
      mode: "fallback_error",
      results: getMockResults(payload),
    };

    saveChatbotQuery(payload, fallbackResponse, token);

    return fallbackResponse;
  }
}

function saveChatbotQuery(payload, response, token) {
  const consulta = String(payload?.descripcion || "").trim();

  if (!consulta) return;

  const simplifiedResults = Array.isArray(response?.results)
    ? response.results.slice(0, 10).map((app) => ({
        appId: app.appId || null,
        nombre: app.nombre || null,
        categoria: app.categoria || null,
        afinidad: app.afinidad || null,
        url: app.url || null,
      }))
    : [];

  fetch(`${API_BASE}/guardar_consulta_chatbot.php`, {
    method: "POST",
    headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  },
    body: JSON.stringify({
      consulta,
      payload,
      provider: response?.provider || "",
      mode: response?.mode || "",
      results: simplifiedResults,
    }),
  }).catch((error) => {
    console.warn("No se pudo guardar la consulta del chatbot:", error);
  });
}

async function searchCatalogApps(payload, token) {
  const queries = buildSearchQueries(payload);
  const collectedApps = [];

  for (const query of queries) {
    const url = `${API_BASE}/obtener_datos.php?query=${encodeURIComponent(
      query
    )}&limit=10&source=queesia_bot_widget&_nocache=${Date.now()}`;

  

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    

    if (!response.ok) {
      if (response.status === 429) {
        const data = await response.json();


        throw {
          type: "DAILY_LIMIT_REACHED",
          message: data?.message || "Límite diario alcanzado",
          dailyLimit: data?.dailyLimit,
          dailyCount: data?.dailyCount,
        };
      }

      continue;
    }

    const data = await response.json();

    if (typeof data?.remainingToday === "number") {
      payload.remainingToday = data.remainingToday;
      payload.dailyLimit = data.dailyLimit;
    }

    const tools = Array.isArray(data?.tools) ? data.tools : [];

    collectedApps.push(...tools);
  }

  const uniqueApps = deduplicateApps(collectedApps);
  const rankedApps = rankAppsByRelevance(uniqueApps, payload);
  const normalizedApps = normalizeCatalogResults(rankedApps, payload);

  return normalizedApps.slice(0, 8);
}

function buildSearchQueries(payload) {
  const descripcion = payload.descripcion || "";
  const areaUso = payload.areaUso || "";
  const resultadoEsperado = payload.resultadoEsperado || "";
  const restricciones = payload.restricciones || "";

  const semanticKeywords = extractUsefulKeywords(descripcion);

  const queries = [
    ...semanticKeywords,
    descripcion,
    `${areaUso} ${resultadoEsperado}`.trim(),
    areaUso,
    resultadoEsperado,
    restricciones,
  ];

  return queries
    .map((query) => String(query).trim())
    .filter(Boolean)
    .filter((query) => query.length >= 3)
    .filter((query, index, arr) => arr.indexOf(query) === index);
}

function extractUsefulKeywords(text) {
  const cleanText = normalizeText(text);

    if (isMultiModelChatText(cleanText)) {
    return [
      "chat multimodelo comparar modelos IA",
      "multi model chat ChatGPT Claude Gemini",
      "comparar respuestas ChatGPT Claude Gemini",
      "chat privado memoria modelos IA",
      "AI chat multiple models private memory",
    ];
  }

  const isSocialPublishing = includesAny(cleanText, [
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

  const isAutomationIntent = includesAny(cleanText, [
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
    return [
      "automatización redes sociales",
      "programar publicaciones redes sociales",
      "marketing contenido redes sociales",
      "social media scheduling",
      "content automation",
    ];
  }

  const keywordMap = [
    {
  terms: [
    "anuncio",
    "anuncios",
    "ads",
    "publicidad",
    "publicitario",
    "publicitaria",
    "publicitarias",
    "campaña",
    "campañas",
    "campana",
    "campanas",
    "meta ads",
    "facebook ads",
    "instagram ads",
    "paid ads",
    "paid media",
    "marketing pagado",
    "creativos publicitarios",
    "ad creatives",
    "ad copy",
    "performance marketing",
  ],
  queries: [
    "publicidad anuncios campañas IA",
    "crear anuncios Meta Ads Facebook Instagram",
    "generar campañas publicitarias con IA",
    "paid media ad creatives marketing pagado",
    "automatización de anuncios publicidad digital",
  ],
},
        {
      terms: [
        "prueba",
        "pruebas",
        "unitaria",
        "unitarias",
        "unit test",
        "unit tests",
        "testing",
        "test",
        "tests",
        "qa",
        "quality assurance",
        "cobertura",
        "coverage",
        "java",
        "codigo",
        "código",
        "code",
        "legacy",
      ],
      queries: [
        "pruebas unitarias código IA",
        "unit tests Java testing agent",
        "automatizar pruebas unitarias",
        "generar tests código",
        "QA testing código",
      ],
    },
    {
      terms: [
        "video",
        "videos",
        "clip",
        "clips",
        "reels",
        "shorts",
        "subtitulo",
        "subtitulos",
        "subtítulos",
        "editar",
        "edicion",
        "edición",
      ],
      queries: ["video clips subtítulos edición", "edición de video IA"],
    },
    {
      terms: [
        "pdf",
        "documento",
        "documentos",
        "resumen",
        "resumir",
        "texto",
        "leer",
        "extraer",
      ],
      queries: ["resumen documentos pdf", "chat documentos pdf"],
    },
    {
      terms: [
        "marketing",
        "seo",
        "campaña",
        "campana",
        "publicidad",
        "contenido",
        "linkedin",
        "redes",
      ],
      queries: ["marketing seo contenido", "marketing redes sociales"],
    },
    {
      terms: [
        "imagen",
        "imagenes",
        "imágenes",
        "diseño",
        "diseno",
        "visual",
        "redes sociales",
        "post",
        "publicacion",
        "publicación",
      ],
      queries: ["imagen diseño redes sociales", "generador imágenes diseño"],
    },
    {
      terms: [
        "codigo",
        "código",
        "programar",
        "programacion",
        "programación",
        "desarrollo",
        "javascript",
        "python",
      ],
      queries: ["codificación programación código", "asistente programación IA"],
    },
    {
      terms: [
        "excel",
        "datos",
        "analisis",
        "análisis",
        "csv",
        "tabla",
        "base de datos",
      ],
      queries: ["análisis de datos excel", "datos excel IA"],
    },
    {
      terms: [
        "audio",
        "voz",
        "transcribir",
        "transcripcion",
        "transcripción",
        "podcast",
      ],
      queries: ["audio transcripción voz", "transcribir audio IA"],
    },
    {
      terms: [
        "automatizar",
        "automatizacion",
        "automatización",
        "flujo",
        "tareas",
        "procesos",
      ],
      queries: ["automatización productividad procesos", "workflow automation"],
    },
  ];

  const match = keywordMap.find((item) =>
    item.terms.some((term) => cleanText.includes(normalizeText(term)))
  );

  return match?.queries || [text];
}

function rankAppsByRelevance(apps, payload) {
  const isSocialPublishingIntent =
  isSocialPublishingAutomationIntent(payload) && !isPaidAdvertisingIntent(payload);

  return apps
    .map((app) => ({
      ...app,
      _queesiaScore: calculateAppScore(app, payload),
      _isPaidAdsOnly: isSocialPublishingIntent
        ? isPaidAdsFocusedWithoutPublishingSignal(app)
        : false,
    }))
    .filter((app) => app._queesiaScore >= 4)
    .filter((app) => {
      if (!isSocialPublishingIntent) return true;

      // Para búsquedas de publicaciones orgánicas, quitamos apps claramente
      // centradas solo en anuncios/publicidad pagada.
      return !app._isPaidAdsOnly;
    })
    .sort((a, b) => b._queesiaScore - a._queesiaScore);
}

function calculateAppScore(app, payload) {
  const appText = normalizeText(
  [
    app.name,
    app.category,
    app.short_description,
    app.description,
    app.what_is,
    app.purpose,
    app.use_cases,
    app.main_advantages,
    app.long_description,
    app.search_profile,
    Array.isArray(app.tags) ? app.tags.join(" ") : app.tags,
  ]
    .filter(Boolean)
    .join(" ")
);

  const userText = normalizeText(
    [
      payload.descripcion,
      payload.areaUso,
      payload.resultadoEsperado,
      payload.restricciones,
    ]
      .filter(Boolean)
      .join(" ")
  );

  const intentTerms = getIntentTerms(payload);
    let score = 0;

    // Aprovecha el puntaje calculado por la API del catálogo.
    // Esto ayuda a respetar el orden basado en search_profile.
    const apiRelevanceScore = Number(app.relevance_score || 0);

    if (!Number.isNaN(apiRelevanceScore) && apiRelevanceScore > 0) {
      score += Math.min(apiRelevanceScore, 300) * 0.12;
    }

  // Coincidencia directa por intención.
  for (const term of intentTerms) {
    if (appText.includes(normalizeText(term))) {
      score += 4;
    }
  }

  // Coincidencia con categoría esperada.
  if (
    payload.areaUso &&
    app.category &&
    normalizeText(app.category).includes(normalizeText(payload.areaUso))
  ) {
    score += 6;
  }

  // Coincidencia con resultado esperado.
  if (
    payload.resultadoEsperado &&
    appText.includes(normalizeText(payload.resultadoEsperado))
  ) {
    score += 4;
  }

  // Coincidencia general por categoría del catálogo.
const categoryTerms = getCategoryTerms(app.category);

for (const term of categoryTerms) {
  if (appText.includes(normalizeText(term)) && userText.includes(normalizeText(term))) {
    score += 3;
  }
}

const matchedCategoryTerms = categoryTerms.filter((term) =>
  userText.includes(normalizeText(term))
);

if (matchedCategoryTerms.length > 0) {
  score += Math.min(matchedCategoryTerms.length * 2, 10);
}

// Ajuste especial para intención de publicidad, anuncios y campañas pagadas.
if (isPaidAdvertisingIntent(payload)) {
  const paidAdvertisingTerms = getPaidAdvertisingIntentTerms();

  for (const term of paidAdvertisingTerms) {
    if (appText.includes(normalizeText(term))) {
      score += 4;
    }
  }

  const hasStrongPaidAdsSignal = paidAdvertisingTerms.some((term) =>
    appText.includes(normalizeText(term))
  );

  if (hasStrongPaidAdsSignal) {
    score += 10;
  }

  if (
    appText.includes("advivi") ||
    appText.includes("meta ads") ||
    appText.includes("facebook ads") ||
    appText.includes("instagram ads") ||
    appText.includes("paid media") ||
    appText.includes("marketing pagado")
  ) {
    score += 12;
  }

  if (
    normalizeText(app.category || "").includes("publicidad") ||
    normalizeText(app.category || "").includes("marketing")
  ) {
    score += 6;
  }
}

   // Ajuste especial para búsquedas de publicaciones orgánicas en redes sociales.
  if (isSocialPublishingAutomationIntent(payload)) {
    const positiveTerms = getPositiveSocialPublishingTerms();
    const paidAdsTerms = getPaidAdsTerms();

    for (const term of positiveTerms) {
      if (appText.includes(normalizeText(term))) {
        score += 3;
      }
    }

    const hasStrongOrganicSignal = positiveTerms.some((term) =>
      appText.includes(normalizeText(term))
    );

    const hasPaidAdsSignal = paidAdsTerms.some((term) =>
      appText.includes(normalizeText(term))
    );

    if (hasStrongOrganicSignal) {
      score += 5;
    }

    if (hasPaidAdsSignal && !hasStrongOrganicSignal) {
      score -= 6;
    }

    if (hasPaidAdsSignal && hasStrongOrganicSignal) {
      score -= 2;
    }
  }

    // Ajuste especial para intención de pruebas, testing y QA en código.
  if (isCodeTestingIntent(payload)) {
    const testingTerms = getCodeTestingTerms();

    for (const term of testingTerms) {
      if (appText.includes(normalizeText(term))) {
        score += 4;
      }
    }

    const hasStrongTestingSignal = testingTerms.some((term) =>
      appText.includes(normalizeText(term))
    );

    if (hasStrongTestingSignal) {
      score += 8;
    }

    if (
      appText.includes("java") &&
      includesAny(userText, ["java", "unit tests", "pruebas unitarias"])
    ) {
      score += 6;
    }

    if (
      appText.includes("testing agent") ||
      appText.includes("diffblue") ||
      appText.includes("cobertura de codigo") ||
      appText.includes("cobertura de código")
    ) {
      score += 10;
    }
  }

    // Ajuste especial para Chat multimodelo, comparación de modelos,
  // memoria entre modelos y privacidad.
  if (isMultiModelChatIntent(payload)) {
    const multiModelTerms = getMultiModelChatTerms();
    const strongMultiModelTerms = getStrongMultiModelChatTerms();
    const genericPenaltyTerms = getGenericChatPenaltyTerms();

    for (const term of multiModelTerms) {
      if (appText.includes(normalizeText(term))) {
        score += 4;
      }
    }

    const hasStrongMultiModelSignal = strongMultiModelTerms.some((term) =>
      appText.includes(normalizeText(term))
    );

    const hasGenericPenaltySignal = genericPenaltyTerms.some((term) =>
      appText.includes(normalizeText(term))
    );

    if (hasStrongMultiModelSignal) {
      score += 12;
    }

    if (normalizeText(app.category || "").includes("chat")) {
      score += 8;
    }

    // Apps que, por las pruebas actuales, sí encajan mejor con chat multimodelo.
    if (
      appText.includes("chatplayground") ||
      appText.includes("anuma") ||
      appText.includes("nottoai")
    ) {
      score += 18;
    }

    if (appText.includes("t3 chat")) {
      score += 10;
    }

    // Baja apps de chat demasiado específicas o genéricas cuando no muestran
    // señal clara de multimodelo, comparación, memoria o privacidad.
    if (hasGenericPenaltySignal && !hasStrongMultiModelSignal) {
      score -= 10;
    }

    if (
      appText.includes("chatgpt gov") ||
      appText.includes("agencias gubernamentales") ||
      appText.includes("gubernamentales")
    ) {
      score -= 14;
    }
  }


  // Coincidencia por palabras relevantes del usuario.
  const userKeywords = extractUserKeywords(userText);

  for (const keyword of userKeywords) {
    if (appText.includes(keyword)) {
      score += 2;
    }
  }

  // Bonificación si tiene descripción útil.
  if (app.short_description && app.short_description.length > 30) {
    score += 1;
  }

  return score;
}

function getIntentTerms(payload) {
  const area = payload.areaUso || "";
  const result = payload.resultadoEsperado || "";
  const description = normalizeText(payload.descripcion || "");

  if (area === "Chat" || isMultiModelChatIntent(payload)) {
    return getMultiModelChatTerms();
  }

  const isSocialPublishing = includesAny(description, [
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

const isAutomationIntent = includesAny(description, [
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
  return [
    "automatizar",
    "automatización",
    "automatizacion",
    "publicaciones",
    "publicacion",
    "publicación",
    "redes sociales",
    "social media",
    "marketing",
    "contenido",
    "posts",
    "schedule",
    "scheduling",
    "content",
    "automation",
  ];
}

  if (area === "Video" || result === "Video") {
    return [
      "video",
      "videos",
      "clip",
      "clips",
      "subtítulos",
      "subtitulos",
      "edición de video",
      "edicion de video",
      "reels",
      "shorts",
      "tiktok",
      "youtube",
    ];
  }

  if (area === "Imagen" || result === "Imagen") {
    return [
      "imagen",
      "imagenes",
      "imágenes",
      "diseño",
      "diseno",
      "visual",
      "redes sociales",
      "generar imágenes",
      "crear imágenes",
      "arte",
    ];
  }

  if (area === "Productividad" || result === "Resumen") {
    return [
      "documento",
      "documentos",
      "pdf",
      "resumen",
      "resumir",
      "texto",
      "leer",
      "extraer",
      "productividad",
    ];
  }

  if (area === "Marketing") {
    return [
      "marketing",
      "seo",
      "contenido",
      "publicidad",
      "campañas",
      "campanas",
      "redes sociales",
      "linkedin",
      "social media",
    ];
  }

  const isTestingCodeIntent = includesAny(description, [
  "prueba",
  "pruebas",
  "unitaria",
  "unitarias",
  "unit test",
  "unit tests",
  "testing",
  "test",
  "tests",
  "qa",
  "quality assurance",
  "cobertura",
  "coverage",
  "java testing",
  "legacy code",
]);

if (isTestingCodeIntent) {
  return [
    "pruebas unitarias",
    "prueba unitaria",
    "unit tests",
    "unit testing",
    "testing",
    "testing agent",
    "qa",
    "quality assurance",
    "cobertura de código",
    "code coverage",
    "java",
    "java testing",
    "automatizar pruebas",
    "generar pruebas",
    "generar tests",
    "crear pruebas",
    "código",
    "codigo",
    "code",
    "legacy code",
    "ci/cd",
    "devops",
  ];
}

if (area === "Programación" || result === "Código") {
  return [
    "código",
    "codigo",
    "programación",
    "programacion",
    "desarrollo",
    "developer",
    "javascript",
    "python",
    "script",
    "codificación",
    "testing",
    "pruebas",
    "unit tests",
    "qa",
  ];
}

  if (area === "Datos" || result === "Análisis de datos") {
    return [
      "datos",
      "excel",
      "csv",
      "tabla",
      "análisis",
      "analisis",
      "dashboard",
      "visualización",
      "base de datos",
    ];
  }

  if (area === "Audio" || result === "Audio") {
    return [
      "audio",
      "voz",
      "transcripción",
      "transcripcion",
      "transcribir",
      "podcast",
      "speech",
    ];
  }

  if (
    description.includes("automatizar") ||
    description.includes("automatizacion") ||
    description.includes("automatización")
  ) {
    return [
      "automatización",
      "automatizacion",
      "automatizar",
      "workflow",
      "flujo",
      "procesos",
      "productividad",
    ];
  }

  return [];
}

function isMultiModelChatIntent(payload) {
  const text = [
    payload.descripcion,
    payload.areaUso,
    payload.resultadoEsperado,
    payload.restricciones,
  ]
    .filter(Boolean)
    .join(" ");

  return normalizeText(payload.areaUso || "") === "chat" || isMultiModelChatText(text);
}

function isMultiModelChatText(text) {
  const value = normalizeText(text || "");

  const hasDirectMultiModelIntent = includesAny(value, [
    "chat multimodelo",
    "multi-model chat",
    "multimodelo",
    "multi model",
    "multi-model",
    "varios modelos",
    "multiples modelos",
    "múltiples modelos",
    "modelos de ia en un solo chat",
    "ai chat multiple models",
  ]);

  const hasModelNames = includesAny(value, [
    "chatgpt",
    "claude",
    "gemini",
    "perplexity",
    "llama",
    "mistral",
    "gpt-4",
    "gpt-5",
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
    "memoria unificada",
    "chat privado",
    "privacidad en chat",
    "privacidad en chat ia",
    "modo privado",
    "private memory",
  ]);

  return (
    hasDirectMultiModelIntent ||
    hasPrivacyOrMemoryIntent ||
    (hasModelNames && hasComparisonIntent)
  );
}

function getMultiModelChatTerms() {
  return [
    "chat",
    "chatbot",
    "llm",
    "modelo",
    "modelos",
    "multimodelo",
    "multi modelo",
    "multi-model",
    "multi model",
    "varios modelos",
    "multiples modelos",
    "múltiples modelos",
    "chatgpt",
    "claude",
    "gemini",
    "perplexity",
    "gpt-4",
    "gpt-5",
    "comparar respuestas",
    "comparar modelos",
    "memoria",
    "memoria unificada",
    "memoria entre modelos",
    "privado",
    "modo privado",
    "private",
    "todo-en-uno",
    "todo en uno",
  ];
}

function getStrongMultiModelChatTerms() {
  return [
    "multimodelo",
    "multi modelo",
    "multi-model",
    "multi model",
    "varios modelos",
    "multiples modelos",
    "múltiples modelos",
    "chatgpt claude",
    "claude",
    "gemini",
    "perplexity",
    "comparar respuestas",
    "comparar modelos",
    "modelos en una sola plataforma",
    "una sola interfaz",
    "todo-en-uno",
    "todo en uno",
    "memoria unificada",
    "memoria entre modelos",
    "modo privado",
    "private memory",
  ];
}

function getGenericChatPenaltyTerms() {
  return [
    "soporte al cliente",
    "atención al cliente",
    "atencion al cliente",
    "ventas",
    "leads",
    "slack",
    "chatbot sin código",
    "chatbot sin codigo",
    "sin código",
    "sin codigo",
    "agencias gubernamentales",
    "gubernamentales",
  ];
}

function isPaidAdvertisingIntent(payload) {
  const text = normalizeText(
    [
      payload.descripcion,
      payload.areaUso,
      payload.resultadoEsperado,
      payload.restricciones,
    ]
      .filter(Boolean)
      .join(" ")
  );

  return includesAny(text, [
    "anuncio",
    "anuncios",
    "ads",
    "publicidad",
    "publicitario",
    "publicitaria",
    "publicitarias",
    "campaña",
    "campañas",
    "campana",
    "campanas",
    "meta ads",
    "facebook ads",
    "instagram ads",
    "paid ads",
    "paid media",
    "marketing pagado",
    "creativos publicitarios",
    "ad creatives",
    "ad copy",
    "performance marketing",
  ]);
}

function getPaidAdvertisingIntentTerms() {
  return [
    "publicidad",
    "anuncios",
    "anuncio",
    "ads",
    "campañas publicitarias",
    "campanas publicitarias",
    "campañas",
    "campanas",
    "publicitario",
    "publicitaria",
    "publicitarias",
    "meta ads",
    "facebook ads",
    "instagram ads",
    "paid ads",
    "paid media",
    "marketing pagado",
    "performance marketing",
    "creativos publicitarios",
    "ad creatives",
    "ad copy",
    "generar campañas",
    "crear campañas",
    "crear anuncios",
    "generar anuncios",
    "automatización de anuncios",
    "automatizacion de anuncios",
    "publicidad digital",
  ];
}

function getCategoryTerms(category) {
  const normalizedCategory = normalizeText(category || "");

  const categoryMap = {
    deteccion: [
      "detectar",
      "detección",
      "deteccion",
      "identificar",
      "clasificar",
      "análisis",
      "analisis",
    ],
    publicidad: [
      "publicidad",
      "anuncios",
      "ads",
      "campañas",
      "campanas",
      "meta ads",
      "facebook ads",
      "instagram ads",
      "paid media",
      "marketing pagado",
      "creativos publicitarios",
    ],
    audio: [
      "audio",
      "voz",
      "transcripción",
      "transcripcion",
      "transcribir",
      "podcast",
      "speech",
    ],
    automatizacion: [
      "automatizar",
      "automatización",
      "automatizacion",
      "workflow",
      "flujo",
      "tareas",
      "procesos",
      "agentes",
    ],
    "inteligencia de negocios": [
      "inteligencia de negocios",
      "business intelligence",
      "bi",
      "dashboard",
      "datos",
      "analítica",
      "analitica",
      "reportes",
    ],
        chat: [
      "chat",
      "chatbot",
      "llm",
      "modelo",
      "modelos",
      "multimodelo",
      "multi modelo",
      "multi-model",
      "multi model",
      "varios modelos",
      "multiples modelos",
      "múltiples modelos",
      "chatgpt",
      "claude",
      "gemini",
      "perplexity",
      "gpt",
      "gpt-4",
      "gpt-5",
      "memoria",
      "memoria unificada",
      "memoria entre modelos",
      "privado",
      "modo privado",
      "todo-en-uno",
      "todo en uno",
      "comparar respuestas",
      "comparar modelos",
      "conversación",
      "conversacion",
    ],
    codificacion: [
      "código",
      "codigo",
      "codificación",
      "codificacion",
      "programación",
      "programacion",
      "developer",
      "devtools",
      "testing",
      "qa",
      "unit tests",
      "java",
      "python",
      "javascript",
    ],
    "marketing de contenidos": [
      "marketing de contenidos",
      "contenido",
      "posts",
      "publicaciones",
      "blog",
      "redes sociales",
      "social media",
      "calendario editorial",
      "content marketing",
    ],
    redaccion: [
      "redacción",
      "redaccion",
      "escribir",
      "copywriting",
      "texto",
      "contenido",
      "documentos",
    ],
    citas: [
      "citas",
      "agenda",
      "reservas",
      "calendario",
      "booking",
      "programar cita",
    ],
    gestion: [
      "gestión",
      "gestion",
      "administrar",
      "organizar",
      "crm",
      "proyectos",
      "operaciones",
    ],
    "generacion de diseno": [
      "generación de diseño",
      "generacion de diseno",
      "diseño",
      "diseno",
      "branding",
      "visual",
      "mockup",
    ],
    educacion: [
      "educación",
      "educacion",
      "aprender",
      "enseñanza",
      "ensenanza",
      "curso",
      "estudiantes",
      "tutor",
    ],
    juegos: [
      "juegos",
      "gaming",
      "game",
      "videojuegos",
      "npc",
      "desarrollo de juegos",
    ],
    "generacion de arte": [
      "generación de arte",
      "generacion de arte",
      "arte",
      "imagen",
      "ilustración",
      "ilustracion",
      "dibujo",
    ],
    "generacion de texto": [
      "generación de texto",
      "generacion de texto",
      "texto",
      "redacción",
      "redaccion",
      "escribir",
      "copy",
      "contenido",
    ],
    "generacion de video": [
      "generación de video",
      "generacion de video",
      "video",
      "videos",
      "crear video",
      "generar video",
      "clips",
      "reels",
      "shorts",
    ],
    "entrenamiento de modelos": [
      "entrenamiento de modelos",
      "modelo",
      "modelos",
      "fine tuning",
      "dataset",
      "machine learning",
      "ml",
      "training",
    ],
    "diseno grafico": [
      "diseño gráfico",
      "diseno grafico",
      "diseño",
      "diseno",
      "gráfico",
      "grafico",
      "visual",
      "branding",
    ],
    "edicion de imagenes": [
      "edición de imágenes",
      "edicion de imagenes",
      "imagen",
      "imagenes",
      "foto",
      "fotografía",
      "fotografia",
      "background",
      "remove background",
      "editar imagen",
    ],
    marketing: [
      "marketing",
      "campañas",
      "campanas",
      "contenido",
      "redes sociales",
      "seo",
      "publicidad",
      "leads",
      "growth",
    ],
    musica: [
      "música",
      "musica",
      "canción",
      "cancion",
      "audio",
      "instrumental",
      "generar música",
      "generar musica",
    ],
    "plataformas sin codigo": [
      "plataformas sin código",
      "plataformas sin codigo",
      "no-code",
      "nocode",
      "sin código",
      "sin codigo",
      "app builder",
      "automatización",
    ],
    podcasting: [
      "podcast",
      "podcasting",
      "audio",
      "voz",
      "transcripción",
      "transcripcion",
      "episodios",
    ],
    productividad: [
      "productividad",
      "documentos",
      "pdf",
      "resumen",
      "resumir",
      "tareas",
      "notas",
      "organización",
      "organizacion",
    ],
    bienestar: [
      "bienestar",
      "salud",
      "mental",
      "fitness",
      "hábitos",
      "habitos",
      "meditación",
      "meditacion",
    ],
    reclutamiento: [
      "reclutamiento",
      "recursos humanos",
      "rrhh",
      "talento",
      "cv",
      "entrevistas",
      "contratación",
      "contratacion",
    ],
    seo: [
      "seo",
      "posicionamiento",
      "keywords",
      "palabras clave",
      "contenido",
      "tráfico",
      "trafico",
      "ranking",
    ],
    "redes sociales": [
      "redes sociales",
      "social media",
      "posts",
      "publicaciones",
      "instagram",
      "facebook",
      "linkedin",
      "twitter",
      "x",
      "tiktok",
    ],
    "texto a video": [
      "texto a video",
      "text to video",
      "video",
      "generar video",
      "crear video",
      "prompt a video",
    ],
    "texto a voz": [
      "texto a voz",
      "text to speech",
      "voz",
      "audio",
      "narración",
      "narracion",
      "voiceover",
    ],
    traduccion: [
      "traducción",
      "traduccion",
      "traducir",
      "idiomas",
      "translation",
      "localización",
      "localizacion",
    ],
    "edicion de video": [
      "edición de video",
      "edicion de video",
      "video",
      "clips",
      "reels",
      "shorts",
      "subtítulos",
      "subtitulos",
      "cortar video",
      "editar video",
    ],
  };

  return categoryMap[normalizedCategory] || [];
}

function isCodeTestingIntent(payload) {
  const text = normalizeText(
    [
      payload.descripcion,
      payload.areaUso,
      payload.resultadoEsperado,
      payload.restricciones,
    ]
      .filter(Boolean)
      .join(" ")
  );

  return includesAny(text, [
    "prueba",
    "pruebas",
    "unitaria",
    "unitarias",
    "unit test",
    "unit tests",
    "testing",
    "test",
    "tests",
    "qa",
    "quality assurance",
    "cobertura",
    "coverage",
    "java testing",
    "legacy code",
  ]);
}

function getCodeTestingTerms() {
  return [
    "pruebas unitarias",
    "prueba unitaria",
    "unit tests",
    "unit testing",
    "testing",
    "testing agent",
    "qa",
    "quality assurance",
    "cobertura de código",
    "cobertura de codigo",
    "code coverage",
    "java",
    "java testing",
    "automatizar pruebas",
    "generar pruebas",
    "crear pruebas",
    "generar tests",
    "crear tests",
    "legacy code",
    "ci/cd",
    "devops",
  ];
}

function isSocialPublishingAutomationIntent(payload) {
  const description = normalizeText(payload.descripcion || "");
  const area = normalizeText(payload.areaUso || "");
  const result = normalizeText(payload.resultadoEsperado || "");

  const hasSocialPublishingTerms = includesAny(description, [
    "publicaciones",
    "publicacion",
    "posts",
    "redes sociales",
    "social media",
    "linkedin",
    "instagram",
    "facebook",
    "tiktok",
    "twitter",
    "x",
  ]);

  const hasAutomationTerms = includesAny(description, [
    "automatizar",
    "automatizacion",
    "programar",
    "calendarizar",
    "agendar",
    "planificar",
    "publicar",
  ]);

  return (
    hasSocialPublishingTerms &&
    (hasAutomationTerms ||
      area.includes("marketing") ||
      result.includes("automatizacion"))
  );
}

function getPositiveSocialPublishingTerms() {
  return [
    "publicaciones",
    "publicacion",
    "posts",
    "post",
    "redes sociales",
    "social media",
    "content calendar",
    "calendar",
    "schedule",
    "scheduling",
    "programar",
    "calendarizar",
    "planificar",
    "content planning",
    "content planner",
    "linkedin",
    "instagram",
    "facebook",
    "twitter",
    "x",
    "contenido",
    "marketing de contenidos",
  ];
}

function getPaidAdsTerms() {
  return [
    "ads",
    "ad",
    "anuncio",
    "anuncios",
    "publicidad",
    "publicitarias",
    "publicitario",
    "campañas pagadas",
    "campanas pagadas",
    "paid ads",
    "meta ads",
    "facebook ads",
    "google ads",
    "ugc ads",
    "creativos publicitarios",
  ];
}

function isPaidAdsFocusedWithoutPublishingSignal(app) {
  const appText = normalizeText(
  [
    app.name,
    app.category,
    app.short_description,
    app.description,
    app.what_is,
    app.purpose,
    app.use_cases,
    app.main_advantages,
    app.long_description,
    app.search_profile,
    Array.isArray(app.tags) ? app.tags.join(" ") : app.tags,
  ]
    .filter(Boolean)
    .join(" ")
);

  const paidAdsTerms = getPaidAdsTerms();

  const organicPublishingTerms = [
    "publicaciones",
    "publicacion",
    "posts",
    "post",
    "redes sociales",
    "social media",
    "programar publicaciones",
    "programacion de publicaciones",
    "programación de publicaciones",
    "calendarizar",
    "calendario de contenido",
    "content calendar",
    "content planning",
    "content planner",
    "schedule posts",
    "scheduling posts",
    "social media management",
    "gestionar redes sociales",
    "gestion de redes sociales",
    "gestión de redes sociales",
  ];

  const hasPaidAdsSignal = paidAdsTerms.some((term) =>
    appText.includes(normalizeText(term))
  );

  const hasOrganicPublishingSignal = organicPublishingTerms.some((term) =>
    appText.includes(normalizeText(term))
  );

  return hasPaidAdsSignal && !hasOrganicPublishingSignal;
}


function extractUserKeywords(text) {
  const stopwords = new Set([
    "para",
    "con",
    "una",
    "uno",
    "unas",
    "unos",
    "que",
    "quiero",
    "necesito",
    "busco",
    "herramientas",
    "herramienta",
    "apps",
    "app",
    "ia",
    "inteligencia",
    "artificial",
    "crear",
    "generar",
    "hacer",
    "usar",
    "por",
    "del",
    "los",
    "las",
    "mis",
    "tus",
    "sus",
  ]);

  return text
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length >= 4)
    .filter((word) => !stopwords.has(word))
    .slice(0, 12);
}

function normalizeCatalogResults(apps, payload) {
  return apps.map((app, index) => {
    const appId = app.id || app.app_id || app.appId;
    const categoria = app.category || app.categoria || "IA aplicada";
    const description = getBestDescription(app);

    return {
      appId,
      nombre: app.name || app.nombre || "App sin nombre",
      categoria,
      afinidad: getAffinity(app, payload, index),
      razon: buildReason(description, categoria),
      url: appId ? `/app/${appId}/` : "/catalogo",
      logoFilename: app.logo_filename || null,
      raw: app,
    };
  });
}

function getBestDescription(app) {
  return (
    app.short_description ||
    app.description ||
    app.what_is ||
    app.purpose ||
    app.long_description ||
    ""
  );
}

function buildReason(description, categoria) {
  if (description && description.trim().length > 20) {
    return description.trim();
  }

  return `Esta herramienta aparece relacionada con la categoría ${categoria} y puede ser útil para explorar soluciones de inteligencia artificial vinculadas con tu búsqueda.`;
}

function getAffinity(app, payload, index = 0) {
  const score = Number(app._queesiaScore || 0);

  // Evita que todas las recomendaciones aparezcan como "Alta".
  // Solo las primeras 3 pueden ser Alta si además superan el umbral.
  if (index <= 2 && score >= 45) return "Alta";

  if (score >= 25) return "Media";

  return "Exploratoria";
}

function deduplicateApps(apps) {
  const seen = new Set();

  return apps.filter((app) => {
    const id = app.id || app.app_id || app.appId || app.name;

    if (!id || seen.has(id)) {
      return false;
    }

    seen.add(id);
    return true;
  });
}

function normalizeText(text) {
  return String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function includesAny(text, terms) {
  return terms.some((term) => text.includes(normalizeText(term)));
}