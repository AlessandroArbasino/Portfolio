# Portfolio — Alessandro Arbasino

Portfolio personale realizzato con Angular e Node.js/Express. Presenta progetti, profilo e contatti con contenuti localizzati e una chat AI per personalizzare il tema.

## Funzionalità

- Sezioni profilo, progetti, documenti e contatti.
- Contenuti e progetti in più lingue, gestiti tramite MongoDB.
- Chat AI con Gemini e personalizzazione dinamica del tema.
- Galleria immagini e video, con anteprima incorporata per BookMatch.
- Interfaccia responsive e metadati SEO.

## Stack

- **Frontend:** Angular 18, TypeScript, RxJS, Tailwind CSS, Angular Material.
- **Backend:** Node.js, Express 5, MongoDB, Mongoose.
- **Servizi:** Gemini per la chat e Pexels per i media di sfondo.

## Avvio in locale

Requisiti: Node.js/npm e un’istanza MongoDB locale o remota.

1. Installa le dipendenze:

   ```powershell
   npm install
   ```

2. Crea un file `.env` nella root. Per avviare sito, API e progetti è necessario configurare MongoDB:

   ```env
   MONGO_URI=mongodb://localhost:27017/portfolio
   PORT=3000
   NODE_ENV=development
   ```

   Per abilitare tutte le funzionalità, aggiungi anche le chiavi dei servizi usati dall’app:

   ```env
   GEMINI_API_KEY=
   PEXELS_API_KEY=
   TRANSLATE_CONTENT_API_KEY=
   AI_CHAT_RETENTION_DAYS=30
   ```

3. Avvia backend e frontend insieme:

   ```powershell
   npm run dev
   ```

4. Apri [http://localhost:4200](http://localhost:4200). L’anteprima BookMatch usa il sito già pubblicato su Vercel; non è necessario fare il deploy del portfolio per visualizzarla.

Per avviare solo Angular, usa `npm run dev:client`. In questo caso le API richiedono comunque il backend e MongoDB.

## Progetti e localizzazione

I progetti sono salvati nella collection `projects` e recuperati da `/api/projects?lang=<lingua>`. Ogni documento contiene lingua, descrizione, stack, link e tipo. L’API ordina i progetti più recenti per primi.

Per aggiungere un progetto:

1. Aggiungi i dati per ogni lingua in `bookMatchProjects`/dati seed in `server/server.js`, usando un ID coerente, ad esempio `nuovo-progetto_en` e `nuovo-progetto_it`, e il campo `language` corrispondente.
2. Mantieni gli stessi campi e lo stesso stack nelle varianti localizzate; traduci nome e descrizione.
3. Per un’anteprima incorporata, imposta `previewUrl` solo per URL esplicitamente autorizzati nella logica iframe di `src/app/components/projects/project-item/project-item.component.ts`.
4. I seed dei progetti devono essere idempotenti: usa un upsert per non duplicare i documenti quando il server si riavvia.

Per aggiungere una nuova stringa fissa dell’interfaccia:

1. Aggiungi la chiave e il relativo tipo all’interfaccia `FixedTexts` in `src/app/models/api.models.ts` (nella sezione appropriata).
2. Aggiungi il testo in ogni lingua supportata nei documenti `FixedText` della collection MongoDB. Il formato è `{ section, language, content }`; `content` è una mappa di chiavi e stringhe.
3. Per i testi iniziali gestiti dai seed, aggiorna `seedSection` in `server/server.js` e fornisci i valori localizzati per ogni lingua. Il seed esistente crea i contenuti iniziali in inglese.
4. Consuma la chiave nel componente Angular usando `fixedTexts.<sezione>.<chiave>`. `/api/fixed-texts` restituisce la lingua richiesta e usa l’italiano come fallback se la traduzione non esiste.

Le traduzioni di progetto seguono la stessa struttura: un documento per lingua, con ID che termina con il codice lingua, ad esempio `_en` o `_it`. Le route di traduzione sono definite in `server/routes/translateRoutes.js`.

## Comandi

| Comando | Descrizione |
| --- | --- |
| `npm run dev` | Avvia server API e frontend Angular |
| `npm run dev:client` | Avvia il solo frontend |
| `npm run server` | Avvia il solo backend |
| `npm run build` | Build Angular di produzione |
| `npm test` | Avvia i test Angular |

## Struttura

```text
src/app/
  components/   Componenti Angular e sezione progetti
  models/       Interfacce dei dati API
  services/     API, lingua, tema, media e SEO
server/
  controllers/  Endpoint e logica applicativa
  models/       Modelli Mongoose
  routes/       Route Express
  services/     Integrazioni AI
```

## Deploy

Il progetto è configurato per Vercel tramite `vercel.json`. Configura nell’ambiente di deploy le variabili necessarie, in particolare `MONGO_URI`; le funzionalità AI richiedono anche le rispettive chiavi API.

## Licenza

Distribuito secondo i termini della [licenza MIT](LICENSE).
