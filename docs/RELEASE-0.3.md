# Bushido Ops 0.3 — aggiornamento pronto per GitHub

## Cosa include

- My Dojo: XP reali, pratiche e passi completati, abitudini Philosophy, stato dei corsi, prossima azione e risposte da ripassare.
- Motore corsi modulare: contenuti in JSON, ID stabili, Warm-up/Lesson/Quiz riutilizzabili, soglie del quiz, ricompense e prerequisiti.
- Player con passi precedente/successivo, riepilogo del quiz e piccolo feedback visivo su verifica, senza animazioni ampie aggiuntive.
- Salvataggio versione 3 con migrazione dalla 0.2, backup JSON, importazione anche tramite testo, reset con conferma e protezione dei dati non leggibili.
- 22 test automatici e comando unico di controllo della release.
- Menu uniforme con My Dojo su tutte le pagine; sfondo avorio esplicito; grafica, personaggi e animazioni 8-bit già approvati preservati.

Nessun nuovo materiale didattico: resta disponibile il pilot originale. Gli altri sette corsi sono in sviluppo. Nessun account, cloud sync, classifica, streak o certificazione.

## Caricamento manuale

1. Se hai progressi da conservare, esporta un backup dalla versione attuale.
2. Estrai `bushido-ops-0.3.zip`.
3. Apri `dbottali/bushido-ops`, branch `main`: **Add file → Upload files**.
4. Carica **tutto il contenuto interno** dello ZIP nella radice del repository, comprese le cartelle. Non caricare soltanto lo ZIP, né una cartella esterna che lo racchiude.
5. Conferma la sostituzione dei file esistenti e crea il commit.
6. Attendi il deploy Pages nella scheda Actions, poi ricarica il sito. My Dojo deve essere nel menu e il footer delle pagine interne deve indicare `v0.3`.

Il pacchetto contiene sorgenti e build già pronta; non richiede file nascosti. Vecchi bundle con nomi diversi possono restare nel repository: solo quelli richiamati dal nuovo index sono usati. Per pulizia si possono rimuovere in seguito, ma non è necessario per l'aggiornamento.

### Tre upload per il pacchetto completo

Il pacchetto ha 203 file. GitHub limita ogni caricamento da browser a 100 file; usa questi tre blocchi dalla radice del repository, confermando un commit per ciascuno:

| Blocco | Seleziona nella cartella estratta | File |
| --- | --- | --- |
| 1 | Tutti i file sciolti nella radice + cartelle `art`, `assets`, `fonts`, `public` | 42 |
| 2 | Cartelle `app`, `components`, `lib`, `data`, `static`, `hooks` | 96 |
| 3 | Cartelle `build`, `db`, `docs`, `drizzle`, `examples`, `scripts`, `tests`, `vendor` | 65 |

Trascina le cartelle conservando i percorsi, senza selezionare soltanto i file al loro interno. Il primo blocco aggiorna già il sito compilato; gli altri completano i sorgenti e la documentazione. Attendi comunque l'ultimo deploy prima del controllo finale.

Fonte del limite: [documentazione GitHub](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository), verificata il 4 ottobre 2026.

Mantieni Pages su **Deploy from a branch → main → /(root)**. L'upload su GitHub è a tuo carico: questa consegna non modifica il repository o il sito online.

## Progressi e rollback

La chiave del browser resta identica. I dati 0.2 validi sono convertiti automaticamente mantenendo risposte, completamenti e abitudini. Un backup 0.2 può essere importato dalla 0.3. Una vecchia versione 0.2 non sa leggere i nuovi backup 0.3: conserva il backup precedente per un eventuale rollback.

La validazione browser usa Chrome e larghezze responsive, non un iPad/Safari fisico. Download nativo e selettore file richiedono ancora una verifica sul dispositivo; la verifica dell'importazione tramite testo e del payload esportato è inclusa.

Per i dettagli: `LEARNING-ENGINE.md`, `PROGRESS.md`, `QA.md`. Per lo sviluppo: `pnpm dev:pages`; per la release: `pnpm check:pages`.
