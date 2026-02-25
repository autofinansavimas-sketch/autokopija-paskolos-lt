import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, Mail, User, Euro, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { analytics } from "@/lib/analytics";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const formSchema = z.object({
  name: z.string().max(100).optional(),
  phone: z.string().min(1, "Telefono numeris privalomas").max(20),
  email: z.string().email("Neteisingas el. pašto formatas").max(255),
  amount: z.string().max(20).optional(),
  website: z.string().optional(), // honeypot
});

interface ContactFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loanType?: string;
  loanAmount?: number;
  loanPeriod?: number;
}

export const ContactFormDialog = ({ open, onOpenChange, loanType, loanAmount, loanPeriod }: ContactFormDialogProps) => {
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      amount: "",
      website: "",
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Track form open
  useEffect(() => {
    if (open) {
      analytics.formOpened('Dialog');
    }
  }, [open]);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    // Honeypot check
    if (values.website) return;
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: values.name || "Nenurodytas",
          email: values.email,
          phone: values.phone,
          amount: values.amount || (loanAmount ? loanAmount.toString() : "Nenurodyta"),
          loanType: loanType || "Nenurodyta",
          loanPeriod: loanPeriod ? `${loanPeriod} mėn.` : "Nenurodyta",
        },
      });

      if (error) {
        analytics.formError(error.message || 'Unknown error');
        throw error;
      }

      analytics.formSubmitted(values.amount ? `${values.amount}€` : undefined);
      
      toast({
        title: "Paraiška išsiųsta!",
        description: "Susisieksime su Jumis per 30 minučių. Patikrinkite el. paštą.",
      });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Error sending email:", error);
      toast({
        title: "Klaida",
        description: "Nepavyko išsiųsti paraiškos. Bandykite dar kartą.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="pb-2 sm:pb-4">
          <DialogTitle className="text-xl sm:text-2xl md:text-3xl font-bold">
            Gaukite <span className="text-primary">geriausią pasiūlymą</span>
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Užpildykite formą ir gaukite pasiūlymus per 1 val.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 sm:space-y-6">
            {/* Mobile: Stack all fields, Desktop: Grid */}
            <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base font-semibold">
                      Vardas Pavardė
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                        <Input
                          {...field}
                          className="pl-9 sm:pl-10 h-11 sm:h-12 text-base"
                          placeholder="Jūsų vardas"
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
                    <FormLabel className="text-sm sm:text-base font-semibold">
                      Telefonas *
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                        <Input
                          {...field}
                          type="tel"
                          className="pl-9 sm:pl-10 h-11 sm:h-12 text-base"
                          placeholder="+37062851439"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base font-semibold">
                      El. paštas *
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                        <Input
                          {...field}
                          type="email"
                          className="pl-9 sm:pl-10 h-11 sm:h-12 text-base"
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
                    <FormLabel className="text-sm sm:text-base font-semibold">
                      Paskolos suma
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                        <Input
                          {...field}
                          type="number"
                          className="pl-9 sm:pl-10 h-11 sm:h-12 text-base"
                          placeholder="10000"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" size="lg" className="w-full h-12 sm:h-14 text-base font-semibold" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Siunčiama...
                </>
              ) : (
                "Gauti pasiūlymus"
              )}
            </Button>

            {/* Honeypot - hidden from users */}
            <div className="absolute opacity-0 -z-10" aria-hidden="true" tabIndex={-1}>
              <Input {...form.register("website")} tabIndex={-1} autoComplete="off" />
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground text-center">
              * Privalomi laukai. Jūsų duomenys yra saugūs.
            </p>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};