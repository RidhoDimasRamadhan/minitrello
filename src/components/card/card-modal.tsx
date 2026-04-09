"use client";

import { useEffect, useState } from "react";
import { useCardModal } from "@/hooks/use-card-modal";
import { getCard } from "@/actions/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { CardDescription } from "./card-description";
import { CardLabels } from "./card-labels";
import { CardDates } from "./card-dates";
import { CardChecklist } from "./card-checklist";
import { CardComments } from "./card-comments";
import { CardActivity } from "./card-activity";
import { CardActions } from "./card-actions";
import { CardHeader } from "./card-header";
import { CardAttachments } from "./card-attachments";
import {
  AlignLeft,
  CheckSquare,
  MessageSquare,
  Activity,
} from "lucide-react";

export function CardModal() {
  const { isOpen, onClose, cardId, boardId } = useCardModal();
  const [card, setCard] = useState<Awaited<ReturnType<typeof getCard>>>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (cardId && isOpen) {
      setIsLoading(true);
      getCard(cardId).then((data) => {
        setCard(data);
        setIsLoading(false);
      });
    }
  }, [cardId, isOpen]);

  function handleClose() {
    onClose();
    setCard(null);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 overflow-hidden">
        {isLoading || !card ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <ScrollArea className="max-h-[90vh]">
            <div className="p-6">
              {/* Cover */}
              {card.coverColor && (
                <div
                  className="h-24 -mx-6 -mt-6 mb-4"
                  style={{ backgroundColor: card.coverColor }}
                />
              )}

              {/* Header */}
              <CardHeader card={card} boardId={boardId!} />

              <div className="flex flex-col lg:flex-row gap-6 mt-6">
                {/* Main content */}
                <div className="flex-1 space-y-6">
                  {/* Labels on card */}
                  {card.labels.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase">
                        Label
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {card.labels.map(({ label }) => (
                          <span
                            key={label.id}
                            className="px-3 py-1 rounded-md text-white text-xs font-medium"
                            style={{ backgroundColor: label.color }}
                          >
                            {label.name || ""}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Due date display */}
                  {card.dueDate && (
                    <CardDates card={card} boardId={boardId!} />
                  )}

                  {/* Description */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <AlignLeft className="h-4.5 w-4.5" />
                      <h3 className="font-semibold">Deskripsi</h3>
                    </div>
                    <CardDescription card={card} boardId={boardId!} />
                  </div>

                  {/* Checklists */}
                  {card.checklists.map((checklist) => (
                    <div key={checklist.id}>
                      <div className="flex items-center gap-2 mb-2">
                        <CheckSquare className="h-4.5 w-4.5" />
                        <h3 className="font-semibold">{checklist.title}</h3>
                      </div>
                      <CardChecklist
                        checklist={checklist}
                        boardId={boardId!}
                      />
                    </div>
                  ))}

                  {/* Attachments */}
                  <CardAttachments
                    cardId={card.id}
                    boardId={boardId!}
                    attachments={card.attachments}
                  />

                  {/* Comments */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <MessageSquare className="h-4.5 w-4.5" />
                      <h3 className="font-semibold">Komentar</h3>
                    </div>
                    <CardComments
                      cardId={card.id}
                      comments={card.comments}
                      boardId={boardId!}
                    />
                  </div>

                  {/* Activity */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Activity className="h-4.5 w-4.5" />
                      <h3 className="font-semibold">Aktivitas</h3>
                    </div>
                    <CardActivity activities={card.activities} />
                  </div>
                </div>

                {/* Sidebar actions */}
                <div className="w-full lg:w-48 space-y-2">
                  <CardActions card={card} boardId={boardId!} />
                </div>
              </div>
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
