# 🪙 Kameti — Committee (BC) Tracker

A tracker for **rotating savings committees**, known as *committee*, *BC*, *kameti* or *ROSCA*, built with **Next.js**, **React**, **TypeScript** and **Tailwind CSS**.
Every month each member pays a fixed amount and one member takes home the whole pot. Kameti keeps track of the payout order, who has paid, who still owes, and writes the WhatsApp reminder for you. All data stays in your browser.

## ✨ Features

- **Dashboard**: money collected this month across all running committees, pending payments, and a card for each committee with progress and this month's receiver
- **Create & edit committees**: monthly amount, start month, due date, members and payout order
- **🎲 Lucky draw (qur'a andazi)**: an animated shuffle that randomly sets the payout order
- **Round view**: who receives the pot this month, a collection progress bar, one-click *Mark paid* / *Mark all paid*, and *Mark handed over* for the payout
- **Full ledger**: member × month grid with paid / overdue / not-due states, the payout month highlighted, and how much each member owes. Click any cell to toggle it
- **WhatsApp reminders**: group message in **Roman Urdu** or **English** listing who hasn't paid yet, a WhatsApp chat-bubble preview, copy or share via `wa.me`, plus a one-tap personal nudge for each member
- **Export**: CSV ledger per committee, and JSON backup / import of all data
- **Multi-currency**: PKR, INR, BDT, AED, SAR, GBP, USD
- **Persistent** with `localStorage`, plus demo data on first visit
- **Responsive** layout and automatic **dark mode**

## 🛠️ Tech Stack

| Area      | Tech                                          |
| --------- | --------------------------------------------- |
| Framework | Next.js 16 (App Router), React 19             |
| Language  | TypeScript                                    |
| Styling   | Tailwind CSS 4                                |
| State     | `useSyncExternalStore` + `localStorage`       |
| Tooling   | ESLint, npm                                   |
| Hosting   | Vercel                                        |

## 🚀 Getting Started

```bash
git clone https://github.com/AroojDogar/kameti.git
cd kameti
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command         | Description                |
| --------------- | -------------------------- |
| `npm run dev`   | Start the dev server       |
| `npm run build` | Create a production build  |
| `npm run start` | Serve the production build |
| `npm run lint`  | Run ESLint                 |

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx            # Dashboard
│   ├── new/                # Create committee
│   └── c/[id]/             # Committee detail + edit
├── components/
│   ├── HomeView.tsx        # Summary hero and committee cards
│   ├── CommitteeForm.tsx   # Create/edit form with lucky draw
│   ├── CommitteeView.tsx   # Stats, round picker, round panel
│   ├── LedgerGrid.tsx      # Member × month payment grid
│   ├── ReminderPanel.tsx   # WhatsApp group reminder
│   └── ui.tsx              # Card, Avatar, Progress, buttons
└── lib/
    ├── store.ts            # External store persisted to localStorage
    ├── schedule.ts         # Rounds, months, collection and arrears math
    ├── reminder.ts         # Roman Urdu / English message templates
    ├── io.ts               # CSV export, JSON backup/import
    ├── demo.ts             # Demo committees relative to today
    └── format.ts           # Currency and date helpers
```

## 🧮 How it works

A committee with **N** members runs for **N** months. Member *i* in the payout order receives the pot (`monthly amount × N`) in month *i*.
Payments are stored as `round:memberId → date paid`, so the dashboard, ledger, arrears and reminders are all computed from that one record.

## 📄 License

MIT
