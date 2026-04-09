import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Activity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

const ACTION_LABELS: Record<string, string> = {
  CREATED: "membuat",
  UPDATED: "memperbarui",
  DELETED: "menghapus",
  MOVED: "memindahkan",
  ADDED: "menambahkan",
  REMOVED: "menghapus",
  COMPLETED: "menyelesaikan",
  COMMENTED: "berkomentar pada",
};

export default async function BoardActivityPage({
  params,
}: {
  params: Promise<{ boardId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { boardId } = await params;

  const board = await db.board.findUnique({
    where: { id: boardId },
    select: { id: true, title: true, backgroundColor: true },
  });
  if (!board) redirect("/dashboard");

  const member = await db.boardMember.findUnique({
    where: { userId_boardId: { userId: session.user.id, boardId } },
  });
  if (!member) redirect("/dashboard");

  const activities = await db.activity.findMany({
    where: { boardId },
    include: { user: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href={`/board/${boardId}`}>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div
              className="h-8 w-8 rounded"
              style={{ backgroundColor: board.backgroundColor }}
            />
            <div>
              <h1 className="text-xl font-bold">{board.title}</h1>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Activity className="h-3.5 w-3.5" />
                Activity Log
              </p>
            </div>
          </div>
        </div>

        {/* Activity List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border">
          {activities.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Belum ada aktivitas</p>
            </div>
          ) : (
            <div className="divide-y">
              {activities.map((activity) => {
                const meta = activity.metadata as Record<string, string> | null;
                return (
                  <div key={activity.id} className="flex gap-3 p-4">
                    <Avatar className="h-8 w-8 flex-shrink-0 mt-0.5">
                      <AvatarImage src={activity.user.image || ""} />
                      <AvatarFallback className="bg-blue-500 text-white text-xs">
                        {activity.user.name?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-semibold">
                          {activity.user.name}
                        </span>{" "}
                        <span className="text-muted-foreground">
                          {ACTION_LABELS[activity.action] || activity.action}{" "}
                          {activity.entityType}
                        </span>
                        {meta?.title && (
                          <span className="font-medium">
                            {" "}
                            &quot;{meta.title}&quot;
                          </span>
                        )}
                        {meta?.from && meta?.to && (
                          <span className="text-muted-foreground">
                            {" "}
                            dari{" "}
                            <span className="font-medium">{meta.from}</span> ke{" "}
                            <span className="font-medium">{meta.to}</span>
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(activity.createdAt), {
                          addSuffix: true,
                          locale: id,
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
