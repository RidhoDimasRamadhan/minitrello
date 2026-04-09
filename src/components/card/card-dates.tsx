"use client";

import { format, isPast, isToday } from "date-fns";
import { id } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Clock } from "lucide-react";
import { updateCard } from "@/actions/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CardDatesProps {
  card: {
    id: string;
    dueDate: Date | null;
    isComplete: boolean;
  };
  boardId: string;
}

export function CardDates({ card, boardId }: CardDatesProps) {
  const dueDate = card.dueDate ? new Date(card.dueDate) : null;
  if (!dueDate) return null;

  const isOverdue = !card.isComplete && isPast(dueDate) && !isToday(dueDate);
  const isDueToday = isToday(dueDate);

  async function handleToggleComplete() {
    const result = await updateCard({
      id: card.id,
      isComplete: !card.isComplete,
      boardId,
    });
    if (result.error) toast.error(result.error);
  }

  return (
    <div>
      <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase">
        Due Date
      </h4>
      <div className="flex items-center gap-2">
        <Checkbox
          checked={card.isComplete}
          onCheckedChange={handleToggleComplete}
        />
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-sm">
            {format(dueDate, "dd MMMM yyyy, HH:mm", { locale: id })}
          </span>
          {card.isComplete && (
            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              Selesai
            </Badge>
          )}
          {isOverdue && (
            <Badge variant="destructive">Terlambat</Badge>
          )}
          {isDueToday && !card.isComplete && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
              Hari Ini
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
