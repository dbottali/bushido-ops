# Aggiornamento Bushido Ops — personaggi 8 bit

Questo archivio aggiorna la versione GitHub Pages già funzionante e include le correzioni precedenti alle animazioni.

1. Estrai `bushido-ops-8bit-characters.zip`.
2. Apri il repository `dbottali/bushido-ops`, branch `main`.
3. Seleziona **Add file → Upload files** dalla pagina principale del repository.
4. Trascina tutto il contenuto estratto nella radice: `index.html`, `README.md` e le cartelle `assets`, `art`, `public`, `app`, `components`, `lib`, `docs`. Non caricare lo ZIP e non aggiungere una cartella contenitore.
5. Conferma con **Commit changes**. I file con lo stesso percorso vengono aggiornati.
6. Attendi la pubblicazione Pages in **Actions**, poi ricarica con ⌘⇧R su Mac o Ctrl⇧R su Windows/Linux.

Sono inclusi il protagonista stile Ryu, il pugile per Warm-up, la combattente ispirata a Chun-Li per Quiz e lo sfondo pulito. I personaggi hanno pixel marcati e sedici colori. A riposo respirano e sobbalzano leggermente; al passaggio del mouse eseguono un solo pugno con il corpo intero, poi tornano in guardia.

Il nuovo `index.html` carica i nuovi bundle in `assets`. I vecchi bundle possono restare: non vengono più usati. Le nuove immagini sono sia in `art` per Pages, sia in `public/art` per ricompilare il progetto. Artwork originale e font già presenti non richiedono un nuovo upload. Non ci sono file nascosti necessari.

Dopo l’upload: Warm-up deve mostrare guantoni rossi e Quiz una combattente in blu. Su Ryu, braccio e busto devono muoversi insieme; lasciando il puntatore fermo il pugno non deve ripetersi. Il pacchetto è verificato in anteprima locale; la versione online cambia dopo il tuo caricamento.
