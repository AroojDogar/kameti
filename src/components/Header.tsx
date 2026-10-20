"use client";

import Link from "next/link";
import { useRef } from "react";
import { actions, useAppState } from "@/lib/store";
import { exportBackup, readBackup } from "@/lib/io";
import { btn } from "./ui";

const CURRENCIES = ["PKR", "INR", "BDT", "AED", "SAR", "GBP", "USD"];

export default function Header() {
  const state = useAppState();
  const fileRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDetailsElement>(null);

  const close = () => menuRef.current?.removeAttribute("open");

  async function onImport(file: File | undefined) {
    if (!file) return;
    try {
      actions.importState(await readBackup(file));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Could not read that file");
    }
    close();
  }

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-white/80 backdrop-blur dark:border-zinc-800/80 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5" aria-hidden>
              <circle cx="12" cy="12" r="9" />
              <path d="M12 3v9l6.36 6.36" strokeLinecap="round" />
              <path d="M12 12 5.64 18.36" strokeLinecap="round" opacity={0.5} />
            </svg>
          </span>
          <span className="leading-tight">
            <span className="block text-base font-bold tracking-tight">Kameti</span>
            <span className="hidden text-[11px] text-zinc-500 sm:block dark:text-zinc-400">Committee tracker</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <select
            aria-label="Currency"
            value={state.currency}
            onChange={(e) => actions.setCurrency(e.target.value)}
            className="rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            {CURRENCIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>

          <details ref={menuRef} className="relative">
            <summary className={`${btn.ghost} cursor-pointer list-none [&::-webkit-details-marker]:hidden`}>
              Data
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden>
                <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06z" />
              </svg>
            </summary>
            <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-zinc-200 bg-white p-1 text-sm shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
              <MenuItem onClick={() => (exportBackup(state), close())}>Export backup (.json)</MenuItem>
              <MenuItem onClick={() => fileRef.current?.click()}>Import backup…</MenuItem>
              <MenuItem onClick={() => (actions.loadDemo(), close())}>Load demo data</MenuItem>
              <MenuItem
                danger
                onClick={() => {
                  if (confirm("Delete all committees from this browser?")) actions.clearAll();
                  close();
                }}
              >
                Delete everything
              </MenuItem>
            </div>
          </details>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              onImport(e.target.files?.[0]);
              e.target.value = "";
            }}
          />

          <Link href="/new" className={`${btn.primary} px-3 whitespace-nowrap sm:px-4`}>
            + New<span className="hidden sm:inline"> committee</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

function MenuItem({ children, danger, onClick }: { children: React.ReactNode; danger?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`block w-full rounded-lg px-3 py-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
        danger ? "text-rose-600 dark:text-rose-400" : ""
      }`}
    >
      {children}
    </button>
  );
}
