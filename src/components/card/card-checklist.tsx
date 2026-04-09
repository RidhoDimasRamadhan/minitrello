"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Plus, Trash2, X } from "lucide-react";
import {
  createChecklistItem,
  toggleChecklistItem,
  deleteChecklistItem,
  deleteChecklist,
} from "@/actions/checklist";
import { toast } from "sonner";

interface CardChecklistProps {
  checklist: {
    id: string;
    title: string;
    items: {
      id: string;
      text: string;
      isChecked: boolean;
    }[];
  };
  boardId: string;
}

export function CardChecklist({ checklist, boardId }: CardChecklistProps) {
  const [newItemText, setNewItemText] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const total = checklist.items.length;
  const checked = checklist.items.filter((i) => i.isChecked).length;
  const progress = total > 0 ? (checked / total) * 100 : 0;

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newItemText.trim()) return;

    const result = await createChecklistItem({
      text: newItemText,
      checklistId: checklist.id,
      boardId,
    });
    if (result.error) toast.error(result.error);
    else setNewItemText("");
  }

  async function handleToggle(itemId: string) {
    const result = await toggleChecklistItem(itemId, boardId);
    if (result.error) toast.error(result.error);
  }

  async function handleDeleteItem(itemId: string) {
    const result = await deleteChecklistItem(itemId, boardId);
    if (result.error) toast.error(result.error);
  }

  async function handleDeleteChecklist() {
    const result = await deleteChecklist(checklist.id, boardId);
    if (result.error) toast.error(result.error);
  }

  return (
    <div className="space-y-3">
      {/* Progress */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground w-8">
          {Math.round(progress)}%
        </span>
        <Progress value={progress} className="flex-1 h-2" />
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={handleDeleteChecklist}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Items */}
      <div className="space-y-1">
        {checklist.items.map((item) => (
          <div key={item.id} className="flex items-center gap-2 group px-1 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
            <Checkbox
              checked={item.isChecked}
              onCheckedChange={() => handleToggle(item.id)}
            />
            <span
              className={`flex-1 text-sm ${
                item.isChecked ? "line-through text-muted-foreground" : ""
              }`}
            >
              {item.text}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100"
              onClick={() => handleDeleteItem(item.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>

      {/* Add item */}
      {isAdding ? (
        <form onSubmit={handleAddItem} className="space-y-2">
          <Input
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            placeholder="Tambah item..."
            autoFocus
          />
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={!newItemText.trim()}>
              Tambah
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setIsAdding(false);
                setNewItemText("");
              }}
            >
              Batal
            </Button>
          </div>
        </form>
      ) : (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsAdding(true)}
          className="gap-1"
        >
          <Plus className="h-3.5 w-3.5" />
          Tambah Item
        </Button>
      )}
    </div>
  );
}
