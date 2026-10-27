# Project Guidelines

## Contesto

- Portfolio personale Angular 18 + TypeScript con backend Node.js/Express 5 e MongoDB/Mongoose.
- Il frontend è in `src/app`; API, modelli e seed sono in `server/`.
- I contenuti e i progetti dipendono da MongoDB. Configurare `MONGO_URI` prima di verificare le sezioni caricate dalle API.
- I progetti vengono ordinati dal più recente (`createdAt` decrescente), poi per ID per mantenere l’ordine deterministico.
- Clerk non fa parte dell’applicazione portfolio. Non reintrodurlo senza una richiesta esplicita.

## Convenzioni

- Segui i componenti standalone Angular e i pattern RxJS già presenti.
- Mantieni i tipi API in `src/app/models/api.models.ts` allineati ai documenti MongoDB e ai componenti che li consumano.
- I testi dell’interfaccia vengono caricati tramite `LanguageService` e `FixedTexts`; evita stringhe visibili hardcoded nei template.
- I seed del backend devono poter essere eseguiti più volte senza creare record duplicati.
- Non fidarti di URL arbitrari per iframe: consenti solo origini esplicitamente previste.

## Aggiungere contenuti localizzati

### Nuova stringa fissa dell’interfaccia

1. Aggiungi la chiave con il tipo corretto all’interfaccia `FixedTexts` in `src/app/models/api.models.ts`.
2. Aggiungi la stringa localizzata nei documenti `FixedText` di MongoDB per ogni lingua supportata. Ogni documento ha `section`, `language` e `content` (mappa chiave-valore).
3. Per contenuti iniziali gestiti dal seeder, aggiorna `seedSection` in `server/server.js`; il seed inglese non crea automaticamente le altre traduzioni.
4. Usa la chiave nel template, ad esempio `fixedTexts.projects.newLabel`.
5. Verifica sia la lingua predefinita sia le altre lingue. L’API `/api/fixed-texts` ripiega sull’italiano se manca la lingua richiesta.

### Nuovo progetto

1. Aggiungi i documenti localizzati ai seed in `server/server.js`, con ID coerenti per lingua (`project-id_en`, `project-id_it`) e `language` corrispondente.
2. Mantieni invariati fra le traduzioni i campi non testuali: `tech`, `demo`, `github`, `images`, `previewUrl` e `type`.
3. Se un progetto esistente viene inserito nei seed dopo il primo popolamento, usa un upsert idempotente: l’inserimento iniziale di tutti i progetti viene saltato quando la collection non è vuota.
4. Per iframe, aggiorna anche la allowlist nel componente `project-item`; non bypassare la sanitizzazione per URL non verificati.
5. Verifica che il progetto appaia nella lingua richiesta e che l’ordine recente sia corretto.

## Verifica

- Avvio locale: `npm run dev` (MongoDB deve essere disponibile).
- Build frontend: `npm run build`; per una compilazione rapida senza budget production usare `npm run build -- --configuration development`.
- Sintassi server: `node --check server/server.js`.
- Mantieni le modifiche mirate e non sovrascrivere cambiamenti locali non pertinenti.
