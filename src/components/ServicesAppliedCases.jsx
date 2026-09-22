import { Fragment, useEffect, useRef, useState } from "react";

const CONTACT_URL = "/contacto?asunto=servicios";

const solutions = [
  {
    id: "reportes",
    icon: "▥",
    title: "Reportes automáticos",
    question: "¿Tu equipo sigue armando reportes manualmente?",
    what:
      "Consolidamos las fuentes, aplicamos las reglas acordadas y generamos el reporte en el formato definido.",
    benefits: [
      "Menos trabajo manual",
      "Menos errores",
      "Información consistente",
      "Entregas a tiempo",
    ],
  },
  {
    id: "documentos",
    icon: "▤",
    title: "Documentos a datos",
    question: "¿Capturan información de PDFs o documentos a mano?",
    what:
      "Extraemos los datos relevantes, los estructuramos, los validamos y los enviamos al archivo o sistema correspondiente.",
    benefits: [
      "Menos recaptura",
      "Menor riesgo de errores",
      "Procesamiento más rápido",
      "Datos listos para usar",
    ],
  },
  {
    id: "asistente",
    icon: "◫",
    title: "Asistente documental",
    question: "¿Pierden tiempo buscando información interna?",
    what:
      "Organizamos documentación autorizada para que el equipo pueda consultar información y recibir respuestas apoyadas en sus propias fuentes.",
    benefits: [
      "Búsqueda más rápida",
      "Conocimiento accesible",
      "Respuestas trazables",
      "Menos tiempo buscando",
    ],
  },
  {
    id: "seguimiento",
    icon: "◉",
    title: "Seguimiento comercial",
    question: "¿Se quedan prospectos sin seguimiento?",
    what:
      "Identificamos oportunidades detenidas, aplicamos reglas de prioridad y apoyamos el seguimiento comercial.",
    benefits: [
      "Menos oportunidades olvidadas",
      "Seguimiento consistente",
      "Mejor visibilidad",
      "Menor carga administrativa",
    ],
  },
  {
    id: "radar",
    icon: "◎",
    title: "Radar empresarial",
    question: "¿Necesitas seguir regulación, competencia o noticias?",
    what:
      "Monitoreamos las fuentes y temas acordados, filtramos lo relevante y generamos resúmenes o alertas periódicas.",
    benefits: [
      "Menos tiempo de búsqueda",
      "Seguimiento sistemático",
      "Información organizada",
      "Mejor contexto para decidir",
    ],
  },
  {
    id: "ia",
    icon: "✦",
    title: "IA aplicada al trabajo",
    question: "¿Quieren aplicar IA a tareas y procesos reales?",
    what:
      "Diseñamos capacitación y adopción práctica, desde IA generativa y ChatGPT hasta aplicaciones personalizadas en documentos, datos y procesos.",
    benefits: [
      "Adopción práctica",
      "Mejor uso de herramientas",
      "Ahorro de tiempo",
      "Nuevas oportunidades de automatización",
    ],
  },
];

export default function ServicesAppliedCases() {
  const [openId, setOpenId] = useState(null);
  const detailRefs = useRef({});

  useEffect(() => {
    if (!openId) return;

    const frame = requestAnimationFrame(() => {
      detailRefs.current[openId]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [openId]);

  return (
    <section
      id="soluciones"
      className="px-4 py-10 md:py-14"
      aria-labelledby="casos-aplicados-title"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">
            Casos aplicados
          </p>
          <h2
            id="casos-aplicados-title"
            className="mt-3 text-3xl font-extrabold text-default md:text-4xl"
          >
            Soluciones a problemas reales de tu operación
          </h2>
          <p className="mt-4 text-base leading-7 text-default-soft">
            Explora solo lo que te interese. El detalle aparece cuando lo necesitas.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {solutions.map((solution) => {
            const isOpen = openId === solution.id;
            const titleId = `service-title-${solution.id}`;
            const buttonId = `service-toggle-${solution.id}`;
            const detailId = `service-detail-${solution.id}`;

            return (
              <Fragment key={solution.id}>
                <article
                  className={[
                    "card flex h-full min-h-[250px] flex-col bg-white/70 p-6 text-center backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-lg",
                    isOpen
                      ? "border-primary/40 shadow-lg ring-2 ring-primary/15"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  data-case-id={solution.id}
                >
                  <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-2xl leading-none text-primary ring-1 ring-primary/10">
                    <span aria-hidden="true">{solution.icon}</span>
                  </div>

                  <h3 id={titleId} className="text-xl font-bold text-default">
                    {solution.title}
                  </h3>

                  <p className="mt-3 flex-1 text-sm leading-7 text-default-soft">
                    {solution.question}
                  </p>

                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={detailId}
                    className="mx-auto mt-6 inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-primary transition hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 focus:ring-offset-transparent"
                    onClick={() =>
                      setOpenId((currentId) =>
                        currentId === solution.id ? null : solution.id,
                      )
                    }
                  >
                    <span>Ver cómo funciona</span>
                    <svg
                      viewBox="0 0 24 24"
                      className={[
                        "h-4 w-4 transition-transform duration-200",
                        isOpen ? "rotate-180" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                </article>

                {isOpen && (
                  <div
                    id={detailId}
                    ref={(node) => {
                      if (node) detailRefs.current[solution.id] = node;
                    }}
                    role="region"
                    aria-labelledby={titleId}
                    className="col-span-1 scroll-mt-28 rounded-3xl border border-primary/15 bg-white/75 p-6 shadow-card backdrop-blur-xl transition md:col-span-2 md:p-8 xl:col-span-3"
                  >
                    <div className="grid gap-7 lg:grid-cols-[minmax(0,1.25fr)_minmax(220px,0.85fr)_auto] lg:items-center">
                      <div>
                        <h4 className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">
                          Qué hacemos
                        </h4>
                        <p className="mt-3 text-sm leading-7 text-default-soft md:text-base">
                          {solution.what}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">
                          Beneficio
                        </h4>
                        <ul className="mt-3 grid gap-2 text-sm leading-6 text-default-soft">
                          {solution.benefits.map((benefit) => (
                            <li key={benefit} className="flex gap-2">
                              <span
                                className="mt-0.5 font-extrabold text-primary"
                                aria-hidden="true"
                              >
                                ✓
                              </span>
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="lg:justify-self-end">
                        <a
                          href={CONTACT_URL}
                          className="btn-primary inline-flex w-full items-center justify-center px-5 py-3 text-center sm:w-auto"
                        >
                          Quiero evaluar este proceso →
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
}
