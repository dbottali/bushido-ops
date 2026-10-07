# Bushido Ops — decisioni e percorso verso la 1.0

Aggiornato: 7 ottobre 2026. Product owner: Damiano.
Stato: roadmap aggiornata alla consegna del codice 0.5, pronto da configurare su staging. Nessun servizio, dominio, pagamento reale o pubblicazione è stato attivato. Il lancio commerciale resta alla 1.0.

## Avanzamento — release 0.5

Implementati account email/password con conferma e recupero, impostazioni/export/cancellazione, progressi nel database, ripresa, bozze e conflitti fra dispositivi, correzione degli esami sul server, XP univoci e assegnazione delle cinture con prerequisiti. Le API autenticano ogni richiesta e gli studenti non possono modificare contenuti, premi o diritti di accesso.

Il nuovo percorso approvato è: **tre domande come ospite → account gratuito per continuare e completare la bianca → abbonamento e prerequisiti per gialla e superiori**. La registrazione non è più facoltativa dopo la prova iniziale. Pagare non assegna una cintura.

Integrati Stripe sandbox, portale, verifica webhook, gestione della scadenza e importazione JSON riservata al proprietario. Il futuro editor visuale resta rimandato. Il pilota bianco resta materiale campione, senza cintura completa; un catalogo sintetico separato permette di collaudare White → Black e pagamenti di test. Nessun contenuto definitivo è stato aggiunto.

47 test automatici locali passati, TypeScript e build frontend/API Cloudflare compilati. Otto percorsi controllati in Chrome alle larghezze richieste di 320, 390, 768, 1024 e 1280 px: nessun overflow orizzontale del body, sfondo avorio e menu condiviso. Prova ospite 3/3 e 20 XP provvisori, richiesta account e menu da tastiera verificati. Grafica 8 bit e personaggi approvati conservati.

L'archivio 0.5 include sorgenti, migrazione e seed Supabase, template email, contenuti di collaudo, demo statica e guida di configurazione. Cloudflare, Supabase, email, Stripe e dominio sono da collegare dal proprietario. Il dominio non è ancora registrato: lo staging può iniziare su pages.dev. Con SMTP predefinito Supabase si prova soltanto verso gli indirizzi del team, entro i limiti del servizio; per tester esterni serve un dominio mittente verificato.

Il collaudo con servizi esterni, due dispositivi/account, consegna email, rinnovo/cancellazione Stripe, ripristino backup e iPad/Safari/Brave fisici resta da completare. La 0.5 è pronta da configurare e testare; non è un servizio commerciale già operativo.

Prossimi passi: registrare i servizi di staging seguendo Bushido-Ops-0.5-Setup.md, collaudare i flussi, poi caricare il materiale definitivo con ID propri. La produzione sarà separata dai dati e dalle cinture fittizie del collaudo.

## Decisioni confermate da Damiano

- Gli utenti non possono modificare il materiale didattico.
- Editor visuale e authoring avanzato restano rimandati. La 0.5 autorizzata implementa una semplice importazione JSON con validazione e conferma, solo per il proprietario.
- La prossima priorità dell'interfaccia è l'ottimizzazione per smartphone e tablet.
- Il pannello delle preferenze e altre opzioni personali sono rimandati. Resta il rispetto delle impostazioni di movimento ridotto già previsto.
- Il project manager valuta quali controlli automatici siano utili; evitare una nuova infrastruttura di test sproporzionata.
- Iniziare a progettare account, progressione per cinture, hosting e sostenibilità economica.
- Tre domande White senza account; poi account gratuito per completare la bianca. Gialla e superiori con bianca ottenuta, abbonamento attivo e prerequisiti didattici.
- Il successivo sviluppo della 0.5 è stato autorizzato. Account e pagamenti solo in collaudo; lancio pubblico commerciale e incassi reali alla release 1.0.
- Eventuale app mobile da valutare.
- Preservare palette avorio/rosso/blu, grafica 8 bit, personaggio principale con gi bianco, pugile Warm-up e combattente in blu nel Quiz. Idle discreto; gesti ampi solo su interazione.
- Il proprietario ha confermato il corretto sfondo su Safari nell'iPad. Il marrone osservato in Brave resta una differenza da diagnosticare: la causa non è stata confermata.

## Punto di partenza e confine del materiale

La 0.4 conserva il catalogo modulare, le pagine informative, il pilota locale e i backup. La 0.5 aggiunge il modello cloud e conserva il profilo 0.4 come archivio separato. Le tre risposte iniziali possono essere importate esplicitamente e ricorrette; completamenti/XP locali non provano una cintura o un abbonamento.

