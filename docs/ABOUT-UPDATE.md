# Aggiornamento Bushido Ops — About

Il pacchetto `bushido-ops-about.zip` aggiorna il repository GitHub Pages esistente. Include About, Philosophy e l’ultimo aggiornamento dei personaggi 8 bit.

1. Estrai lo ZIP.
2. Apri `dbottali/bushido-ops`, branch `main`.
3. Nella radice del repository scegli **Add file → Upload files**.
4. Trascina tutto il contenuto estratto: `index.html`, `README.md` e le cartelle `assets`, `art`, `public`, `app`, `components`, `lib`, `docs`. Non aggiungere una cartella contenitore e non caricare lo ZIP come singolo file.
5. Conferma con **Commit changes**. I file con lo stesso percorso vengono aggiornati.
6. Attendi il completamento del deploy Pages in **Actions**, poi ricarica con ⌘⇧R su Mac o Ctrl⇧R su Windows/Linux.

**ABOUT** ora apre una pagina dedicata con missione, destinatari, panoramica interattiva di Warm-up/Lesson/Quiz, percorso delle cinture e FAQ. I tre pulsanti delle anteprime aprono i moduli corretti. **READ OUR PHILOSOPHY** porta al codice del dojo; About è raggiungibile anche dalla navigazione di Philosophy.

Il nuovo `index.html` richiama i bundle aggiornati in `assets`. I vecchi bundle possono restare nel repository. Artwork e font già presenti vengono riutilizzati. I personaggi e lo sfondo pulito sono inclusi sia in `art` per Pages, sia in `public/art` per ricompilare. Non servono file nascosti.

La configurazione Pages esistente su `main` e `/(root)` resta compatibile. L’aggiornamento è verificato in anteprima locale; il sito online cambia dopo il caricamento e il deploy.
