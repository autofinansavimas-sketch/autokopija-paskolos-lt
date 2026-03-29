import { useState, useEffect, useCallback } from "react";
import { CheckCircle, X } from "lucide-react";

const lithuanianNames = [
  "Justas", "Mantas", "Tomas", "Andrius", "Darius",
  "Lukas", "Marius", "Paulius", "Donatas", "Evaldas",
  "Giedrius", "Karolis", "Rokas", "Simonas", "Vytautas",
  "Inga", "Kristina", "Rūta", "Eglė", "Jūratė",
  "Monika", "Laura", "Gintarė", "Aistė", "Viktorija",
];

const loanTypes = [
  "automobilio lizingą",
  "vartojimo paskolą",
  "būsto remonto paskolą",
  "refinansavimo pasiūlymą",
];

const cities = [
  "Vilnius", "Kaunas", "Klaipėda", "Šiauliai", "Panevėžys",
  "Alytus", "Marijampolė", "Utena", "Tauragė", "Telšiai",
];

const timeAgo = [
  "Prieš 2 min.", "Prieš 5 min.", "Prieš 8 min.",
  "Prieš 12 min.", "Prieš 15 min.", "Prieš 23 min.",
];

const getRandomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const generateNotification = () => ({
  name: getRandomItem(lithuanianNames),
  loanType: getRandomItem(loanTypes),
  city: getRandomItem(cities),
  time: getRandomItem(timeAgo),
});

export const SocialProofPopup = () => {
  const [visible, setVisible] = useState(false);
  const [notification, setNotification] = useState(generateNotification);
  const [dismissed, setDismissed] = useState(false);

  const showNotification = useCallback(() => {
    setNotification(generateNotification());
    setVisible(true);
    setDismissed(false);

    // Auto-hide after 5s
    const hideTimer = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(hideTimer);
  }, []);

  useEffect(() => {
    // First popup after 15s
    const initialDelay = setTimeout(() => {
      showNotification();
    }, 15000);

    // Then every 25-45s
    const interval = setInterval(() => {
      const randomDelay = Math.random() * 20000 + 25000;
      setTimeout(showNotification, randomDelay - 25000);
    }, 35000);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, [showNotification]);

  if (dismissed || !visible) return null;

  return (
    <div
      className="fixed bottom-20 left-4 z-30 max-w-xs animate-slide-in-left"
      role="status"
      aria-live="polite"
    >
      <div className="bg-card border border-border/60 rounded-xl shadow-lg p-3.5 flex items-start gap-3 relative group">
        <button
          onClick={() => { setVisible(false); setDismissed(true); }}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded-full hover:bg-muted"
          aria-label="Uždaryti"
        >
          <X className="h-3 w-3 text-muted-foreground" />
        </button>

        <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
          <CheckCircle className="h-5 w-5 text-primary" />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground leading-tight">
            {notification.name} iš {notification.city}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            gavo {notification.loanType}
          </p>
          <p className="text-[10px] text-muted-foreground/70 mt-1">
            {notification.time}
          </p>
        </div>
      </div>
    </div>
  );
};
