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
      className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
      aria-label="Susisiekite per WhatsApp"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
};
