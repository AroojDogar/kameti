import type { AppState, Committee } from "./types";
import { addMonths, currentMonth, monthsBetween, paymentKey } from "./schedule";

function makeCommittee(
  name: string,
  monthlyAmount: number,
  monthsAgo: number,
  dueDay: number,
  people: [string, string][],
  missing: string[],
): Committee {
  const startMonth = addMonths(currentMonth(), -monthsAgo);
  const members = people.map(([n, phone]) => ({ id: crypto.randomUUID(), name: n, phone }));
  const payments: Record<string, string> = {};
  const payouts: Record<string, string> = {};
  const dueRounds = Math.min(monthsBetween(startMonth, currentMonth()) + 1, members.length);

  for (let r = 0; r < dueRounds; r++) {
    const [y, m] = addMonths(startMonth, r).split("-").map(Number);
    const isCurrent = r === dueRounds - 1;
    members.forEach((mem, i) => {
      // Past rounds are fully paid; in the current round a few members are still pending.
      if (isCurrent && (missing.includes(mem.name) || i % 3 === 2)) return;
      payments[paymentKey(r, mem.id)] = new Date(y, m - 1, Math.min(dueDay + (i % 4), 28)).toISOString();
    });
    if (!isCurrent) payouts[r] = new Date(y, m - 1, Math.min(dueDay + 5, 28)).toISOString();
  }

  return {
    id: crypto.randomUUID(),
    name,
    monthlyAmount,
    startMonth,
    dueDay,
    members,
    payments,
    payouts,
    createdAt: new Date(startMonth + "-01").toISOString(),
  };
}

export function createDemoState(): AppState {
  return {
    currency: "PKR",
    committees: [
      makeCommittee(
        "Office Committee",
        10000,
        3,
        5,
        [
          ["Ayesha Khan", "923001234567"],
          ["Bilal Ahmed", "923211234567"],
          ["Sana Malik", "923331234567"],
          ["Usman Tariq", "923451234567"],
          ["Hira Siddiqui", "923121234567"],
          ["Fahad Raza", "923061234567"],
          ["Mehwish Ali", "923041234567"],
          ["Zain Butt", "923151234567"],
        ],
        ["Usman Tariq"],
      ),
      makeCommittee(
        "Mohalla Ladies BC",
        5000,
        7,
        1,
        [
          ["Nasreen Baji", "923009876543"],
          ["Rubina", "923219876543"],
          ["Shazia", "923339876543"],
          ["Farzana", "923459876543"],
          ["Kausar", "923129876543"],
          ["Tahira", "923069876543"],
          ["Samina", "923049876543"],
          ["Parveen", "923159876543"],
          ["Robina", "923019876543"],
          ["Ghazala", "923229876543"],
        ],
        [],
      ),
      makeCommittee(
        "Family Eid Kameti",
        20000,
        -1,
        10,
        [
          ["Ammi", ""],
          ["Abbu", ""],
          ["Ali Bhai", "923335551234"],
          ["Sara Apa", "923005551234"],
          ["Hamza", "923215551234"],
          ["Me", ""],
        ],
        [],
      ),
    ],
  };
}
