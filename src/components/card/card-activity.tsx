"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

interface CardActivityProps {
  activities: {
    id: string;
    action: string;
    entityType: string;
    metadata: unknown;
    createdAt: Date;
    user: { id: string; name: string | null; image: string | null };
  }[];
}

export function CardActivity({ activities }: CardActivityProps) {
  return (
    <div className="space-y-3">
      {activities.map((activity) => {
        const meta = activity.metadata as Record<string, string> | null;
        return (
          <div key={activity.id} className="flex gap-3">
            <Avatar className="h-7 w-7 flex-shrink-0 mt-0.5">
              <AvatarImage src={activity.user.image || ""} />
              <AvatarFallback className="bg-gray-400 text-white text-xs">
                {activity.user.name?.charAt(0) || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm">
                <span className="font-semibold">{activity.user.name}</span>{" "}
                <span className="text-muted-foreground">
                  {ACTION_LABELS[activity.action] || activity.action}{" "}
                  {activity.entityType}
                </span>
                {meta?.title && (
                  <span className="font-medium"> &quot;{meta.title}&quot;</span>
                )}
                {meta?.from && meta?.to && (
                  <span className="text-muted-foreground">
                    {" "}
                    dari {meta.from} ke {meta.to}
                  </span>
                )}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatDistanceToNow(new Date(activity.createdAt), {
                  addSuffix: true,
                  locale: id,
                })}
              </p>
            </div>
          </div>
        );
      })}
      {activities.length === 0 && (
        <p className="text-sm text-muted-foreground">Belum ada aktivitas</p>
      )}
    </div>
  );
}
