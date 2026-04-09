"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { updateCard } from "@/actions/card";
import { toast } from "sonner";

interface CardDescriptionProps {
  card: {
    id: string;
    description: string | null;
  };
  boardId: string;
}

export function CardDescription({ card, boardId }: CardDescriptionProps) {
  const [description, setDescription] = useState(card.description || "");
  const [isEditing, setIsEditing] = useState(false);

  async function handleSave() {
    setIsEditing(false);
    if (description !== (card.description || "")) {
      const result = await updateCard({
        id: card.id,
        description,
        boardId,
      });
      if (result.error) {
        toast.error(result.error);
        setDescription(card.description || "");
      }
    }
  }

  if (isEditing) {
    return (
      <div className="space-y-2">
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Tambahkan deskripsi lebih detail..."
          rows={6}
          autoFocus
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave}>
            Simpan
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setIsEditing(false);
              setDescription(card.description || "");
            }}
          >
            Batal
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className="min-h-[80px] bg-gray-100 dark:bg-gray-800 rounded-lg p-3 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
    >
      {description ? (
        <p className="text-sm whitespace-pre-wrap">{description}</p>
      ) : (
        <p className="text-sm text-muted-foreground">
          Tambahkan deskripsi lebih detail...
        </p>
      )}
    </div>
  );
}
