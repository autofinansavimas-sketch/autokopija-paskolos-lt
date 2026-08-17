import { useState } from "react";
import { Flame, X } from "lucide-react";

const BANNER_DISMISS_KEY = "promo-banner-dismissed";
// Show until Dec 31, 2026
const BANNER_EXPIRY = new Date("2026-12-31T23:59:59").getTime();

export const AnnouncementBanner = () => {
  const [dismissed, setDismissed] = useState(() => {
    if (Date.now() > BANNER_EXPIRY) return true;
    return localStorage.getItem(BANNER_DISMISS_KEY) === "true";
  });

  if (dismissed) return null;

  return (
    <div className="bg-primary text-primary-foreground text-[11px] sm:text-sm py-1.5 sm:py-2 px-3 sm:px-4 relative z-[60]">
      <div className="container mx-auto flex items-center justify-center gap-2 pr-8">
        <Flame className="h-3.5 w-3.5 shrink-0" />
        <span className="font-semibold">
          🔥 Itin karštos nuolaidos palūkanoms — gauk geriausią pasiūlymą vos per 30 min!
        </span>
      </div>
      <button
        onClick={() => {
          setDismissed(true);
          localStorage.setItem(BANNER_DISMISS_KEY, "true");
        }}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-primary-foreground/20 transition-colors"
        aria-label="Uždaryti pranešimą"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};
