"use client";

import dynamic from "next/dynamic";
import { useAppState } from "@/lib/store";
import Header from "./Header";
import CommitteeForm from "./CommitteeForm";

function Skeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl animate-pulse space-y-6 px-4 py-10 sm:px-6">
      <div className="h-40 rounded-3xl bg-zinc-200 dark:bg-zinc-800" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="h-48 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
        ))}
      </div>
    </div>
  );
}

// Every view reads localStorage and today's date, so render them only in the browser
// to avoid hydration mismatches with the statically generated HTML.
const clientOnly = <P extends object>(load: () => Promise<{ default: React.ComponentType<P> }>) =>
  dynamic(load, { ssr: false, loading: Skeleton });

const Home = clientOnly(() => import("./HomeView"));
const Committee = clientOnly(() => import("./CommitteeView"));
const Shell = dynamic(() => Promise.resolve(Header), {
  ssr: false,
  loading: () => <div className="h-16 border-b border-zinc-200 dark:border-zinc-800" />,
});

function NewForm() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">New committee</h1>
      <CommitteeForm />
    </main>
  );
}

function EditForm({ id }: { id: string }) {
  const c = useAppState().committees.find((x) => x.id === id);
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Edit committee</h1>
      {c ? <CommitteeForm existing={c} /> : <p className="text-zinc-500">Committee not found.</p>}
    </main>
  );
}

const New = clientOnly(() => Promise.resolve({ default: NewForm }));
const Edit = clientOnly(() => Promise.resolve({ default: EditForm }));

export function HomePage() {
  return (
    <>
      <Shell />
      <Home />
    </>
  );
}

export function NewPage() {
  return (
    <>
      <Shell />
      <New />
    </>
  );
}

export function CommitteePage({ id }: { id: string }) {
  return (
    <>
      <Shell />
      <Committee id={id} />
    </>
  );
}

export function EditPage({ id }: { id: string }) {
  return (
    <>
      <Shell />
      <Edit id={id} />
    </>
  );
}
