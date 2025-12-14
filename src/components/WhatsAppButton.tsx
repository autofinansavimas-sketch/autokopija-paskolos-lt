import { MessageCircle } from "lucide-react";
import { analytics } from "@/lib/analytics";

export const WhatsAppButton = () => {
  const phoneNumber = "37062851439";
  const message = encodeURIComponent("Sveiki! Norėčiau sužinoti daugiau apie paskolos galimybes.");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  const handleClick = () => {
    analytics.whatsappClicked();
  };

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-16 h-16 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110 group"
      aria-label="Susisiekite per WhatsApp"
    >
      {/* Pulse rings */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20" />
      <span className="absolute inset-[-4px] rounded-full bg-[#25D366]/30 animate-pulse" />
      
      {/* Icon */}
      <MessageCircle className="h-7 w-7 relative z-10 group-hover:scale-110 transition-transform" />
      
      {/* Tooltip */}
      <span className="absolute right-full mr-3 px-3 py-2 bg-card border border-border rounded-lg shadow-lg text-foreground text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        Rašykite mums WhatsApp
      </span>
    </a>
  );
};
