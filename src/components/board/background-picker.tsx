"use client";

import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ImageIcon, Loader2, Palette } from "lucide-react";
import { updateBoard } from "@/actions/board";
import { uploadImage } from "@/actions/upload";
import { BOARD_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface BackgroundPickerProps {
  boardId: string;
  currentColor: string;
  currentImage: string | null;
}

export function BackgroundPicker({
  boardId,
  currentColor,
  currentImage,
}: BackgroundPickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  async function handleColorChange(color: string) {
    startTransition(async () => {
      const result = await updateBoard(boardId, {
        backgroundColor: color,
        backgroundImage: undefined,
      });
      if (result.error) toast.error(result.error);
    });
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    startTransition(async () => {
      const uploadResult = await uploadImage(formData);
      if (uploadResult.error) {
        toast.error(uploadResult.error);
        return;
      }
      if (uploadResult.url) {
        const result = await updateBoard(boardId, {
          backgroundImage: uploadResult.url,
        });
        if (result.error) toast.error(result.error);
        else toast.success("Background berhasil diubah!");
      }
    });

    e.target.value = "";
  }

  return (
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
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Palette className="h-4 w-4 mr-1" />
        )}
        <span className="hidden sm:inline">Background</span>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72">
        <h4 className="font-semibold text-sm mb-3">Background Board</h4>

        {/* Colors */}
        <p className="text-xs text-muted-foreground mb-2">Warna</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {BOARD_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => handleColorChange(color)}
              className={cn(
                "h-8 w-12 rounded-md transition-all hover:opacity-80",
                currentColor === color &&
                  !currentImage &&
                  "ring-2 ring-offset-2 ring-blue-600"
              )}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        {/* Image upload */}
        <p className="text-xs text-muted-foreground mb-2">Gambar Custom</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2"
          onClick={() => fileInputRef.current?.click()}
          disabled={isPending}
        >
          <ImageIcon className="h-4 w-4" />
          Upload Gambar
        </Button>

        {currentImage && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-2"
            onClick={() => {
              startTransition(async () => {
                await updateBoard(boardId, { backgroundImage: "" });
              });
            }}
          >
            Hapus Gambar Background
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
}
