"use client";

import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { KeyboardShortcutsHelp } from "@/components/shared/keyboard-shortcuts-help";

export function KeyboardProvider({ children }: { children: React.ReactNode }) {
  useKeyboardShortcuts();

  return (
    <>
      {children}
      <KeyboardShortcutsHelp />
    </>
  );
}
