import React, { useEffect, useMemo, useRef, useState } from "react";

const INITIAL_MESSAGES = [
  {
    id: "bot-welcome-1",
    sender: "bot",
    type: "text",
    text: "¡Hola! 👋 Soy QueesiaBot. Te ayudo a encontrar apps de IA dentro del catálogo de Queesia.",
  },
  {
    id: "bot-welcome-2",
    sender: "bot",
    type: "text",
    text: "Cuéntame qué quieres hacer. Puedes escribirlo libremente o usar una de las sugerencias para empezar.",
  },
];

const SUGGESTIONS = [
  {
    id: "video-clips",
    label: "Clips cortos con subtítulos",
    prompt:
      "Necesito una IA para hacer clips cortos con subtítulos a partir de videos largos para TikTok, Instagram Reels o YouTube Shorts.",
    preset: {
      areaUso: "Video",
      resultadoEsperado: "Video",
      preferenciaPrecio: "Cualquiera",
    },
  },
  {
    id: "social-images",
    label: "Imágenes para redes sociales",
    prompt:
      "Quiero una IA para crear imágenes o diseños para redes sociales de forma rápida y con buena calidad visual.",
    preset: {
      areaUso: "Imagen",
      resultadoEsperado: "Imagen",
      preferenciaPrecio: "Cualquiera",
    },
  },
  {
    id: "documents-summary",
    label: "Resumir documentos o PDFs",
    prompt:
      "Busco una IA para resumir documentos, PDFs o textos largos y extraer las ideas principales.",
    preset: {
      areaUso: "Productividad",
      resultadoEsperado: "Resumen",
      preferenciaPrecio: "Cualquiera",
    },
  },
];

const REFINEMENT_CHIPS = [
  {
    id: "free",
    label: "Gratis / freemium",
    prompt: "Además, prefiero opciones gratis o freemium.",
    preset: {
      preferenciaPrecio: "Gratis",
    },
  },
  {
    id: "spanish",
    label: "Que funcione en español",
    prompt: "También necesito que funcione bien en español.",
    preset: {
      restricciones: "Que funcione bien en español.",
    },
  },
  {
    id: "easy",
    label: "Fácil de usar",
    prompt: "Prefiero herramientas fáciles de usar para principiantes.",
    preset: {
      nivelUsuario: "Principiante",
    },
  },
];

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
  General: [
    {
      appId: 786,
      nombre: "Meroid",
      categoria: "Marketing",
      afinidad: "Media",
      razon:
        "Puede apoyar tareas de marketing digital, contenido SEO, análisis web y automatización de campañas.",
      url: "/app/786/",
    },
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
  ],
};

