# Pubblicazione su GitHub Pages

La webapp animata funziona interamente nel browser. La build dedicata include gli stessi componenti React della versione di anteprima, con percorsi compatibili con `/bushido-ops/`.

## Prima installazione del pacchetto pronto

1. Estrai il pacchetto aggiornato `bushido-ops-0.3.zip`. Per i dettagli dell’ultimo aggiornamento, vedi `RELEASE-0.3.md`.
2. Apri il repository `dbottali/bushido-ops`, sulla branch `main`.
3. Usa **Add file → Upload files** e carica il contenuto interno della cartella estratta nella radice del repository. I file sorgenti aggiornati accompagnano i file già compilati.
4. Conferma la sostituzione di `index.html`, `README.md` e degli altri file esistenti. Questo pacchetto non richiede file nascosti.
5. Crea il commit su `main` e attendi che il deploy Pages nella scheda **Actions** sia completato.
6. Apri `https://dbottali.github.io/bushido-ops/` e ricarica con **Command + Shift + R**.

Il pacchetto aggiorna la pagina iniziale, i personaggi 8 bit, About, Belts, Philosophy e il pilot con warm-up, lesson e quiz. Include My Dojo, il motore corsi modulare, il menu uniforme, lo sfondo avorio esplicito e la migrazione dei progressi dalla 0.2. In My Dojo → Manage Backups (o Belts → Your Progress) puoi esportare un backup JSON, importarlo su un altro dispositivo oppure azzerare i progressi con conferma.

La versione completa contiene 203 file: per l'upload da browser usa i **tre blocchi** indicati in `RELEASE-0.3.md`, ciascuno sotto il limite GitHub di 100 file. Carica sempre dalla radice del repository e conserva le cartelle.

## Build successive

Prerequisiti: Node.js almeno 22.13.0 e pnpm 11.25.0.

```sh
pnpm install --frozen-lockfile
pnpm check:pages
```

Copia il contenuto di `dist-pages/` nella radice del repository, poi crea il commit e pubblicalo su `main`. Conserva nella radice anche i sorgenti per continuare lo sviluppo. Per lo sviluppo locale, esegui `pnpm dev:pages`.

## Impostazione Pages

Per questa pubblicazione da branch: **Settings → Pages → Build and deployment → Deploy from a branch → main → /(root)**.

La vecchia immagine `bushido-ops-pixel-page.png` può rimanere nel repository: il nuovo `index.html` usa il bundle JavaScript della webapp e non la richiama.
