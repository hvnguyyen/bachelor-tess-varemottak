# Sporingsflyt fase 3 - prosesslogg (POC)

## 0. Oppdatert info før implementasjon av fasen
Opprinnelig scope for sporingsflyten var å vise relevante ordre/forsendelser med nøkkelinformasjon, 
enkel filtrering/søk, tydelig statusvisning og brukervennlig håndtering av tomme svar, feil og manglende tilgang.

Etter fullført fase 2 er det avklart at vi foreløpig ikke har et eget dedikert sporingsendepunkt, trackingnummer 
eller Bring/Posten-integrasjon tilgjengelig fra TESS. Sporingsflyten avgrenses derfor pragmatisk til en 
ordrebasert sporings- og statusoversikt basert på ordredata fra `GET /order/{customerNumber}`.

I fase 2 ble ordredata midlertidig hentet med direkte klientkall fra frontend fordi server-side kall fra vår interne Next.js-route 
mot `https://api.tessix.no` ble stoppet av Cloudflare HTML challenge. Etter dialog med TESS fikk vi en alternativ Azure-base-URL 
for server-side API-kall gjennom `https://30011-proxyapi-cuafeua6bha7ckby.norwayeast-01.azurewebsites.net`

Dette gjør at vi kan flytte ordreintegrasjonen tilbake til vår interne proxy-route `/api/orders`, ved å bruke Azure-URLen 
som `TESS_ORDERS_API_BASE_URL` for server-side kall, samtidig som `NEXT_PUBLIC_API_BASE_URL` fortsatt peker mot `https://api.tessix.no` 
for browser/auth-flyt.

Dette betyr at fase 3 bør starte med å reetablere ønsket mellomlagsarkitektur: `UI -> /api/orders -> TESS API`

## 1. Initiell implementasjonsplan:
#1. Reetablere intern ordreproxy som standard integrasjonsvei
#2. Bygge sporingsflyt på samme ordregrunnlag som varemottak
#3. Lage enkel sporingsmodell/adaptasjon for UI
#4. Implementere sporingsside i `/track-parcel`
#5. Legge til funksjonalitet (detaljevisning pr ordre, søk, filtrering og enkel navigering)
#6. Rydde og dokumentere
#7. Eventuelle tillegg

## 2. Hva som ble implementert
#1. Reetablere intern ordreproxy som standard integrasjonsvei
- Lagt til egen Azure-base-URL for ordre-proxy gjennom `TESS_ORDERS_API_BASE_URL` for å muliggjøre server-side kall mot ordre-endepunktet uten Cloudflare-utfordringen
- Beholdt `NEXT_PUBLIC_API_BASE_URL=https://api.tessix.no` for browser/auth-flyt
- Endret ordreklienten `ordersClient.ts` slik at frontend kaller `/api/orders` i stedet for TESS sitt ordre-endepunkt direkte
- Verifisert at `/api/orders?customerNumber=<customerNumber>&pageSize=1` returnerer JSON med `data` og `meta` etter endringer

#2. Bygge sporingsflyt på samme ordregrunnlag som varemottak
- Henter relevant `customerNumber` fra innlogget brukerprofil
- Bruker `GET /order/{customerNumber}` via intern `/api/orders` som grunnlag for presenterbar data i sporingsverktøyet
- Henter lagervalg fra TESS sitt warehouse-endepunkt via intern `/api/warehouses`
- Presenterer ordre som sporingsobjekter med ordrenummer, dato, status, selskap/lager og referanser

#3. Lage enkel sporingsmodell/adaptasjon for UI
- Mappet `Order` og `OrderLine` til en sporingsrettet visningsmodell i `tracking.ts`
- Gruppert informasjon per ordre, med ordrelinjer tilgjengelig i detaljvisning
- Bruker eksisterende statusverdier fra ordrelinjene som foreløpig statusgrunnlag, og viser statuskoder i UI-et

