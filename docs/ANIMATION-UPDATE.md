# Correzione personaggio Bushido Ops

Questo archivio aggiorna la versione GitHub Pages già funzionante.

1. Estrai lo ZIP.
2. Apri il repository `dbottali/bushido-ops`, branch `main`.
3. Seleziona **Add file → Upload files** dalla pagina principale del repository.
4. Trascina tutto il contenuto estratto nella radice del repository, incluse le cartelle `assets`, `app`, `components` e `docs`. Non caricare lo ZIP e non aggiungere una cartella contenitore.
5. Conferma con **Commit changes**. I file con lo stesso percorso vengono aggiornati.
6. Attendi il completamento della pubblicazione Pages in **Actions**, poi ricarica il sito con ⌘⇧R su Mac o Ctrl⇧R su Windows/Linux.

Il nuovo `index.html` usa i nuovi file in `assets`. I vecchi bundle possono restare: non sono più caricati. Artwork e font già presenti non richiedono un nuovo upload. Nessun file nascosto è necessario per questo aggiornamento.

Il pugno automatico è stato eliminato. I personaggi restano quasi fermi e fanno una sola breve reazione quando il mouse entra sul personaggio o sulla sua card. Le reazioni delle card funzionano anche con il focus da tastiera. I movimenti e i tempi sono differenziati.

Questa versione elimina anche il pavimento dal ritaglio animato e mantiene testa, collo, petto e braccia come un unico disegno senza ridimensionamenti fra i fotogrammi. Mantiene il protagonista originale stile Ryu. Il pugile e la combattente per il quiz sono ancora da creare e non sono inclusi: la generazione è bloccata dal limite immagini.