È pubblicabile il solo pilota White incluso; le altre cinture hanno obiettivi e anteprime pianificati. Il catalogo sintetico serve al collaudo, non all'insegnamento definitivo. Le otto cinture reali richiedono materiale e criteri editoriali revisionati.

## Valutazione del project manager

Ha senso un investimento piccolo e delimitato per verificare un prodotto didattico riconoscibile e sostenibile. L'esperienza di insegnamento del proprietario e il dojo 8 bit sono punti di partenza utili. La disponibilità a pagare non è ancora dimostrata.

Il primo obiettivo economico è pagare infrastruttura e aggiornamenti. Coprire i server è diverso dal remunerare preparazione delle lezioni, manutenzione e assistenza. Misurare separatamente spesa monetaria e ore.

Il rischio di prodotto principale è proporre un abbonamento a un catalogo finito che lo studente conclude e abbandona. Il valore ricorrente dovrà essere sostenuto da scenari nuovi, pratica e aggiornamenti realistici, con una cadenza che Damiano possa mantenere. Non promettere nuovi contenuti settimanali prima di aver misurato il lavoro necessario.

Pubblico iniziale proposto: principianti adulti che vogliono difendersi online e proseguire verso le basi della difesa informatica. Questa è un'ipotesi da validare, non una decisione definitiva sul pubblico. Le cinture avanzate possono guidare chi vuole continuare; evitare promesse di qualifica professionale non dimostrate.

## Ambito storico della 0.4 — implementato

- Header e menu leggibili su smartphone senza comprimere le voci; stessa identità e destinazioni.
- Titoli, contenuti e pulsanti leggibili in portrait e landscape.
- Schede, dashboard, percorso cinture e quiz senza scorrimento orizzontale.
- Interazioni touch equivalenti alle azioni importanti oggi associate a hover/focus; gesti dei personaggi sempre brevi e discreti.
- Ridurre lavoro grafico inutile e verificare fluidità su un dispositivo reale.
- Pochi controlli di regressione per navigazione, ricaricamento, XP non duplicati, recupero/importazione dei progressi e larghezza mobile.
- Nessun editor per gli studenti; nessun pannello preferenze; nessuna attivazione di account o pagamenti in questo sprint.

Criterio di uscita: un utente può completare il pilota e riprenderlo dal telefono; testo e controlli sono comodi e nessuna azione richiede il mouse.

## Architettura degli account — implementata nella 0.5, da collaudare sui servizi

- Prova iniziale di tre domande White per ospiti; account gratuito verificato richiesto per proseguire.
- Supabase Auth: email e password, conferma e recupero tramite email. Template con token_hash per l'apertura su un altro dispositivo; nessun login social nel primo rilascio.
- My Dojo associato all'account: moduli, completamenti, ripresa, risultati e cinture coerenti fra dispositivi.
- Importazione esplicita delle tre risposte iniziali, ricorrette sul server; archivio 0.4 separato. Nessun diritto premium, cintura o XP fidato dal browser.
- Profilo minimo: email e nome opzionale; gestione, recupero, export e cancellazione implementati, da provare sui servizi configurati.
- Studenti e proprietario hanno autorizzazioni diverse. L'iscrizione non concede editing dei contenuti.
- Abbonamento e livello didattico sono due stati distinti: pagare concede accesso, superare la verifica concede la cintura.
- Alla scadenza dell'abbonamento il percorso gratuito e i progressi rimangono; l'accesso ai contenuti premium dipende dal diritto attivo. La cancellazione dell'account è un'azione separata.
- Le verifiche dei diritti premium devono avvenire sul server o nel database, con isolamento dei dati per utente. Nascondere pulsanti nel browser non protegge contenuti.
- Il materiale a pagamento non va distribuito nel bundle pubblico o nel repository pubblico.
- Diritti test aggiornati tramite eventi Stripe verificati, lettura dello stato corrente, deduplicazione e scadenza. Il ritorno dal checkout non conferma l'accesso. Modalità live rinviata alla 1.0.
- Account e progresso sul server introducono manutenzione reale: backup, recupero, isolamento degli ambienti e controllo delle autorizzazioni.

Le funzioni sono implementate nel pacchetto 0.5 e verificate localmente; i provider devono essere configurati e il collaudo esterno rimane aperto.

## Proposta del curriculum per cinture

