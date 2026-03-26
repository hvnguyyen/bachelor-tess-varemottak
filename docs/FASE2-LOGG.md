# Varemottaks-flyt fase 2 - løpende prosesslogg (POC)

## 1. Oppdatert info før implementasjon av fasen

Opprinnelig scope:

Nytt scope:

Vi skal fremdeles implementere en hybrid:
✔️ Ordrevisualisering (fra ekte API)
✔️ QR scanning (som prototype)
men:
❌ Ikke full mottaksregistrering

## start med:
0. Fjern mock-data som blokkerer ekte varemottak og sporingsflyt
1. Få GET /order/169999 til å virke i vår egen proxy-route
2. Rendér responsen i en tabell
3. Lage en enkel detaljvisning for ordrelinjer
4. Deretter bygge en QR prototype
5. Til slutt rydde og dokumentere

## wip:
- brukeren min jakob@kallevik.no har tilgang til 169999
- har 676665@stud.hvl.no også tilgang?

- GET /order/169999 fungerer i browser

- faktisk respons er annerledes enn Swagger eksempelet, da responsen er wrappet
    - ekte respons: har data: {ordrelinjer} og meta: {meta-data}
    -> ikke bare en ren array:

Vi må korrigere datamodellen til:
data: Order[]
meta: OrdersMeta

=> Dette betyr: 
- browser + sesjon-cookie fungerer, ikke at /api/orders-proxien fungerer server-side

Status akkurat nå: Server-side proxy ble stoppet av Cloudfare
- http://localhost:8080/api/orders?customerNumber=169999 ga "<!DOCTYPE html> Just a moment..." osv
- Browseren min kalte vår Next.js route: /api/orders?customerNumber=169999
- Inne i app/api/orders/route.ts gjorde serveren et Axios-kall til: https://api.tessix.no/order/169999
- > I stedet for JSON svarte upstream med Cloudfare HTML challenge
- Routen vår tok svaret og sendte tilbake til browser 

Cloudfare behandler serverkallet annerledes enn browserkallet

## Klientkall fra frontend vs Egen proxy-route i Next-applikasjonen

1. Klientkall fra frontend
Frontend kaller TESS direkte: <React/Next frontend> -> <`https://api.tessix.no/order/169999`>

+
.) raskere å få opp å gå
.) færre lag å debugge
.) enklere henting og visning av data

-
.) frontend blir tett koblet til TESS sitt API (uten vårt interne API-lag)
.) vanskeligere å normalisere respons ett sted
.) vanskeligere å bytte til live senere
.) må håndtere CORS og cookie i browser

2. Egen proxy-route i Next.js
Frontend kaller vår egen rute: <React/Next frontend> -> </api/orders -> `api/tessix.no/order/169999`>

.) eier API-kontrakten selv
.) lettere å normalisere respons
.) lettere å bytte mellom mock og ekte API
.) mindre CORS-trøbbel
.) penere arkitektur i rapporten

-
.) mer kode og oppsett
.) auth/cookie-forwarding kan bli knotete

## Vi prøver følgende:
1. Next.js proxy route
2. Hvis Cloudfare faktisk stopper for server-side proxy, er dette et reelt teknisk hinder og bruker fallback:
    - klientkall, men kapsler det inn i et adapterlag frontend

Inne på varemottak skal innlogget bruker kunne se ordrene tilknyttet kundenummer den brukeren har tilgang på/ansvar for

=> Resultat ved å bruke accessToken fra Tessix i .env.local:
- Cloudfare HTML

token er ikke hovedproblemet, men server-side kallet blir stoppet