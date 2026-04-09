"use client";

import { useState, useRef, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X } from "lucide-react";
import { createCard } from "@/actions/card";
import { toast } from "sonner";

interface CardFormProps {
  listId: string;
  boardId: string;
  onAddCard?: (listId: string, card: {
    id: string;
    title: string;
    position: number;
    listId: string;
    description: null;
    dueDate: null;
    isComplete: boolean;
    coverColor: null;
    labels: [];
    assignees: [];
    checklists: [];
    _count: { comments: number; attachments: number };
  }) => void;
}

export function CardForm({ listId, boardId, onAddCard }: CardFormProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isPending, startTransition] = useTransition();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const cardTitle = title.trim();
    setTitle("");
    textareaRef.current?.focus();

    // Optimistic: add card to UI instantly
    const tempId = `temp-${Date.now()}`;
    onAddCard?.(listId, {
      id: tempId,
      title: cardTitle,
      position: Date.now(),
      listId,
      description: null,
      dueDate: null,
      isComplete: false,
      coverColor: null,
      labels: [],
      assignees: [],
      checklists: [],
      _count: { comments: 0, attachments: 0 },
    });

    // Server action in background
    startTransition(async () => {
      const result = await createCard({ title: cardTitle, listId, boardId });
      if (result.error) {
        toast.error(result.error);
      }
    });
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
