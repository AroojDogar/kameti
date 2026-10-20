"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { actions, useAppState } from "@/lib/store";
import { formatDate, formatMoney, formatMonth, ordinal } from "@/lib/format";
import { exportLedgerCsv } from "@/lib/io";
import { memberReminder, whatsappLink } from "@/lib/reminder";
import {
  addMonths,
  currentMonth,
  monthsBetween,
  paymentKey,
  potSize,
  roundCollection,
  roundMonth,
  status,
  totalCollected,
} from "@/lib/schedule";
import type { Committee } from "@/lib/types";
import LedgerGrid from "./LedgerGrid";
import ReminderPanel from "./ReminderPanel";
import { Avatar, Card, PhaseBadge, Progress, SectionTitle, WhatsAppIcon, btn } from "./ui";

export default function CommitteeView({ id }: { id: string }) {
  const { committees, currency } = useAppState();
  const c = committees.find((x) => x.id === id);

  if (!c) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-16 text-center sm:px-6">
        <p className="text-lg font-semibold">Committee not found</p>
        <p className="mt-1 text-sm text-zinc-500">It may have been deleted from this browser.</p>
        <Link href="/" className={`${btn.primary} mt-6`}>
          Back to committees
        </Link>
      </main>
    );
  }
  // Keyed so the selected round resets when navigating between committees.
  return <Detail key={c.id} c={c} currency={currency} />;
}

function Detail({ c, currency }: { c: Committee; currency: string }) {
  const router = useRouter();
  const { phase, round: todayRound, total } = status(c);
  const [round, setRound] = useState(todayRound);
  const money = (n: number) => formatMoney(n, currency);

  const payoutsDone = Object.keys(c.payouts).length;
  const grandTotal = potSize(c) * total;
  const collectedAll = totalCollected(c);

  function remove() {
    if (!confirm(`Delete "${c.name}" and all its records?`)) return;
    actions.deleteCommittee(c.id);
    router.push("/");
  }

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <div>
        <Link href="/" className="text-sm text-zinc-500 hover:text-emerald-700 dark:text-zinc-400">
          ← All committees
        </Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{c.name}</h1>
              <PhaseBadge phase={phase} />
            </div>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {money(c.monthlyAmount)} each · due by the {ordinal(c.dueDay)} ·{" "}
              {formatMonth(c.startMonth, "short")} – {formatMonth(addMonths(c.startMonth, total - 1), "short")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={`/c/${c.id}/edit`} className={btn.secondary}>
              Edit
            </Link>
            <button onClick={() => exportLedgerCsv(c)} className={btn.secondary}>
              Export CSV
            </button>
            <button onClick={remove} className={btn.danger}>
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Pot every month" value={money(potSize(c))} />
        <StatCard label="Collected so far" value={money(collectedAll)} hint={`of ${money(grandTotal)}`} />
        <StatCard label="Payouts handed over" value={`${payoutsDone} / ${total}`} />
        <StatCard
          label={phase === "upcoming" ? "Starts in" : "Months remaining"}
          value={
            phase === "upcoming"
              ? `${monthsBetween(currentMonth(), c.startMonth)} mo`
              : String(Math.max(total - todayRound - (phase === "completed" ? 1 : 0), 0))
          }
        />
      </div>

      <RoundPicker c={c} round={round} todayRound={phase === "running" ? todayRound : -1} onPick={setRound} />

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <RoundPanel c={c} round={round} currency={currency} />
        <ReminderPanel c={c} round={round} currency={currency} />
      </div>

      <LedgerGrid c={c} currency={currency} onPickRound={setRound} />
    </main>
  );
}

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="mt-1 text-lg font-bold sm:text-xl">{value}</p>
      {hint && <p className="text-xs text-zinc-400">{hint}</p>}
    </Card>
  );
}