#4. Implementere sporingsside i `/track-parcel`
- Erstattet placeholder-siden med en faktisk sporingsvisning
- Lagt inn knapp for å hente sporingsdata slik at ordredata ikke lastes inn by default
- Laster inn tilgjengelige lagervalg ved sideinnlasting
- Siden viser loading-state ved henting av ordre, tom-state og feilmeldinger
- Leser innlogget brukers standardlager fra lokal brukerprofil og bruker dette som initialt filtervalg i sporingsvisningen

#5. Legge til funksjonalitet (detaljevisning pr ordre, søk, filtrering og enkel navigering)
- Støtter fritekstsøk i lastet side på ordrenummer, referanse eller lager
- Filtrerer på lager eller status(kode)
- Mulighet for å vise eller skjule filtervalg
- Støtter sidevis navigering og visningsvalg mellom 25, 50, 75 eller 100 ordre per side
- Åpne/lukke detaljevisning per ordre
- Ordrelinjer viser blant annet varenummer, varenavn, antall, enhet, status og linjesum

#6. Rydde og dokumentere fase 3-baseline
- Oppdatert fase-logg med faktisk implementert løsning (to-do)
- Oppdatere `API-LAYER.md` dersom ordreintegrasjonen flyttes tilbake til intern proxy (to-do)
- Dokumentere kjente begrensninger og eventuelle videre avklaringer mot TESS (to-do)

#7. Eventuelle tillegg
- Forenklet sporingsflyten ved å bruke egen warehouse-route
- Gikk bort fra å utlede filterverdier fra ordredata


## 3. Endelig flyt (nåværende baseline for sporingsverktøy)
1. Bruker er på `/dashboard`
2. Bruker trykker på `Sporingsverktøy`
3. Sporingsverktøyet åpnes under `/track-parcel` og relevant data hentes fra lokal brukerprofil-helper
4. Tilgjengelige lagervalg hentes fra intern route `GET /api/warehouses`, samt viewet åpnes med `Hent Ordre`-knapp og filtervalg
5. `GET /api/warehouses` proxier mot TESS sitt warehouse-endepunkt
6. Ved `Hent ordre` kaller frontend intern route `GET /api/orders?customerNumber=<customerNumber>&page=<page>&pageSize=<pageSize>`
7. Bruker kan velge fritekstsøk, lager, statuskode og antall ordre pr side og brukes på lastede siden i visningen
8. Intern `/api/orders` proxier server-side videre til TESS sitt ordre-endepunkt via Azure-base-URLen for ordreproxy
9. TESS returnerer ordre med `data` og `meta`
10. Frontend mapper ordredata til en sporingsrettet visningsmodell i `tracking.ts` og viser én rad pr ordrenummer
11. Ved trykk på `Vis detaljer` på en ordre vises detaljvisning av ordren
12. Bruker kan navigere mellom sider via `Forrige side` og `Neste side`
13. Ved sidebytte hentes neste eller forrige side fra `/api/orders` med tilsvarende oppdatert visning

## 4. Nøkkelpunkter og viktigste feilbilder og årsaker

# 4.1 Generelle HTTP-status feilmeldinger
- `400` oppstår dersom `customerNumber` mangler i kall mot intern `/api/orders`
- `401` oppstår dersom verken sesjonscookie eller `TESS_ACCESS_TOKEN` er tilgjengelig for server-side proxy
- `403` oppstår ved ugyldig eller utløpt token ved kall mot TESS sine endepunkter
- `500` kan oppstå dersom upstream-kall feiler eller respons fra upstream ikke kan brukes videre i applikasjonen

# 4.2 Cloudflare og server-side ordreproxy
Etter dialog med oppdragsgiver, fikk vi en alternativ Azure-base-URL som muliggjorde server-side ordreproxy 
utenom Cloudflare-problemet fra fase 2. Dette gjorde det mulig å flytte ordreintegrasjonen tilbake til intern `/api/orders`.

