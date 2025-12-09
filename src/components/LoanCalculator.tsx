import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { TrendingDown } from "lucide-react";
import { ContactFormDialog } from "@/components/ContactFormDialog";
import { analytics } from "@/lib/analytics";

type LoanType = "consumer" | "car" | "home" | "refinance";

const loanTypes = [
  { id: "consumer" as LoanType, name: "Vartojimo paskola", rate: 5.9, color: "bg-primary" },
  { id: "car" as LoanType, name: "Automobilio lizingas", rate: 3.9, color: "bg-blue-500" },
  { id: "home" as LoanType, name: "Būsto remontas", rate: 4.5, color: "bg-green-500" },
  { id: "refinance" as LoanType, name: "Paskolų refinansavimas", rate: 4.2, color: "bg-purple-500" },
];

export const LoanCalculator = () => {
  const [selectedType, setSelectedType] = useState<LoanType>("consumer");
  const [amount, setAmount] = useState([15000]);
  const [period, setPeriod] = useState([36]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const currentLoan = loanTypes.find(l => l.id === selectedType)!;
  const monthlyRate = currentLoan.rate / 100 / 12;
  const monthlyPayment = (amount[0] * monthlyRate * Math.pow(1 + monthlyRate, period[0])) / (Math.pow(1 + monthlyRate, period[0]) - 1);
  const totalPayment = monthlyPayment * period[0];
  const totalInterest = totalPayment - amount[0];

  return (
    <>
    <ContactFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    <section id="loan-calculator" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-5xl font-bold mb-3 md:mb-4 uppercase">
              GAUK GERIAUSIĄ PASKOLOS PASIŪLYMĄ <span className="text-primary">VOS PER 30 MINUČIŲ</span>
            </h2>
            <p className="text-lg md:text-2xl font-semibold text-foreground uppercase">
              AUTOPASKOLOS.LT - PASKOLOS NE TIK AUTOMOBILIUI
            </p>
          </div>

          <Card className="p-4 md:p-12 border-2">
            {/* Loan Type Selection */}
            <div className="mb-8 md:mb-10">
              <Label className="text-sm md:text-base font-semibold mb-3 md:mb-4 block">Paskolos tipas</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {loanTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => {
                      setSelectedType(type.id);
                      analytics.calculatorUsed(type.name, amount[0]);
                    }}
                    className={`p-4 md:p-6 rounded-xl border-2 transition-all text-left ${
                      selectedType === type.id
                        ? "border-primary bg-primary/5 shadow-lg"
                        : "border-border hover:border-primary/50 bg-card"
                    }`}
                  >
                    <div className="font-semibold text-base md:text-lg mb-1 md:mb-2">{type.name}</div>
                    <div className="text-xs md:text-sm text-muted-foreground">Nuo {type.rate}% metinių palūkanų</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Slider */}
            <div className="mb-8 md:mb-10">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-3 md:mb-4 gap-2">
                <Label className="text-sm md:text-base font-semibold">Paskolos suma</Label>
                <div className="text-2xl md:text-3xl font-bold text-primary">{amount[0].toLocaleString('lt-LT')} €</div>
              </div>
              <Slider
                value={amount}
                onValueChange={setAmount}
                onValueCommit={() => analytics.calculatorSliderChanged('amount')}
                min={1000}
                max={30000}
                step={500}
                className="mb-2 md:mb-2"
              />
              <div className="flex justify-between text-xs md:text-sm text-muted-foreground">
                <span>1,000 €</span>
                <span>30,000 €</span>
              </div>
            </div>

            {/* Period Slider */}
            <div className="mb-8 md:mb-12">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-3 md:mb-4 gap-2">
                <Label className="text-sm md:text-base font-semibold">Paskolos laikotarpis</Label>
                <div className="text-2xl md:text-3xl font-bold text-primary">{period[0]} mėn.</div>
              </div>
              <Slider
                value={period}
                onValueChange={setPeriod}
                onValueCommit={() => analytics.calculatorSliderChanged('period')}
                min={6}
                max={144}
                step={6}
                className="mb-2 md:mb-2"
              />
              <div className="flex justify-between text-xs md:text-sm text-muted-foreground">
                <span>6 mėn.</span>
                <span>144 mėn.</span>
              </div>
            </div>

            {/* Results */}
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl md:rounded-2xl p-6 md:p-8 mb-6 md:mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                <div className="text-center md:text-left">
                  <div className="text-xs md:text-sm text-muted-foreground mb-2">Mėnesinis mokestis</div>
                  <div className="text-3xl md:text-4xl font-bold text-primary">{monthlyPayment.toFixed(2)} €</div>
                </div>
                <div className="text-center md:text-left">
                  <div className="text-xs md:text-sm text-muted-foreground mb-2">Bendra mokėtina suma</div>
                  <div className="text-3xl md:text-4xl font-bold">{totalPayment.toFixed(2)} €</div>
                </div>
                <div className="text-center md:text-left">
                  <div className="text-xs md:text-sm text-muted-foreground mb-2">Palūkanos</div>
                  <div className="text-3xl md:text-4xl font-bold">{totalInterest.toFixed(2)} €</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:gap-4 justify-center">
              <Button 
                size="lg" 
                className="text-base md:text-lg h-16 md:h-14 px-6 md:px-8 w-full md:w-auto font-semibold"
                onClick={() => {
                  analytics.ctaClicked('Calculator CTA');
                  setDialogOpen(true);
                }}
              >
                Gauti geriausius pasiūlymus
              </Button>
            </div>

          </Card>
        </div>
      </div>
    </section>
    </>
  );
};
