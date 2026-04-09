"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCardModal } from "./use-card-modal";

export function useKeyboardShortcuts() {
  const router = useRouter();
  const { isOpen, onClose } = useCardModal();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        // Only handle Escape in inputs
        if (e.key === "Escape") {
          target.blur();
        }
        return;
      }

      // Escape - close card modal
      if (e.key === "Escape" && isOpen) {
        onClose();
        return;
      }

      // / or Ctrl+K - focus search
      if (e.key === "/" || (e.key === "k" && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        router.push("/search");
        return;
      }

      // D - go to dashboard
      if (e.key === "d" && !e.metaKey && !e.ctrlKey) {
        router.push("/dashboard");
        return;
      }

      // ? - show shortcuts help
      if (e.key === "?" && e.shiftKey) {
        const event = new CustomEvent("toggle-shortcuts-help");
        window.dispatchEvent(event);
        return;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router, isOpen, onClose]);
}
