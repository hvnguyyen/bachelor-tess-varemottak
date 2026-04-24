## Hybrid API-lag for POC

### 1. Formål
API-laget i prosjektet fungerer som et lag mellom UI og TESS API med det formål å

- Skjerme frontend fra endringer i eksterne API-kontrakter der det er mulig
- Samle autentisering, sesjonshåndtering og feilhåndtering ett sted
- Støtte lokal utvikling og testing gjennom interne API-ruter og mock-flyt der det er nødvendig
- Gjøre utvikling og testing mulig også uten dedikert sandbox
- Legge til rette for en konsistent POC-arkitektur

### 2. Prinsipper
Vi speiler ikke hele Swagger/API-flaten til TESS. Vi implementerer kun endepunkter og integrasjoner som støtter kjerneflytene for POC-en:

1. Login/autorisering som tenant
2. Varemottak
3. Sporingsforberedende ordrevisualisering

Kontrakten i BFF-/mellomlaget (Backend-For-Frontend) eies av prosjektet og er bevisst smalere enn det eksterne API-et. Der server-side integrasjon ikke lar seg gjennomføre som planlagt, vil vi vurder å bruke et klientbasert adapterlag som midlertidig fallback. Vi tilstreber å holde arkitekturen konsistent ved å kun implementere ett enkelt mellomlag.

*BFF: `https://www.geeksforgeeks.org/system-design/backend-for-frontend-pattern/`

### 3. Typer routing
Vi har to ulike typer routing i samme prosjekt: sideruter og API-ruter.

- Sideruter (`page.tsx`) styrer hva brukeren ser i nettleseren og hvilken URL som viser hvilken side
    - Skrevet i typescript + JavaScript XML og er laget som tynne wrappers som kun rendrer en feature-komponent
- API-ruter (`route.ts`) eksponerer HTTP-endepunkter internt i appen og returnerer data, ikke UI

I tillegg finnes et eget UI-/featurelag i `features`, der selve sideinnholdet og interaksjonslogikken ligger. Denne strukturen gir en tydelig oppdeling mellom:

- `app/` = routing og framework-lag
- `app/api/` = interne API-ruter / server-side mellomlag
- `features/` = UI og funksjonell frontendlogikk
- `lib/` = typer, hjelpefunksjoner og adaptere

### 4. Interne endepunkter i POC
Disse endepunktene utgjør prosjektets interne API-kontrakt:

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/receipts`

- `GET /api/me` (routes til dashbord)
- `GET /api/orders/` (server-side kall for ordrehenting er fikset fra fase 2)
- `GET /api/warehouses`

Mock-støtte brukes der den faktisk er nødvendig for POC-flyten:
1. `POST /api/auth/login` for mock/dev-innlogging
2. `GET /api/me` for mock-basert brukeroppslag
3. `POST /api/receipts` for prototype av mottaksregistrering

Eventuelle ekstra ruter legges kun til dersom de støtter en konkret del av kjerneleveransen.

### 5. Eksternt API og miljø
- Primær base-URL: `https://api.tessix.no/` (TESS_API_BASE_URL)
- Ordrehenting base-URL: `https://30011-proxyapi-cuafeua6bha7ckby.norwayeast-01.azurewebsites.net` (TESS_ORDERS_API_BASE_URL)
- Next Public base-URL: `https://api.tessix.no` (NEXT_PUBLIC_API_BASE_URL)
- Prosjektet har ingen, og har ikke hatt et eget fullverdig testmiljø/sandbox
- Ekte API-kall og lokal mock-flyt må støttes avhengig av hva som er tilgjengelig i utviklingssituasjonen
- Enkelte kall fungerer i browser-kontekst, men ikke server-side fra localhost, noe som har påvirket valg av integrasjonsmønster i POC-en

### 6. Kjerneflyt for login/auth/session (fase 1)
1. Bruker åpner webappen på `/login`
2. Bruker velger `Logg inn som Tenant`
3. Frontend redirecter til `GET https://api.tessix.no/auth/tenant?returnTo=<app>/auth/complete`
4. TESS backend redirecter videre til CIAM / Entra ID
5. Etter vellykket innlogging returneres bruker til `https://api.tessix.no/auth/tenant/callback?...`
6. TESS backend setter session-cookie (`accessToken`) og redirecter tilbake til `returnTo`
7. Appen lander på `/auth/complete`
8. `/auth/complete` prøver først `GET https://api.tessix.no/user` med `credentials: include`
9. Dersom dette ikke lykkes, brukes intern fallback `GET /api/me`
10. Ved gyldig sesjon lagres relevant brukerprofil lokalt og bruker sendes videre til `/dashboard`
11. Ved logout kalles både `POST https://api.tessix.no/logout` og intern `POST /api/auth/logout`
12. Lokal brukerprofil, localhost-cookie og TESS sin `accessToken`-cookie ryddes før bruker sendes tilbake til `/login`

