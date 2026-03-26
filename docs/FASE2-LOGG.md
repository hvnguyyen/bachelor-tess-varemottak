# Varemottaks-flyt fase 2 - prosesslogg (POC)

## 0. Oppdatert info før implementasjon av fasen
Justert scope:
✔️ Ordrevisualisering (fra ekte API)
✔️ QR/strekkode scanning (kun prototype)
✔️ Mottaksregistrering uten backend-/ERP-integrasjon

## 1. Initiell implementasjonsplan:
#1. Fjern mock-data som blokkerer ekte varemottak og sporingsflyt
#2. Få GET /order/169999 til å virke i vår egen proxy-route
#3. Rendér responsen i en tabell
#4. Lage en enkel detaljvisning for ordrelinjer
#5. Deretter bygge en QR/strekkode prototype
#6. Rydde og dokumentere
#7. Eventuelle tillegg

## 2. Hva som ble implementert:
#1. Fjerning av mockdata:
- Ordre- og sporingsmock er fjernet for å hindre blokkering av ekte varemottaksflyt
- Auth-mock er beholdt

#2. GET /order/169999:
- GET /order/169999 fungerer i browser
- proxy-route finnes
- Cloudflare hindret oss i å proxy-route server-side, så flyten er implementert med kall fra klientkall fra frontend via en klientbasert adapter

#3 og #4. Rendre ordretabellen som respons & Lage en enkel detaljvisning av ordrelinjer pr ordre
- Ordretabellen i Varemottak viser en rad per ordrenummer, med detaljevisning per ordre
- Data lastes ikke automatisk, bruker må starte flyten manuelt

#5. QR-/strekkode-prototype
- QR er ikke verifisert, foreløpig kun en strekkodeprotype
- Kamera lastes heller ikke automatisk, bruker må først åpne Varemottak fra Dashbord, og deretter åpne skanning manuelt
- Kamera fungerer og skanning samler opp strekkoder i listevisning
- Innholdet av mottaket oppsummeres i en modal før bruker registrerer mottak

#6. Rydding og dokumentering
- Prosesslogg er skrevet løpende
- Dokumentasjon er gjort rede for
- Code-clean-up gjennomført

#7. Tillegg / annet:
- Bekreftelsesmodul før POST oppsummerer mottaket og fungerer kun som en 'submit-confirmation'
- En enkel historikkside med localStorage viser lokalt lagrede mottak på denne enheten/nettleseren
- Flyt er ferdig implementert, men UX og UI skal forbedres ved senere iterasjon

## 3. Endelig flyt (nåværende baseline)
1. Bruker åpner `/dashboard`
2. Klikker `Varemottak`
3. Appen åpner `Varemottak`-siden med to manuelle startpunkter:
    - `Hent aktuelle ordredata`
    - `Åpne kamera for mottak av kolli`
4. Hvis bruker velger `Hent aktuelle ordredata`:
    - frontend henter ordredata fra `GET https://api.tessix.no/order/169999`
    - ordre vises som komprimert tabell med én rad per ordrenummer
    - bruker kan filtrere og åpne detaljvisning for ordrelinjer
5. Hvis bruker velger `Åpne kamera for mottak av kolli`:
    - kameramodul aktiveres
    - hver registrering legges til i en midlertidig liste over kolli
    - strekkoder kan skannes eller legges inn manuelt
6. Når bruker klikker `Registrer mottak`:
    - en bekreftelsesmodal viser oppsummering av mottaket
    - bruker må eksplisit bekrefte før innsending
7. Ved bekreftelse sendes mottaket til intern `POST /api/receipts`
8. Mock-ruten returnerer vellykket respons med `receiptId``
9. Appen:
    - viser sukessmelding
    - tømmer midlertidig liste
    - lagrer mottaket lokalt i `localStorage`
10. Hvis det finnes lagret historikk, kan bruker åpne `Siste varemottak`og se tidligere registrerte mottak på samme enhet/nettleser

## 4. Nøkkelpunkter og viktigste feilbilder og årsaker

# 4.1 Ulik datamodell for ordre-respons
Faktisk respons fra TESS var noe annerledes enn i Swaggeren da denne responsen var wrappet med `data: Order[]` og `meta: {page, pageSize, totalPages, totalItems}`, og ikke bare en ren array. Vi korrigerte datamodellen til `data: Order[], meta: OrdersMeta`

# 4.2 Cloudflare HTML challenge
Problemet med server-side proxy skyldes Cloudflare, hvor lokal nettleser gjorde kall til vår Next.js route `/api/orders?customerNumber=169999`, og i routen `app/api/orders/route.ts` gjorde serveren et Axios-kall til: `https://api.tessix.no/order/169999`. Istedet for ønsket JSON respons svarte server-upstream med en Cloudflare HTML challenge. Routen vår `app/api/orders/route.ts` tok dette svaret og returnerte til nettleser.

