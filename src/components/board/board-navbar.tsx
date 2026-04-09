"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Star,
  MoreHorizontal,
  Users,
  Trash2,
  Copy,
  Archive,
} from "lucide-react";
import { toast } from "sonner";
import { updateBoard, deleteBoard, toggleStarBoard } from "@/actions/board";
import { inviteBoardMember } from "@/actions/board";
import { cn } from "@/lib/utils";

interface BoardNavbarProps {
  board: {
    id: string;
    title: string;
    stars: { id: string }[];
    members: { user: { id: string; name: string | null; image: string | null } }[];
    workspace: { name: string; slug: string };
  };
}

export function BoardNavbar({ board }: BoardNavbarProps) {
  const router = useRouter();
  const [title, setTitle] = useState(board.title);
  const [isEditing, setIsEditing] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const isStarred = board.stars.length > 0;

  async function handleTitleSave() {
    setIsEditing(false);
    if (title.trim() && title !== board.title) {
      const result = await updateBoard(board.id, { title });
      if (result.error) {
        toast.error(result.error);
        setTitle(board.title);
      }
    } else {
      setTitle(board.title);
    }
  }

  async function handleDelete() {
    if (!confirm("Yakin ingin menghapus board ini?")) return;
    const result = await deleteBoard(board.id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.success);
      router.push("/dashboard");
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    const result = await inviteBoardMember(board.id, inviteEmail);
    if (result.error) toast.error(result.error);
    else {
      toast.success(result.success);
      setInviteEmail("");
    }
  }

  return (
    <div className="h-14 bg-black/30 backdrop-blur-sm flex items-center justify-between px-4 gap-4">
      <div className="flex items-center gap-3 min-w-0">
        {isEditing ? (
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={(e) => e.key === "Enter" && handleTitleSave()}
            className="h-8 bg-white/20 border-none text-white font-bold text-lg w-auto"
            autoFocus
          />
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="text-white font-bold text-lg truncate hover:bg-white/10 px-2 py-1 rounded"
          >
            {board.title}
          </button>
        )}

        <button
          onClick={async () => {
            const result = await toggleStarBoard(board.id);
            if (result.error) toast.error(result.error);
          }}
        >
          <Star
            className={cn(
              "h-4.5 w-4.5 transition-colors",
              isStarred
                ? "fill-yellow-400 text-yellow-400"
                : "text-white/70 hover:text-yellow-400"
            )}
          />
        </button>

        <span className="text-white/60 text-sm hidden sm:inline">
          di {board.workspace.name}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* Members */}
        <div className="flex -space-x-2 mr-2">
          {board.members.slice(0, 5).map((member) => (
            <Avatar key={member.user.id} className="h-7 w-7 border-2 border-white/20">
              <AvatarImage src={member.user.image || ""} />
              <AvatarFallback className="bg-blue-500 text-white text-xs">
                {member.user.name?.charAt(0) || "?"}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>

        {/* Invite */}
        <Popover>
          <PopoverTrigger
            render={
              <Button
                size="sm"
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-none h-8"
              />
            }
          >
            <Users className="h-4 w-4 mr-1" />
            Undang
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80">
            <h4 className="font-semibold mb-2">Undang Member</h4>
            <form onSubmit={handleInvite} className="flex gap-2">
              <Input
                placeholder="Email member"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                type="email"
                className="flex-1"
              />
              <Button type="submit" size="sm">
                Undang
              </Button>
            </form>
          </PopoverContent>
        </Popover>

        {/* More options */}
        <Popover>
          <PopoverTrigger
            render={
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/20 h-8 w-8"
              />
            }
          >
            <MoreHorizontal className="h-4 w-4" />
          </PopoverTrigger>
          <PopoverContent align="end" className="w-60">
            <div className="space-y-1">
              <button
                onClick={handleDelete}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
              >
                <Trash2 className="h-4 w-4" />
                Hapus Board
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