Merk: Overliggende Entra/CIAM-sesjon termineres ikke nødvendigvis fullt ut i samme steg, noe som kan gi sømløs ny autentisering ved neste login.

### 7. Kjerneflyt for varemottak (fase 2)
1. Bruker åpner `Varemottak` fra dashboard
2. Appen henter relevant `customerNumber` fra innlogget brukerprofil
3. Bruker kan eksplisitt velge `Hent aktuelle ordredata`
4. Frontend henter ordredata fra `GET https://api.tessix.no/order/{customerNumber}` via klientadapter
5. Ordre vises i en komprimert tabell med én rad per ordrenummer og detaljvisning for ordrelinjer
6. Bruker kan åpne kamera for mottak av kolli
7. Strekkoder registreres i en midlertidig liste og duplikater avvises
8. Før innsending vises en bekreftelsesmodal med oppsummering av mottaket
9. Ved bekreftelse sendes mottaket til intern `POST /api/receipts`
10. Mock-ruten returnerer vellykket respons, og mottaket lagres lokalt i `localStorage` som midlertidig historikk

### 8. Kjerneflyt for sporingsverktøy (fase 3)
1. Bruker trykker på `Sporingsverktøy` fra dashboard
2. Sporingsverktøyet åpnes under `/track-parcel` og relevant data hentes fra lokal brukerprofil-helper
3. Tilgjengelige lagervalg hentes fra intern route `GET /api/warehouses` som proxier mot TESS sitt warehouse-endepunkt
4. Siden åpnes med `Hent Ordre`-knapp og filtervalg
5. Ved `Hent ordre` kaller frontend intern route `GET /api/orders?customerNumber=<customerNumber>&page=<page>&pageSize=<pageSize>`
6. Bruker kan velge fritekstsøk, lager, statuskode og antall ordre pr side og brukes på lastet siden i visningen
7. Intern `/api/orders` proxier server-side videre til TESS sitt ordre-endepunkt via Azure-base-URLen for ordreproxy
8. TESS returnerer ordre med `data` og `meta`
9. Frontend mapper ordredata til en sporingsrettet visningsmodell i `tracking.ts` og viser én rad pr ordrenummer
10. `Vis detaljer` gir detaljevisning for en ordre
11. `Forrige side` og `Neste side` lar bruker navigere mellom sider

### 9. Mock-strategi
Siden prosjektet ikke har hatt et fullverdig testmiljø, støtter løsningen mock-modus der det er nødvendig under utvikling:
- Mock-bruker for dev-login
- Mock-basert `GET /api/me`
- Mock-basert `POST /api/receipts`

Ved manglende eller utløpt TESS-token kan appen kjøres i mock-mode med:
- `USE_MOCK_API=true` for server-side API-ruter
- `NEXT_PUBLIC_USE_MOCK_API=true` for klientflyt i login-siden

Effekt i dagens løsning:
- `POST /api/auth/login` setter lokal mock-cookie (`accessToken`) når mock-mode er aktiv
- `GET /api/me` validerer cookie og returnerer mock-bruker i mock-mode
- Live-kall til TESS brukes kun når mock-mode er av

I dagens løsning er mock-strategien bevisst begrenset. Ordreintegrasjonen bruker ekte TESS-endepunkt i server-kontekst etter revidert løsning fra fase 2 til 3, mens auth og mottaksregistrering fortsatt har lokal mock-støtte for utvikling og demo.

### 10. Feilhåndtering og logging
- Feilresponser håndteres eksplisitt før data brukes videre i applikasjonen
- Logging er lagt på et nivå egnet for utvikling og debugging, uten å eksponere sensitiv informasjon i klienten
- Autentiseringsfeil, nettverksfeil og manglende data håndteres med tydelige fallback- eller feilmeldinger
- For å holde arkitekturen konsistent ble klient-adapter work-around-løsningen fra fase 2 erstattet med server-side proxy i en senere iterasjon da dette lot seg gjøre via ny base-URL fra oppdragsgiver. Dette resulterer riktignok i at accessToken i noen tilfeller vil utløpe, og må da manuelt hentes fra devTools på `Tessix.no` og oppdateres i miljøvariabler-filen

### 11. Avgrensning
- API-laget i prosjektet er et POC-lag, ikke en full produksjonsgateway
- Fokus er på robuste flyter for kjerneleveransene, ikke komplett dekning av hele TESS API-flaten
- Mottaksregistrering er foreløpig ikke ERP-integrert og lagres kun lokalt som demostøtte
- Server-side proxy beholdes selv om lokal utvikling fortsatt er avhengig av manuelt oppdatert accessToken ved utløpt token