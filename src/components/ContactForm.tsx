import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Phone, Mail, User, Euro } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  name: z.string().min(2, "Vardas turi būti bent 2 simboliai"),
  phone: z.string().min(9, "Telefono numeris privalomas").regex(/^[\d\s+()-]+$/, "Neteisingas telefono numerio formatas"),
  email: z.string().email("Neteisingas el. pašto formatas"),
  amount: z.string().min(1, "Paskolos suma privaloma"),
});

export const ContactForm = () => {
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      amount: "",
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    toast({
      title: "Paraiška išsiųsta!",
      description: "Susisieksime su Jumis per 1 valandą.",
    });
    form.reset();
  };

  return (
    <section id="contact-form" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Gaukite <span className="text-primary">geriausią pasiūlymą</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Užpildykite formą ir gaukite personalizuotus pasiūlymus per 1 valandą
            </p>
          </div>

          <Card className="p-8 md:p-12">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">
                          Vardas Pavardė *
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                              {...field}
                              className="pl-10 h-12"
                              placeholder="Jūsų vardas ir pavardė"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">
                          Telefonas *
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                              {...field}
                              type="tel"
                              className="pl-10 h-12"
                              placeholder="+370 600 00000"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">
                          El. paštas *
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                              {...field}
                              type="email"
                              className="pl-10 h-12"
                              placeholder="jusu@email.lt"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">
                          Paskolos suma *
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                              {...field}
                              type="number"
                              className="pl-10 h-12"
                              placeholder="10000"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" size="lg" className="w-full h-14 text-lg">
                  Gauti pasiūlymus
                </Button>

                <p className="text-sm text-muted-foreground text-center">
                  * Privalomi laukai. Jūsų duomenys yra saugomi ir naudojami tik pasiūlymams pateikti.
                </p>
              </form>
            </Form>
          </Card>
        </div>
      </div>
    </section>
  );
};