export default function QueesiaAppFinder() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [payloadPreview, setPayloadPreview] = useState(null);
  const [lastNeed, setLastNeed] = useState("");

  const chatEndRef = useRef(null);

  const consultasRestantes = 3;

  const hasUserMessages = useMemo(() => {
    return messages.some((message) => message.sender === "user");
  }, [messages]);

  useEffect(() => {
    if (!isOpen) return;
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isTyping, isOpen]);

  const handleSuggestionClick = (suggestion) => {
    processUserMessage(suggestion.prompt, suggestion.preset, suggestion.prompt);
  };

  const handleRefinementClick = (chip) => {
    const baseText = lastNeed ? `${lastNeed} ${chip.prompt}` : chip.prompt;
    processUserMessage(baseText, chip.preset, chip.label);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (isTyping) return;

    const cleanValue = inputValue.trim();

    if (!cleanValue) return;

    processUserMessage(cleanValue);
  };

  const processUserMessage = (rawText, preset = {}, displayText = null) => {
    const cleanText = rawText.trim();

    if (!cleanText) return;

    const textToShow = displayText || cleanText;
    const payload = buildPayload(cleanText, preset);
    const results = getMockResults(payload);

    setInputValue("");
    setLastNeed(cleanText);
    setPayloadPreview(payload);

    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: "user",
        type: "text",
        text: textToShow,
      },
    ]);

    setIsTyping(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-understood-${Date.now()}`,
          sender: "bot",
          type: "text",
          text: `Entendido. Buscaré herramientas relacionadas con: “${payload.descripcion}”.`,
        },
      ]);
    }, 450);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-results-${Date.now()}`,
          sender: "bot",
          type: "results",
          text: "Encontré algunas apps que podrían ayudarte 👇",
          results,
        },
      ]);

      setIsTyping(false);
    }, 1200);
  };

  const handleReset = () => {
    setMessages(INITIAL_MESSAGES);
    setInputValue("");
    setIsTyping(false);
    setPayloadPreview(null);
    setLastNeed("");
  };

  return (
    <>
      <section className="mx-auto flex min-h-[calc(100vh-180px)] max-w-5xl flex-col items-center justify-center px-4 py-16 text-center text-white">
        <span className="inline-flex rounded-full border border-lime-300/30 bg-lime-300/10 px-4 py-1 text-sm text-lime-200">
          Queesia App Finder
        </span>

        <h1 className="mt-5 text-3xl font-semibold tracking-tight md:text-5xl">
          Encuentra la app de IA que necesitas
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-white/70 md:text-base">
          Abre QueesiaBot, describe lo que quieres resolver y recibe
          recomendaciones de herramientas de inteligencia artificial del
          catálogo.
        </p>

        <p className="mt-3 text-sm text-lime-200">
          Consultas disponibles: {consultasRestantes}
        </p>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="mt-8 rounded-2xl bg-lime-300 px-6 py-3 text-sm font-semibold text-black transition hover:bg-lime-200"
        >
          Abrir QueesiaBot
        </button>

        <div className="mt-8 grid max-w-3xl gap-3 text-left md:grid-cols-3">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion.id}
              type="button"
              onClick={() => {
                setIsOpen(true);
                setTimeout(() => handleSuggestionClick(suggestion), 250);
              }}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white/70 transition hover:border-lime-300/40 hover:bg-white/[0.07] hover:text-white"
            >
              <span className="mb-2 block text-xs text-lime-200">
                Ejemplo
              </span>
              {suggestion.label}
            </button>
          ))}
        </div>
      </section>

      <div className="fixed bottom-5 right-5 z-[9999] md:bottom-6 md:right-6">
        {!isOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group flex items-center gap-3 rounded-full border border-lime-300/30 bg-[#11151d] px-4 py-3 text-white shadow-2xl shadow-black/40 transition hover:border-lime-300/60 hover:bg-[#151b24]"
            aria-label="Abrir QueesiaBot"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-lime-300 text-xl text-black transition group-hover:scale-105">
              🧀
            </span>

            <span className="hidden text-left md:block">
              <span className="block text-sm font-semibold">
                QueesiaBot
              </span>
              <span className="block text-xs text-white/50">
                Encuentra apps de IA
              </span>
            </span>
          </button>
        )}

        {isOpen && (
          <div className="flex h-[74vh] max-h-[680px] w-[calc(100vw-2rem)] max-w-[390px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#11141b] text-white shadow-2xl shadow-black/60 md:h-[680px] md:w-[390px]">
            <div className="flex items-center justify-between border-b border-white/10 bg-[#171c25] px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-lime-300/30 bg-lime-300/10 text-lg">
                  🧀
                </div>

                <div>
                  <h2 className="text-sm font-semibold">
                    QueesiaBot
                  </h2>
                  <p className="flex items-center gap-2 text-xs text-white/50">
                    <span className="h-2 w-2 rounded-full bg-lime-300" />
                    Recomendador de apps IA
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60 transition hover:border-lime-300/40 hover:text-lime-200"
                >
                  Reiniciar
                </button>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-lg text-white/60 transition hover:border-lime-300/40 hover:text-lime-200"
                  aria-label="Cerrar QueesiaBot"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}

                {!hasUserMessages && (
                  <SuggestionCards
                    suggestions={SUGGESTIONS}
                    onSelect={handleSuggestionClick}
                  />
                )}

                {isTyping && <TypingIndicator />}

                {!isTyping && hasUserMessages && (
                  <QuickReplyChips
                    chips={REFINEMENT_CHIPS}
                    onSelect={handleRefinementClick}
                  />
                )}

                {payloadPreview && hasUserMessages && (
                  <details className="rounded-2xl border border-lime-300/20 bg-black/30 p-3">
                    <summary className="cursor-pointer text-xs font-semibold text-lime-200">
                      Vista previa del payload
                    </summary>

                    <pre className="mt-3 max-h-52 overflow-auto whitespace-pre-wrap text-[11px] leading-5 text-white/55">
                      {JSON.stringify(payloadPreview, null, 2)}
                    </pre>
                  </details>
                )}

                <div ref={chatEndRef} />
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="border-t border-white/10 bg-[#171c25] p-3"
            >
              <div className="flex gap-2">
                <textarea
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      handleSubmit(event);
                    }
                  }}
                  rows={1}
                  placeholder="Escribe aquí tu necesidad..."
                  className="min-h-[44px] flex-1 resize-none rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-lime-300/60"
                />

                <button
                  type="submit"
                  disabled={!inputValue.trim() || isTyping}
                  className="rounded-2xl bg-lime-300 px-4 py-3 text-sm font-semibold text-black transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/35"
                >
                  Enviar
                </button>
              </div>

              <p className="mt-2 text-[11px] text-white/35">
                Describe la actividad, resultado esperado y restricciones.
              </p>
            </form>
          </div>
        )}
      </div>
    </>
  );
}

