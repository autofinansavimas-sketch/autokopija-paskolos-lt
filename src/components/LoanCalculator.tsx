import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Calculator, TrendingDown } from "lucide-react";

type LoanType = "consumer" | "car" | "home";

const loanTypes = [
  { type: "consumer", label: "Vartojimo", rate: 5.9 },
  { type: "car", label: "Auto", rate: 3.9 },
  { type: "home", label: "Būstas", rate: 4.5 },
];

export const LoanCalculator = () => {
  const [selectedType, setSelectedType] = useState<LoanType>("consumer");
  const [amount, setAmount] = useState([15000]);
  const [period, setPeriod] = useState([36]);

  const currentLoan = loanTypes.find(l => l.type === selectedType)!;
  const monthlyRate = currentLoan.rate / 100 / 12;
  const monthlyPayment = (amount[0] * monthlyRate * Math.pow(1 + monthlyRate, period[0])) / (Math.pow(1 + monthlyRate, period[0]) - 1);
  const totalPayment = monthlyPayment * period[0];
  const totalInterest = totalPayment - amount[0];

  return (
    <section id="loan-calculator" className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Kiek noriu pasiskolinti?
          </h2>
          <p className="text-base text-muted-foreground">
            Pasirink sumą ir laikotarpį
          </p>
        </div>

        <Card className="max-w-3xl mx-auto shadow-lg">
          <div className="p-6 md:p-10 space-y-8">
            {/* Loan Type Selection */}
            <div className="space-y-3">
              <Label className="text-base">Paskolos tipas</Label>
              <div className="grid grid-cols-3 gap-2">
                {loanTypes.map((type) => (
                  <Button
                    key={type.type}
                    variant={selectedType === type.type ? "default" : "outline"}
                    onClick={() => setSelectedType(type.type as LoanType)}
                    className="h-16 text-sm"
                  >
                    {type.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Amount Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-base">Suma</Label>
                <span className="text-xl font-bold text-primary">{amount[0].toLocaleString('lt-LT')} €</span>
              </div>
              <Slider
                value={amount}
                onValueChange={setAmount}
                min={1000}
                max={30000}
                step={500}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1,000 €</span>
                <span>30,000 €</span>
              </div>
            </div>

            {/* Period Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-base">Laikotarpis</Label>
                <span className="text-xl font-bold text-primary">{period[0]} mėn.</span>
              </div>
              <Slider
                value={period}
                onValueChange={setPeriod}
                min={6}
                max={144}
                step={6}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>6 mėn.</span>
                <span>144 mėn.</span>
              </div>
            </div>

            {/* Results */}
            <div className="bg-primary/5 rounded-xl p-6 md:p-8 space-y-4 border border-primary/20">
              
              <div className="text-center space-y-2">
                <div className="text-sm text-muted-foreground">Mokėsi per mėnesį</div>
                <div className="text-4xl md:text-5xl font-bold text-primary">{monthlyPayment.toFixed(0)} €</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">Bendra suma</div>
                  <div className="text-lg font-semibold">{totalPayment.toFixed(0)} €</div>
                </div>
                
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">Palūkanos</div>
                  <div className="text-lg font-semibold">{totalInterest.toFixed(0)} €</div>
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  size="lg" 
                  className="w-full h-14 text-lg"
                  onClick={() => {
                    document.querySelector('#contact-form')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Gauti pasiūlymus
                </Button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Apytikslis skaičiavimas. Tikslios sąlygos priklauso nuo kreditoriaus.
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
};
