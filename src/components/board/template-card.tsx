"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { createBoard } from "@/actions/board";
import { createList } from "@/actions/list";
import { toast } from "sonner";

interface TemplateCardProps {
  template: {
    title: string;
    color: string;
    lists: string[];
  };
  workspaces: { id: string; name: string }[];
}

export function TemplateCard({ template, workspaces }: TemplateCardProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState(template.title);
  const [workspaceId, setWorkspaceId] = useState(workspaces[0]?.id || "");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !workspaceId) return;

    setIsLoading(true);

    const boardResult = await createBoard({
      title,
      workspaceId,
      backgroundColor: template.color,
    });

    if (boardResult.error || !boardResult.boardId) {
      toast.error(boardResult.error || "Gagal membuat board");
      setIsLoading(false);
      return;
    }

    // Create lists from template
    for (const listTitle of template.lists) {
      await createList({ title: listTitle, boardId: boardResult.boardId });
    }

    setIsLoading(false);
    toast.success("Board berhasil dibuat dari template!");
    setOpen(false);
    router.push(`/board/${boardResult.boardId}`);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button className="h-24 rounded-lg overflow-hidden relative text-left hover:opacity-90 transition-opacity w-full" />
        }
      >
        <div
          className="absolute inset-0"
          style={{ backgroundColor: template.color }}
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative p-3 h-full flex flex-col justify-between">
          <span className="text-white font-semibold text-sm">
            {template.title}
          </span>
          <span className="text-white/70 text-xs">
            {template.lists.length} list
          </span>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Buat Board dari Template</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Judul Board</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Workspace</Label>
            <Select value={workspaceId} onValueChange={(val) => val && setWorkspaceId(val)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih workspace" />
              </SelectTrigger>
              <SelectContent>
                {workspaces.map((ws) => (
                  <SelectItem key={ws.id} value={ws.id}>
                    {ws.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>List yang akan dibuat</Label>
            <div className="flex flex-wrap gap-1.5">
              {template.lists.map((list) => (
                <span
                  key={list}
                  className="bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded text-xs font-medium"
                >
                  {list}
                </span>
              ))}
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
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
