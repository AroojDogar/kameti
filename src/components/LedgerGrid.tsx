"use client";

import { actions } from "@/lib/store";
import { formatMonth } from "@/lib/format";
import { currentMonth, memberArrears, monthsBetween, paymentKey, roundMonth } from "@/lib/schedule";
import type { Committee } from "@/lib/types";
import { Avatar, Card, SectionTitle } from "./ui";

export default function LedgerGrid({
  c,
  currency,
  onPickRound,
}: {
  c: Committee;
  currency: string;
  onPickRound: (r: number) => void;
}) {
  const today = currentMonth();
  const rounds = c.members.map((_, r) => r);

  return (
    <Card className="p-0">
      <div className="p-5 pb-0">
        <SectionTitle
          action={
            <div className="flex flex-wrap gap-3 text-xs text-zinc-500 dark:text-zinc-400">
              <Legend className="bg-emerald-500" label="Paid" />
              <Legend className="bg-rose-400" label="Overdue" />
              <Legend className="bg-zinc-200 dark:bg-zinc-700" label="Not due" />
              <Legend className="ring-2 ring-amber-400" label="Payout" />
            </div>
          }
        >
          Full ledger
        </SectionTitle>
      </div>

      <div className="overflow-x-auto px-5 pb-5">
        <table className="w-full border-separate border-spacing-1 text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-white pr-3 text-left text-xs font-medium text-zinc-500 dark:bg-zinc-900">
                Member
              </th>
              {rounds.map((r) => (
                <th key={r} className="min-w-9 text-center text-[11px] font-medium text-zinc-500">
                  <button onClick={() => onPickRound(r)} className="hover:text-emerald-600">
                    {formatMonth(roundMonth(c, r), "short").replace(" 20", " '")}
                  </button>
                </th>
              ))}
              <th className="pl-2 text-right text-xs font-medium text-zinc-500">Owes</th>
            </tr>
          </thead>
          <tbody>
            {c.members.map((m, mi) => {
              const owed = memberArrears(c, m, today);
              return (
                <tr key={m.id}>
                  <td className="sticky left-0 z-10 bg-white pr-3 dark:bg-zinc-900">
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <Avatar name={m.name} size="sm" />
                      <span className="max-w-32 truncate">{m.name}</span>
                    </div>
                  </td>
                  {rounds.map((r) => {
                    const paid = !!c.payments[paymentKey(r, m.id)];
                    const offset = monthsBetween(roundMonth(c, r), today);
                    const due = offset > 0 || (offset === 0 && new Date().getDate() > c.dueDay);
                    const future = offset < 0;
                    const color = paid
                      ? "bg-emerald-500 text-white hover:bg-emerald-600"
                      : due
                        ? "bg-rose-400 text-white hover:bg-rose-500"
                        : future
                          ? "bg-zinc-100 text-zinc-400 hover:bg-zinc-200 dark:bg-zinc-800"
                          : "bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-950 dark:text-amber-300";
                    return (
                      <td key={r} className="text-center">
                        <button
                          onClick={() => actions.togglePayment(c.id, r, m.id)}
                          title={`${m.name} · ${formatMonth(roundMonth(c, r))}: ${paid ? "paid" : "not paid"}`}
                          className={`h-8 w-full min-w-8 rounded-md text-xs font-bold transition ${color} ${
                            mi === r ? "ring-2 ring-amber-400 ring-offset-1 ring-offset-white dark:ring-offset-zinc-900" : ""
                          }`}
                        >
                          {paid ? "✓" : mi === r ? "★" : ""}
                        </button>
                      </td>
                    );
                  })}
                  <td className="pl-2 text-right text-xs font-semibold whitespace-nowrap">
                    {owed ? (
                      <span className="text-rose-600 dark:text-rose-400">
                        {(owed * c.monthlyAmount).toLocaleString()} {currency}
                      </span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400">Clear</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-3 w-3 rounded ${className}`} />
      {label}
    </span>
  );
}
