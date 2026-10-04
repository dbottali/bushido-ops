"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { AlertDialog } from "radix-ui";
import { decodeProgress, encodeProgress, MAX_BACKUP_BYTES, PILOT_ID, progressXp, type DojoProgress, type ProgressSnapshot, type ProgressStore } from "@/lib/dojo-progress";

type Confirmation = { type: "reset" } | { type: "import"; data: DojoProgress };
export function ProgressManager({ store, snapshot }: { store: ProgressStore; snapshot: ProgressSnapshot }) {
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [reading, setReading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const importButton = useRef<HTMLButtonElement>(null);
  const resetButton = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<HTMLButtonElement | null>(null);

  const backupHref = (raw: string) => `data:application/json;charset=utf-8,${encodeURIComponent(raw)}`;
  const backupName = (suffix = "progress") => `bushido-ops-${suffix}-${new Date().toISOString().slice(0, 10)}.json`;
  function backupClicked() {
    setError("");
    setMessage("Keep the downloaded backup to restore your progress later.");
  }
  async function chooseBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setMessage(""); setError(""); setReading(true);
    try {
      if (file.size > MAX_BACKUP_BYTES) { setError("Choose a Bushido Ops progress backup smaller than 256 KB."); return; }
      const parsed = decodeProgress(await file.text());
      if (!parsed.ok) { setError(parsed.reason === "newer" ? "This backup needs a newer Bushido Ops version. Your current progress has not changed." : "This isn't a valid Bushido Ops progress backup. Your current progress has not changed."); return; }
      returnFocus.current = importButton.current;
      setConfirmation({ type: "import", data: parsed.data });
    } catch { setError("The file couldn't be read. Your current progress has not changed."); }
    finally { setReading(false); }
  }
  function confirmChange() {
    if (!confirmation) return;
    const saved = confirmation.type === "reset" ? store.reset() : store.replace(confirmation.data);
    setError("");
    setMessage(confirmation.type === "reset" ? (saved ? "Progress reset and saved. Your next practice starts at Warm-up." : "Progress reset for this session. This browser couldn't save the change.") : (saved ? "Backup restored and saved on this browser." : "Backup restored for this session. This browser couldn't save the change."));
    setConfirmation(null);
  }

  return <section className="progress-manager" aria-labelledby="progress-manager-title">
    <div className="progress-manager-copy"><p className="eyebrow">YOUR DOJO / YOUR PROGRESS</p><h3 id="progress-manager-title">PICK UP WHERE YOU LEFT OFF.</h3><p>{snapshot.mode === "saved" ? "Training progress, unfinished answers and dojo-code choices are saved on this browser. Export a backup to move them to another device." : "This practice session is temporary. Export a backup before leaving to keep your training progress, unfinished answers and dojo-code choices."}</p><span className={`progress-save-state ${snapshot.mode === "saved" ? "saved" : ""}`}><span aria-hidden="true">▪</span> {snapshot.mode === "saved" ? "AUTO-SAVE ON" : snapshot.mode === "protected" ? "SAVED COPY PROTECTED" : "TEMPORARY SESSION"}</span></div>
    <div className="progress-manager-actions"><a className="pixel-button" href={backupHref(encodeProgress(snapshot.data))} download={backupName()} onClick={backupClicked}>EXPORT BACKUP <span aria-hidden="true">↓</span></a><button type="button" className="pixel-button pixel-button-light" ref={importButton} disabled={reading} onClick={() => fileInput.current?.click()}>{reading ? "READING BACKUP…" : "IMPORT BACKUP"} <span aria-hidden="true">↑</span></button><button type="button" className="progress-reset-button" ref={resetButton} disabled={reading} onClick={() => { setError(""); returnFocus.current = resetButton.current; setConfirmation({ type: "reset" }); }}>RESET PROGRESS</button><input ref={fileInput} type="file" accept=".json,application/json" aria-label="Choose a Bushido Ops progress backup" className="sr-only" tabIndex={-1} onChange={chooseBackup} /></div>
    {snapshot.mode === "protected" && snapshot.savedRaw !== null && <div className="progress-protected-copy"><p>{snapshot.notice}</p><a className="about-text-link" href={backupHref(snapshot.savedRaw)} download={backupName("saved-copy")} onClick={backupClicked}>DOWNLOAD SAVED COPY <span aria-hidden="true">↓</span></a></div>}
    {message && <p className="progress-manager-message" role="status">{message}</p>}{error && <p className="progress-manager-error" role="alert">{error}</p>}
    <AlertDialog.Root open={confirmation !== null} onOpenChange={open => { if (!open) setConfirmation(null); }}>
      <AlertDialog.Portal><AlertDialog.Overlay className="progress-dialog-overlay" /><AlertDialog.Content className="progress-dialog pixel-frame" onCloseAutoFocus={event => { event.preventDefault(); returnFocus.current?.focus(); }}>
        <p className="eyebrow">YOUR PROGRESS</p><AlertDialog.Title>{confirmation?.type === "import" ? "RESTORE THIS BACKUP?" : "START A FRESH PATH?"}</AlertDialog.Title>
        <AlertDialog.Description>{confirmation?.type === "import" ? "This replaces the training progress, answers and dojo-code choices on this browser. Export your current progress first if you want to keep both." : "This clears your training progress, answers and dojo-code choices on this browser. Export a backup first if you want to keep them."}</AlertDialog.Description>
        {confirmation?.type === "import" && <p className="progress-import-summary"><strong>{progressXp(confirmation.data)} / 100 XP</strong><span>{confirmation.data.courses[PILOT_ID].completed.length} / 3 modules · {confirmation.data.commitments.length} / 3 habits</span></p>}
        <div className="progress-dialog-actions"><AlertDialog.Cancel asChild><button type="button" className="pixel-button pixel-button-light">KEEP CURRENT PROGRESS</button></AlertDialog.Cancel><AlertDialog.Action asChild><button type="button" className="pixel-button" onClick={confirmChange}>{confirmation?.type === "import" ? "RESTORE BACKUP" : "RESET PROGRESS"}</button></AlertDialog.Action></div>
      </AlertDialog.Content></AlertDialog.Portal>
    </AlertDialog.Root>
  </section>;
}
