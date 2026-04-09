"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import { createList } from "@/actions/list";
import { toast } from "sonner";

interface ListFormProps {
  boardId: string;
}

export function ListForm({ boardId }: ListFormProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const result = await createList({ title, boardId });
    if (result.error) {
      toast.error(result.error);
    } else {
      setTitle("");
      inputRef.current?.focus();
    }
  }

  if (!isAdding) {
    return (
      <button
        onClick={() => setIsAdding(true)}
        className="bg-white/30 dark:bg-white/10 hover:bg-white/50 dark:hover:bg-white/20 rounded-xl w-72 flex-shrink-0 p-3 flex items-center gap-2 text-white text-sm font-medium transition-colors"
      >
        <Plus className="h-4 w-4" />
        Tambah List
      </button>
    );
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-xl w-72 flex-shrink-0 p-3 shadow-md">
      <form onSubmit={onSubmit} className="space-y-2">
        <Input
          ref={inputRef}
          placeholder="Masukkan judul list..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
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
    </div>
  );
}