| Cintura | Tema coerente con il catalogo | Risultato pratico iniziale | Accesso proposto |
|---|---|---|---|
| Bianca | Pause. Verify. Protect. | Riconoscere una richiesta sospetta, verificare con un canale affidabile e scegliere un'azione sicura. | Gratuito |
| Gialla | Accounts & Identity | Proteggere un account con credenziali adeguate, MFA e recupero accesso. | Abbonamento |
| Arancione | Devices & Data | Gestire aggiornamenti, permessi, dati e backup; provare un ripristino guidato. | Abbonamento |
| Verde | Networks & the Web | Capire connessioni, Wi-Fi, HTTPS e rischi della navigazione; scegliere configurazioni sensate. | Abbonamento |
| Blu | Defensive Thinking | Valutare rischi, privilegi e priorità; motivare misure di protezione. | Abbonamento |
| Viola | Investigation & Detection | Analizzare segnali e log didattici per riconoscere attività sospette. | Abbonamento |
| Marrone | Incident Response | Seguire un piano guidato di contenimento, recupero e comunicazione. | Abbonamento |
| Nera | Practice & Mentorship | Completare un progetto finale e spiegare ad altri le scelte di difesa. | Abbonamento |

La bianca deve essere un percorso gratuito completo e utile, non solo l'attuale esercizio pilota.
Ogni cintura avrà pochi obiettivi misurabili, sessioni brevi Warm-up → Lesson → Quiz, una verifica finale su uno scenario e feedback per correggere gli errori.
La cintura richiede apprendimento verificato; l'XP serve a mostrare il percorso e non sostituisce la prova.
Soglia di superamento, durata, numero di missioni e prerequisiti restano da definire con il materiale. La cintura è un riconoscimento interno al dojo e non una certificazione accreditata.

Per la 1.0 propongo bianca completa e almeno gialla/arancione realmente disponibili e revisionate. Le altre possono restare una roadmap esplicitamente indicata. L'abbonamento darà accesso a tutte le cinture premium disponibili, senza acquisto separato per cintura.

## Modello economico da validare

- Un livello gratuito: bianca.
- Un solo piano premium per iniziare; evitare più livelli di prezzo e accesso.
- Ipotesi di prezzo da testare: 9 EUR/mese. Non è un prezzo già approvato né una valutazione di mercato.
- Sconti annuali ed eventuali offerte per gruppi si valutano dopo i primi dati; evitare di vincolare un anno quando il catalogo è ancora piccolo.
- Ipotesi di tetto per il primo esperimento: 100–200 EUR di spesa monetaria complessiva, usando i piani gratuiti dove adatti. Non è una stima del costo di sviluppo professionale.
- Budget tecnico indicativo al primo lancio, con poco traffico: 30–50 EUR/mese per un'architettura piccola. È un'ipotesi di budget, non un preventivo: dipende da piano, cambio USD/EUR, imposte, email, uso e dominio.
- Quel budget esclude commissioni di incasso, consulenza, creazione del materiale, supporto e valore delle ore del proprietario. Prima della 1.0 ricalcolare il costo effettivo.

Scenari aritmetici con prezzo ipotetico di 9 EUR/mese:

| Abbonati attivi | Ricavi mensili lordi |
|---|---:|
| 10 | 90 EUR |
| 30 | 270 EUR |
| 50 | 450 EUR |

Sono ricavi lordi, prima di commissioni, IVA ove applicabile, imposte e costi. Non sono previsioni di utenti o utile.
Stripe in Germania indica attualmente 1,5% + 0,25 EUR per carte EEA standard e 0,7% aggiuntivo per Billing pay-as-you-go; altri metodi e carte hanno tariffe diverse.
A titolo puramente tecnico, un incasso di 9 EUR con quelle due componenti avrebbe circa 0,448 EUR di commissioni. Questa cifra non determina l'utile e non include altre eventuali componenti.

Misura guida: margine dopo costi / ore mensili. Un progetto che paga l'hosting ma richiede troppe ore deve ridurre scope o rivedere offerta e prezzo.

## Hosting proposto per la 1.0

Configurazione scelta per lo staging 0.5; verificare nuovamente piani, limiti e costi prima della produzione:

