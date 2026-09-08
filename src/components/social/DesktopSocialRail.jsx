import React from "react";
import { IG, FB, Threads, TikTok, XLogo, YT } from "./Icons";

const LINKS = [
  { href: "https://www.instagram.com/quees_ia", title: "Instagram", Icon: IG },
  { href: "https://www.facebook.com/share/16tCkmXBzp/", title: "Facebook", Icon: FB },
  { href: "https://www.threads.net/@quees_ia", title: "Threads", Icon: Threads },
  { href: "https://www.tiktok.com/@quees_ia", title: "TikTok", Icon: TikTok },
  { href: "https://x.com/quees_ia", title: "X", Icon: XLogo },
  { href: "https://www.youtube.com/@Quees_IA", title: "YouTube", Icon: YT },
];

export default function DesktopSocialRail({
  side = "left",
  top = "50%",
  iconSize = 18,
}) {
  const sideClass = side === "right" ? "right-4 xl:right-5" : "left-4 xl:left-5";

  return (
    <div
      className={`hidden md:block fixed ${sideClass} top-1/2 -translate-y-1/2 z-[80] pointer-events-none`}
      style={{ top }}
      aria-label="Redes sociales"
    >
      <ul className="flex flex-col gap-3">
        {LINKS.map(({ href, title, Icon }) => (
          <li key={title}>
            <a
              className="pointer-events-auto block p-2.5 rounded-full bg-white/70 backdrop-blur-md ring-1 ring-white/50 shadow-lg hover:shadow-xl hover:bg-white/90 transition text-primary"
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              title={title}
              aria-label={title}
            >
              <Icon className="w-[18px] h-[18px]" size={iconSize} />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}