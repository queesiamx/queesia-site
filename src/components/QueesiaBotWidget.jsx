import React, { useEffect, useMemo, useRef, useState } from "react";

import { buildPayload } from "../lib/chatbot/mockRecommendations";
import { recommendApps } from "../lib/chatbot/recommendApps";
import { AuthProvider, useAuth } from "../hooks/useAuth.jsx";

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


export default function QueesiaBotWidget(props) {
  return (
    <AuthProvider>
      <QueesiaBotWidgetInner {...props} />
    </AuthProvider>
  );
}

function QueesiaBotWidgetInner({
  targetId = "catalogo",
  showOnlyWhenTargetVisible = true,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldShowWidget, setShouldShowWidget] = useState(
    !showOnlyWhenTargetVisible
  );
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [payloadPreview, setPayloadPreview] = useState(null);
  const [lastNeed, setLastNeed] = useState("");
  const [dailyLimitReached, setDailyLimitReached] = useState(false);

  const { user, getToken, login } = useAuth();

  const chatEndRef = useRef(null);

  const hasUserMessages = useMemo(() => {
    return messages.some((message) => message.sender === "user");
  }, [messages]);

  useEffect(() => {
  if (!showOnlyWhenTargetVisible) {
    setShouldShowWidget(true);
    return;
  }

  const checkVisibility = () => {
    const target = document.getElementById(targetId);

    if (!target) {
      setShouldShowWidget(false);
      return;
    }

    const rect = target.getBoundingClientRect();
    const viewportHeight =
      window.innerHeight || document.documentElement.clientHeight;

    const targetTop = rect.top + window.scrollY;
    const targetBottom = targetTop + rect.height;
    const currentScroll = window.scrollY;

    const navbarOffset = 120;

    const isInsideCatalog =
      currentScroll + navbarOffset >= targetTop &&
      currentScroll + viewportHeight * 0.45 <= targetBottom;

    setShouldShowWidget(isInsideCatalog);

    if (!isInsideCatalog) {
      setIsOpen(false);
    }
  };

  checkVisibility();

  window.addEventListener("scroll", checkVisibility, { passive: true });
  window.addEventListener("resize", checkVisibility);

  const timeoutId = window.setTimeout(checkVisibility, 600);

  return () => {
    window.removeEventListener("scroll", checkVisibility);
    window.removeEventListener("resize", checkVisibility);
    window.clearTimeout(timeoutId);
  };
}, [targetId, showOnlyWhenTargetVisible]);

  useEffect(() => {
    if (!isOpen) return;
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isTyping, isOpen]);

  const handleSuggestionClick = (suggestion) => {
    if (!user) return;

    processUserMessage(suggestion.prompt, suggestion.preset, suggestion.prompt);
  };

  const handleRefinementClick = (chip) => {
  if (!user) return;

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

  const processUserMessage = async (rawText, preset = {}, displayText = null) => {
  const cleanText = rawText.trim();

  if (!cleanText) return;

  if (!user) {
    login?.();
    return;
  }

  const textToShow = displayText || cleanText;
  const payload = buildPayload(cleanText, preset);

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

  

    try {
      const token = await getToken();

      

      const response = await recommendApps(payload, token);

      

      if (response?.limitReached) {
        setDailyLimitReached(true);
        setPayloadPreview(null);
        setLastNeed("");

        setMessages((current) => [
          ...current.filter(
            (message) =>
              message.type !== "results" &&
              message.type !== "refinements" &&
              message.type !== "payload"
          ),
          {
            id: `bot-limit-${Date.now()}`,
            sender: "bot",
            type: "limit",
            text:
              "Has alcanzado el límite gratuito de consultas de QueesiaBot por hoy. Vuelve mañana para seguir buscando apps de IA.",
            image: "/ohno-cheese.png",
          },
        ]);

        return;
      }

      setMessages((prev) => [
  ...prev,
  {
    id: `bot-understood-${Date.now()}`,
    sender: "bot",
    type: "text",
    text: `Entendido. Buscaré herramientas relacionadas con: “${payload.descripcion}”.`,
  },
  {
    id: `bot-results-${Date.now()}`,
    sender: "bot",
    type: "results",
    text: "Encontré algunas apps que podrían ayudarte 👇",
    results: response.results,
    provider: response.provider,
    mode: response.mode,
    remainingToday: response.remainingToday ?? payload.remainingToday,
    dailyLimit: response.dailyLimit ?? payload.dailyLimit,
  },
]);


  } catch (error) {
    console.error("Error generando recomendaciones:", error);

    setMessages((prev) => [
      ...prev,
      {
        id: `bot-error-${Date.now()}`,
        sender: "bot",
        type: "text",
        text: "Tuve un problema al buscar recomendaciones. Intenta nuevamente en unos segundos.",
      },
    ]);
  } finally {
    setIsTyping(false);
  }
};

  const handleReset = () => {
    setMessages(INITIAL_MESSAGES);
    setInputValue("");
    setIsTyping(false);
    setPayloadPreview(null);
    setLastNeed("");
    setDailyLimitReached(false);
  };

  if (!shouldShowWidget) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[9999] md:bottom-6 md:right-6">
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-3 rounded-full border border-white/20 bg-white/10 backdrop-blur-xl px-4 py-3 text-white shadow-2xl shadow-black/30 transition hover:border-lime-300/40 hover:bg-white/15"
          aria-label="Abrir QueesiaBot"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-lime-300 text-xl text-black transition group-hover:scale-105">
            🧀
          </span>

          <span className="hidden text-left md:block">
            <span className="block text-sm font-semibold text-black">QueesiaBot</span>
            <span className="block text-xs text-blue-600">
              Encuentra apps de IA
            </span>
          </span>
        </button>
      )}

      {isOpen && (
        
        <div className="relative flex h-[74vh] max-h-[680px] w-[calc(100vw-2rem)] max-w-[390px] flex-col overflow-hidden rounded-3xl border border-white/60 bg-white/[0.72] backdrop-blur-2xl text-slate-900 shadow-2xl shadow-black/30 md:h-[620px] md:w-[380px]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute top-1/3 -left-10 h-28 w-28 rounded-full bg-fuchsia-400/10 blur-3xl" />
        <div className="absolute -bottom-8 right-8 h-24 w-24 rounded-full bg-lime-300/10 blur-3xl" />
        </div>
          <div className="relative z-10 flex items-center justify-between border-b border-white/60 bg-white/[0.45] backdrop-blur-xl px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-lime-300/30 bg-lime-300/10 text-lg">
                🧀
              </div>

              <div>
                <h2 className="text-sm font-semibold text-slate-950">QueesiaBot</h2>
                <p className="flex items-center gap-2 text-xs text-slate-600">
                  <span className="h-2 w-2 rounded-full bg-lime-300" />
                  Recomendador de apps IA
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="rounded-full border border-slate-300/70 bg-white/40 px-3 py-1 text-xs text-slate-600 transition hover:border-lime-500/50 hover:text-slate-950"
              >
                Nuevo chat
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300/70 bg-white/40 text-lg text-slate-600 transition hover:border-lime-500/50 hover:text-slate-950"
                aria-label="Cerrar QueesiaBot"
              >
                ×
              </button>
            </div>
          </div>

          <div className="relative z-10 flex-1 overflow-y-auto px-4 py-4">
            {!user ? (
              <LoginRequiredPanel onLogin={login} />
            ) : (
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

              {!isTyping && hasUserMessages && !dailyLimitReached && (
                <QuickReplyChips
                  chips={REFINEMENT_CHIPS}
                  onSelect={handleRefinementClick}
                />
              )}

              {import.meta.env.DEV && payloadPreview && hasUserMessages && !dailyLimitReached && (
                <details className="rounded-2xl border border-slate-200/70 bg-white/[0.55] p-3 backdrop-blur-md">
                  <summary className="cursor-pointer text-xs font-semibold text-slate-500 hover:text-lime-700">
                    Vista previa del payload
                  </summary>

                  <pre className="mt-3 max-h-52 overflow-auto whitespace-pre-wrap text-[11px] leading-5 text-slate-600">
                    {JSON.stringify(payloadPreview, null, 2)}
                  </pre>
                </details>
              )}

                <div ref={chatEndRef} />
              </div>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="relative z-10 border-t border-white/60 bg-white/[0.5] backdrop-blur-xl p-3"
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
                placeholder={
                  dailyLimitReached
                    ? "Límite diario alcanzado"
                    : user
                      ? "Escribe aquí tu necesidad..."
                      : "Inicia sesión para usar QueesiaBot"
                }
                disabled={!user || dailyLimitReached || isTyping}
                className="min-h-[44px] flex-1 resize-none rounded-2xl border border-slate-200/80 bg-white/[0.86] px-4 py-3 text-sm text-slate-900 shadow-inner outline-none placeholder:text-slate-500 focus:border-lime-500/70 focus:ring-2 focus:ring-lime-300/30"
              />

              <button
                type="submit"
                disabled={!user || dailyLimitReached || !inputValue.trim() || isTyping}
                className="rounded-2xl bg-lime-400 px-4 py-3 text-sm font-bold text-slate-950 shadow-sm transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
              >
                Enviar
              </button>
            </div>

            <p className="mt-2 text-[11px] text-slate-500">
              Describe la actividad, resultado esperado y restricciones.
            </p>
          </form>
        </div>
      )}
    </div>
  );
}

