import { Button } from "@/components/ui/button";

export const ExpertSection = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <div className="relative w-full aspect-square max-w-md mx-auto">
                <div className="absolute inset-0 bg-primary/10 rounded-full"></div>
                <div className="relative w-full h-full rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border-4 border-background shadow-xl">
                  <div className="text-9xl">👨‍💼</div>
                </div>
              </div>
            </div>

            <div className="order-1 md:order-2">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Su AUTOPASKOLOS.LT paskolų ekspertais pasiskolinsite žemesnėmis palūkanomis
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Nustebtumėte, kiek galima sutaupyti vien tik palyginus kelių kredito įstaigų pasiūlymus. Tiesa, tai reikalauja laiko ir žinių. Pavyzdžiui, kai kurios įmonės mėgsta sumažinti palūkanų normas ir paslėpti jas po papildomais mokesčiais. AUTOPASKOLOS.LT paskolų ekspertai yra Jūsų pusėje ir gerai suprasdami rinką, pateikia skaidrius palyginimus bei leidžia išvengti netikėtumų. AUTOPASKOLOS.LT paslaugos nieko nekainuoja. Tad kodėl gi jų neišbandžius nors ir dabar?
              </p>
              <Button size="lg" className="text-lg px-8 py-6">
                Gauti pasiūlymą
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
