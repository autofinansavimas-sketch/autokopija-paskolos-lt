# Aktyvaus `/admin` Facebook kelio pataisa

## Tikslas
Užtikrinti, kad tikrame `/admin` Facebook skirtuke, kuriame rodomas tekstas apie tikrus Meta identifikatorius, visada būtų matomi „Prijungti Meta“ ir „Integracijos būsena“ valdikliai.

## Veiksmai
1. Patvirtinti vienintelį aktyvų `/admin` maršrutą ir Facebook skirtuko JSX šaką.
2. Toje pačioje šakoje sutvarkyti valdiklių išdėstymą be papildomų vaidmens sąlygų ar alternatyvaus Facebook komponento.
3. Nepaliesti Facebook kortelių, klientų, paraiškų ir Meta serverio konfigūracijos.
4. Prisijungus atidaryti peržiūros `/admin → Facebook`, patikrinti abu mygtukus ir jų tikrus dialogus.
5. Nepublikuoti.

## Techninė informacija
- Aktyvus maršrutas: `src/App.tsx` perduoda `/admin` tiesiai į `src/pages/Admin.tsx`.
- Tikslinis blokas yra `TabsContent value="facebook"` faile `src/pages/Admin.tsx`.
- Valdikliai naudoja realias serverio funkcijas per `MetaConnectPanel` ir `MetaHealthPanel`; fiktyvūs duomenys nebus kuriami.
