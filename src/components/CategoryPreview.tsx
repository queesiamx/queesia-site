// src/components/CategoryPreview.tsx
import { iconMap, descriptionMap } from "../utils/categoryInfo.tsx";
import { Bot } from "lucide-react";
import type { App } from "../types";
import { getLogoUrl, handleLogoError } from "../utils/logoUtils";

interface Props {
  categoria: string;
  apps: App[];
  totalEnCategoria?: number;
}

// Formatea 1200 -> "1.2K", 3000000 -> "3M"
function compact(n: unknown): string | null {
  const num =
    typeof n === "number" ? n :
    typeof n === "string" ? Number(n) : NaN;
  if (!isFinite(num) || num <= 0) return null;
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(num % 1_000_000_000 ? 1 : 0) + "B";
  if (num >= 1_000_000)     return (num / 1_000_000).toFixed(num % 1_000_000 ? 1 : 0) + "M";
  if (num >= 1_000)         return (num / 1_000).toFixed(num % 1_000 ? 1 : 0) + "K";
  return String(num);
}

export default function CategoryPreview({ categoria, apps, totalEnCategoria }: Props) {
  const Icon = iconMap[categoria] ?? Bot;
  const descripcion = descriptionMap[categoria] ?? "Explora herramientas de esta categoría.";
  
  // 👇 Normalizamos top 5 y calculamos cuántos “espaciadores” faltan
  const top = (apps ?? []).slice(0, 5);
  const placeholders = Math.max(0, 5 - top.length);

  return (
    <article className="flex flex-col h-full rounded-2xl bg-white/60 backdrop-blur-md
                        border border-white/60 shadow-lg hover:shadow-xl transition p-5">
      {/* Encabezado de la tarjeta */}
      <header className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">{categoria}</h3>
          <p className="text-sm text-gray-500">{descripcion}</p>
        </div>
      </header>

      {/* Lista Top 5 */}
      {/* 👇 flex-1 hace que este bloque “crezca” y empuje las acciones al fondo */}
      <ul className="space-y-2 flex-1">
        {top.map((app: any) => {
          {Array.from({ length: placeholders }).map((_, i) => (
          <li
            key={`ph-${i}`}
            className="rounded-xl px-3 py-2 opacity-0 pointer-events-none select-none"
          >
            spacer
          </li>
        ))}

          const rate =
            typeof app?.rate === "number" ? app.rate :
            (typeof app?.rate === "string" ? Number(app.rate) : NaN);

          // varias opciones por si tu API trae distintos nombres
          const prettyUsers =
            app?.users_pretty ??
            compact(app?.users) ??
            compact(app?.installs) ??
            compact(app?.downloads) ??
            compact(app?.monthly_users) ??
            compact(app?.user_count);

          return (
            <li key={app.id ?? app.name}>
               <a
                href={`/app/${app.id ?? ""}`}
                className="flex items-center justify-between rounded-xl bg-white/70 hover:bg-white/80
                           backdrop-blur-sm border border-white/60 transition px-3 py-2"
                title={app.name}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-white ring-1 ring-black/5 overflow-hidden flex items-center justify-center">
                    <img
                      src={getLogoUrl(app.logo_filename)}
                      alt={`Logo de ${app.name}`}
                      onError={handleLogoError}
                      className="max-w-[75%] max-h-[75%] object-contain"
                      loading="lazy"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {app.name}
                    </div>
                    <div className="text-[11px] text-gray-500">
                      {isFinite(rate) ? `⭐ ${rate}` : "Sin calificar"}
                      {prettyUsers ? ` • ${prettyUsers}+` : ""}
                    </div>
                  </div>
                </div>
                <span aria-hidden className="text-gray-400">›</span>
              </a>
            </li>
          );
        })}
      </ul>

      {/* Acciones */}
      <div className="mt-4 flex items-center justify-between">
        <a
          href={`/categorias/${encodeURIComponent(categoria)}`}
          className="text-sm px-3 py-1 rounded-full border hover:bg-black hover:text-white transition"
        >
          Ver todas {typeof totalEnCategoria === "number" ? `(${totalEnCategoria})` : ""}
        </a>
        <a
          href={`/categorias/${encodeURIComponent(categoria)}?top=1`}
          className="text-sm text-blue-600 hover:underline"
        >
          Top 5 →
        </a>
      </div>
    </article>
  );
}
