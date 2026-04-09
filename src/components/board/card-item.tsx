"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MessageSquare,
  Paperclip,
  Clock,
  CheckSquare,
  AlignLeft,
} from "lucide-react";
import { format, isPast, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import { useCardModal } from "@/hooks/use-card-modal";

interface CardItemProps {
  card: {
    id: string;
    title: string;
    description: string | null;
    dueDate: Date | null;
    isComplete: boolean;
    coverColor: string | null;
    labels: { label: { id: string; name: string | null; color: string } }[];
    assignees: { user: { id: string; name: string | null; image: string | null } }[];
    checklists: { items: { isChecked: boolean }[] }[];
    _count: { comments: number; attachments: number };
  };
  boardId: string;
  isDragOverlay?: boolean;
}

export function CardItem({ card, boardId, isDragOverlay }: CardItemProps) {
  const { onOpen } = useCardModal();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    disabled: isDragOverlay,
  });

  const style = isDragOverlay
    ? {}
    : {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      };

  const totalItems = card.checklists.reduce(
    (acc, cl) => acc + cl.items.length,
    0
  );
  const checkedItems = card.checklists.reduce(
    (acc, cl) => acc + cl.items.filter((i) => i.isChecked).length,
    0
  );

  const dueDate = card.dueDate ? new Date(card.dueDate) : null;
  const isOverdue = dueDate && !card.isComplete && isPast(dueDate) && !isToday(dueDate);
  const isDueToday = dueDate && isToday(dueDate);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => !isDragOverlay && onOpen(card.id, boardId)}
      className={cn(
        "bg-white dark:bg-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer group border border-transparent hover:border-blue-400",
        isDragging && "shadow-lg"
      )}
    >
      {/* Cover */}
      {card.coverColor && (
        <div
          className="h-8 rounded-t-lg"
          style={{ backgroundColor: card.coverColor }}
        />
      )}

      <div className="p-2.5 space-y-2">
        {/* Labels */}
        {card.labels.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {card.labels.map(({ label }) => (
              <div
                key={label.id}
                className="h-2 w-10 rounded-full"
                style={{ backgroundColor: label.color }}
                title={label.name || ""}
              />
            ))}
          </div>
        )}

        {/* Title */}
        <p className="text-sm font-medium leading-snug">{card.title}</p>

        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
          {dueDate && (
            <span
              className={cn(
                "flex items-center gap-1 px-1.5 py-0.5 rounded",
                card.isComplete && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                isOverdue && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                isDueToday &&
                  !card.isComplete &&
                  "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
              )}
            >
              <Clock className="h-3 w-3" />
              {format(dueDate, "dd MMM")}
            </span>
          )}

          {card.description && (
            <span className="flex items-center gap-0.5">
              <AlignLeft className="h-3 w-3" />
            </span>
          )}

          {totalItems > 0 && (
            <span
              className={cn(
                "flex items-center gap-1 px-1.5 py-0.5 rounded",
                checkedItems === totalItems && totalItems > 0 &&
                  "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              )}
            >
              <CheckSquare className="h-3 w-3" />
              {checkedItems}/{totalItems}
            </span>
          )}

          {card._count.comments > 0 && (
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {card._count.comments}
            </span>
          )}

          {card._count.attachments > 0 && (
            <span className="flex items-center gap-1">
              <Paperclip className="h-3 w-3" />
              {card._count.attachments}
            </span>
          )}

          {/* Assignees */}
          {card.assignees.length > 0 && (
            <div className="flex -space-x-1 ml-auto">
              {card.assignees.slice(0, 3).map(({ user }) => (
                <Avatar key={user.id} className="h-5 w-5 border border-white dark:border-gray-700">
                  <AvatarImage src={user.image || ""} />
                  <AvatarFallback className="bg-blue-500 text-white text-[8px]">
                    {user.name?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
