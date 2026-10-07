# Bushido Ops 0.5 — registrare e collegare i servizi

Guida per Damiano · verificata il 7 ottobre 2026.

Il codice 0.5 è pronto per un ambiente di collaudo. Gli account esterni, il dominio, l'invio delle email e Stripe devono ancora essere configurati dal proprietario. Nessun servizio è stato aperto, nessun pagamento reale è stato attivato e il sito esistente non è stato sovrascritto. Il lancio commerciale resta alla 1.0.

## 1. Cosa aprire, in questo ordine

| Servizio | Per cosa serve | Cosa creare ora |
|---|---|---|
| [Cloudflare](https://dash.cloudflare.com/sign-up) | Sito e API della 0.5 | Account e progetto Pages di staging |
| [Supabase](https://supabase.com/dashboard/sign-up) | Account degli studenti e database | Progetto di test, regione UE disponibile |
| [Resend](https://resend.com/signup) | Conferma email e recupero password | Account; attivare SMTP dopo aver verificato un dominio proprio |
| [Stripe](https://dashboard.stripe.com/register) | Abbonamenti di prova | Account e sandbox separata |
| Registrar del dominio | Nome pubblico e dominio mittente | Può aspettare: iniziamo su `pages.dev` |

Usa una tua email esistente, un password manager e l'autenticazione a due fattori per gli account dei servizi. Inizia dai piani gratuiti dove disponibili e controlla i limiti mostrati prima di selezionare eventuali opzioni a pagamento. Nessuna cifra nella guida costituisce un budget approvato.

Non serve aprire subito una casella email a pagamento. Per il primo collaudo, l'indirizzo con cui sei membro dell'organizzazione Supabase può ricevere i messaggi dell'SMTP predefinito: attualmente circa due email/ora e solo agli indirizzi del team. Non aggiungere studenti come membri amministrativi per aggirare questo limite. Per tester esterni serve un mittente verificato e SMTP personalizzato.

## 2. Preparare GitHub senza cambiare subito il sito esistente

Il tuo repository è `dbottali/bushido-ops`. Estrai lo ZIP 0.5 sul computer: contiene sorgenti, database, esempi e una demo statica già compilata.

1. Conserva la cronologia del repository attuale. Con GitHub Desktop puoi creare una branch `staging-0.5` dalla versione corrente.
2. Copia nella cartella del repository i file estratti, mantenendo la cartella `.git` del repository. Fai un commit sulla branch e pubblica la branch.
3. Il file `package.json` deve stare alla radice, insieme a `pnpm-lock.yaml`, `wrangler.jsonc` e alle cartelle `app`, `components`, `functions`, `public`, `server`, `supabase` e `static`.
4. Non caricare credenziali, `.env.local`, `node_modules` o copie dei database. Il modello `config.example.txt` contiene solo segnaposto.

Il repository può restare pubblico per questi esempi sintetici. I futuri contenuti premium e le relative risposte corrette devono restare in file privati e nel database: non aggiungerli al repository pubblico né a `public/`.

GitHub Pages serve solo la demo ospite: non può eseguire le API della 0.5. Per provare gli account collega la branch a Cloudflare. Non è sufficiente caricare lo ZIP nel pannello Cloudflare Direct Upload: con le Pages Functions occorre l'integrazione Git o Wrangler.

## 3. Creare Cloudflare Pages

Nel dashboard Cloudflare: **Workers & Pages → Create application → Pages → Connect to Git**. Collega GitHub e autorizza l'accesso al repository necessario. Seleziona `bushido-ops` e imposta:

| Campo | Valore |
|---|---|
| Project name | `bushido-ops-staging`, se disponibile |
| Production branch | `staging-0.5` |
| Framework preset | None |
| Root directory | Radice del repository, vuoto se non richiesto |
| Build command | `pnpm install --frozen-lockfile && pnpm build:cloud` |
| Build output directory | `dist-cloud` |
| Build variable `NODE_VERSION` | `22.16.0` |
| Build variable `PNPM_VERSION` | `11.25.0` |
| Build variable `SKIP_DEPENDENCY_INSTALL` | `true` |

Qui “Production branch” è il nome tecnico di Cloudflare per la branch che alimenta l'URL principale del **progetto di staging**; non rappresenta il lancio commerciale.

Puoi effettuare la prima build senza segreti: la prova di tre domande funziona e la schermata account indica che i servizi non sono ancora collegati. Annota l'URL assegnato, per esempio `https://bushido-ops-staging.pages.dev`. Se il nome non è disponibile, usa quello effettivo anche nelle configurazioni successive e aggiorna `name` in `wrangler.jsonc` prima di usare il CLI.

Le Functions sono in `functions/api/[[path]].ts`. `wrangler.jsonc` include `nodejs_compat`. Non sostituire questa build con quella Next.js/framework o con `dist-pages`.

Per limitare i deploy inaspettati, disattiva le branch preview automatiche non necessarie; configura ora solo l'ambiente del progetto di staging. Il codice accetta richieste di modifica solo dall'origine impostata in `APP_URL`.

## 4. Creare il progetto Supabase

Crea un'organizzazione personale e un progetto chiamato `bushido-ops-staging`. Scegli una regione UE disponibile, per esempio Francoforte se proposta. Conserva la password del database nel password manager; è diversa dalla password del tuo account.

Apri **SQL Editor → New query**. Su questo nuovo database:

1. Incolla tutto `supabase/migrations/202610070001_bushido_ops.sql` ed eseguilo una volta.
2. In una nuova query incolla `supabase/seed-pilot.sql` ed eseguilo una volta. Inserisce il pilota White e le cinture pianificate.
3. Non eseguire questa migrazione sopra un database con altri dati o sul futuro progetto di produzione. Non usare reset per recuperare un errore senza un backup.

La migrazione crea le tabelle `dojo_*`, le policy che isolano gli studenti, le funzioni per esami/XP/cinture e le autorizzazioni del server. Non serve configurare D1 o altre Edge Functions.

Da **Project Settings → API Keys** copia la chiave pubblicabile (`sb_publishable_…`) e la chiave segreta (`sb_secret_…`). Il codice supporta anche le chiavi legacy `anon` e `service_role` se disponibili. Copia l'URL del progetto dal pannello API/Connect. La chiave segreta è utilizzata dal server e non deve essere incollata nel codice.

In **Authentication**:

- Abilita Email/password e **Confirm email**. Imposta una lunghezza minima della password di 12 caratteri.
- In **URL Configuration**, imposta **Site URL** all'URL Cloudflare esatto, senza percorso o slash finale.
- Aggiungi alle Redirect URLs l'URL esatto e `https://TUO-PROGETTO.pages.dev/**`. Non usare wildcard che autorizzano altri host.
- Mantieni limiti di autenticazione ragionevoli. Prima dei tester esterni verifica il servizio SMTP e le sue quote.

### Template di conferma e recupero

In Authentication → Email, configura i template:

| Template | Oggetto proposto | File da incollare |
|---|---|---|
| Confirm signup | `Bushido Ops — confirm your email` | `supabase/email-templates/confirm.html` |
| Reset password | `Bushido Ops — reset your password` | `supabase/email-templates/recovery.html` |

I link usano `TokenHash` e `SiteURL`. La webapp verifica il token e lo rimuove dall'indirizzo: questo permette di aprire il messaggio anche su un dispositivo diverso. Inserisci Site URL senza slash finale per evitare un doppio slash nel template. Senza questi template, il flusso PKCE standard richiede il browser che ha iniziato la richiesta.

## 5. Collegare il sito al database

In Cloudflare Pages → progetto → **Settings → Variables and Secrets**, aggiungi questi valori all'ambiente principale del progetto di staging:

| Nome esatto | Valore | Tipo |
|---|---|---|
| `DEPLOYMENT_STAGE` | `staging` | Variabile |
| `APP_URL` | URL Cloudflare effettivo, solo origine HTTPS | Variabile |
| `SUPABASE_URL` | `https://ID-PROGETTO.supabase.co` | Variabile |
| `SUPABASE_PUBLISHABLE_KEY` | Chiave pubblicabile/anon | Variabile pubblica |
| `SUPABASE_SERVICE_ROLE_KEY` | Chiave segreta/service_role | **Secret** |
| `SUPPORT_EMAIL` | La tua email di assistenza esistente | Variabile pubblica, facoltativa |
| `OWNER_USER_IDS` | Lascia inizialmente vuoto | Variabile |

Salva e fai un nuovo deploy della stessa branch. Non creare variabili `VITE_` contenenti segreti. Non incollare le chiavi nella chat: entrano solo nei dashboard dei servizi o nel tuo file locale escluso da Git.

Apri sul tuo URL `/api/health`: deve riportare `version: 0.5.0`, `environment: staging` e `configured: true`. Questo controlla la presenza della configurazione, non prova ancora la connessione al database. `/api/catalog` deve mostrare corsi e metadati, senza domande o risposte corrette; questa richiesta verifica anche database e seed.

Registra il tuo account nella webapp, con l'indirizzo membro del team Supabase se stai ancora usando il servizio email predefinito. Conferma l'email e accedi. Il pilota White deve essere disponibile e My Dojo deve iniziare senza cinture inventate.

### Autorizzare il proprietario

In Supabase **Authentication → Users**, copia lo **User UID/UUID** del tuo account verificato. Inseriscilo in Cloudflare `OWNER_USER_IDS`, salva e ridistribuisci. Accedi alla webapp: Account mostrerà **Owner / Content Import**.

L'indirizzo email o un nome “admin” non concedono privilegi. Gli studenti non vedono il comando e l'API rifiuta comunque le loro richieste. Il proprietario può importare contenuti ma segue le stesse regole didattiche e di abbonamento quando studia.

## 6. Dominio ed email: cosa serve realmente

Per ora usa `pages.dev`. Quando scegli un dominio, verifica disponibilità, prezzo iniziale e rinnovo presso il registrar; un nome discusso non è automaticamente disponibile o registrato. Non serve spostare subito il sito dalla sua URL attuale.

Dopo l'acquisto, collega il dominio o un sottodominio di staging da **Cloudflare Pages → Custom domains**, seguendo i record indicati. Se cambi l'origine della webapp, aggiorna insieme `APP_URL`, Supabase Site URL/Redirect URLs e l'endpoint webhook Stripe.

### Email automatiche con Resend

1. In Resend → **Domains**, aggiungi un sottodominio che possiedi, per esempio `auth.TUODOMINIO`.
2. Nel pannello DNS del dominio copia esattamente i record di verifica mostrati da Resend e attendi lo stato Verified. Non sostituire arbitrariamente SPF o MX di una casella già esistente.
3. Crea una API key di invio per quel dominio; disattiva il tracciamento di click/aperture delle email di autenticazione.
4. In Supabase **Authentication → Email → SMTP Settings**, abilita Custom SMTP:

| Campo | Valore |
|---|---|
| Sender email | `dojo@auth.TUODOMINIO` |
| Sender name | `Bushido Ops` |
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` |
| Password | API key Resend |

La chiave Resend resta in Supabase SMTP: non serve nella webapp o su GitHub. Prova conferma e recupero verso indirizzi esterni prima di invitare tester. Controlla rate limits Supabase e quota del piano Resend; l'SMTP personalizzato ha un limite iniziale distinto.

### Assistenza e casella email

`SUPPORT_EMAIL` è un indirizzo pubblico di contatto, non un servizio di invio. Puoi usare la tua casella attuale per il collaudo.

Con dominio e DNS su Cloudflare, Email Routing può inoltrare `support@TUODOMINIO` alla tua casella esistente. Verifica la destinazione e crea la regola. L'inoltro non crea una casella completa per inviare risposte con quel mittente: se vuoi quella funzione, scegli successivamente una casella/servizio SMTP dedicato. Resend gestisce qui le email automatiche del sito.

## 7. Stripe: soltanto sandbox

Apri Stripe e usa il selettore account → **Switch to sandbox → Create sandbox**. Nome: `Bushido Ops Staging`; scegli un ambiente da zero e verifica il banner Sandbox.

Nel catalogo prodotti crea `Bushido Ops Premium — TEST`, con un prezzo fisso ricorrente mensile. Per il collaudo puoi scegliere **1 EUR/mese di prova**: non è il prezzo commerciale approvato. Annota il `price_…`.

Dal pannello Developers/Workbench copia la **Secret key test** (`sk_test_…`). In Billing → Customer portal abilita il portale e la cancellazione alla fine del periodo. Non attivare prezzi live o incassi reali.

Crea una destinazione webhook nel medesimo sandbox:

- URL: `https://TUO-PROGETTO.pages.dev/api/stripe/webhook`.
- Se viene richiesta una versione API, usa quella del codice Stripe 22.6.2: `2026-08-26.dahlia`.
- Eventi: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed`.
- Copia il segreto di firma `whsec_…` della destinazione effettiva, non quello di una sessione CLI diversa.

Aggiungi in Cloudflare:

| Nome | Valore | Tipo |
|---|---|---|
| `STRIPE_SECRET_KEY` | Chiave `sk_test_…` dello staging | **Secret** |
| `STRIPE_PRICE_ID` | Prezzo mensile `price_…` | Variabile |
| `STRIPE_WEBHOOK_SECRET` | Segreto `whsec_…` del webhook | **Secret** |

Salva e ridistribuisci. Il Checkout ospitato non richiede una chiave pubblicabile Stripe nella webapp. Il codice 0.5 rifiuta chiavi/eventi live e ambienti diversi da staging.

Con il solo pilota, il pulsante per sottoscrivere rimane disabilitato: il pilota non assegna la White completa e le cinture premium non hanno materiale. Per verificare l'intero flusso usa il catalogo sintetico del passo successivo.

## 8. Prova completa senza il materiale definitivo

Dopo aver assegnato il tuo UID proprietario:

1. Apri Account → Owner / Content Import e scarica una copia del catalogo corrente.
2. Carica `content/staging-smoke-catalog.json`, scegli **Validate**, controlla il riepilogo e poi **Publish**. Il pilota esistente rimane; vengono aggiunti percorsi sintetici White → Black con lezioni e domande di prova.
3. Completa `White TEST`: ogni domanda dichiara il contesto di test. Il suo esame assegna una cintura **di staging**, non la vera cintura didattica.
4. Da Account avvia il sandbox Checkout. Usa la carta di test `4242 4242 4242 4242`, scadenza futura e CVC di tre cifre. Nessun dato di carta reale.
5. Verifica che Stripe confermi l'abbonamento e che Yellow si apra. Completa Yellow: Orange deve richiedere prima Yellow anche con abbonamento attivo.
6. Nel portale cancella alla fine del periodo: l'accesso resta valido fino alla scadenza, poi il premium si chiude e progressi/White rimangono. Per accelerare il test, usa gli strumenti di sandbox Stripe e prova anche una cancellazione immediata dal dashboard.
7. Ripeti una consegna webhook già ricevuta: nessun XP o diritto deve duplicarsi. Modificare manualmente `?billing=success` non deve aprire il premium.

Il catalogo di prova serve solo a collaudare l'infrastruttura. Una volta iniziati i corsi, il sistema protegge il contenuto già utilizzato: non lo riscrivere per trasformare una cintura finta in quella reale. La futura produzione avrà un database separato e il materiale definitivo con nuovi ID/versioni.

## 9. Verifiche da completare sui servizi reali

- [ ] Iscrizione, conferma e reset email sul tuo indirizzo.
- [ ] Link email aperto in un browser/dispositivo diverso.
- [ ] Prova ospite → importazione esplicita → XP assegnati una volta.
- [ ] Due dispositivi con lo stesso account: risposte, ripresa e progressi coerenti. Il refresh avviene al ritorno in pagina, al cambio di connessione e circa ogni minuto.
- [ ] Modifiche simultanee: il secondo salvataggio segnala un conflitto senza cancellare silenziosamente la bozza.
- [ ] Un secondo account non accede al catalogo proprietario o ai dati del primo.
- [ ] Stripe checkout, rinnovo, fallimento pagamento, cancellazione, scadenza e ritorno dal portale.
- [ ] Export account e cancellazione di un account **creato apposta per il collaudo**.
- [ ] Safari/Brave su iPad e smartphone fisici; verifica sfondo avorio, menu e link email.
- [ ] Backup database e ripristino su un secondo progetto di test.

Questi controlli non sono stati eseguiti su account esterni durante lo sviluppo. I test automatici locali verificano SQL, API e permessi, ma non provano consegna email o configurazione del tuo provider.

## 10. Backup e sviluppo locale

L'export dello studente contiene i suoi dati; il download del catalogo contiene materiale e chiavi delle risposte. Nessuno dei due è un backup completo di Supabase Auth/database.

Per il progetto Free, pianifica esportazioni manuali del database. La guida ufficiale Supabase usa CLI + Docker e tre dump: ruoli, schema e dati. Conserva connessione/password localmente e copie cifrate fuori dal repository; segui [Backup and Restore using the CLI](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore). Un recupero operativo richiede anche impostazioni Auth/SMTP, configurazione e segreti dei servizi. Prova il ripristino in un progetto nuovo prima di considerare il backup affidabile. Il restore non deve riattivare webhook di test contro un account diverso.

Per sviluppare sul computer: Node.js ≥22.13.0, pnpm 11.25.0, poi:

```sh
pnpm install --frozen-lockfile
pnpm dev:cloud
```

Per collegare la preview locale, copia `config.example.txt` in `.env.local` e inserisci i valori di staging. Imposta `APP_URL` all'origine localhost effettiva stampata da Vite e aggiungila alle Redirect URLs Supabase di test. Per verificare il bundle Cloudflare locale con Wrangler, i binding vanno in `.dev.vars` (escluso da Git); non vengono caricati automaticamente da `.env.local`.

```sh
pnpm check:cloud
pnpm preview:cloud
```

Non copiare segreti nei file che compilerà il browser. Non usare il database di produzione per i test automatici: usano PostgreSQL locale in memoria.

## 11. Prima della 1.0

Preparare materiale completo White e almeno un percorso premium reale, dati e condizioni per gli utenti, prezzo e costi effettivi; collaudare backup, accessibilità e dispositivi fisici. La 0.5 non è un lancio commerciale, un'app nativa o una promessa che tutte le cinture abbiano già contenuti.

## Fonti ufficiali

- [Cloudflare Pages — Git integration](https://developers.cloudflare.com/pages/get-started/git-integration/)
- [Cloudflare Pages — build image e variabili](https://developers.cloudflare.com/pages/configuration/build-image/)
- [Cloudflare Pages — Functions](https://developers.cloudflare.com/pages/functions/get-started/)
- [Supabase — SMTP e limiti](https://supabase.com/docs/guides/auth/auth-smtp)
- [Supabase — template email](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Resend — Supabase SMTP](https://resend.com/docs/send-with-supabase-smtp)
- [Resend — dominio mittente](https://resend.com/docs/dashboard/domains/introduction)
- [Cloudflare — Email Routing](https://developers.cloudflare.com/email-service/get-started/route-emails/)
- [Stripe — sandbox](https://docs.stripe.com/sandboxes/dashboard/manage)
- [Stripe — carte di test](https://docs.stripe.com/testing)
- [Supabase — backup e ripristino](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore)
