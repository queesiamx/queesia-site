// src/components/MiniToolCard.tsx
import type { App } from "../types";
import { getLogoUrl, handleLogoError } from "../utils/logoUtils";

interface Props {
  app: App;
}

export default function MiniToolCard({ app }: Props) {
  const logoURL = getLogoUrl(app.logo_filename);


    
  return (
    <a
      href={`/app/${app.id}`}
      className="flex items-center gap-2 px-3 py-1.5 rounded-xl
                 bg-white/70 backdrop-blur-sm border border-white/60 shadow-sm
                 transition-transform duration-200 hover:scale-105 min-w-[220px] h-10">
      <img
        src={logoURL}
        alt={`Logo de ${app.name}`}
        className="w-7 h-7 object-contain rounded-md"
        onError={handleLogoError}
      />
      
      <div className="flex-1 overflow-hidden">
        <h4 className="text-[13px] font-semibold whitespace-nowrap overflow-hidden text-ellipsis text-black">
          {app.name}
        </h4>
      </div>
    </a>
  );
}
