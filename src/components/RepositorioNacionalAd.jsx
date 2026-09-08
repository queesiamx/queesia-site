// src/components/RepositorioNacionalAd.jsx
import React, { useEffect, useState } from "react";
import LlaveMXImg from "../assets/llavemx-card.png";
import DigitalizadorImg from "../assets/digitalizador-card.png";
import RepoLogo from "../assets/repo-nacional-logo.png";

const slides = [
  {
    title: "¿Tienes código abierto que quieras compartir con la sociedad?",
    description:
      "Publica tus desarrollos en el Repositorio Nacional y hazlos disponibles para otras instituciones.",
  },
  {
    title: "Visita el nuevo Repositorio Nacional de Tecnología del Gobierno de México.",
    description:
      "Explora soluciones tecnológicas públicas listas para ser reutilizadas y adaptadas.",
  },
  {
    title: "Conecta tus proyectos con soluciones ya disponibles.",
    description:
      "Conoce sistemas que permiten solicitar integración, como plataformas de trámites y servicios digitales.",
  },
];

// Soluciones destacadas
const featuredSolutions = [
  {
    name: "Llave MX",
    description: "Inicio de sesión, seguridad y funcionalidades para identidad digital.",
    href: "https://www.repositorionacional.atdt.gob.mx/plataforma/?plataforma=54",
    image: LlaveMXImg,
  },
  {
    name: "Digitalizador público",
    description: "Gestión de trámites, pagos en línea y funcionalidades clave.",
    href: "https://www.repositorionacional.atdt.gob.mx/plataforma/?plataforma=51",
    image: DigitalizadorImg,
  },
];

export default function RepositorioNacionalAd({ className = "" }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setIndex((prev) => (prev + 1) % slides.length),
      5000
    );
    return () => clearInterval(id);
  }, []);

  const slide = slides[index];

  return (
    <section
      className={`relative overflow-hidden rounded-3xl border border-emerald-100 bg-white/85 px-4 py-4 md:px-6 md:py-5 shadow-sm shadow-emerald-900/5 backdrop-blur ${className}`}
    >
      <div className="flex flex-col gap-4">
        {/* Primera fila: logo + texto principal */}
        <div className="flex items-center gap-4 md:gap-6">
          {/* Logo más grande */}
          <div className="flex-shrink-0">
            <div className="rounded-3xl bg-emerald-50 p-3 shadow-inner">
              <img
                src={RepoLogo.src ?? RepoLogo}
                alt="Repositorio Nacional de Tecnología Pública"
                className="h-14 w-14 md:h-16 md:w-16 object-contain"
              />
            </div>
          </div>

          {/* Texto + CTA principal */}
          <div className="flex-1">
            <p className="text-[11px] uppercase tracking-[0.14em] text-emerald-700 mb-1">
              Repositorio Nacional de Tecnología Pública
            </p>

            <div className="transition-opacity duration-500">
              <h2 className="text-sm md:text-base font-semibold text-emerald-950 mb-1">
                {slide.title}
              </h2>
              <p className="text-xs md:text-sm text-slate-600">
                {slide.description}
              </p>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <a
                href="https://www.repositorionacional.atdt.gob.mx/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-1.5 text-xs md:text-sm font-medium text-white shadow hover:bg-emerald-700 transition-colors"
              >
                Ir al repositorio
                <span aria-hidden="true">↗</span>
              </a>

              {/* Indicadores del carrusel */}
              <div className="flex items-center gap-1">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIndex(i)}
                    className={`h-1.5 w-1.5 rounded-full transition-all ${
                      i === index ? "w-3 bg-emerald-600" : "bg-emerald-300"
                    }`}
                    aria-label={`Ver mensaje ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Segunda fila: soluciones destacadas con captura + CTA */}
        <div className="grid gap-3 md:grid-cols-2">
          {featuredSolutions.map((item) => (
            <div
              key={item.name}
              className="group flex flex-col rounded-2xl border border-emerald-100 bg-emerald-50/60 hover:border-emerald-300 hover:bg-emerald-50 transition-colors overflow-hidden"
            >
              {/* Mini captura */}
              {item.image && (
                <div className="w-full bg-emerald-900/5">
                  <img
                    src={item.image.src ?? item.image}
                    alt={item.name}
                    className="h-24 w-full object-cover"
                  />
                </div>
              )}

              {/* Texto + botón (solo el botón tiene link) */}
              <div className="flex items-center justify-between gap-3 px-3 py-2.5">
                <div className="pr-1">
                  <p className="font-semibold text-emerald-900 text-xs md:text-sm mb-0.5">
                    {item.name}
                  </p>
                  <p className="text-[11px] md:text-xs text-emerald-800/80">
                    {item.description}
                  </p>
                </div>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center whitespace-nowrap rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-medium text-white group-hover:bg-emerald-700"
                >
                  Ver en el repositorio
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
