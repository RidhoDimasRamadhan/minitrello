"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { toggleStarBoard } from "@/actions/board";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface BoardCardProps {
  board: {
    id: string;
    title: string;
    backgroundColor: string;
    backgroundImage: string | null;
  };
  workspaceName?: string;
  isStarred?: boolean;
}

export function BoardCard({ board, workspaceName, isStarred }: BoardCardProps) {
  async function handleToggleStar(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const result = await toggleStarBoard(board.id);
    if (result.error) toast.error(result.error);
  }

  return (
    <Link href={`/board/${board.id}`}>
      <div
        className="group relative h-24 rounded-lg overflow-hidden cursor-pointer transition-opacity hover:opacity-90"
        style={{
          backgroundColor: board.backgroundColor,
          backgroundImage: board.backgroundImage
            ? `url(${board.backgroundImage})`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative p-3 h-full flex flex-col justify-between">
          <span className="text-white font-semibold text-sm truncate">
            {board.title}
          </span>
          {workspaceName && (
            <span className="text-white/70 text-xs truncate">
              {workspaceName}
            </span>
          )}
        </div>
        <button
          onClick={handleToggleStar}
          className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Star
            className={cn(
              "h-4 w-4 transition-colors",
              isStarred
                ? "fill-yellow-400 text-yellow-400"
                : "text-white hover:text-yellow-400"
            )}
          />
        </button>
      </div>
    </Link>
  );
}
