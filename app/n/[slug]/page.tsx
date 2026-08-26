import type { Metadata } from "next";
import { NoteSpaceWorkbench } from "@/components/NoteSpaceWorkbench";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ slug: "welcome" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `${slug} — Shared Space`,
    description: `A simple, auto-saving text space at xxf.app/n/${slug}.`,
    alternates: { canonical: `/n/${encodeURIComponent(slug)}/` },
    robots: { index: false, follow: false },
  };
}

export default async function NoteSpacePage({ params }: Props) {
  const { slug } = await params;
  return (
    <main className="note-space-page">
      <NoteSpaceWorkbench spaceName={slug} />
    </main>
  );
}
