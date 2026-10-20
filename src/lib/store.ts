"use client";

import { useSyncExternalStore } from "react";
import type { AppState, Committee } from "./types";
import { createDemoState } from "./demo";
import { paymentKey } from "./schedule";

const STORAGE_KEY = "kameti:v1";
const EMPTY: AppState = { committees: [], currency: "PKR" };

let state: AppState | null = null;
const listeners = new Set<() => void>();

function load(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...EMPTY, ...JSON.parse(raw) };
  } catch {
    // Storage unavailable or corrupted: fall back to demo data.
  }
  return createDemoState();
}

function getSnapshot(): AppState {
  if (!state) state = load();
  return state;
}

function setState(update: (prev: AppState) => AppState) {
  state = update(getSnapshot());
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore quota / private-mode errors; state still lives in memory.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useAppState(): AppState {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}

function updateCommittee(id: string, update: (c: Committee) => Committee) {
  setState((s) => ({
    ...s,
    committees: s.committees.map((c) => (c.id === id ? update(c) : c)),
  }));
}

export type CommitteeInput = Omit<Committee, "id" | "payments" | "payouts" | "createdAt">;

export const actions = {
  createCommittee(input: CommitteeInput) {
    const id = crypto.randomUUID();
    setState((s) => ({
      ...s,
      committees: [
        { ...input, id, payments: {}, payouts: {}, createdAt: new Date().toISOString() },
        ...s.committees,
      ],
    }));
    return id;
  },
  editCommittee(id: string, input: CommitteeInput) {
    updateCommittee(id, (c) => {
      // Drop records of members that were removed.
      const ids = new Set(input.members.map((m) => m.id));
      const payments = Object.fromEntries(
        Object.entries(c.payments).filter(([k]) => ids.has(k.split(":")[1]!)),
      );
      return { ...c, ...input, payments };
    });
  },
  deleteCommittee(id: string) {
    setState((s) => ({ ...s, committees: s.committees.filter((c) => c.id !== id) }));
  },
  togglePayment(id: string, round: number, memberId: string) {
    updateCommittee(id, (c) => {
      const key = paymentKey(round, memberId);
      const payments = { ...c.payments };
      if (payments[key]) delete payments[key];
      else payments[key] = new Date().toISOString();
      return { ...c, payments };
    });
  },
  markRoundPaid(id: string, round: number) {
    updateCommittee(id, (c) => {
      const payments = { ...c.payments };
      const now = new Date().toISOString();
      for (const m of c.members) payments[paymentKey(round, m.id)] ??= now;
      return { ...c, payments };
    });
  },
  togglePayout(id: string, round: number) {
    updateCommittee(id, (c) => {
      const payouts = { ...c.payouts };
      if (payouts[round]) delete payouts[round];
      else payouts[round] = new Date().toISOString();
      return { ...c, payouts };
    });
  },
  setCurrency(currency: string) {
    setState((s) => ({ ...s, currency }));
  },
  importState(next: AppState) {
    setState(() => ({ ...EMPTY, ...next }));
  },
  loadDemo() {
    setState(() => createDemoState());
  },
  clearAll() {
    setState((s) => ({ ...EMPTY, currency: s.currency }));
  },
};
