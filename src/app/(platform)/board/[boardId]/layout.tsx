import { getBoard } from "@/actions/board";
import { redirect } from "next/navigation";

export default async function BoardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ boardId: string }>;
}) {
  const { boardId } = await params;
  const board = await getBoard(boardId);
  if (!board) redirect("/dashboard");

  return (
    <div
      className="h-full flex flex-col"
      style={{
        backgroundColor: board.backgroundColor,
        backgroundImage: board.backgroundImage
          ? `url(${board.backgroundImage})`
          : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {children}
    </div>
  );
}
