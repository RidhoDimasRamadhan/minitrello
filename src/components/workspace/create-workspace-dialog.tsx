"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { createWorkspace } from "@/actions/workspace";

export function CreateWorkspaceDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    const result = await createWorkspace({ name, description });
    setIsLoading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(result.success);
    setOpen(false);
    setName("");
    setDescription("");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline" className="gap-1" />}>
        <Plus className="h-4 w-4" />
        Workspace Baru
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Buat Workspace Baru</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ws-name">Nama Workspace</Label>
            <Input
              id="ws-name"
              placeholder="Contoh: Tim Development"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ws-desc">Deskripsi (opsional)</Label>
            <Textarea
              id="ws-desc"
              placeholder="Deskripsi singkat workspace ini"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              rows={3}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading || !name.trim()}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Buat Workspace"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
