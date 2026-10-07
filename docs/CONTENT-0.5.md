# Preparare il materiale — 0.5

Gli studenti leggono e svolgono gli esercizi. Solo l'account del proprietario autorizzato nel server può validare e pubblicare il catalogo. Il materiale definitivo non è ancora incluso.

## Esempi inclusi

| File | Uso |
|---|---|
| `content/pilot-catalog.json` | Pilota White e sette cinture pianificate; non assegna la cintura completa |
| `content/staging-smoke-catalog.json` | Esempio completo di lezioni, domande, esami, premi e prerequisiti White → Black; interamente materiale test |
| `supabase/seed-pilot.sql` | Primo inserimento del pilota in un database appena migrato |

Usa il catalogo sintetico anche come riferimento della struttura JSON, senza trasformare i suoi contenuti finti in contenuti reali già certificati. Mantieni i file di authoring effettivi privati.

## Struttura e regole

Il documento usa `schemaVersion: 2` e `courses`. Ogni corso ha `id`, `belt`, `title`, `summary`, `availability`, `prerequisites`, `awardsBelt`, `testContent`, `modules`.

- ID: lettere minuscole iniziali, cifre e trattini, massimo 80 caratteri. Unici e stabili; non riciclare un ID di test.
- `planned`: nessun modulo e nessuna cintura assegnabile.
- `available`: almeno un modulo con contenuto concreto.
- `testContent: true`: etichetta test sempre visibile. Materiale revisionato reale usa false.
- Moduli in ordine: Warm-up/Quiz (`kind: warmup` o `quiz`), Lesson (`lesson`) e, per una cintura, esame finale (`exam`).
- Lesson: `sections` con titolo e corpo. Testi semplici; niente HTML o script.
- Valutazioni: `questions`, opzioni, `correct` come indice numerico a partire da **0**, `explanation` e `passingScore` come numero di risposte corrette necessario. Almeno due opzioni per domanda.
- `reward`: XP una volta per modulo, non per tentativo. Il totale è derivato dai moduli pubblicati.
- `awardsBelt: true`: almeno una lezione, esame come ultimo modulo, completamento di tutti i moduli. Per la gialla e oltre occorre il corso che assegna la cintura precedente fra i prerequisiti.
- White non ha prerequisiti e resta gratuita per l'account. I corsi premium richiedono automaticamente White e abbonamento; questi vincoli non sono campi modificabili dallo studente.

Esempio di domanda privata:

```json
{
  "id": "verify-channel",
  "prompt": "Replace with the reviewed scenario.",
  "options": ["Replace option A.", "Replace option B."],
  "correct": 1,
  "explanation": "Explain the principle and the safe action."
}
```

Non pubblicare questa domanda segnaposto come materiale definitivo. L'API studente invia soltanto `id`, `prompt` e `options`; la correzione viene eseguita nel database.

## Importazione

1. Scarica una copia del catalogo corrente da Owner prima di modificarlo.
2. Conserva i corsi già presenti. Aggiungi il nuovo corso con nuovi ID, materiali e prerequisiti coerenti.
3. Opzionalmente valida in locale: `pnpm content:validate percorso-del-catalogo.json`.
4. Apri Owner → carica file JSON o incolla il documento; massimo 1 MB.
5. Scegli Validate e controlla corsi disponibili, valutazioni e indicazione di materiale test.
6. Scegli Publish per il documento verificato. Il server ricontrolla contenuto, permessi e revisione. Ricarica il catalogo se un altro publish lo ha aggiornato.
7. Verifica il corso con un account studente separato; prova errore, retry, prerequisiti e cintura.

La pubblicazione non riscrive un corso che abbia già risposte/progressi. Per una correzione successiva, prepara una nuova versione con nuovo ID e una migrazione editoriale esplicita. In questo primo collaudo mantieni i vecchi corsi del catalogo; la gestione dell'archivio dei corsi potrà essere aggiunta più avanti.

## Confine editoriale

Ogni cintura dovrebbe indicare pochi risultati pratici verificabili. Il pilota sul phishing non equivale alla bianca completa. Una cintura test non va migrata come cintura reale. La 1.0 partirà da un database di produzione separato, con materiali e soglie revisionati dal proprietario.
