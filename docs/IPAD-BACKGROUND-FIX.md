# Sfondo uniforme anche nella vista tablet

Il pacchetto aggiornato `bushido-ops-infrastructure.zip` include questa correzione e conserva tutti gli aggiornamenti precedenti.

## Correzione

Nel CSS della Home era rimasta una regola che applicava un fondo beige `#f9f2e7` sotto i 1119 pixel. La sezione iniziale ora usa lo stesso avorio `#fcfaf5` a tutte le larghezze. Anche HTML, body, root React e contenitori delle pagine hanno un fondo esplicito, con tema `only light` fin dal caricamento iniziale.

Il controllo della versione online ha confermato che indice e bundle precedenti erano già correttamente pubblicati. Questa correzione aggiunge nuovi bundle e un indice aggiornato; non richiede di cancellare i progressi del browser.

## Caricamento

1. Scarica di nuovo lo ZIP aggiornato ed estrailo.
2. Su GitHub, branch `main`, usa **Add file → Upload files** e carica tutto il contenuto nella radice del repository, sostituendo i file con lo stesso nome.
3. Crea il commit e attendi che Pages termini in **Actions**.
4. Apri il sito in una nuova scheda Safari sull'iPad. Una scheda privata può aiutare a confrontare una nuova sessione senza cancellare i dati della scheda normale.

Il fondo è stato verificato nel browser alle larghezze effettive di 768, 1024, 390 e 320 pixel. Non è una prova su un iPad fisico. Se il dispositivo continua a mostrare marrone, serve uno screenshot completo della zona e il nome del browser per individuare la differenza rimasta.

Le illustrazioni del dojo mantengono i loro colori originali. Menu, animazioni 8 bit e progressi restano inclusi. Non eliminare i dati di Safari per applicare questa correzione.
