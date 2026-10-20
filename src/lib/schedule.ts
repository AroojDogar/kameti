import type { Committee, Member } from "./types";

export function paymentKey(round: number, memberId: string) {
  return `${round}:${memberId}`;
}

export function currentMonth(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function addMonths(month: string, n: number) {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 1 + n, 1);
  return currentMonth(d);
}

export function monthsBetween(from: string, to: string) {
  const [fy, fm] = from.split("-").map(Number);
  const [ty, tm] = to.split("-").map(Number);
  return (ty - fy) * 12 + (tm - fm);
}

export function roundMonth(c: Committee, round: number) {
  return addMonths(c.startMonth, round);
}

export function potSize(c: Committee) {
  return c.monthlyAmount * c.members.length;
}

export type Phase = "upcoming" | "running" | "completed";

/** Where the committee stands today: its phase and the round that is due now. */
export function status(c: Committee, today = currentMonth()) {
  const total = c.members.length;
  const offset = monthsBetween(c.startMonth, today);
  const phase: Phase = offset < 0 ? "upcoming" : offset >= total ? "completed" : "running";
  const round = Math.min(Math.max(offset, 0), Math.max(total - 1, 0));
  return { phase, round, total };
}

export function roundCollection(c: Committee, round: number) {
  const paid = c.members.filter((m) => c.payments[paymentKey(round, m.id)]);
  const unpaid = c.members.filter((m) => !c.payments[paymentKey(round, m.id)]);
  return {
    paid,
    unpaid,
    collected: paid.length * c.monthlyAmount,
    expected: potSize(c),
  };
}

export function totalCollected(c: Committee) {
  return Object.keys(c.payments).length * c.monthlyAmount;
}

/** How many contributions a member still owes for rounds that are already due. */
export function memberArrears(c: Committee, member: Member, today = currentMonth()) {
  const due = Math.min(monthsBetween(c.startMonth, today) + 1, c.members.length);
  let missed = 0;
  for (let r = 0; r < due; r++) if (!c.payments[paymentKey(r, member.id)]) missed++;
  return missed;
}