Da Cloudflare behandler serverkallet annerledes enn browserkallet, og ettersom dette hindrer server-side proxying så vi oss nødt til å implementere enda et mellom-/integrasjonslag i form av en klientadapter hvor frontend kaller TESS API `https://api.tessix.no/order/169999` direkte.

# 4.3 Scannefunksjon med kamera
Foreløpig er QR-kode skanning ikke verifisert

## 5. Presise avgrensninger (kjente begrensninger)
Fase 2 er avgrenset til en demonstrerbar prototype av varemottaksflyten, ikke en full backend-integrert mottaksløsning. Ordredata hentes fra ekte TESS-endepunkt, men vises i en forenklet og brukerorientert tabellvisning. Selve mottaksregistreringen skjer foreløpig via intern mock-route med lokal historikk i localStorage, og ikke som endelig ERP-integrasjon. Løsningen demonstrerer derfor scanning, oppsummering og innsending av mottak, men ikke full produksjonsflyt på tvers av backend-systemer.

## 6. Oppsummering / Konklusjon av fase 2
Fasen for varemottak-baseline er funksjonell som POC for ordrevisualisering og prototype av mottaksregistrering, og følgende er verifisert i nettleser:
- Ordredata kan hentes fra `GET https://api.tessix.no/order/169999` i klientkontekst med gyldig sesjons-cookie.
- Ordredata vises i `Varemottak` som en komprimert tabell med én rad per ordrenummer.
- Detaljvisning per ordre åpner tilhørende ordrelinjer ved behov.
- Ordredata lastes ikke automatisk, men hentes eksplisitt av bruker gjennom filtrert ordrevisning.
- Kamera/scanner kan åpnes manuelt fra varemottaksmodulen og registrerer strekkoder i en midlertidig liste.
- Duplikate strekkoder blir avvist i registreringslisten.
- Bruker får en bekreftelsesmodal før innsending av mottak.
- `POST /api/receipts` fullføres mot intern mock-route.
- Registrerte mottak lagres lokalt i `localStorage` og kan vises i `Siste varemottak` på samme enhet/nettleser.

## 7. Retrospekt / Refleksjonsnotat
For en konsistent arkitektur ønsket vi utgangspunktet å holde all integrasjon i samme lag gjennom enda en route i Next.js-applikasjonen, og ved å følge denne arkitektoniske tanken får vi: 1) ett tydelig integrasjonslag, hvor UI kun kaller egne endepunkter, istedenfor å noen ganger kalle våre interne endepunkter, og noen ganger TESS direkte. 2) Det blir mindre kobling i frontend fordi frontend slipper å vite detaljer om TESS-URLer, cookies, parametre og responsformater og 3) mer fleksibilitet ved at normalisering og feilbehandling kan håndteres samme sted.

Forskjellen på mellomlagene våre nå er at det interne API-laget som mellomlag eksponerer egne HTTP-endepunkter i appen og kjøres på serversiden. Klientadapteren som mellomlag eksponerer ikke egne HTTP-endepunkter, og fungerer som kodeabstraksjon i frontend som kaller TESS direkte fra nettleser. Det vil si at vi får en delvis ny arkitektur bestående av:
- UI- og frontendlogikk
- Wrapper/page-filer (sideruter/entry points som viser feature-komponenter (UI))
- API-ruter (håndterer HTTP-kall, cookies, proxying og respons)
- 2 integrasjonslag:
    - Et server-side internt API-lag i appen
    - Et klientbasert adapterlag som gjør direkte kall til TESS gjennom lib/ordersClient for akkurat ordre-endepunktet