function ChatMessage({ message }) {
  if (message.type === "results") {
    return (
      <div className="flex justify-start">
        <div className="w-full rounded-3xl rounded-tl-md border border-white/10 bg-black/30 p-4">
          <p className="mb-4 text-sm leading-6 text-white/80">
            {message.text}
          </p>

          <div className="grid gap-3">
            {message.results.map((app) => (
              <ResultCard key={app.appId} app={app} />
            ))}
          </div>

          <p className="mt-4 text-xs text-white/40">
            Resultados simulados. Después se conectarán con búsqueda semántica
            real.
          </p>
        </div>
      </div>
    );
  }

  const isBot = message.sender === "bot";

  return (
    <div className={`flex ${isBot ? "justify-start" : "justify-end"}`}>
      <div
        className={[
          "max-w-[88%] rounded-3xl px-4 py-3 text-sm leading-6",
          isBot
            ? "rounded-tl-md border border-white/10 bg-black/30 text-white/75"
            : "rounded-tr-md bg-lime-300 text-black",
        ].join(" ")}
      >
        {message.text}
      </div>
    </div>
  );
}

function SuggestionCards({ suggestions, onSelect }) {
  return (
    <div className="rounded-3xl rounded-tl-md border border-lime-300/15 bg-lime-300/[0.06] p-4">
      <p className="mb-3 text-sm font-medium text-lime-200">
        Puedes empezar con una de estas ideas:
      </p>

      <div className="grid gap-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.id}
            type="button"
            onClick={() => onSelect(suggestion)}
            className="rounded-2xl border border-white/10 bg-black/30 p-3 text-left text-sm leading-5 text-white/75 transition hover:border-lime-300/40 hover:bg-white/[0.06] hover:text-white"
          >
            <span className="mb-1 block text-xs text-lime-200">
              Sugerencia
            </span>
            {suggestion.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function QuickReplyChips({ chips, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <button
          key={chip.id}
          type="button"
          onClick={() => onSelect(chip)}
          className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/65 transition hover:border-lime-300/40 hover:text-lime-200"
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="rounded-3xl rounded-tl-md border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/60">
        QueesiaBot está buscando...
      </div>
    </div>
  );
}

function ResultCard({ app }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-black/40 p-4 transition hover:border-lime-300/40 hover:bg-white/[0.05]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/60">
          {app.categoria}
        </span>

        <span className="rounded-full border border-lime-300/30 bg-lime-300/10 px-3 py-1 text-xs text-lime-200">
          Afinidad {app.afinidad}
        </span>
      </div>

      <h4 className="text-base font-semibold text-white">
        {app.nombre}
      </h4>

      <p className="mt-3 text-sm leading-6 text-white/65">
        {app.razon}
      </p>

      <a
        href={app.url}
        className="mt-4 inline-flex text-sm font-medium text-lime-200 hover:text-lime-100"
      >
        Ver ficha en Queesia →
      </a>
    </article>
  );
}

function buildPayload(text, preset = {}) {
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
    source: "queesia_app_finder_float_chat",
    createdAt: new Date().toISOString(),
  };
}

function inferArea(text) {
  const value = normalizeText(text);

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

  if (includesAny(value, ["video", "clip", "clips", "reels", "shorts"])) {
    return "Video";
  }

  if (includesAny(value, ["imagen", "imagenes", "diseño", "diseno", "visual"])) {
    return "Imagen";
  }

  if (includesAny(value, ["resumen", "resumir", "sintetizar"])) {
    return "Resumen";
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

  if (includesAny(value, ["principiante", "facil", "fácil", "simple", "sencillo"])) {
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

function getMockResults(payload) {
  const area = payload.areaUso || "General";

  if (MOCK_RESULTS_BY_AREA[area]) {
    return MOCK_RESULTS_BY_AREA[area];
  }

  return MOCK_RESULTS_BY_AREA.General;
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