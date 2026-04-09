import { getBoard } from "@/actions/board";
import { redirect } from "next/navigation";
import { BoardNavbar } from "@/components/board/board-navbar";
import { ListContainer } from "@/components/board/list-container";

export default async function BoardPage({
  params,
}: {
  params: Promise<{ boardId: string }>;
}) {
  const { boardId } = await params;
  const board = await getBoard(boardId);
  if (!board) redirect("/dashboard");

  return (
    <>
      <BoardNavbar board={board} />
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-4">
        <ListContainer board={board} />
      </div>
    </>
  );
}
