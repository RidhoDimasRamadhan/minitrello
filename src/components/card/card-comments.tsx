"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { Trash2 } from "lucide-react";
import { createComment, deleteComment } from "@/actions/comment";
import { toast } from "sonner";

interface CardCommentsProps {
  cardId: string;
  comments: {
    id: string;
    content: string;
    createdAt: Date;
    user: { id: string; name: string | null; image: string | null };
  }[];
  boardId: string;
}

export function CardComments({ cardId, comments, boardId }: CardCommentsProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    const result = await createComment({ content, cardId, boardId });
    setIsSubmitting(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      setContent("");
    }
  }

  async function handleDelete(commentId: string) {
    const result = await deleteComment(commentId, boardId);
    if (result.error) toast.error(result.error);
  }

  return (
    <div className="space-y-4">
      {/* Comment form */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Tulis komentar..."
          rows={3}
        />
        <Button
          type="submit"
          size="sm"
          disabled={!content.trim() || isSubmitting}
        >
          Kirim
        </Button>
      </form>

      {/* Comment list */}
      <div className="space-y-3">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3 group">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage src={comment.user.image || ""} />
              <AvatarFallback className="bg-blue-500 text-white text-xs">
                {comment.user.name?.charAt(0) || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">
                  {comment.user.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.createdAt), {
                    addSuffix: true,
                    locale: id,
                  })}
                </span>
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 mt-1">
                <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
              </div>
              <button
                onClick={() => handleDelete(comment.id)}
                className="text-xs text-muted-foreground hover:text-red-600 mt-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
              >
                <Trash2 className="h-3 w-3" />
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
