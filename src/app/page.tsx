"src/app/page.tsx";
import React from "react";
import { getUser } from "@/auth/server";
import { AskAIButton } from "@/components/AskAIButton";
import NewNoteButton from "@/components/NewNoteButton";
import NoteTextInput from "@/components/NoteTextInput";
import { prisma } from "@/db/prisma";
import StockInfo from "@/components/stockInfo";
import { Button } from "@/components/ui/button";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function HomePage({ searchParams }: Props) {
  const noteIdParam = (await searchParams).noteId;
  const user = await getUser();

  const noteId = Array.isArray(noteIdParam)
    ? noteIdParam![0]
    : noteIdParam || "";

  const note = await prisma.note.findUnique({
    where: {
      id: noteId,
      authorId: user?.id,
    },
  });

  return (
    <div className="flex h-full flex-col items-center gap-4">
      <div className="flex w-full max-w-4xl justify-end gap-2">
        <AskAIButton user={user} />
        <NewNoteButton user={user} />
        <Button>刷新最新消息</Button>
      </div>

      <div className="h-full w-full">
        <StockInfo />
      </div>

      <div className="w-full max-w-4xl">
        <NoteTextInput noteId={noteId} startingNoteText={note?.text || ""} />
      </div>
    </div>
  );
}
