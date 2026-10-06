# Bushido Ops 0.4 — mobile e preparazione 1.0

6 ottobre 2026. Release locale consegnata come archivio; nessuna pubblicazione remota eseguita.

## Implementato

- Header condiviso con menu mobile espandibile, destinazioni originali e CTA sempre visibile. Chiusura su navigazione, Escape e passaggio al layout desktop.
- Comandi più comodi, hero leggibile, schede adattate, breadcrumb che va a capo e finestra backup compatibile con altezza viewport dinamica/fallback.
- Reazioni dei personaggi su tap touch/pen breve, mouse e focus; palette e sprite completi conservati.
- Animazione a intervalli di 100 ms invece di un callback a ogni refresh; nessun ciclo per il footer fermo. Pause fuori schermo, pagina nascosta e movimento ridotto conservate.
- Build portabile senza richiedere i metadati del precedente hosting Sites.
- Specifiche per account, otto cinture, free/premium, hosting e sequenza verso la 1.0: [PLAN-1.0.md](PLAN-1.0.md).

## Verificato

- `pnpm check:pages`: TypeScript, 22 test di progressi/catalogo/routes e build di produzione con asset richiesti.
- `pnpm build`: build framework locale completata.
- Sette pagine a 320, 390, 768 e 1024 px in un iframe del sito reale; nessuno scorrimento orizzontale. Ulteriori controlli Home a 580, 680 e 1280 px.
- Menu aperto, link About, chiusura e focus con Escape. Menu e brand da 44 px; CTA da 48 px.
- Pilota completo a 320 px: 20 XP Warm-up, 50 dopo Lesson, 100 e 3/3 dopo Quiz; My Dojo conserva i progressi dopo reload.

## Limiti

È verificata la disposizione responsive in Chrome; la nuova release richiede ancora prova fisica su Safari/iPad e smartphone. La reazione touch è stata implementata e controllata nel codice; non è stata emulata nel browser. Non si afferma di aver riprodotto il marrone di Brave.

Account, cloud sync e pagamenti sono progettati, non attivi. È giocabile solo il pilota bianco. Il materiale effettivo sarà inserito successivamente dal proprietario. Nessun editor per studenti, pannello preferenze o app installabile.

## Archivio

Lo ZIP contiene sorgenti, lockfile, documentazione, arte originale e build statica alla radice. Non include dipendenze, output temporanei, fixture QA o segreti.

Per sviluppo locale: `pnpm install --frozen-lockfile`, `pnpm dev:pages`. Per verifica/build: `pnpm check:pages`. Non aprire semplicemente `index.html` come file locale: il browser deve caricarlo da un server web.

La build statica mantiene `/bushido-ops/`. Conservare la cronologia Git se si aggiorna il repository. Il trasferimento a hosting commerciale e i pagamenti appartengono al percorso verso la 1.0.
