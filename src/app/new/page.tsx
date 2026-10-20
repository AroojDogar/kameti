import type { Metadata } from "next";
import { NewPage } from "@/components/views";

export const metadata: Metadata = { title: "New committee · Kameti" };

export default function New() {
  return <NewPage />;
}