- GitHub per mantenere il codice e la cronologia.
- Cloudflare Pages per il frontend: richieste a file statici gratuite; funzioni e servizi ulteriori hanno limiti/tariffe propri.
- Supabase per autenticazione, database, progressi e API protette; piano Free per esperimenti, Pro da 25 USD/mese per valutare il primo lancio. Scegliere una regione UE disponibile. Il Free può essere sospeso dopo una settimana di inattività e non include backup automatici.
- Stripe Checkout/Billing per pagamenti e gestione abbonamento; verifica server degli eventi.
- Dominio proprio ed email transazionali configurate. L'SMTP predefinito Supabase non è un servizio di invio email pubblico per produzione.
- Informazioni sui dati degli utenti, condizioni del servizio, prezzi, fatturazione e trattamento fiscale da preparare prima del lancio, in funzione del modello e dei paesi serviti.

GitHub Pages rimane pertinente al prototipo esistente; i suoi limiti vietano l'uso come hosting gratuito di un business/e-commerce/SaaS commerciale. Pianificare la migrazione del sito prima del lancio a pagamento.
Non usare l'homelab personale come dipendenza operativa del servizio agli abbonati nel primo rilascio.

Questa selezione non crea account, non compra il dominio, non sposta il sito e non autorizza costi.

## Mobile e possibile app

Prima perfezionare il sito mobile. Successivamente valutare una PWA: la stessa webapp con manifest, icona e un'esperienza adatta all'apertura dalla schermata Home.
Installazione e capacità variano secondo browser e dispositivo; provarle prima di promettere funzioni. Apple documenta l'apertura di un sito come webapp dalla Home dell'iPad.
L'installazione non concede automaticamente modalità offline. Cache, aggiornamenti e contenuti premium offline richiedono una progettazione separata.
Un'app nativa per gli store è una decisione successiva, da legare a utilizzo mobile ripetuto e a un vantaggio concreto che giustifichi costo e manutenzione.

## Sequenza verso la 1.0

1. **0.4 — Mobile:** migliorare interfaccia touch e controllare le regressioni del pilota.
2. **0.5 — Infrastruttura:** codice account, sincronizzazione, esami/cinture, importazione proprietario e Stripe sandbox consegnato; materiale campione.
3. **Configurazione e prova privata:** creare/collegare servizi di staging, collaudare email, due dispositivi, accessi, Stripe, backup e iPad; poi materiale definitivo. Nessuna attivazione commerciale.
4. **Candidata 1.0:** percorso gratuito completo, premium iniziale concreto, recupero account, dati fra dispositivi, accessi verificati, checkout/cancellazione provati, informazioni per utenti e costi effettivi rivisti.
5. **1.0 — Lancio commerciale:** solo dopo decisione esplicita del proprietario sul rilascio.
6. **Dopo 1.0:** contenuti aggiuntivi, PWA/app, eventuale editor privato e preferenze, in base ai riscontri.

Non serve riempire adesso tutte le versioni intermedie con feature nuove. Una release deve risolvere un bisogno osservato.

## Prova di interesse prima di ampliare il progetto

Proposta da approvare e organizzare senza pubblicazione commerciale:

- 10–20 tester volontari, invitati privatamente quando autorizzato.
- Osservare se completano la bianca senza assistenza, applicano il principio e tornano entro 7–14 giorni.
- Mostrare una proposta premium chiara e il prezzo ipotetico; raccogliere motivi, obiezioni e disponibilità a pagare.
- La disponibilità dichiarata è un segnale preliminare. Acquisti e rinnovi reali dopo il lancio sono una prova più forte.
- Ampliare il catalogo o spendere per acquisizione solo dopo risultati concreti.
- Non contattare automaticamente studenti, colleghi o altre persone a nome del proprietario.

Prime decisioni da prendere: pubblico iniziale, materiale della bianca gratuita e prima offerta premium sostenibile; prezzo e tempo mensile per aggiornamenti/supporto. Il confine del funnel account è già approvato.

## Fonti verificate il 5 ottobre 2026

Prezzi, limiti e condizioni possono cambiare; riverificarli prima di acquistare o pubblicare.

- Cloudflare Pages, pricing: https://developers.cloudflare.com/pages/functions/pricing/
- Supabase, pricing: https://supabase.com/pricing
- Supabase, email SMTP: https://supabase.com/docs/guides/auth/auth-smtp
- Supabase, Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
- Stripe, pricing Germania: https://stripe.com/de/pricing
- Stripe, subscription webhooks: https://docs.stripe.com/billing/subscriptions/webhooks
- GitHub Pages, limiti: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
- Apple, webapp iPad: https://support.apple.com/en-euro/guide/ipad/ipad8f1f7a29/ipados