# 4.3 Work-arounds / Tokenhåndtering i lokal utvikling
Selv om server-side proxy nå fungerer, er lokal utvikling fortsatt avhengig av et gyldig `TESS_ACCESS_TOKEN` i `.env.local` 
når `localhost` ikke automatisk kan bruke TESS sin sesjonscookie på `.tessix.no`. Dette gjør at token i noen tilfeller må 
oppdateres manuelt i utviklingsmiljøet for at kall mot `/api/orders` og `/api/warehouses` fortsatt skal fungere.

## 5. Presise avgrensinger (kjente begrensninger som må dokumenteres i rapport)
- Sporingsflyten er avgrenset til en ordrebasert statusoversikt, og ikke full transport- eller leveransesporing
- Løsningen har foreløpig ikke tilgang til egne trackingnummer, dedikert sporingsendepunkt eller Bring/Posten-integrasjon
- Status vises som eksisterende statuskoder fra ordrelinjene, og ikke som fullt forklart transportstatus
- Lagerfilter bygger på TESS sitt warehouse-endepunkt, uten regionhierarki eller komplett geografisk modell
- Søk og filtrering skjer på lastet side i visningen, og ikke på hele ordregrunnlaget globalt
- Lokal utvikling med server-side proxy krever fortsatt manuelt oppdatert `TESS_ACCESS_TOKEN` i `.env.local` ved utløpt token
- Lokal dev-flyten er fortsatt påvirket av cookie- og tokenforhold mellom `localhost` og TESS sine domener

## 6. Oppsummering / Konklusjon av fase 3
Fasen for sporings-baseline er funksjonell som POC for ordrebasert status- og sporingsvisning, og følgende er verifisert i nettleser:
- Intern `GET /api/orders` returnerer ordredata med `data` og `meta` via server-side proxy
- Intern `GET /api/warehouses` returnerer tilgjengelige lagervalg fra TESS sitt warehouse-endepunkt
- Relevant `customerNumber` hentes fra innlogget brukerprofil og brukes som grunnlag for ordreoppslag
- Lagerdata lastes inn før ordretabellen, mens selve ordrevisningen startes eksplisitt av bruker med `Hent ordre`
- Ordrene vises som én rad per ordrenummer med status, siste registrering og detaljvisning
- Bruker kan søke i lastet side, filtrere på lager og statuskode, og navigere mellom sider
- Loading-state, tom-state og feilmeldinger vises ved relevante tilfeller
- Sporingsvisningen benytter nå samme mellomlagsarkitektur som resten av applikasjonen, ved at frontend kaller interne API-ruter i stedet for TESS direkte

## 7. Refleksjonsnotat i retrospekt (til sluttrapport)
I fase 3 ble det tydelig at sporingsfunksjonaliteten måtte avgrenses mer pragmatisk enn opprinnelig antatt. 
Siden vi verken hadde tilgang til dedikert sporingsendepunkt, trackingnummer eller Bring/Posten-integrasjon, ble løsningen 
i stedet bygget som en ordrebasert statusoversikt med detaljvisning per ordre.

Samtidig fikk vi reetablert ønsket mellomlagsarkitektur ved å flytte ordreintegrasjonen tilbake til intern server-side proxy 
gjennom en alternativ Azure-base-URL fra oppdragsgiver. Dette gjorde løsningen mer konsistent med resten av applikasjonen, men 
avdekket også at lokal utvikling fortsatt er sårbar for token- og cookieforhold mellom `localhost` og TESS sine domener.

Et annet viktig læringspunkt var at lagerfilter ikke burde utledes fra ordredata. Ved å bruke TESS sitt eget warehouse-endepunkt 
ble filtergrunnlaget mer robust og sporingsflyten enklere å forstå. Arbeidet i fase 3 viser derfor både verdien av å holde 
integrasjonsarkitekturen konsistent, og viktigheten av å tilpasse scope til de dataene som faktisk er tilgjengelige i en PoC.
