"use client";

import Link from "next/link";
import { actions, useAppState } from "@/lib/store";
import { formatMoney, formatMonth } from "@/lib/format";
import { potSize, roundCollection, roundMonth, status } from "@/lib/schedule";
import type { Committee } from "@/lib/types";
import { Avatar, Card, PhaseBadge, Progress, btn } from "./ui";

export default function HomeView() {
  const { committees, currency } = useAppState();
  const money = (n: number) => formatMoney(n, currency);

  const running = committees.filter((c) => status(c).phase === "running");
  const thisMonth = running.map((c) => roundCollection(c, status(c).round));
  const collected = thisMonth.reduce((s, r) => s + r.collected, 0);
  const expected = thisMonth.reduce((s, r) => s + r.expected, 0);
  const pending = thisMonth.reduce((s, r) => s + r.unpaid.length, 0);
  const members = new Set(committees.flatMap((c) => c.members.map((m) => m.name.trim().toLowerCase()))).size;

  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 sm:px-6 sm:py-10">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-6 text-white shadow-lg sm:p-8">
        <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-24 right-24 h-48 w-48 rounded-full bg-white/5" />
        <p className="text-sm font-medium text-emerald-100">Collected this month</p>
        <p className="mt-1 text-4xl font-bold tracking-tight sm:text-5xl">{money(collected)}</p>
        <p className="mt-1 text-sm text-emerald-100">
          of {money(expected)} across {running.length} running {running.length === 1 ? "committee" : "committees"}
        </p>
        <Progress value={expected ? collected / expected : 0} className="mt-5 max-w-md bg-white/20 [&>div]:bg-white" />
        <div className="mt-6 grid max-w-xl grid-cols-3 gap-4 text-sm">
          <Stat label="Committees" value={committees.length} />
          <Stat label="Members" value={members} />
          <Stat label="Payments pending" value={pending} />
        </div>
      </section>

      <section>
        <h1 className="mb-4 text-xl font-bold tracking-tight">Your committees</h1>

        {committees.length === 0 ? (
          <Card className="flex flex-col items-center py-14 text-center">
            <p className="text-lg font-semibold">No committees yet</p>
            <p className="mt-1 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
              Start a committee (BC / kameti), add members in payout order and track who has paid every month.
            </p>
            <div className="mt-6 flex gap-3">
              <Link href="/new" className={btn.primary}>
                Create committee
              </Link>
              <button onClick={actions.loadDemo} className={btn.secondary}>
                Try demo data
              </button>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {committees.map((c) => (
              <CommitteeCard key={c.id} c={c} currency={currency} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-emerald-100">{label}</p>
    </div>
  );
}

function CommitteeCard({ c, currency }: { c: Committee; currency: string }) {
  const { phase, round, total } = status(c);
  const { paid, collected, expected } = roundCollection(c, round);
  const recipient = c.members[round];
  const nextLabel = phase === "completed" ? "Last payout" : phase === "upcoming" ? "First payout" : "This month's payout";

  return (
    <Link
      href={`/c/${c.id}`}
      className="group rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-emerald-800"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-semibold group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
            {c.name}
          </h3>
          <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
            {formatMoney(c.monthlyAmount, currency)} × {total} members
          </p>
        </div>
        <PhaseBadge phase={phase} />
      </div>

      <div className="mt-5 flex items-end justify-between">
        <div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Pot size</p>
          <p className="text-xl font-bold">{formatMoney(potSize(c), currency)}</p>
        </div>
        <p className="text-right text-xs text-zinc-500 dark:text-zinc-400">
          Round {round + 1} of {total}
          <br />
          {formatMonth(roundMonth(c, round), "short")}
        </p>
      </div>

      {phase === "running" && (
        <div className="mt-4">
          <div className="mb-1.5 flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>
              {paid.length}/{total} paid
            </span>
            <span>{Math.round((collected / expected) * 100)}%</span>
          </div>
          <Progress value={collected / expected} />
        </div>
      )}

      {recipient && (
        <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-zinc-50 p-2.5 dark:bg-zinc-800/60">
          <Avatar name={recipient.name} size="sm" />
          <div className="min-w-0 text-sm">
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{nextLabel}</p>
            <p className="truncate font-medium">{recipient.name}</p>
          </div>
        </div>
      )}
    </Link>
  );
}
