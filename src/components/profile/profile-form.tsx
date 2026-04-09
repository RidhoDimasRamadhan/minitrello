"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Pencil } from "lucide-react";
import { updateProfile } from "@/actions/profile";
import { toast } from "sonner";

interface ProfileFormProps {
  name: string;
  email: string;
  image: string;
}

export function ProfileForm({ name: initialName, email, image }: ProfileFormProps) {
  const [name, setName] = useState(initialName);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  async function handleSave() {
    if (!name.trim()) return;
    setIsLoading(true);

    const result = await updateProfile({ name });
    setIsLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.success);
      setIsEditing(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Avatar */}
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={image} />
          <AvatarFallback className="bg-blue-600 text-white text-xl">
            {name?.charAt(0)?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-lg">{name || "User"}</p>
          <p className="text-sm text-muted-foreground">{email}</p>
        </div>
      </div>

      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Nama</Label>
        {isEditing ? (
          <div className="flex gap-2">
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
            <Button onClick={handleSave} disabled={isLoading || !name.trim()}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Simpan"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setIsEditing(false);
                setName(initialName);
              }}
            >
              Batal
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Input id="name" value={name} disabled />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Email (read-only) */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={email} disabled />
        <p className="text-xs text-muted-foreground">
          Email tidak dapat diubah
        </p>
      </div>
    </div>
  );
}
