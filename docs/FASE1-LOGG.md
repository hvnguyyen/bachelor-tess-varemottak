# Auth-flyt fase 1 - prosesslogg (POC)

## 1. Initiell implementasjonsplan:
#1. Etablere UI for login-side i appen for tenant- og SSO-innlogging
#2. Lage en enkel dev/mock-fallback-flyt for lokal testing
#3. Koble appen mot TESS sitt auth-oppsett
  - Redirecte bruker til TESS sine auth-endepunkter
  - Sende bruker videre til Entra/CIAM
  - Sørge for at bruker returneres til appen etter vellykket innlogging
#4. Implementere callback- og sesjonsvalidering
#5. Hente brukerdata og avgjøre om innlogging er gyldig
#6. Opprette interne API-ruter for login/logout/session
#7. Redirecte til dashboard ved gyldig sesjon
#8. Rydde lokal state/cookies ved logout og ny innlogging
#9. Teste end-to-end-innloggings-flyt i nettleser
#10. Dokumentere kjente begrensninger, workarounds og endelig flyt

## 2. Hva som ble implementert
#1. & #2 Login-side med tre valg:
  - `Logg inn som Tenant`
  - `Logg inn med SSO` (Ikke fungerende)
  - `Logg inn med TTM ID` (dev/mock)

#3. Koble appen mot TESS sitt auth-oppsett
  - Frontend redirecter til `GET https://api.tessix.no/auth/tenant?returnTo=<app>/auth/complete`
  - TESS backend redirecter til CIAM authorize

#4. Callback- og sesjonsvalidering
  - Callback-side: `/auth/complete`
  - Alias for kompatibilitet: `/auth-complete` -> redirect til `/auth/complete`

#5. Gyldig innlogging med brukerdata
  - Intern bruker-rute: `GET /api/me`

#6. Interne API-ruter for loing/logout/session
  - Mock-provider for dev: `GET /api/mock-auth/[mode]`
  - Intern login-rute: `POST /api/auth/login`

#7. Redirect til dashboard ved gyldig sesjon
  - Backend setter session-cookie (`accessToken`) og redirecter til `returnTo` som gjør en redirect til `/dashboard` med riktig bruker

#8. Lokal state/cookies clean-up ved logout og ny innlogging
  - logout/cleanup er ikke implementert i faktisk brukerflyt
  - Nettleser husker cookies og logger bruker automatisk inn selv ved terminering av server
  - i DashboardPage.tsx gjør 'Logg ut' bare: `localStorage.removeItem("employeeId")`og `router.push(")`
  - Intern logout-rute for å rydde lokal cookie: `POST /api/auth/logout`

#9. End-to-end innloggings-flyt testet i nettleser
  - Tenant-flyt fungerer end-to-end med unntak av at state/cookies ikke ryddes ved logout
  - SSO-flyten ble forsøkt, men satt på vent på grunn av manglende tilganger

#10. Dokumentasjon
  - Rapport ferdig utfylt, kode clean-up og docs oppdatert

## 3. Endelig flyt (nåværende baseline for tenant-innlogging)
1. Bruker åpner `/login`
2. Klikker `Logg inn som Tenant`
3. Frontend redirecter til `GET https://api.tessix.no/auth/tenant?returnTo=<app>/auth/complete`
4. TESS backend redirecter til CIAM authorize
5. Bruker logger inn
6. CIAM redirecter til `https://api.tessix.no/auth/tenant/callback?code=...`
7. Backend setter session-cookie (`accessToken`) og redirecter til `returnTo`
8. App lander på `/auth/complete`
9. `/auth/complete` validerer session:
   - først `GET https://api.tessix.no/user` med `credentials: include`
   - fallback til intern `GET /api/me`
10. Ved 200: redirect til `/dashboard` med riktig bruker

## 4. Nøkkelpunkter og viktigste feilbilder og årsaker

# 4.1 Generelle HTTP-status feilmeldinger
- `404` på login-ruter ved feil endpoint-path i tidlig fase.
- `405` oppstod ved GET mot route som kun støtter POST.
- `401` på `/login/cookie` ved placeholder eller ugyldige tokens.
- Redirect til nettbutikk i stedet for app da `state.returnTo` pekte til `https://tessix.no/no`.
- `auth_failed` etter callback pga session validering feilet på `/auth/complete`.
- Variasjon i cookie-policy/browser-kontekst (særlig incognito/third-party cookies).
- Mock-bruker “forurenset” tenant-test da lokal mock-cookie kunne bli hengende.
- Mock-cookie kollisjon ved at ekte tenant session cookie ble laget på tessix.no, og en lokal mock-cookie (accessToken) på localhost

# 4.2 Callback/session
Med third-party-cookies blocked klarer ikke /auth/complete å validere sesjonen mot api/tessix.no og man havner på `login?error=auth_failed`. Med third-party-cookies blir cookie sendt med, /user returnerer riktig data og man logges inn på dashboard.

Tenant-login fungerer end-to-end i normal nettleserkontekst. I inkognito/private mode kan flyten feile dersom tredjepartscookies blokkeres, fordi sesjonscookie fra api.tessix.no da ikke blir sendt i valideringssteget fra localhost.

# 4.3 Work-arounds/ Avklaringer fra oppdragsgiver
- Fikk etterhvert bekreftet av oppdragsgiver at Entra godtar localhost (men på port 8080, og ikke 3000 som vi brukte) som redirect og Entra-tokens skal brukes mot `POST /login/cookie`. Nøkkelnavn ble avklart og brukes i lokal `.env.local`, og skal holdes lokalt per utvikler.

## 5. Presise avgrensinger (kjente begrensninger som må dokumenteres i rapport)
- Incognito/private mode kan blokkere third-party cookies og gi `auth_failed`, selv om flyten ellers er korrekt.
- Tester må kjøres med riktig cookie-policy når session valideres cross-site fra `localhost`.
- Mock-innlogging skal kun brukes for utvikling og demo fallback.

## 6. Oppsummering / Konklusjon av fase 1
Fasen for auth-baseline er funksjonell for POC i normal nettleserkontekst, og følgende er verifisert i nettleser:
- Tenant-login fungerer end-to-end
  - `GET https://api.tessix.no/user` returnerer brukerprofil med 200.
  - Request inneholder `Cookie: accessToken=...`.
  - Redirect-kjeden lander på `/auth/complete` og videre til `/dashboard`.
  - Sesjon etableres, bruker valideres og dashboard lastes inn med viser riktig Tessix-bruker (ikke mock-bruker).

## 7. Refleksjonsnotat i retrospekt (til sluttrapport)
I fase 1 etablerte vi en fungerende autentiseringsflyt mot TESS sitt backend-only auth-oppsett med Entra/CIAM. Etter iterativ feilsøking av redirect, session-cookie og cross-site validering landet vi på en stabil løsning der bruker autentiseres via `/auth/tenant`, returneres til appens callback-side, valideres mot `GET /user`, og sendes til dashboard med korrekt brukerprofil. Arbeidet avdekket særlig viktigheten av cookie-policy i utviklingsmiljø (`localhost`) og tydelig ansvarsdeling mellom frontend og backend i auth-flyten.
