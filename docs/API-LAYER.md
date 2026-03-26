## Hybrid API-lag for POC

### 1. Formål

API-laget i prosjektet fungerer som et lag mellom UI og TESS API med det formål å

- Skjerme frontend fra endringer i eksterne API-kontrakter.
- Samle autentisering, sesjonshåndtering og feilhåndtering ett sted.
- Gjøre utvikling og testing mulig også uten dedikert sandbox.


### 2. Prinsipper

Vi speiler ikke hele Swagger/API-flaten til TESS. Vi implementerer kun endepunkter som trengs for POC-flytene:

1. Login/autorisering som tenant
2. Varemottak
3. Sporing

Kontrakten i BFF*-laget (Backend-For-Frontend) eies av prosjektet og kan være smalere og mer stabil enn eksternt API.
*`https://www.geeksforgeeks.org/system-design/backend-for-frontend-pattern/`


## 3. Typer routing

Vi har to ulike typer routing i samme prosjekt. Sideruter og API-ruter.

Sideruter er for hva brukeren ser i nettleser og API-ruter er for dataflyt mellom appen og backend

API-rutene `route.ts` (typescript) eksponerer HTTP-endepunktene og viser ikke UI, men binder backend til frontend ved å returnere JSON responses.

Siderutene `page.tsx` (typescript + JavaScript XML) er brukergrensesnittet og bestemmer hvilken URL som viser hvilken side i nettleseren. Disse er laget som tynne wrappers som kun rendrer en feature-komponent.

Så har vi selve UI-logikken og sideinnholdet, som er komponentene brukeren faktisk ser og interagerer med. Også skrevet i typescript + JSX.


### 4. Interne endepunkter i POC

Disse endepunktene utgjør prosjektets interne API-kontrakt:

- `POST /api/auth/login`
- `POST /api/auth/logout`

- `GET /api/me` (routes til dashbord)

- `POST /api/receipts` (foreløpig aktiv som mock API-route)
- `GET /api/orders/:customerNumber` (routes til sporingsverktøy)

POST /api/receipts er foreløpig aktiv kun for å demonstrere flyten, flere mock-ruter legges til når vi trenger dem i UI:
1. POST /api/auth/login når vi teknisk starter med Entra-auth i kode
2. GET /api/me når vi starter Entra/session-flow
3. GET /api/orders/:customerNumber når sporingssiden kobles mot API

Eventuelle ekstra ruter legges kun til dersom de støtter en konkret del av kjerneleveransen.


### 5. Eksternt API og miljø

- Primær base-URL: `https://api.tessix.no/`
- Per nå finnes ikke et eget testmiljø/sandbox.
- Prosjektet må derfor kunne kjøre med lokal mock-data ved behov.


### 6. Kjerneflyt for login/auth/session (fase 1)

1. Bruker åpner webapp i nettleser `.../login`
2. Bruker redirectes til CIAM for autentisering via Entra ID-flyt
3. `app/auth/tenant/callback?` setter en sesjonscookie på tessix.no
4. `/auth/complete` prøver `GET https://api.tessix.no/user`
5. Gyldig cookie/sesjon etableres og `GET /api/me` brukes som fallback
6. Frontend kaller `GET /api/me` som gjør en proxy mot `GET /user` for å verifisere sesjon og henter innlogget brukers informasjon.
7. Brukerinfo brukes til videre kall, f.eks. `GET /api/orders/:customerNumber` som da vil gjøre en proxy mot `GET /order/{customerNumber}`.
8. Ved `401` eller `"Token expired"` gjøres en re-auth og ny sesjon hentes før nytt forsøk.


### 7. Kjerneflyt for varemottak (fase 2)
%% TODO


### 8. Kjerneflyt for sporingsverktøy (fase 3)
%% TODO


### 9. Mock-strategi
Siden testmiljø mangler, skal API-laget støtte mock-modus under dev:
- Faste JSON-fixtures for bruker, ordre/forsendelser og mottakssvar.
- Simulering av vanlige feil (f.eks. `401`, timeout, tom respons).
- Lik responsstruktur i mock og live-modus, slik at UI kan utvikles uten å bytte kodeflyt.

Ved manglende/utløpt TESS-token kan appen kjøres i mock-mode med:
- `USE_MOCK_API=true` (server-side API-ruter)
- `NEXT_PUBLIC_USE_MOCK_API=true` (klientflyt i login-siden)

Effekt i dagens løsning:
- `POST /api/auth/login` setter lokal mock-cookie (`accessToken`) når mock-mode er aktiv.
- `GET /api/me` validerer cookie og returnerer mock-bruker i mock-mode.
- Live-kall til TESS brukes kun når mock-mode er av.


### 10. Feilhåndtering og logging
- Standardiserte feilresponser.
- Logging på nivå egnet for utvikling/debugging (ikke sensitiv informasjon i klientlogger).
- Tydelig håndtering av autentiseringsfeil, nettverksfeil og manglende data.


### 11. Avgrensning
- API-laget vårt er et POC-lag og ikke en full produksjonsgateway.
- Fokus er på robust flyt for kjerneleveransen, ikke komplett dekning av alle TESS-endepunkter.