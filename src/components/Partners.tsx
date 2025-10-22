export const Partners = () => {
  const partners = [
    "Citadele",
    "TF Bank",
    "Fjord Bank",
    "URBO",
    "SKU",
    "GF",
    "+14 kitų kreditorių"
  ];

  return (
    <section className="py-16 border-y bg-secondary/20">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
          Geriausios paskolos Jums ieškome:
        </h2>
        
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
          {partners.map((partner, index) => (
            <div
              key={index}
              className="flex items-center justify-center px-6 py-3 bg-card rounded-lg border border-border hover:border-primary/50 transition-colors min-w-[120px]"
            >
              <span className="font-semibold text-sm md:text-base text-foreground/80">
                {partner}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