function RoundPicker({
  c,
  round,
  todayRound,
  onPick,
}: {
  c: Committee;
  round: number;
  todayRound: number;
  onPick: (r: number) => void;
}) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <div className="flex gap-2 pb-1">
        {c.members.map((m, r) => {
          const { paid } = roundCollection(c, r);
          const done = paid.length === c.members.length;
          const selected = r === round;
          return (
            <button
              key={m.id}
              onClick={() => onPick(r)}
              className={`relative shrink-0 rounded-xl border px-3 py-2 text-left text-xs transition ${
                selected
                  ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                  : "border-zinc-200 bg-white hover:border-emerald-300 dark:border-zinc-800 dark:bg-zinc-900"
              }`}
            >
              <span className={`block font-semibold ${selected ? "" : "text-zinc-900 dark:text-zinc-100"}`}>
                {formatMonth(roundMonth(c, r), "short")}
              </span>
              <span className={selected ? "text-emerald-100" : "text-zinc-500 dark:text-zinc-400"}>
                {c.payouts[r] ? "✓ " : done ? "● " : ""}
                {m.name.split(" ")[0]}
              </span>
              {r === todayRound && (
                <span className="absolute -top-1.5 -right-1.5 rounded-full bg-amber-400 px-1.5 text-[10px] font-bold text-amber-950">
                  now
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function RoundPanel({ c, round, currency }: { c: Committee; round: number; currency: string }) {
  const recipient = c.members[round]!;
  const month = roundMonth(c, round);
  const { paid, collected, expected } = roundCollection(c, round);
  const today = currentMonth();
  const isPast = monthsBetween(month, today) > 0;
  const isFuture = monthsBetween(month, today) < 0;
  const pastDue = isPast || (!isFuture && new Date().getDate() > c.dueDay);
  const handedOver = c.payouts[round];

  return (
    <Card>
      <SectionTitle
        action={
          paid.length < c.members.length && (
            <button onClick={() => actions.markRoundPaid(c.id, round)} className={btn.ghost}>
              Mark all paid
            </button>
          )
        }
      >
        Round {round + 1} · {formatMonth(month)}
      </SectionTitle>

      <div className="flex flex-wrap items-center gap-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 p-4 dark:from-emerald-950/50 dark:to-teal-950/40">
        <Avatar name={recipient.name} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Committee goes to</p>
          <p className="truncate text-lg font-bold">{recipient.name}</p>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">{formatMoney(expected, currency)}</p>
        </div>
        <button
          onClick={() => actions.togglePayout(c.id, round)}
          className={
            handedOver
              ? "rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white"
              : `${btn.secondary} py-2`
          }
        >
          {handedOver ? `✓ Handed over ${formatDate(handedOver)}` : "Mark handed over"}
        </button>
      </div>

      <div className="mt-5">
        <div className="mb-1.5 flex justify-between text-sm">
          <span className="font-medium">
            {formatMoney(collected, currency)} <span className="text-zinc-400">/ {formatMoney(expected, currency)}</span>
          </span>
          <span className="text-zinc-500 dark:text-zinc-400">
            {paid.length} of {c.members.length} paid
          </span>
        </div>
        <Progress value={collected / expected} />
      </div>

      <ul className="mt-5 divide-y divide-zinc-100 dark:divide-zinc-800">
        {c.members.map((m, i) => {
          const paidOn = c.payments[paymentKey(round, m.id)];
          return (
            <li key={m.id} className="flex items-center gap-3 py-2.5">
              <Avatar name={m.name} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {m.name}
                  {i === round && <span className="ml-2 text-xs text-emerald-600 dark:text-emerald-400">🎉 receiver</span>}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {paidOn ? `Paid ${formatDate(paidOn)}` : isFuture ? "Not due yet" : pastDue ? "Overdue" : "Pending"}
                </p>
              </div>
              {!paidOn && m.phone && !isFuture && (
                <a
                  href={whatsappLink(memberReminder(c, round, m, currency, "ur"), m.phone)}
                  target="_blank"
                  rel="noreferrer"
                  title={`Remind ${m.name} on WhatsApp`}
                  className="rounded-lg p-2 text-emerald-600 transition hover:bg-emerald-50 dark:hover:bg-emerald-950"
                >
                  <WhatsAppIcon />
                </a>
              )}
              <button
                onClick={() => actions.togglePayment(c.id, round, m.id)}
                className={`min-w-[84px] rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  paidOn
                    ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300"
                    : pastDue
                      ? "bg-rose-50 text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-300 dark:ring-rose-900"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
                }`}
              >
                {paidOn ? "✓ Paid" : "Mark paid"}
              </button>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
