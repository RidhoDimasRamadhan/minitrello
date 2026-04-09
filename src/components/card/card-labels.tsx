"use client";

import { toggleCardLabel } from "@/actions/card";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { toast } from "sonner";

interface CardLabelsProps {
  cardId: string;
  boardId: string;
  labels: { id: string; name: string | null; color: string }[];
  selectedLabelIds: string[];
}

export function CardLabels({
  cardId,
  boardId,
  labels,
  selectedLabelIds,
}: CardLabelsProps) {
  async function handleToggle(labelId: string) {
    const result = await toggleCardLabel(cardId, labelId, boardId);
    if (result.error) toast.error(result.error);
  }

  return (
    <div className="space-y-1.5">
      {labels.map((label) => {
        const isSelected = selectedLabelIds.includes(label.id);
        return (
          <button
            key={label.id}
            onClick={() => handleToggle(label.id)}
            className="w-full flex items-center gap-2 p-1 rounded hover:opacity-80 transition-opacity"
          >
            <div
              className={cn(
                "flex-1 h-8 rounded-md flex items-center px-3 text-white text-sm font-medium"
              )}
              style={{ backgroundColor: label.color }}
            >
              {label.name}
            </div>
            {isSelected && <Check className="h-4 w-4 flex-shrink-0" />}
          </button>
        );
      })}
    </div>
  );
}
