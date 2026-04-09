"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { LayoutList } from "lucide-react";
import { updateCard } from "@/actions/card";
import { toast } from "sonner";

interface CardHeaderProps {
  card: {
    id: string;
    title: string;
    list: { title: string };
  };
  boardId: string;
}

export function CardHeader({ card, boardId }: CardHeaderProps) {
  const [title, setTitle] = useState(card.title);
  const [isEditing, setIsEditing] = useState(false);

  async function handleSave() {
    setIsEditing(false);
    if (title.trim() && title !== card.title) {
      const result = await updateCard({ id: card.id, title, boardId });
      if (result.error) {
        toast.error(result.error);
        setTitle(card.title);
      }
    } else {
      setTitle(card.title);
    }
  }

  return (
    <div>
      {isEditing ? (
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          className="text-xl font-bold"
          autoFocus
        />
      ) : (
        <h2
          onClick={() => setIsEditing(true)}
          className="text-xl font-bold cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1 -mx-2 rounded"
        >
          {card.title}
        </h2>
      )}
      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
        <LayoutList className="h-3.5 w-3.5" />
        di list <span className="font-medium">{card.list.title}</span>
      </p>
    </div>
  );
}
