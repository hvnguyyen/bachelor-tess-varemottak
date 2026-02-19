## Scope og leveranseplan (POC)

### 1. Formål
Prosjektet leveres som en Proof of Concept (POC) for en webbasert løsning for digitalt varemottak hos TESS.

Målet er å demonstrere gjennomførbarhet, teknisk kvalitet og god brukerflyt, ikke å levere et fullskala produksjonssystem.

### 2. Kjerneleveranse
Kjerneleveransen består av tre funksjonsområder:

1. Login/auth (sesjonshåndtering med cookie)
2. Varemottak (skanning, registrering og innsending)
3. Sporing (oversikt og detaljer for relevante ordre/forsendelser)

### 3. Fasevis gjennomføring
Vi bygger kjerneleveransen iterativt, med tydelig prioritet i rekkefølge:

1. Fase 1: Login/auth mot Entra ID
- Integrere autentisering mot oppdragsgivers eksisterende auth-flyt.
- Etablere og validere sesjon/cookie for videre API-kall.
- Verifisere bruker og tilknyttet kundegrunnlag via bruker-endepunkt.

2. Fase 2: Varemottak
- Implementere skanning av strekkode med kamera på nettbrett.
- Støtte manuell registrering som fallback.
- Avklare strekkodeinnhold og minimum POST-payload med oppdragsgiver.
- Koble registrering mot API-kall for innsending av mottak.

3. Fase 3: Sporing
- Vise relevante ordre/forsendelser med nøkkelinformasjon.
- Støtte enkel filtrering/søk og tydelig statusvisning.
- Gi brukervennlig håndtering av tomme svar, feil og manglende tilgang.

### 4. In-scope (MVP)
Følgende inngår i MVP:

- Nettbrettvennlig webgrensesnitt (landskap og portrett) med enkel og tydelig flyt.
- Proxy/BFF-lag i Next.js API routes for kall mot eksternt API.
- Grunnleggende feilhåndtering og logging for utvikling og debugging.
- Bevisst bruk av relevante WCAG-prinsipper (kontrast, semantikk, tastaturnavigasjon).
- Mulighet for lokal mock-data ved utilgjengelig API eller manglende testmiljø.

### 5.1 Out-of-scope (bevisste avgrensninger)
For å holde leveransen gjennomførbar i prosjektperioden avgrenses prosjektet fra:

- Full produksjonssetting og drift (skalering, monitorering, CI/CD, hardening).
- Full ERP-funksjonalitet utover avtalte POC-flyter.
- Avansert avvik/reklamasjon, returer og komplekse arbeidsprosesser.
- Native mobilapp (løsningen leveres som webapplikasjon).
- Komplett rolle- og tilgangsmodell utover det auth-løsningen gir i POC.
- Dyp Bring-integrasjon utover det som eventuelt tilbys via TESS-data.

### 5.2 Mulige utvidelser
Dersom målet er nådd, MVPen er tilstrekkelig og tid tillater det, kan følgende utvidelser vurderes:
- Arkiv og søk med visning av historiske varemottak (backend implementasjon)
- Begrenset integrasjon mot Bring med visualisering av sporingsdata på kart
- Enkel side/modul med teknisk hjelp (IT-støtte, kort veiledning, etc.)
- Bedre feilhåndtering

### 6. Leveransekriterier for POC
POC anses som vellykket når:

- Bruker kan logge inn via Entra ID og etablere gyldig sesjon.
- Varemottak kan registreres via skanning/manuell fallback og sendes med korrekt payload.
- Sporing viser relevante data for innkommende ordre/forsendelser.
- Løsningen demonstrerer stabil grunnflyt med tydelig feilhåndtering.

### 7. Arbeidsform
Prosjektet gjennomføres iterativt (tilnærmet ukentlig), og detaljer i løsning kan justeres i samråd med veileder og oppdragsgiver så lenge kjerneleveransen opprettholdes.
