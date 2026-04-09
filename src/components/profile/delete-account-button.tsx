"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Trash2 } from "lucide-react";
import { deleteAccount } from "@/actions/profile";
import { toast } from "sonner";

export function DeleteAccountButton() {
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleDelete() {
    if (confirmation !== "HAPUS AKUN") return;

    setIsLoading(true);
    const result = await deleteAccount();
    setIsLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.success);
      signOut({ callbackUrl: "/" });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button variant="destructive" className="gap-2" />}
      >
        <Trash2 className="h-4 w-4" />
        Hapus Akun
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hapus Akun</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Tindakan ini akan menghapus akun kamu secara permanen beserta semua
            data yang terkait. Ketik <strong>HAPUS AKUN</strong> untuk
            konfirmasi.
          </p>
          <Input
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            placeholder="Ketik HAPUS AKUN"
          />
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleDelete}
            disabled={confirmation !== "HAPUS AKUN" || isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Hapus Akun Permanen"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
