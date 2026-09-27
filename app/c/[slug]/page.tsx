import type { Metadata } from "next";
import { ChatRoomWorkbench } from "@/components/ChatRoomWorkbench";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ slug: "welcome" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `${slug} — Chat Room`,
    description: `A simple shared chat room at xxf.app/c/${slug}.`,
    alternates: { canonical: `/c/${encodeURIComponent(slug)}/` },
    robots: { index: false, follow: false },
  };
}

export default async function ChatRoomPage({ params }: Props) {
  const { slug } = await params;
  return (
    <main className="chat-room-page">
      <ChatRoomWorkbench roomName={slug} />
    </main>
  );
}
