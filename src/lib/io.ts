import type { AppState, Committee } from "./types";
import { paymentKey, roundMonth } from "./schedule";
import { formatMonth } from "./format";

function download(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "committee";
}

export function exportBackup(state: AppState) {
  download(`kameti-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(state, null, 2), "application/json");
}

export async function readBackup(file: File): Promise<AppState> {
  const data = JSON.parse(await file.text());
  if (!data || !Array.isArray(data.committees)) throw new Error("Not a Kameti backup file");
  return data as AppState;
}

const csvCell = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

/** Member × month ledger: one row per member, one column per round. */
export function exportLedgerCsv(c: Committee) {
  const rounds = c.members.map((_, r) => r);
  const header = ["Payout #", "Member", "Phone", ...rounds.map((r) => formatMonth(roundMonth(c, r), "short"))];
  const rows = c.members.map((m, i) => [
    String(i + 1),
    m.name,
    m.phone,
    ...rounds.map((r) => (c.payments[paymentKey(r, m.id)] ? c.payments[paymentKey(r, m.id)]!.slice(0, 10) : "")),
  ]);
  const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
  download(`${slug(c.name)}-ledger.csv`, csv, "text/csv");
}
