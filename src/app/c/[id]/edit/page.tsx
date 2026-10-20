import type { Metadata } from "next";
import { Suspense } from "react";
import { EditPage } from "@/components/views";

export const metadata: Metadata = { title: "Edit committee · Kameti" };

async function Content({ params }: PageProps<"/c/[id]/edit">) {
  const { id } = await params;
  return <EditPage id={id} />;
}

export default function Edit(props: PageProps<"/c/[id]/edit">) {
  return (
    <Suspense>
      <Content {...props} />
    </Suspense>
  );
}
