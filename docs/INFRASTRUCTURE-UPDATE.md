# Aggiornamento infrastruttura, menu e sfondo

Il pacchetto `bushido-ops-infrastructure.zip` è cumulativo rispetto all'ultimo aggiornamento: conserva personaggi e grafica 8 bit, About, Belts, Philosophy e il pilot. Si applica al repository esistente `dbottali/bushido-ops`.

Il pacchetto è stato aggiornato anche con la correzione del fondo tablet/mobile: il beige specifico della Home sotto i 1119 pixel è stato rimosso. Vedi `IPAD-BACKGROUND-FIX.md`.

## Cosa cambia

- Menu superiore identico su Home, Dojo, About, Belts e Philosophy, basato sul design delle pagine informative.
- Sfondo avorio `#fcfaf5` e tema chiaro espliciti, anche quando il dispositivo preferisce un tema scuro.
- Salvataggio automatico locale di completamenti, risposte e scelte Philosophy.
- Ripresa dal primo modulo incompleto e XP conteggiati una sola volta.
- In Belts → Your Progress: export/import JSON e reset con conferma.
- Gestione dei salvataggi non leggibili e dei browser che non possono salvare.

Non include nuovo materiale didattico, account o sincronizzazione automatica tra dispositivi. I progressi precedenti a questo aggiornamento non erano salvati al reload e non possono essere recuperati.

## Caricamento manuale su GitHub

1. Estrai lo ZIP sul computer.
2. Apri il repository `dbottali/bushido-ops` sulla branch `main`.
3. Scegli **Add file → Upload files** e trascina tutti i file e le cartelle contenuti nello ZIP nella radice del repository. Non caricare lo ZIP stesso né una cartella esterna che racchiuda il progetto.
4. Carica anche `assets`, `app`, `components`, `lib`, `static`, `scripts`, `tests`, `docs`, `art` e `public`. Conferma la sostituzione dei file con lo stesso nome. Questo aggiornamento non richiede file nascosti.
5. Crea il commit su `main`. La pubblicazione esistente resta **main / (root)**.
6. Attendi il completamento di Pages in **Actions**, poi ricarica il sito. Su iPad chiudi e riapri la scheda se mostra ancora la vecchia versione.

Il nuovo `index.html` richiama i nuovi file compilati inclusi in `assets`. I vecchi bundle possono rimanere: non sono richiamati dal nuovo indice. I sorgenti accompagnano la build per continuare lo sviluppo.

## Verifica dopo la pubblicazione

Apri tutte le pagine e verifica che il menu abbia le stesse voci. Completa il Warm-up, ricarica e controlla che restino 20 XP. In Belts prova Export Backup e verifica che il file JSON venga scaricato; importa un backup e conferma solo dopo aver letto l'anteprima. Controlla lo sfondo su iPad. I controlli automatici del modello passano; il comportamento fisico di Safari/iPad resta da verificare sul dispositivo.

Per dettagli tecnici e verifiche: `PROGRESS.md` e `QA.md`.
