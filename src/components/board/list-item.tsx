"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CardItem } from "./card-item";
import { CardForm } from "./card-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MoreHorizontal, Copy, Trash2, GripVertical } from "lucide-react";
import { updateList, deleteList, copyList } from "@/actions/list";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ListItemProps {
  list: {
    id: string;
    title: string;
    cards: {
      id: string;
      title: string;
      position: number;
      listId: string;
      description: string | null;
      dueDate: Date | null;
      isComplete: boolean;
      coverColor: string | null;
      labels: { label: { id: string; name: string | null; color: string } }[];
      assignees: { user: { id: string; name: string | null; image: string | null } }[];
      checklists: { items: { isChecked: boolean }[] }[];
      _count: { comments: number; attachments: number };
    }[];
  };
  boardId: string;
}

export function ListItem({ list, boardId }: ListItemProps) {
  const [title, setTitle] = useState(list.title);
  const [isEditing, setIsEditing] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: list.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  async function handleTitleSave() {
    setIsEditing(false);
    if (title.trim() && title !== list.title) {
      const result = await updateList(list.id, { title });
      if (result.error) {
        toast.error(result.error);
        setTitle(list.title);
      }
    } else {
      setTitle(list.title);
    }
  }

  async function handleDelete() {
    if (!confirm("Yakin ingin menghapus list ini beserta semua card-nya?")) return;
    const result = await deleteList(list.id);
    if (result.error) toast.error(result.error);
    else toast.success(result.success);
  }

  async function handleCopy() {
    const result = await copyList(list.id);
    if (result.error) toast.error(result.error);
    else toast.success(result.success);
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-gray-100 dark:bg-gray-800 rounded-xl w-72 flex-shrink-0 flex flex-col max-h-[calc(100vh-12rem)] shadow-md"
    >
      {/* Header */}
      <div className="flex items-center gap-1 p-3 pb-1">
        <button
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        {isEditing ? (
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={(e) => e.key === "Enter" && handleTitleSave()}
            className="h-7 text-sm font-semibold"
            autoFocus
          />
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="flex-1 text-left text-sm font-semibold px-1.5 py-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 truncate"
          >
            {list.title}
          </button>
        )}

        <span className="text-xs text-muted-foreground flex-shrink-0">
          {list.cards.length}
        </span>

        <Popover>
          <PopoverTrigger
            render={<Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0" />}
          >
            <MoreHorizontal className="h-4 w-4" />
          </PopoverTrigger>
          <PopoverContent align="start" className="w-52">
            <div className="space-y-1">
              <button
                onClick={handleCopy}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
              >
                <Copy className="h-4 w-4" />
                Salin List
              </button>
              <button
                onClick={handleDelete}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
              >
                <Trash2 className="h-4 w-4" />
                Hapus List
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Cards */}
      <ScrollArea className="flex-1 px-3 py-1">
        <SortableContext
          items={list.cards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2 min-h-[2px]">
            {list.cards.map((card) => (
              <CardItem key={card.id} card={card} boardId={boardId} />
            ))}
          </div>
        </SortableContext>
      </ScrollArea>

      {/* Add card */}
      <div className="p-2 pt-1">
        <CardForm listId={list.id} boardId={boardId} />
      </div>
    </div>
  );
}