function LoginRequiredPanel({ onLogin }) {
  return (
    <div className="rounded-3xl border border-lime-400/30 bg-white/[0.78] p-5 text-center shadow-[0_12px_36px_-24px_rgba(15,23,42,0.5)] backdrop-blur-xl">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-lime-300 text-2xl">
        🧀
      </div>

      <h3 className="text-base font-bold text-slate-950">
        Inicia sesión para usar QueesiaBot
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        El recomendador está disponible para usuarios registrados de Queesia.
      </p>

      <button
        type="button"
        onClick={onLogin}
        className="mt-4 rounded-2xl bg-lime-400 px-5 py-3 text-sm font-bold text-slate-950 shadow-sm transition hover:bg-lime-300"
      >
        Iniciar sesión con Google
      </button>
    </div>
  );
}


function ChatMessage({ message }) {
  if (message.type === "limit") {
    return (
      <div className="flex justify-start">
        <div className="w-full rounded-3xl rounded-tl-md border border-amber-200 bg-amber-50/90 p-4 shadow-[0_12px_36px_-24px_rgba(15,23,42,0.5)] backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <img
              src={message.image}
              alt="Límite alcanzado"
              className="h-20 w-20 shrink-0"
            />

            <div>
              <p className="text-sm font-bold leading-6 text-slate-950">
                Has alcanzado el límite gratuito de consultas de QueesiaBot. 🧀
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-700">
                Vuelve mañana para seguir buscando apps de IA.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

 if (message.type === "results") {
  return (
    <div className="flex justify-start">
      <div className="w-full rounded-3xl rounded-tl-md border border-slate-200/80 bg-white/[0.72] p-4 shadow-[0_12px_36px_-24px_rgba(15,23,42,0.5)] backdrop-blur-xl">
        <p className="mb-4 text-sm font-medium leading-6 text-slate-800">
          {message.text}
        </p>

        <div className="grid gap-3">
          {message.results.map((app) => (
            <ResultCard key={app.appId} app={app} />
          ))}
        </div>

        <p className="mt-4 text-xs text-slate-500">
          {message.provider === "queesia_catalog_api"
            ? "Resultados obtenidos desde el catálogo de Queesia. Te recomendamos revisar cada ficha para comparar funciones, precios y casos de uso."
            : "Estos resultados son sugerencias de respaldo. Prueba ajustar tu búsqueda para obtener coincidencias más precisas del catálogo."}
        </p>

        {message.remainingToday !== undefined &&
          message.remainingToday !== null &&
          message.dailyLimit !== undefined &&
          message.dailyLimit !== null && (
            <p className="mt-2 text-xs font-semibold text-lime-700">
             🟢 Te quedan {message.remainingToday} de {message.dailyLimit} consultas gratuitas hoy.
            </p>
          )}
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
            ? "rounded-tl-md border border-white/70 bg-white/[0.62] backdrop-blur-md text-slate-800 shadow-sm"
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
    <div className="rounded-3xl rounded-tl-md border border-lime-500/25 bg-white/[0.72] p-4 shadow-[0_10px_30px_-22px_rgba(15,23,42,0.45)] backdrop-blur-xl">
      <p className="mb-3 text-sm font-bold text-lime-700">
        Puedes empezar con una de estas ideas:
      </p>

      <div className="grid gap-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.id}
            type="button"
            onClick={() => onSelect(suggestion)}
            className="rounded-2xl border border-slate-200/80 bg-white/[0.86] p-3 text-left text-sm leading-5 text-slate-800 shadow-sm backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-lime-500/45 hover:bg-lime-50/80 hover:text-slate-950"
          >
            <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-lime-700">
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
          className="rounded-full border border-slate-200/80 bg-white/[0.72] px-3 py-2 text-xs font-medium text-slate-700 shadow-sm backdrop-blur-sm transition hover:border-lime-500/45 hover:bg-lime-50 hover:text-lime-800"
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
      <div className="rounded-3xl rounded-tl-md border border-slate-200/80 bg-white/[0.72] px-4 py-3 text-sm font-medium text-slate-600 shadow-sm backdrop-blur-md">
        QueesiaBot está buscando...
      </div>
    </div>
  );
}

function ResultCard({ app }) {
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white/[0.82] p-4 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.45)] backdrop-blur-md transition hover:-translate-y-0.5 hover:border-lime-500/45 hover:bg-white/95 hover:shadow-[0_16px_36px_-20px_rgba(15,23,42,0.55)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {app.categoria}
        </span>

        <span className="rounded-full border border-lime-500/40 bg-lime-100 px-3 py-1 text-xs font-semibold text-lime-700">
          Afinidad {app.afinidad}
        </span>
      </div>

      <h4 className="text-base font-bold italic text-slate-950">
        {app.nombre}
      </h4>

      <p className="mt-3 text-sm leading-6 text-slate-700">
        {app.razon}
      </p>

      <a
        href={app.url}
        className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-lime-700 transition hover:text-lime-800"
      >
        Ver ficha en Queesia
        <span aria-hidden="true">→</span>
      </a>
    </article>
  );
}

