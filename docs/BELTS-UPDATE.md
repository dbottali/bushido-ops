# Caricare l’aggiornamento Belts

Il pacchetto `bushido-ops-belts.zip` è cumulativo: contiene Belts, About, Philosophy, i personaggi 8 bit approvati e il pilot White Belt. Include i sorgenti aggiornati e la versione già compilata per GitHub Pages.

1. Scarica ed estrai `bushido-ops-belts.zip`.
2. Apri il repository `dbottali/bushido-ops` sulla branch `main`.
3. Seleziona **Add file → Upload files**.
4. Carica tutto il contenuto interno della cartella estratta nella radice del repository, insieme alle cartelle `app`, `components`, `lib`, `art`, `public`, `assets` e `docs`. Carica i file estratti, non il file ZIP.
5. Conferma la sostituzione dei file esistenti e crea il commit con **Commit changes**. Puoi usare il messaggio `Develop Belts page and connect pilot progress`.
6. Attendi che il deploy GitHub Pages nella scheda **Actions** termini.
7. Apri il sito, ricarica con **Command + Shift + R**, poi seleziona **BELTS**.

Non servono file nascosti, installazioni o build sul tuo Mac. Mantieni `index.html` nella radice di `main`. Gli asset originali e i font già presenti nel repository restano necessari.

## Cosa controllare

- BELTS apre una pagina dedicata con otto cinture selezionabili.
- Cliccare una cintura da Home o About apre il suo curriculum.
- White è disponibile; le altre sette sono indicate come in sviluppo.
- Completare il Warm-up mostra 20 XP in Belts. “Continue your practice” apre Lesson; dopo la Lesson apre Quiz.
- Completare tutti e tre i moduli mostra 100 XP e 3/3. Ripetere gli esercizi non aggiunge XP duplicati.
- Il progresso vale per la sessione aperta e si azzera al reload.

Questo file descrive l’upload manuale; il pacchetto non pubblica automaticamente il sito.
