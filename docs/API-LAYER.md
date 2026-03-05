## API-lag (BFF) for POC

### 1. Formål
API-laget i prosjektet fungerer som et BFF-lag (Backend for Frontend) mellom UI og TESS API.
Målet er å:

- Skjerme frontend fra endringer i eksterne API-kontrakter.
- Samle autentisering, sesjonshåndtering og feilhåndtering ett sted.
- Gjøre utvikling og testing mulig også uten dedikert sandbox.

### 2. Prinsipper
Vi speiler ikke hele Swagger/API-flaten. Vi implementerer kun endepunkter som trengs for POC-flytene:

1. Login/auth
2. Varemottak
3. Sporing

Kontrakten i BFF-laget eies av prosjektet og kan være smalere og mer stabil enn eksternt API.

### 3. Eksternt API og miljø

- Primær base-URL: `https://api.tessix.no/`
- Per nå finnes ikke et eget testmiljø/sandbox.
- Prosjektet må derfor kunne kjøre med lokal mock-data ved behov.

### 4. Kjerneflyt for auth/session (fase 1)

1. Bruker autentiseres via Entra ID-flyt.
2. Gyldig cookie/sesjon etableres.
3. Frontend kaller `GET /api/me` (proxy mot `GET /user`) for å verifisere sesjon og hente kundeinformasjon.
4. Kundegrunnlag brukes til videre kall, f.eks. `GET /api/orders/:customerNumber` (proxy mot `GET /order/{customerNumber}`).
5. Ved `401` eller `"Token expired"`: gjennomfør re-auth og hent ny sesjon før nytt forsøk.

`GET /api/me` er dermed standard for session bootstrap/validering i klientflyten.

### 5. Interne BFF-endepunkter i POC

Disse endepunktene utgjør prosjektets interne API-kontrakt:

- `POST /api/auth/login`
- `GET /api/me` (routes til dashbord)
- `POST /api/receipts` (foreløpig aktiv som mock API-route)
- `GET /api/orders/:customerNumber` (routes til sporingsverktøy)

POST /api/receipts er foreløpig aktiv kun for å demonstrere flyten, flere mock-ruter legges til når vi trenger dem i UI:
1. POST /api/auth/login når vi teknisk starter med Entra-auth i kode
2. GET /api/me når vi starter Entra/session-flow
3. GET /api/orders/:customerNumber når sporingssiden kobles mot API

Eventuelle ekstra ruter legges kun til dersom de støtter en konkret del av kjerneleveransen.

### 6. Mock-strategi

Siden testmiljø mangler, skal API-laget støtte mock-modus:

- Faste JSON-fixtures for bruker, ordre/forsendelser og mottakssvar.
- Simulering av vanlige feil (f.eks. `401`, timeout, tom respons).
- Lik responsstruktur i mock og live-modus, slik at UI kan utvikles uten å bytte kodeflyt.

#### Mock-mode toggle (implementert)

Ved manglende/utløpt TESS-token kan appen kjøres i mock-mode med:

- `USE_MOCK_API=true` (server-side API-ruter)
- `NEXT_PUBLIC_USE_MOCK_API=true` (klientflyt i login-siden)

Effekt i dagens løsning:

- `POST /api/auth/login` setter lokal mock-cookie (`accessToken`) når mock-mode er aktiv.
- `GET /api/me` validerer cookie og returnerer mock-bruker i mock-mode.
- Live-kall til TESS brukes kun når mock-mode er av.

### 7. Feilhåndtering og logging

- Standardiserte feilresponser fra BFF til frontend.
- Logging på nivå egnet for utvikling/debugging (ikke sensitiv informasjon i klientlogger).
- Tydelig håndtering av autentiseringsfeil, nettverksfeil og manglende data.

### 8. Avgrensning

- BFF-laget er et POC-lag og ikke en full produksjonsgateway.
- Fokus er på robust flyt for kjerneleveransen, ikke komplett dekning av alle TESS-endepunkter.
