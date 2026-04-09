import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Star, Clock, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateBoardDialog } from "@/components/board/create-board-dialog";
import { CreateWorkspaceDialog } from "@/components/workspace/create-workspace-dialog";
import { BoardCard } from "@/components/board/board-card";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const workspaces = await db.workspace.findMany({
    where: { members: { some: { userId: session.user.id } } },
    include: {
      boards: {
        where: { isClosed: false },
        include: { stars: { where: { userId: session.user.id } } },
        orderBy: { updatedAt: "desc" },
      },
      members: { include: { user: true } },
      _count: { select: { boards: true, members: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const starredBoards = workspaces
    .flatMap((ws) =>
      ws.boards
        .filter((b) => b.stars.length > 0)
        .map((b) => ({ ...b, workspaceName: ws.name }))
    );

  const recentBoards = workspaces
    .flatMap((ws) =>
      ws.boards.map((b) => ({ ...b, workspaceName: ws.name }))
    )
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 8);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Starred Boards */}
      {starredBoards.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-yellow-500" />
            <h2 className="text-lg font-semibold">Board Dibintangi</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {starredBoards.map((board) => (
              <BoardCard
                key={board.id}
                board={board}
                workspaceName={board.workspaceName}
                isStarred={true}
              />
            ))}
          </div>
        </section>
      )}

      {/* Recent Boards */}
      {recentBoards.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Terakhir Dilihat</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {recentBoards.map((board) => (
              <BoardCard
                key={board.id}
                board={board}
                workspaceName={board.workspaceName}
                isStarred={board.stars.length > 0}
              />
            ))}
          </div>
        </section>
      )}

      {/* Workspaces */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Workspace Kamu</h2>
          <CreateWorkspaceDialog />
        </div>
        <div className="space-y-8">
          {workspaces.map((workspace) => (
            <div key={workspace.id}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white h-8 w-8 rounded-md flex items-center justify-center text-sm font-bold">
                    {workspace.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold">{workspace.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {workspace._count.members} member &bull;{" "}
                      {workspace._count.boards} board
                    </p>
                  </div>
                </div>
                <Link href={`/workspace/${workspace.slug}`}>
                  <Button variant="ghost" size="sm">
                    Lihat Semua
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {workspace.boards.map((board) => (
                  <BoardCard
                    key={board.id}
                    board={board}
                    isStarred={board.stars.length > 0}
                  />
                ))}
                <CreateBoardDialog workspaceId={workspace.id}>
                  <div className="h-24 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-blue-600 transition-colors cursor-pointer">
                    <Plus className="h-4 w-4" />
                    Buat Board
                  </div>
                </CreateBoardDialog>
              </div>
            </div>
          ))}

          {workspaces.length === 0 && (
            <div className="text-center py-16 bg-white dark:bg-gray-950 rounded-xl border">
              <LayoutDashboard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Belum ada workspace</h3>
              <p className="text-muted-foreground mb-4">
                Buat workspace pertamamu untuk mulai mengorganisir project
              </p>
              <CreateWorkspaceDialog />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
