import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Calculator, Car, Home, RefreshCw, Wallet, TrendingUp, Sparkles, ArrowRight } from "lucide-react";
import { ContactFormDialog } from "@/components/ContactFormDialog";
import { analytics } from "@/lib/analytics";

type LoanType = "consumer" | "car" | "home" | "refinance";

const loanTypes = [
  { id: "consumer" as LoanType, name: "Vartojimo paskola", displayRate: 5.9, calcRate: 8.9, icon: Wallet, gradient: "from-emerald-500 to-teal-600" },
  { id: "car" as LoanType, name: "Automobilio lizingas", displayRate: 3.9, calcRate: 6.9, icon: Car, gradient: "from-blue-500 to-cyan-600" },
  { id: "home" as LoanType, name: "Būsto remontas", displayRate: 4.5, calcRate: 7.5, icon: Home, gradient: "from-amber-500 to-orange-600" },
  { id: "refinance" as LoanType, name: "Paskolų refinansavimas", displayRate: 4.2, calcRate: 7.2, icon: RefreshCw, gradient: "from-purple-500 to-pink-600" },
];

export const LoanCalculator = () => {
  const [selectedType, setSelectedType] = useState<LoanType>("consumer");
  const [amount, setAmount] = useState([15000]);
  const [period, setPeriod] = useState([36]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const currentLoan = loanTypes.find(l => l.id === selectedType)!;
  const monthlyRate = currentLoan.calcRate / 100 / 12;
  const monthlyPayment = (amount[0] * monthlyRate * Math.pow(1 + monthlyRate, period[0])) / (Math.pow(1 + monthlyRate, period[0]) - 1);
  const totalPayment = monthlyPayment * period[0];
  const totalInterest = totalPayment - amount[0];
  const interestPercentage = (totalInterest / totalPayment) * 100;

  return (
    <>
      <ContactFormDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        loanType={currentLoan.name}
        loanAmount={amount[0]}
        loanPeriod={period[0]}
      />
      <section id="skaiciuokle" className="py-8 md:py-24 relative overflow-hidden" aria-labelledby="calculator-heading">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="hidden md:block absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="hidden md:block absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        
        <div className="container mx-auto px-3 md:px-4 relative z-10">
          <div className="max-w-5xl mx-auto">
            {/* Header - Compact on mobile */}
            <div className="text-center mb-6 md:mb-14">
              <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-black mb-3 md:mb-6 uppercase animate-fade-in tracking-tight leading-tight">
                AUTOPASKOLOS.LT - <span className="gradient-text block sm:inline">PASKOLOS NE TIK AUTOMOBILIUI</span>
              </h1>
              <h2 id="calculator-heading" className="text-base sm:text-lg md:text-2xl lg:text-3xl font-bold mb-2 md:mb-5 uppercase animate-fade-in leading-snug" style={{ animationDelay: '0.1s' }}>
                GAUK GERIAUSIĄ PASIŪLYMĄ <span className="gradient-text animate-pulse block sm:inline">VOS PER 30 MIN</span>
              </h2>
              <p className="text-sm md:text-xl text-muted-foreground animate-fade-in hidden md:block" style={{ animationDelay: '0.2s' }}>
                Pasirink paskolos tipą ir sužinok preliminarią mėnesio įmoką
              </p>
            </div>

            <Card className="p-4 md:p-10 border-0 shadow-xl md:shadow-2xl bg-card/80 backdrop-blur-xl relative overflow-hidden">
              {/* Decorative gradient border */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/20 via-transparent to-accent/20 pointer-events-none" />
              
              {/* Loan Type Selection - Horizontal scroll on mobile */}
              <fieldset className="mb-6 md:mb-12 relative">
                <legend className="text-sm md:text-lg font-bold mb-3 md:mb-5 block flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  Pasirink paskolos tipą
                </legend>
                
                {/* Mobile: Horizontal scrollable */}
                <div className="md:hidden flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory scrollbar-hide" role="radiogroup">
                  {loanTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.id}
                        role="radio"
                        aria-checked={selectedType === type.id}
                        onClick={() => {
                          setSelectedType(type.id);
                          analytics.calculatorUsed(type.name, amount[0]);
                        }}
                        className={`flex-shrink-0 w-[140px] snap-start group relative p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                          selectedType === type.id
                            ? "border-primary bg-primary/10 shadow-lg"
                            : "border-border/50 bg-card/50"
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${type.gradient} flex items-center justify-center mb-2 shadow`}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <div className="font-semibold text-xs leading-tight">{type.name}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                          Nuo <span className="font-semibold text-primary">{type.displayRate}%</span>
                          <span className="inline-flex items-center px-1 py-0.5 rounded bg-gradient-to-r from-amber-500 to-orange-500 text-[8px] font-bold text-white uppercase animate-pulse">🔥</span>
                        </div>
                        {selectedType === type.id && (
                          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
                        )}
                      </button>
                    );
                  })}
                </div>
                
                {/* Desktop: Grid */}
                <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4" role="radiogroup">
                  {loanTypes.map((type, index) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.id}
                        role="radio"
                        aria-checked={selectedType === type.id}
                        onClick={() => {
                          setSelectedType(type.id);
                          analytics.calculatorUsed(type.name, amount[0]);
                        }}
                        className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 text-left overflow-hidden animate-fade-in ${
                          selectedType === type.id
                            ? "border-primary bg-primary/5 shadow-xl scale-[1.02]"
                            : "border-border/50 hover:border-primary/50 bg-card/50 hover:bg-card"
                        }`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${type.gradient} opacity-0 transition-opacity duration-300 ${selectedType === type.id ? 'opacity-10' : 'group-hover:opacity-5'}`} />
                        
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${type.gradient} flex items-center justify-center mb-4 shadow-lg transition-transform duration-300 ${selectedType === type.id ? 'scale-110' : 'group-hover:scale-105'}`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="font-bold text-base mb-1 relative z-10">{type.name}</div>
                        <div className="text-sm text-muted-foreground relative z-10 flex items-center gap-2">
                          Nuo <span className="font-semibold text-primary">{type.displayRate}%</span> metinių palūkanų
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-500 to-orange-500 text-[10px] font-bold text-white uppercase animate-pulse">🔥 Akcija</span>
                        </div>
                        
                        {selectedType === type.id && (
                          <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-primary animate-pulse" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {/* Sliders - Stacked on mobile */}
              <div className="grid md:grid-cols-2 gap-6 md:gap-12 mb-6 md:mb-12">
                {/* Amount Slider */}
                <div className="space-y-2 md:space-y-4">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="amount-slider" className="text-sm md:text-base font-bold flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      Paskolos suma
                    </Label>
                    <span className="text-xl md:hidden font-bold text-primary">{amount[0].toLocaleString('lt-LT')} €</span>
                  </div>
                  <div className="hidden md:block text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent" aria-live="polite">
                    {amount[0].toLocaleString('lt-LT')} €
                  </div>
                  <div className="pt-1 md:pt-2">
                    <Slider
                      id="amount-slider"
                      value={amount}
                      onValueChange={setAmount}
                      onValueCommit={() => analytics.calculatorSliderChanged('amount')}
                      min={1000}
                      max={30000}
                      step={500}
                      className="py-3 md:py-4"
                      aria-label="Paskolos suma"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span className="font-medium">1,000 €</span>
                    <span className="font-medium">30,000 €</span>
                  </div>
                </div>

                {/* Period Slider */}
                <div className="space-y-2 md:space-y-4">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="period-slider" className="text-sm md:text-base font-bold flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-accent" />
                      Laikotarpis
                    </Label>
                    <span className="text-xl md:hidden font-bold text-primary">{period[0]} mėn.</span>
                  </div>
                  <div className="hidden md:block text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent" aria-live="polite">
                    {period[0]} mėn.
                  </div>
                  <div className="pt-1 md:pt-2">
                    <Slider
                      id="period-slider"
                      value={period}
                      onValueChange={setPeriod}
                      onValueCommit={() => analytics.calculatorSliderChanged('period')}
                      min={6}
                      max={144}
                      step={6}
                      className="py-3 md:py-4"
                      aria-label="Paskolos laikotarpis"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span className="font-medium">6 mėn.</span>
                    <span className="font-medium">144 mėn.</span>
                  </div>
                </div>
              </div>

              {/* Results - Compact on mobile */}
              <div className="relative rounded-xl md:rounded-3xl overflow-hidden mb-5 md:mb-8" role="region" aria-label="Skaičiavimo rezultatai">
                <div className={`absolute inset-0 bg-gradient-to-br ${currentLoan.gradient} opacity-10`} />
                <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm" />
                
                <div className="relative p-4 md:p-10">
                  {/* Mobile: Centered main result */}
                  <div className="md:hidden text-center mb-4">
                    <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-medium">Mėnesinis mokestis</div>
                    <div className="text-4xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent" aria-live="polite">
                      {monthlyPayment.toFixed(2)} €
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {currentLoan.displayRate}% metinių palūkanų
                    </div>
                  </div>
                  
                  {/* Mobile: Compact stats row */}
                  <div className="md:hidden grid grid-cols-2 gap-3">
                    <div className="bg-card/50 rounded-lg p-3 border border-border/50 text-center">
                      <div className="text-xs text-muted-foreground mb-1">Bendra suma</div>
                      <div className="text-lg font-bold">{totalPayment.toFixed(0)} €</div>
                    </div>
                    <div className="bg-card/50 rounded-lg p-3 border border-border/50 text-center">
                      <div className="text-xs text-muted-foreground mb-1">Sutaupysite*</div>
                      <div className="text-lg font-bold text-emerald-500">iki {(totalInterest * 0.75).toFixed(0)} €</div>
                    </div>
                  </div>
                  
                  {/* Desktop: Full layout */}
                  <div className="hidden md:grid grid-cols-3 gap-8">
                    <div className="col-span-1 text-left">
                      <div className="text-sm text-muted-foreground mb-2 uppercase tracking-wider font-medium">Mėnesinis mokestis</div>
                      <div className="text-5xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent" aria-live="polite">
                        {monthlyPayment.toFixed(2)} €
                      </div>
                      <div className="text-sm text-muted-foreground mt-2">
                        {currentLoan.displayRate}% metinių palūkanų
                      </div>
                    </div>
                    
                    <div className="col-span-2 grid grid-cols-2 gap-6">
                      <div className="bg-card/50 rounded-xl p-6 border border-border/50">
                        <div className="text-sm text-muted-foreground mb-2">Bendra suma</div>
                        <div className="text-3xl font-bold" aria-live="polite">{totalPayment.toFixed(2)} €</div>
                        <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                            style={{ width: `${100 - interestPercentage}%` }}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Pagrindinė suma</div>
                      </div>
                      
                      <div className="bg-card/50 rounded-xl p-6 border border-border/50">
                        <div className="text-sm text-muted-foreground mb-2">Jūs sutaupote*</div>
                        <div className="text-3xl font-bold text-emerald-500" aria-live="polite">iki {(totalInterest * 0.75).toFixed(0)} €</div>
                        <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-500"
                            style={{ width: '70%' }}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">lyginant su kitais pasiūlymais</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Button - Full width on mobile */}
              <div className="flex justify-center">
                <Button 
                  size="lg" 
                  className="group w-full md:w-auto text-base md:text-xl h-14 md:h-16 px-6 md:px-14 font-bold shadow-xl hover:shadow-2xl transition-all duration-300 hover-lift bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => {
                    analytics.ctaClicked('Calculator CTA');
                    setDialogOpen(true);
                  }}
                >
                  Gauti geriausius pasiūlymus
                  <ArrowRight className="ml-2 md:ml-3 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
};
