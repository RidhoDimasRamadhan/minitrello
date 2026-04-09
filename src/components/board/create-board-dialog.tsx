"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createBoard } from "@/actions/board";
import { BOARD_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface CreateBoardDialogProps {
  workspaceId: string;
  children?: React.ReactNode;
}

export function CreateBoardDialog({
  workspaceId,
  children,
}: CreateBoardDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [selectedColor, setSelectedColor] = useState(BOARD_COLORS[0]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    const result = await createBoard({
      title,
      workspaceId,
      backgroundColor: selectedColor,
    });
    setIsLoading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(result.success);
    setOpen(false);
    setTitle("");
    if (result.boardId) {
      router.push(`/board/${result.boardId}`);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children ? (
        <DialogTrigger render={<button className="w-full text-left" />}>{children}</DialogTrigger>
      ) : (
        <DialogTrigger render={<Button size="sm" />}>Buat Board</DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Buat Board Baru</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Preview */}
          <div
            className="h-32 rounded-lg relative overflow-hidden"
            style={{ backgroundColor: selectedColor }}
          >
            <div className="absolute inset-0 bg-black/10" />
            <div className="relative p-4">
              <span className="text-white font-semibold">
                {title || "Nama Board"}
              </span>
            </div>
          </div>

          {/* Color picker */}
          <div className="space-y-2">
            <Label>Warna Background</Label>
            <div className="flex flex-wrap gap-2">
              {BOARD_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={cn(
                    "h-8 w-12 rounded-md transition-all",
                    selectedColor === color && "ring-2 ring-offset-2 ring-blue-600"
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="board-title">Judul Board</Label>
            <Input
              id="board-title"
              placeholder="Masukkan judul board"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading || !title.trim()}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Buat Board"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
