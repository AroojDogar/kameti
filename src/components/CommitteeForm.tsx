"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { actions, useAppState, type CommitteeInput } from "@/lib/store";
import { formatMoney, formatMonth } from "@/lib/format";
import { addMonths, currentMonth } from "@/lib/schedule";
import type { Committee, Member } from "@/lib/types";
import { Avatar, Card, btn, input } from "./ui";

const newMember = (): Member => ({ id: crypto.randomUUID(), name: "", phone: "" });

function shuffle<T>(items: T[]) {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export default function CommitteeForm({ existing }: { existing?: Committee }) {
  const router = useRouter();
  const { currency } = useAppState();
  const [name, setName] = useState(existing?.name ?? "");
  const [amount, setAmount] = useState(existing ? String(existing.monthlyAmount) : "10000");
  const [startMonth, setStartMonth] = useState(existing?.startMonth ?? currentMonth());
  const [dueDay, setDueDay] = useState(existing ? String(existing.dueDay) : "5");
  const [members, setMembers] = useState<Member[]>(
    existing?.members ?? [newMember(), newMember(), newMember()],
  );
  const [drawing, setDrawing] = useState(false);
  const [error, setError] = useState("");

  const named = members.filter((m) => m.name.trim());
  const monthly = Number(amount) || 0;

  function updateMember(id: string, patch: Partial<Member>) {
    setMembers((ms) => ms.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }

  function move(index: number, dir: -1 | 1) {
    setMembers((ms) => {
      const next = [...ms];
      const j = index + dir;
      if (j < 0 || j >= next.length) return ms;
      [next[index], next[j]] = [next[j]!, next[index]!];
      return next;
    });
  }

  /** Qur'a andazi: shuffle the payout order a few times so it visibly "rolls". */
  function luckyDraw() {
    setDrawing(true);
    let ticks = 0;
    const timer = setInterval(() => {
      setMembers((ms) => shuffle(ms));
      if (++ticks >= 10) {
        clearInterval(timer);
        setDrawing(false);
      }
    }, 90);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError("Give your committee a name.");
    if (monthly <= 0) return setError("Monthly amount must be more than zero.");
    if (named.length < 2) return setError("Add at least two members.");
    const day = Math.min(Math.max(Number(dueDay) || 1, 1), 28);

    const data: CommitteeInput = {
      name: name.trim(),
      monthlyAmount: monthly,
      startMonth,
      dueDay: day,
      members: named.map((m) => ({ ...m, name: m.name.trim(), phone: m.phone.trim() })),
    };

    if (existing) {
      actions.editCommittee(existing.id, data);
      router.push(`/c/${existing.id}`);
    } else {
      router.push(`/c/${actions.createCommittee(data)}`);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <Card>
          <h2 className="mb-4 font-semibold">Committee details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="mb-1.5 block text-sm font-medium">Name</span>
              <input
                className={input}
                placeholder="e.g. Office Committee 2026"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus={!existing}
              />
            </label>
            <label>
              <span className="mb-1.5 block text-sm font-medium">Monthly amount per member ({currency})</span>
              <input
                className={input}
                type="number"
                min={1}
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </label>
            <label>
              <span className="mb-1.5 block text-sm font-medium">Starting month</span>
              <input
                className={input}
                type="month"
                value={startMonth}
                onChange={(e) => e.target.value && setStartMonth(e.target.value)}
              />
            </label>
            <label>
              <span className="mb-1.5 block text-sm font-medium">Due by (day of month)</span>
              <input
                className={input}
                type="number"
                min={1}
                max={28}
                value={dueDay}
                onChange={(e) => setDueDay(e.target.value)}
              />
            </label>
          </div>
        </Card>

        <Card>
          <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-semibold">Members &amp; payout order</h2>
            <button
              type="button"
              onClick={luckyDraw}
              disabled={drawing || members.length < 2}
              className={btn.secondary}
            >
              <span className={drawing ? "animate-spin" : ""}>🎲</span>
              {drawing ? "Drawing…" : "Lucky draw"}
            </button>
          </div>
          <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
            Member #1 gets the pot in the first month, #2 in the second, and so on. Use the arrows to reorder, or let
            the lucky draw (qur&apos;a andazi) decide.
          </p>

          <ol className="space-y-2">
            {members.map((m, i) => (
              <li
                key={m.id}
                className={`flex items-center gap-2 rounded-xl border border-zinc-200 p-2 transition dark:border-zinc-800 ${
                  drawing ? "bg-emerald-50 dark:bg-emerald-950/40" : ""
                }`}
              >
                <span className="w-6 shrink-0 text-center text-sm font-semibold text-zinc-400">{i + 1}</span>
                <Avatar name={m.name || "?"} size="sm" />
                <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-[1fr_11rem]">
                  <input
                    className={input}
                    placeholder="Member name"
                    value={m.name}
                    onChange={(e) => updateMember(m.id, { name: e.target.value })}
                  />
                  <input
                    className={input}
                    placeholder="WhatsApp no. (optional)"
                    inputMode="tel"
                    value={m.phone}
                    onChange={(e) => updateMember(m.id, { phone: e.target.value })}
                  />
                </div>
                <div className="flex shrink-0">
                  <IconBtn label="Move up" onClick={() => move(i, -1)} disabled={i === 0}>
                    ↑
                  </IconBtn>
                  <IconBtn label="Move down" onClick={() => move(i, 1)} disabled={i === members.length - 1}>
                    ↓
                  </IconBtn>
                  <IconBtn
                    label="Remove member"
                    onClick={() => setMembers((ms) => ms.filter((x) => x.id !== m.id))}
                    disabled={members.length <= 1}
                  >
                    ✕
                  </IconBtn>
                </div>
              </li>
            ))}
          </ol>
          <button
            type="button"
            onClick={() => setMembers((ms) => [...ms, newMember()])}
            className={`${btn.ghost} mt-3 text-emerald-700 dark:text-emerald-400`}
          >
            + Add member
          </button>
          {existing && (
            <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
              Removing a member also removes their payment records.
            </p>
          )}
        </Card>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <Card className="space-y-4">
          <h2 className="font-semibold">Summary</h2>
          <Row label="Members" value={String(named.length)} />
          <Row label="Each pays monthly" value={formatMoney(monthly, currency)} />
          <Row label="Pot every month" value={formatMoney(monthly * named.length, currency)} strong />
          <Row label="Duration" value={`${named.length} months`} />
          <Row
            label="Runs"
            value={
              named.length
                ? `${formatMonth(startMonth, "short")} – ${formatMonth(addMonths(startMonth, named.length - 1), "short")}`
                : "—"
            }
          />
          {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-300">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button type="submit" className={`${btn.primary} flex-1`}>
              {existing ? "Save changes" : "Create committee"}
            </button>
            <button type="button" onClick={() => router.back()} className={btn.secondary}>
              Cancel
            </button>
          </div>
        </Card>
      </aside>
    </form>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-zinc-500 dark:text-zinc-400">{label}</span>
      <span className={strong ? "text-lg font-bold text-emerald-700 dark:text-emerald-400" : "font-medium"}>{value}</span>
    </div>
  );
}

function IconBtn({
  children,
  label,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className="h-8 w-8 rounded-lg text-sm text-zinc-500 transition hover:bg-zinc-100 disabled:opacity-30 disabled:hover:bg-transparent dark:hover:bg-zinc-800"
      {...props}
    >
      {children}
    </button>
  );
}
