"use client";

import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, Trash2, FileText, Image, File, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { uploadAttachment, deleteAttachment } from "@/actions/attachment";
import { toast } from "sonner";

interface CardAttachmentsProps {
  cardId: string;
  boardId: string;
  attachments: {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
    createdAt: Date;
  }[];
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileIcon({ type }: { type: string }) {
  if (type.startsWith("image/")) return <Image className="h-4 w-4" />;
  if (type.includes("pdf")) return <FileText className="h-4 w-4" />;
  return <File className="h-4 w-4" />;
}

export function CardAttachments({ cardId, boardId, attachments }: CardAttachmentsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("cardId", cardId);
    formData.append("boardId", boardId);

    startTransition(async () => {
      const result = await uploadAttachment(formData);
      if (result.error) toast.error(result.error);
      else toast.success(result.success);
    });

    // Reset input
    e.target.value = "";
  }

  async function handleDelete(attachmentId: string) {
    const result = await deleteAttachment(attachmentId, boardId);
    if (result.error) toast.error(result.error);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Paperclip className="h-4.5 w-4.5" />
          <h3 className="font-semibold">Lampiran</h3>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
            ) : (
              <Paperclip className="h-3.5 w-3.5 mr-1" />
            )}
            Upload
          </Button>
        </div>
      </div>

      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 group"
            >
              {/* Preview/Icon */}
              {att.type.startsWith("image/") ? (
                <a href={att.url} target="_blank" rel="noopener noreferrer">
                  <img
                    src={att.url}
                    alt={att.name}
                    className="h-12 w-16 object-cover rounded"
                  />
                </a>
              ) : (
                <div className="h-12 w-16 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                  <FileIcon type={att.type} />
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <a
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium hover:underline truncate block"
                >
                  {att.name}
                </a>
                <p className="text-xs text-muted-foreground">
                  {formatSize(att.size)} &bull;{" "}
                  {formatDistanceToNow(new Date(att.createdAt), {
                    addSuffix: true,
                    locale: id,
                  })}
                </p>
              </div>

              {/* Delete */}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100"
                onClick={() => handleDelete(att.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
