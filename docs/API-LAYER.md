## Hybrid API-lag for POC

### 1. Formål
API-laget i prosjektet fungerer som et lag mellom UI og TESS API med det formål å

- Skjerme frontend fra endringer i eksterne API-kontrakter der det er mulig.
- Samle autentisering, sesjonshåndtering og feilhåndtering ett sted.
- Støtte lokal utvikling og testing gjennom interne API-ruter og mock-flyt der det er nødvendig.
- Gjøre utvikling og testing mulig også uten dedikert sandbox.
- Legge til rette for en konsistent POC-arkitektur.

### 2. Prinsipper
Vi speiler ikke hele Swagger/API-flaten til TESS. Vi implementerer kun endepunkter og integrasjoner som støtter kjerneflytene for POC-en:

1. Login/autorisering som tenant
2. Varemottak
3. Sporingsforberedende ordrevisualisering

Kontrakten i BFF-/mellomlaget (Backend-For-Frontend) eies av prosjektet og er bevisst smalere enn det eksterne API-et. Der server-side integrasjon ikke lot seg gjennomføre som planlagt, brukes et klientbasert adapterlag som midlertidig fallback.
*`https://www.geeksforgeeks.org/system-design/backend-for-frontend-pattern/`

### 3. Typer routing
Vi har to ulike typer routing i samme prosjekt: sideruter og API-ruter.

- Sideruter (`page.tsx`) styrer hva brukeren ser i nettleseren og hvilken URL som viser hvilken side.
    - Skrevet i typescript + JavaScript XML og er laget som tynne wrappers som kun rendrer en feature-komponent.
- API-ruter (`route.ts`) eksponerer HTTP-endepunkter internt i appen og returnerer data, ikke UI.

I tillegg finnes et eget UI-/featurelag i `features`, der selve sideinnholdet og interaksjonslogikken ligger. Denne strukturen gir en tydelig oppdeling mellom:

- `app/` = routing og framework-lag
- `app/api/` = interne API-ruter / server-side mellomlag
- `features/` = UI og funksjonell frontendlogikk
- `lib/` = typer, hjelpefunksjoner og adaptere

### 4. Interne endepunkter i POC
Disse endepunktene utgjør prosjektets interne API-kontrakt:

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/me` (routes til dashbord)
- `POST /api/receipts`

- `GET /api/orders/`
    ...ble ikke stående som aktiv løsning i fase 2 fordi server-side kall mot TESS sitt ordre-endepunkt ble stoppet av Cloudflare. Ordrehenting skjer derfor foreløpig via et klientbasert adapterlag i frontend.

Mock-støtte brukes der den faktisk er nødvendig for POC-flyten:
1. `POST /api/auth/login` for mock/dev-innlogging
2. `GET /api/me` for mock-basert brukeroppslag
3. `POST /api/receipts` for prototype av mottaksregistrering

Eventuelle ekstra ruter legges kun til dersom de støtter en konkret del av kjerneleveransen.

### 5. Eksternt API og miljø
- Primær base-URL: `https://api.tessix.no/`
- Prosjektet har ikke hatt et eget fullverdig testmiljø/sandbox.
- Ekte API-kall og lokal mock-flyt må støttes avhengig av hva som er tilgjengelig i utviklingssituasjonen.
- Enkelte kall fungerer i browser-kontekst, men ikke server-side fra localhost, noe som har påvirket valg av integrasjonsmønster i POC-en.

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
%% TODO

### 9. Mock-strategi
Siden prosjektet ikke har hatt et fullverdig testmiljø, støtter løsningen mock-modus der det er nødvendig under utvikling:
- Mock-bruker for dev-login
- Mock-basert `GET /api/me`
- Mock-basert `POST /api/receipts`

Ved manglende eller utløpt TESS-token kan appen kjøres i mock-mode med:
- `USE_MOCK_API=true` for server-side API-ruter
- `NEXT_PUBLIC_USE_MOCK_API=true` for klientflyt i login-siden

Effekt i dagens løsning:
- `POST /api/auth/login` setter lokal mock-cookie (`accessToken`) når mock-mode er aktiv.
- `GET /api/me` validerer cookie og returnerer mock-bruker i mock-mode.
- Live-kall til TESS brukes kun når mock-mode er av.

I dagens løsning er mock-strategien bevisst begrenset. Ordreintegrasjonen bruker ekte TESS-endepunkt i browser-kontekst, mens auth og mottaksregistrering fortsatt har lokal mock-støtte for utvikling og demo.

### 10. Feilhåndtering og logging
- Feilresponser håndteres eksplisitt før data brukes videre i applikasjonen.
- Logging er lagt på et nivå egnet for utvikling og debugging, uten å eksponere sensitiv informasjon i klienten.
- Autentiseringsfeil, nettverksfeil og manglende data håndteres med tydelige fallback- eller feilmeldinger.
- For ordreintegrasjonen ble feilhåndtering også et spørsmål om arkitektur, siden server-side proxy måtte erstattes av klientadapter som midlertidig løsning.

### 11. Avgrensning
- API-laget i prosjektet er et POC-lag, ikke en full produksjonsgateway.
- Fokus er på robuste flyter for kjerneleveransene, ikke komplett dekning av hele TESS API-flaten.
- Der server-side mellomlag ikke lot seg gjennomføre, brukes klientadapter som midlertidig løsning.
- Mottaksregistrering er foreløpig ikke ERP-integrert og lagres kun lokalt som demostøtte.
