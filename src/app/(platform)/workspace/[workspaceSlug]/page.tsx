import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Plus, Settings, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BoardCard } from "@/components/board/board-card";
import { CreateBoardDialog } from "@/components/board/create-board-dialog";
import Link from "next/link";

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { workspaceSlug } = await params;
  const workspace = await db.workspace.findUnique({
    where: { slug: workspaceSlug },
    include: {
      boards: {
        where: { isClosed: false },
        include: { stars: { where: { userId: session.user.id } } },
        orderBy: { updatedAt: "desc" },
      },
      members: {
        include: { user: true },
      },
    },
  });

  if (!workspace) redirect("/dashboard");

  const isMember = workspace.members.some(
    (m) => m.userId === session.user!.id
  );
  if (!isMember) redirect("/dashboard");

  const currentMember = workspace.members.find(
    (m) => m.userId === session.user!.id
  );
  const isAdmin = currentMember?.role === "OWNER" || currentMember?.role === "ADMIN";

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white h-14 w-14 rounded-xl flex items-center justify-center text-2xl font-bold">
            {workspace.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{workspace.name}</h1>
            {workspace.description && (
              <p className="text-muted-foreground mt-1">
                {workspace.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Members */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">
            Member ({workspace.members.length})
          </h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {workspace.members.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 border"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={member.user.image || ""} />
                <AvatarFallback className="bg-blue-500 text-white text-xs">
                  {member.user.name?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{member.user.name}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {member.role.toLowerCase()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Boards */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Board</h2>
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
              Buat Board Baru
            </div>
          </CreateBoardDialog>
        </div>
      </section>
    </div>
  );
}
