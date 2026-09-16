# Nauji lead'ai iš `receive-lead` automatiškai CRM'e

Šiuo metu atviras priėmimo taškas `receive-lead` įrašo duomenis tik į atskirą „leads" lentelę. Admin lenta „Paraiškos" jos nerodo, todėl nauji lead'ai nepasirodo darbo sąraše.

## Ką padarysime

1. Kiekvienas POST į `receive-lead` toliau saugomas „leads" lentelėje (istorija, visas originalus JSON), o papildomai sukuriama **paraiška** – lygiai tokia pati kortelė, kokias matote „Paraiškos" lentoje, stulpelyje „Nauji".
2. Kortelėje bus rodomas vardas, telefonas, el. paštas, biudžetas kaip suma ir reklamos grupės pavadinimas.
3. Dublikatų apsauga: jei tas pats telefonas arba el. paštas jau buvo atsiųstas per pastarąsias 24 val., nauja kortelė nekuriama – tik įrašas „leads" lentelėje. Taigi pakartotinis siuntimas nesukuria dvigubų kortelių.
4. Šie lead'ai nebus laikomi Facebook įrašais – jie eina į „Paraiškas", Facebook langas nepasikeičia.
5. Atsakymas siuntėjui papildomas informacija, ar kortelė buvo sukurta.

## Kaip lead'us siųsti

Bet kuri sistema (Zapier, Make, Meta CRM webhook, savo forma) siunčia:

```
POST https://jwruubwnqwibbdwkpksz.supabase.co/functions/v1/receive-lead
Content-Type: application/json

{ "full_name": "Vardas", "phone": "+3706...", "email": "a@b.lt",
  "Biudžetas": "20000", "adset_name": "Kampanija A" }
```

Prisijungimo nereikia. Užtenka bent telefono arba el. pašto.

## Techninės detalės

- `supabase/functions/receive-lead/index.ts`: po įrašymo į `leads` atliekamas dublikatų tikrinimas `contact_submissions` (`phone` arba `email`, per 24 val.) ir, jei dublikato nėra, INSERT su `source: "webhook"`, `status: "new"`, `amount` iš `Biudžetas`, `loan_type` iš `adset_name`. Naudojamas service role klientas (RLS apeinamas), klaidos nenutraukia pagrindinio įrašo.
- Serverio funkcija perdeployinama. Migracijų ar naujų paslapčių nereikia.
- Admin UI kodas nekeičiamas – kortelė atsiranda esamame „Nauji" stulpelyje.
