import type { Committee, Member } from "./types";
import { formatMoney, formatMonth, ordinal } from "./format";
import { roundCollection, roundMonth } from "./schedule";

export type Lang = "en" | "ur";

/** Group message listing who still has to pay for a round. */
export function groupReminder(c: Committee, round: number, currency: string, lang: Lang) {
  const { unpaid, paid } = roundCollection(c, round);
  const month = formatMonth(roundMonth(c, round));
  const amount = formatMoney(c.monthlyAmount, currency);
  const recipient = c.members[round]?.name ?? "";
  const list = unpaid.map((m, i) => `${i + 1}. ${m.name}`).join("\n");

  if (lang === "ur") {
    return [
      `*${c.name}* — ${month}`,
      `Assalam o Alaikum sab ko! 🌙`,
      ``,
      `Is mahine ki committee (${amount}) ${ordinal(c.dueDay)} tareekh tak jama karwa dein.`,
      `Is dafa committee *${recipient}* ki nikalegi. 🎉`,
      ``,
      unpaid.length ? `Abhi tak in ki payment baqi hai:\n${list}` : `Sab ki payment aa gayi hai, JazakAllah! ✅`,
      ``,
      `(${paid.length}/${c.members.length} jama ho chuki hain)`,
    ].join("\n");
  }

  return [
    `*${c.name}* — ${month}`,
    `Hi everyone! 👋`,
    ``,
    `Please send this month's contribution of ${amount} by the ${ordinal(c.dueDay)}.`,
    `This round's payout goes to *${recipient}*. 🎉`,
    ``,
    unpaid.length ? `Still pending:\n${list}` : `Everyone has paid, thank you! ✅`,
    ``,
    `(${paid.length}/${c.members.length} received)`,
  ].join("\n");
}

/** Short personal nudge for a single member. */
export function memberReminder(c: Committee, round: number, member: Member, currency: string, lang: Lang) {
  const month = formatMonth(roundMonth(c, round));
  const amount = formatMoney(c.monthlyAmount, currency);
  if (lang === "ur") {
    return `Assalam o Alaikum ${member.name}! *${c.name}* ki ${month} ki payment (${amount}) abhi baqi hai. Meharbani karke ${ordinal(c.dueDay)} tak bhej dein. Shukriya! 🙏`;
  }
  return `Hi ${member.name}! Your ${month} contribution of ${amount} for *${c.name}* is still pending. Please send it by the ${ordinal(c.dueDay)}. Thanks! 🙏`;
}

export function whatsappLink(text: string, phone?: string) {
  const digits = phone?.replace(/\D/g, "") ?? "";
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
