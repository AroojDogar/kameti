"use client";

import { useState } from "react";
import { groupReminder, whatsappLink, type Lang } from "@/lib/reminder";
import type { Committee } from "@/lib/types";
import { Card, SectionTitle, WhatsAppIcon, btn } from "./ui";

export default function ReminderPanel({ c, round, currency }: { c: Committee; round: number; currency: string }) {
  const [lang, setLang] = useState<Lang>("ur");
  const [copied, setCopied] = useState(false);
  const text = groupReminder(c, round, currency, lang);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard blocked: the text is still selectable in the preview.
    }
  }

  return (
    <Card className="flex flex-col lg:self-start">
      <SectionTitle
        action={
          <div className="flex rounded-lg bg-zinc-100 p-0.5 text-xs dark:bg-zinc-800">
            {(["ur", "en"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`rounded-md px-2.5 py-1 font-medium transition ${
                  lang === l ? "bg-white shadow-sm dark:bg-zinc-950" : "text-zinc-500"
                }`}
              >
                {l === "ur" ? "Roman Urdu" : "English"}
              </button>
            ))}
          </div>
        }
      >
        Group reminder
      </SectionTitle>

      {/* WhatsApp-style chat bubble preview */}
      <div className="rounded-2xl bg-[#e5ddd5] p-3 dark:bg-[#0b141a]">
        <div className="ml-auto max-w-[95%] rounded-xl rounded-tr-sm bg-[#d9fdd3] px-3 py-2 text-[13px] leading-relaxed whitespace-pre-wrap text-zinc-900 shadow-sm dark:bg-[#005c4b] dark:text-zinc-100">
          {text.split(/(\*[^*]+\*)/g).map((part, i) =>
            part.startsWith("*") && part.endsWith("*") ? <strong key={i}>{part.slice(1, -1)}</strong> : part,
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button onClick={copy} className={btn.secondary}>
          {copied ? "✓ Copied" : "Copy text"}
        </button>
        <a href={whatsappLink(text)} target="_blank" rel="noreferrer" className={`${btn.primary} bg-[#25d366] hover:bg-[#1ebe5b]`}>
          <WhatsAppIcon /> Share
        </a>
      </div>
    </Card>
  );
}
