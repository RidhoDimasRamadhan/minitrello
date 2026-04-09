"use client";

import { useEffect, useState } from "react";
import { CardModal } from "@/components/card/card-modal";

export function ModalProvider() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <CardModal />;
}
