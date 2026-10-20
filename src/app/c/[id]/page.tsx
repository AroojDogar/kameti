import { Suspense } from "react";
import { CommitteePage } from "@/components/views";

async function Content({ params }: PageProps<"/c/[id]">) {
  const { id } = await params;
  return <CommitteePage id={id} />;
}

export default function Committee(props: PageProps<"/c/[id]">) {
  return (
    <Suspense>
      <Content {...props} />
    </Suspense>
  );
}
