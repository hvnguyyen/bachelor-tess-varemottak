# Fase 1 (Auth) - erfaringsskriv og løpende mini-rapport

## Formål med dette dokumentet
Dette dokumentet oppsummerer arbeid, funn, feilbilder, avklaringer og midlertidige workarounds i fase 1 (autentisering) av bachelorprosjektet. Målet er å ha en praktisk logg som kan brukes direkte i videre utvikling og i sluttrapport.

## Periode
- Arbeidslogg i denne versjonen: 24.-25. februar 2026

## Kort status
- API-proxy via Next.js er etablert.
- `GET /api/me` fungerer og returnerer JSON-data fra TESS sitt `GET /user` når gyldig token brukes.
- Ekte login-flyt via `POST /login/cookie` er ikke fullført enda, fordi den krever gyldige Entra-tokens (`idToken` + `accessToken`).

## Hva som er gjort
- Miljøvariabler satt opp i `.env.local` for base URL og midlertidig token.
- Felles klient laget (`tessClient`) for API-kall mot `https://api.tessix.no`.
- Intern route laget for `GET /api/me` som proxier mot `GET /user`.
- Intern route laget for `POST /api/auth/login` (WIP, flyt testes/justeres).
- Postman tatt i bruk for isolert testing av endepunkter.

## Feilbilder vi traff, og hva de betydde
- `405 Method Not Allowed` på `/api/auth/login`:
  - Oppstod ved GET i nettleser.
  - Forventet når route kun har `POST`.
- `404 Not Found`:
  - Oppstod ved feil endpoint-path i tidlig fase (`/auth/login` i stedet for faktisk login-path hos TESS).
- `500` i intern route:
  - Oppstod som proxy-feil når upstream-kall feilet.
  - Brukt for å identifisere at feilen egentlig kom fra TESS-kall.
- `401` på `POST /login/cookie`:
  - Oppstod når placeholder-verdier fra Swagger (`"string"`) ble sendt som tokens.
  - Bekreftet at endpoint krever reelle Entra-tokens.
- `403` på `GET /api/me`:
  - Oppstod ved ugyldig/utløpt token eller manglende tilgang.
- `timeout (10s)` på `/api/me`:
  - Oppstod i enkelte kall og ga `500` i proxy.

## Midlertidige workarounds brukt så langt
- Midlertidig utviklingsflyt med gyldig `accessToken` i `.env.local` for å verifisere API-lag og videre UI-arbeid.
- Fokus på å få en stabil `GET /api/me`-validering for session-check.
- Separat testing i Postman for å skille route-/kodefeil i egen app fra auth-/tilgangsfeil mot TESS API.

## Viktige avklaringer fra TESS (mottatt 25. februar 2026)
- Vi kan se referanseimplementasjon i delt repo.
- En env-konfig er tidligere delt med teamet (via Vinh).
- TESS sender forespørsel om oppkobling mot testkunde (neste dag).
- Entra godtar localhost som redirect.
- Flytpunkt #1 ble bekreftet som riktig: Entra-tokens skal brukes mot `POST /login/cookie`.

## Entra/env-konfig avklart (side 2 i oppgavebeskrivelse)
Følgende nøkkelnavn er nå avklart og kan brukes i lokal `.env.local`:

- `NEXTAUTH_URL`
- `NEXT_PUBLIC_API_BASE_URL`
- `AUTH_TRUST_HOST`
- `NEXTAUTH_SECRET`
- `AUTH_MICROSOFT_ENTRA_ID_ID_TENANT_USER`
- `AUTH_MICROSOFT_ENTRA_ID_SECRET_TENANT_USER`
- `AUTH_MICROSOFT_ENTRA_ID_ISSUER_TENANT_USER`
- `AUTH_MICROSOFT_ENTRA_ID_ID_SSO_USER`
- `AUTH_MICROSOFT_ENTRA_ID_SECRET_SSO_USER`
- `AUTH_MICROSOFT_ENTRA_ID_ISSUER_SSO_USER`

Notat:
- Verdier/hemmeligheter skal ikke inn i repo.
- `.env.local` skal holdes lokalt per utvikler.

## Hva dette betyr teknisk
- Vi kan ikke ferdigstille ekte `POST /login/cookie`-flow uten gyldig `idToken` + `accessToken` fra Entra.
- Når testkunde og riktig tokenflyt er klar, kan login fullføres end-to-end.

## Gjenstående arbeid for å fullføre fase 1
- Bekrefte nøyaktig tokeninnhenting fra Entra i frontend (samme som i referanserepo).
- Implementere/justere `POST /api/auth/login` slik at den sender `idToken` og `accessToken` til TESS `POST /login/cookie`.
- Lese cookie/session robust i `GET /api/me`.
- Koble login-UI til intern login-route: login -> cookie settes -> `/api/me` validerer -> dashboard.
- Legge inn tydelig håndtering ved `401/403` (redirect tilbake til login).

## Forslag til Definition of Done (fase 1)
- Bruker kan logge inn via reell Entra-flyt.
- `POST /login/cookie` returnerer vellykket og session-cookie er satt.
- `GET /api/me` returnerer forventet brukerdata etter login.
- Ved utløpt/ugyldig session sendes bruker kontrollert tilbake til login.
- Ingen hard avhengighet til manuelt token i `.env.local` for normal innlogging.

## Løpende logg (fortsett her)
### 25. februar 2026
- Verifisert at `GET /api/me` fungerer med gyldig token.
- Verifisert at placeholder-tokens mot `POST /login/cookie` gir `401`.
- Mottatt avklaringer fra TESS om referanserepo, localhost redirect og testkunde.
- Verifisert env-nøkkelsett fra oppgavebeskrivelse (side 2), klart for implementering mot delt login-flyt.

### Neste oppdatering (mal)
- Dato:
- Hva ble implementert:
- Hva fungerte:
- Hvilke feil oppstod:
- Hvordan de ble løst:
- Hva står igjen:

## Notater for rapportskriving senere
- Denne loggen kan brukes direkte i metode- og gjennomføringskapittelet.
- Feilkoder og tiltak gir godt grunnlag for refleksjon rundt iterativ utvikling, risiko og avhengigheter mot ekstern API/autentisering.
