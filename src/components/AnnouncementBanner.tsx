import { useState } from "react";
import { MapPin, X } from "lucide-react";

const BANNER_DISMISS_KEY = "announcement-banner-dismissed";
// Show until May 2, 2026
const BANNER_EXPIRY = new Date("2026-05-02T00:00:00").getTime();

export const AnnouncementBanner = () => {
  const [dismissed, setDismissed] = useState(() => {
    if (Date.now() > BANNER_EXPIRY) return true;
    return localStorage.getItem(BANNER_DISMISS_KEY) === "true";
  });

  if (dismissed) return null;

  return (
    <div className="bg-primary text-primary-foreground text-xs sm:text-sm py-2 px-4 relative z-[60]">
      <div className="container mx-auto flex items-center justify-center gap-2 pr-8">
        <MapPin className="h-3.5 w-3.5 shrink-0" />
        <span>
          Persikėlėme! Naujas adresas —{" "}
          <a
            href="https://maps.app.goo.gl/3HSKiXHLQmBC99eK8"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 font-semibold hover:opacity-80 transition-opacity"
          >
            Palemono g. 173, Kaunas
          </a>
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
