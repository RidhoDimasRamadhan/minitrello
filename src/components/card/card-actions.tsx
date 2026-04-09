"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tag,
  Users,
  CheckSquare,
  Calendar,
  Palette,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { updateCard, deleteCard, toggleCardAssignee } from "@/actions/card";
import { createChecklist } from "@/actions/checklist";
import { useCardModal } from "@/hooks/use-card-modal";
import { LABEL_COLORS, BOARD_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check } from "lucide-react";

interface CardActionsProps {
  card: {
    id: string;
    coverColor: string | null;
    dueDate: Date | null;
    labels: { label: { id: string; name: string | null; color: string } }[];
    assignees: { user: { id: string; name: string | null; image: string | null } }[];
    list: { boardId: string };
  };
  boardId: string;
}

export function CardActions({ card, boardId }: CardActionsProps) {
  const { onClose } = useCardModal();
  const [checklistTitle, setChecklistTitle] = useState("Checklist");
  const [dueDate, setDueDate] = useState(
    card.dueDate
      ? new Date(card.dueDate).toISOString().slice(0, 16)
      : ""
  );

  async function handleAddChecklist() {
    const result = await createChecklist({
      title: checklistTitle,
      cardId: card.id,
      boardId,
    });
    if (result.error) toast.error(result.error);
    else {
      toast.success(result.success);
      setChecklistTitle("Checklist");
    }
  }

  async function handleSetDueDate() {
    if (!dueDate) return;
    const result = await updateCard({
      id: card.id,
      dueDate: new Date(dueDate),
      boardId,
    });
    if (result.error) toast.error(result.error);
    else toast.success("Due date berhasil diatur!");
  }

  async function handleRemoveDueDate() {
    const result = await updateCard({
      id: card.id,
      dueDate: null,
      boardId,
    });
    if (result.error) toast.error(result.error);
    else {
      toast.success("Due date dihapus!");
      setDueDate("");
    }
  }

  async function handleSetCover(color: string | null) {
    const result = await updateCard({
      id: card.id,
      coverColor: color,
      boardId,
    });
    if (result.error) toast.error(result.error);
  }

  async function handleDelete() {
    if (!confirm("Yakin ingin menghapus card ini?")) return;
    const result = await deleteCard(card.id, boardId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.success);
      onClose();
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
        Tambahkan ke card
      </p>

      {/* Members */}
      <Popover>
        <PopoverTrigger
          render={<Button variant="secondary" size="sm" className="w-full justify-start gap-2" />}
        >
          <Users className="h-4 w-4" />
          Member
        </PopoverTrigger>
        <PopoverContent align="start" className="w-64">
          <h4 className="font-semibold text-sm mb-2">Assign Member</h4>
          <p className="text-xs text-muted-foreground mb-2">
            Klik untuk toggle assign/unassign
          </p>
          <div className="space-y-1">
            {card.assignees.map(({ user }) => (
              <button
                key={user.id}
                onClick={async () => {
                  const result = await toggleCardAssignee(
                    card.id,
                    user.id,
                    boardId
                  );
                  if (result.error) toast.error(result.error);
                }}
                className="w-full flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage src={user.image || ""} />
                  <AvatarFallback className="bg-blue-500 text-white text-xs">
                    {user.name?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{user.name}</span>
                <Check className="h-4 w-4 ml-auto text-green-600" />
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Labels */}
      <Popover>
        <PopoverTrigger
          render={<Button variant="secondary" size="sm" className="w-full justify-start gap-2" />}
        >
          <Tag className="h-4 w-4" />
          Label
        </PopoverTrigger>
        <PopoverContent align="start" className="w-64">
          <h4 className="font-semibold text-sm mb-2">Label</h4>
          <div className="space-y-1">
            {LABEL_COLORS.map((lc) => (
              <div
                key={lc.value}
                className="h-8 rounded-md flex items-center px-3 text-white text-sm font-medium cursor-pointer hover:opacity-80"
                style={{ backgroundColor: lc.value }}
              >
                {lc.name}
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Checklist */}
      <Popover>
        <PopoverTrigger
          render={<Button variant="secondary" size="sm" className="w-full justify-start gap-2" />}
        >
          <CheckSquare className="h-4 w-4" />
          Checklist
        </PopoverTrigger>
        <PopoverContent align="start" className="w-64">
          <h4 className="font-semibold text-sm mb-2">Tambah Checklist</h4>
          <div className="space-y-2">
            <Input
              value={checklistTitle}
              onChange={(e) => setChecklistTitle(e.target.value)}
              placeholder="Judul checklist"
            />
            <Button size="sm" onClick={handleAddChecklist} className="w-full">
              Tambah
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Due Date */}
      <Popover>
        <PopoverTrigger
          render={<Button variant="secondary" size="sm" className="w-full justify-start gap-2" />}
        >
          <Calendar className="h-4 w-4" />
          Due Date
        </PopoverTrigger>
        <PopoverContent align="start" className="w-64">
          <h4 className="font-semibold text-sm mb-2">Atur Due Date</h4>
          <div className="space-y-2">
            <Input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
            <Button size="sm" onClick={handleSetDueDate} className="w-full">
              Simpan
            </Button>
            {card.dueDate && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleRemoveDueDate}
                className="w-full"
              >
                Hapus Due Date
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Cover */}
      <Popover>
        <PopoverTrigger
          render={<Button variant="secondary" size="sm" className="w-full justify-start gap-2" />}
        >
          <Palette className="h-4 w-4" />
          Cover
        </PopoverTrigger>
        <PopoverContent align="start" className="w-64">
          <h4 className="font-semibold text-sm mb-2">Warna Cover</h4>
          <div className="flex flex-wrap gap-2">
            {BOARD_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => handleSetCover(color)}
                className={cn(
                  "h-8 w-12 rounded-md transition-all",
                  card.coverColor === color && "ring-2 ring-offset-2 ring-blue-600"
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          {card.coverColor && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleSetCover(null)}
              className="w-full mt-2"
            >
              Hapus Cover
            </Button>
          )}
        </PopoverContent>
      </Popover>

      <div className="pt-2 border-t mt-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
          Aksi
        </p>
        <Button
          variant="destructive"
          size="sm"
          className="w-full justify-start gap-2"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4" />
          Hapus Card
        </Button>
      </div>
    </div>
  );
}
