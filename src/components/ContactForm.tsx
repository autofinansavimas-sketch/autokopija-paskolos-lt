import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Phone, Mail, User, Euro, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const ContactForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    amount: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Paraiška išsiųsta!",
      description: "Susisieksime su Jumis per 1 valandą.",
    });
    setFormData({ name: "", phone: "", email: "", amount: "" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section id="contact-form" className="py-12 md:py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Gauk <span className="text-primary">pasiūlymus</span>
          </h2>
          <p className="text-base text-muted-foreground max-w-xl mx-auto">
            Užpildyk formą ir gauk atsakymus per 1 valandą
          </p>
        </div>

        <Card className="max-w-2xl mx-auto shadow-lg">
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Vardas, Pavardė *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-10 h-12"
                  placeholder="Jūsų vardas"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefonas *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="pl-10 h-12"
                  placeholder="+370 600 00000"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">El. paštas *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 h-12"
                  placeholder="jusu@email.lt"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Paskolos suma (€) *</Label>
              <div className="relative">
                <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleChange}
                  className="pl-10 h-12"
                  placeholder="10000"
                  required
                />
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" size="lg" className="w-full h-14 text-lg">
                Gauti pasiūlymus
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Jūsų duomenys saugūs. Nesidalinsime su trečiosiomis šalimis.
            </p>
          </form>
        </Card>
      </div>
    </section>
  );
};
