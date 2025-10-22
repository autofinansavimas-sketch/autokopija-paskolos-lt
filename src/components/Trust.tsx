import { Shield, Lock, Award } from "lucide-react";

export const Trust = () => {
  return (
    <section className="py-16 bg-background border-y">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">
            AUTOPASKOLOS.LT veikla prižiūrima Lietuvos Banko
          </h2>
          <p className="text-lg text-muted-foreground mb-12">
            AUTOPASKOLOS.LT veiklą prižiūri Lietuvos bankas, Valstybinė duomenų apsaugos inspekcija ir kitos institucijos. Visi duomenys yra koduojami 2048-bit SSL sertifikatu.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <Shield className="h-16 w-16 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Lietuvos Banko priežiūra</h3>
              <p className="text-sm text-muted-foreground">Reguliuojama veikla</p>
            </div>
            <div className="flex flex-col items-center">
              <Lock className="h-16 w-16 text-primary mb-4" />
              <h3 className="font-semibold mb-2">2048-bit SSL</h3>
              <p className="text-sm text-muted-foreground">Aukščiausio lygio saugumas</p>
            </div>
            <div className="flex flex-col items-center">
              <Award className="h-16 w-16 text-primary mb-4" />
              <h3 className="font-semibold mb-2">VDAI sertifikuota</h3>
              <p className="text-sm text-muted-foreground">Duomenų apsauga</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
