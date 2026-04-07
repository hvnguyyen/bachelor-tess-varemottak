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

#6. Interne API-ruter for login/logout/session
  - Mock-provider for dev: `GET /api/mock-auth/[mode]`
  - Intern login-rute: `POST /api/auth/login`

#7. Redirect til dashboard ved gyldig sesjon
  - Backend setter session-cookie (`accessToken`) og redirecter til `returnTo` som gjør en redirect til `/dashboard` med riktig bruker

#8. Lokal state/cookies clean-up ved logout og ny innlogging
  - Dashboard-logout kaller nå både TESS sitt `POST https://api.tessix.no/logout` og intern `POST /api/auth/logout`
  - Logout rydder lokal brukerprofil i `localStorage` (`user-profile` og `employeeId`)
  - Logout rydder lokal localhost-cookie og TESS sin `accessToken`-cookie
  - Bruker sendes deretter tilbake til `/login`

#9. End-to-end innloggings- og logout-flyt testet i nettleser
  - Tenant-login fungerer end-to-end i normal nettleserkontekst
  - Logout rydder lokal state, lokal cookie og TESS sin `accessToken`-cookie
  - SSO-flyten ble forsøkt, men satt på vent på grunn av manglende tilganger
  - Bbruker autentiseres fremdeles sømløst ved innlogging etterfulgt av utlogging (hvilket tyder på at overliggende Entra/CIAM-sesjon ikke nødvendigvis termineres nødvendigvis fullt ut)

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
11. Ved logout kaller dashboard både `POST https://api.tessix.no/logout` og intern `POST /api/auth/logout`
12. Appen rydder lokal brukerprofil i `localStorage` og sender bruker tilbake til `/login`

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
Med third-party-cookies blocked klarer ikke `/auth/complete` å validere sesjonen mot api/tessix.no og man havner på `login?error=auth_failed`. Med third-party-cookies blir cookie sendt med, `/user` returnerer riktig data og man logges inn på dashboard.

Tenant-login fungerer end-to-end i normal nettleserkontekst. I inkognito/private mode kan flyten feile dersom tredjepartscookies blokkeres, fordi sesjonscookie fra api.tessix.no da ikke blir sendt i valideringssteget fra localhost.

# 4.3 Work-arounds/ Avklaringer fra oppdragsgiver
Fikk etterhvert bekreftet av oppdragsgiver at Entra godtar localhost (men på port 8080, og ikke 3000 som vi brukte) som redirect og Entra-tokens skal brukes mot `POST /login/cookie`. Nøkkelnavn ble avklart og brukes i lokal `.env.local`, og skal holdes lokalt per utvikler.

# 4.4 Logout / sesjonsterminering
Logout ble forbedret slik at applikasjonen nå både rydder lokal brukerstate og kaller TESS sitt `POST /logout`-endepunkt. Dette medfører at lokal profilinformasjon, localhost-cookie og TESS sin `accessToken`-cookie slettes ved utlogging. Samtidig ble det observert at bruker i noen tilfeller fortsatt kan logge inn igjen uten manuell innskriving av legitimasjon. Dette indikerer at logout på applikasjons- og TESS-nivå fungerer, men at overliggende sesjon hos Microsoft Entra ID / CIAM ikke nødvendigvis termineres fullt ut i samme steg.


## 5. Presise avgrensinger (kjente begrensninger som må dokumenteres i rapport)
- Incognito/private mode kan blokkere third-party cookies og gi `auth_failed`, selv om flyten ellers er korrekt.
- Tester må kjøres med riktig cookie-policy når session valideres cross-site fra `localhost`.
- Mock-innlogging skal kun brukes for utvikling og demo fallback.
- Logout rydder lokal state og TESS sin `accessToken`-cookie, men overliggende Entra/CIAM-sesjon termineres ikke nødvendigvis fullt ut i samme steg.

## 6. Oppsummering / Konklusjon av fase 1
Fasen for auth-baseline er funksjonell for POC i normal nettleserkontekst, og følgende er verifisert i nettleser:
- Tenant-login fungerer end-to-end
  - `GET https://api.tessix.no/user` returnerer brukerprofil med 200.
  - Request inneholder `Cookie: accessToken=...`.
  - Redirect-kjeden lander på `/auth/complete` og videre til `/dashboard`.
  - Sesjon etableres, bruker valideres og dashboard lastes inn med viser riktig TESS-brukerprofil (Tessix).
  - Logout rydder lokal brukerprofil, lokal cookie og TESS sin `accessToken`-cookie
  - Logout kaller TESS sitt `POST /logout` og intern `POST /api/auth/logout`

## 7. Refleksjonsnotat i retrospekt (til sluttrapport)
I fase 1 etablerte vi en fungerende autentiseringsflyt mot TESS sitt backend-only auth-oppsett med Entra/CIAM. Etter iterativ feilsøking av redirect, session-cookie og cross-site validering landet vi på en stabil løsning der bruker autentiseres via `/auth/tenant`, returneres til appens callback-side, valideres mot `GET /user`, og sendes til dashboard med korrekt brukerprofil. 

I en senere iterasjon ble også logout-flyten forbedret slik at applikasjonen nå rydder både lokal state og TESS sin `accessToken`-cookie. Arbeidet avdekket særlig viktigheten av cookie-policy i utviklingsmiljø (`localhost`), tydelig ansvarsdeling mellom frontend og backend i auth-flyten, samt forskjellen mellom logout i applikasjonen og full terminering av overliggende identitetssesjon.