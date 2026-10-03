# Aggiornamento Bushido Ops — Philosophy

Il pacchetto `bushido-ops-philosophy.zip` aggiorna la versione GitHub Pages esistente. Include la nuova sezione e l’ultimo aggiornamento dei personaggi 8 bit.

1. Estrai lo ZIP.
2. Apri il repository `dbottali/bushido-ops`, branch `main`.
3. Scegli **Add file → Upload files** nella radice del repository.
4. Trascina tutto il contenuto estratto: `index.html`, `README.md` e le cartelle `assets`, `art`, `public`, `app`, `components`, `lib`, `docs`. Carica il contenuto, senza aggiungere una cartella contenitore.
5. Conferma con **Commit changes**. I file con lo stesso percorso vengono aggiornati.
6. Attendi il completamento di Pages in **Actions**, poi ricarica il sito con ⌘⇧R su Mac o Ctrl⇧R su Windows/Linux.

La nuova voce **PHILOSOPHY** apre una pagina con Order, Respect e Honor. Le schede mostrano abitudini ed esempi espandibili. **BUILD YOUR DOJO CODE** porta alle tre scelte personali; **START WHITE BELT** apre l’allenamento. Le selezioni restano mentre navighi nella sessione aperta e si azzerano al reload.

Il nuovo `index.html` richiama i nuovi bundle compilati in `assets`: i bundle precedenti possono restare. I personaggi e lo sfondo sono inclusi sia in `art`, per Pages, sia in `public/art`, per ricompilare. Artwork originale e font già presenti nel repository vengono riutilizzati. Non servono file nascosti.

La pubblicazione esistente da `main` e `/(root)` resta compatibile. Il pacchetto è stato verificato in anteprima locale; il sito online cambia dopo il caricamento e il deploy Pages.
