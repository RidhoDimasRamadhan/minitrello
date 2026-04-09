"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X } from "lucide-react";
import { createCard } from "@/actions/card";
import { toast } from "sonner";

interface CardFormProps {
  listId: string;
  boardId: string;
}

export function CardForm({ listId, boardId }: CardFormProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const result = await createCard({ title, listId, boardId });
    if (result.error) {
      toast.error(result.error);
    } else {
      setTitle("");
      textareaRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit(e);
    }
    if (e.key === "Escape") {
      setIsAdding(false);
      setTitle("");
    }
  }

  if (!isAdding) {
    return (
      <button
        onClick={() => setIsAdding(true)}
        className="w-full flex items-center gap-1.5 px-2 py-1.5 text-sm text-muted-foreground hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
      >
        <Plus className="h-4 w-4" />
        Tambah card
      </button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <Textarea
        ref={textareaRef}
        placeholder="Masukkan judul card..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        autoFocus
        rows={2}
        className="resize-none"
      />
      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" disabled={!title.trim()}>
          Tambah
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => {
            setIsAdding(false);
            setTitle("");
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
