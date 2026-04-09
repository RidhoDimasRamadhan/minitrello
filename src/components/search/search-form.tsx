"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface SearchFormProps {
  initialQuery?: string;
}

export function SearchForm({ initialQuery }: SearchFormProps) {
  const [query, setQuery] = useState(initialQuery || "");
  const router = useRouter();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari card berdasarkan judul atau deskripsi..."
          className="pl-9"
          autoFocus
        />
      </div>
      <Button type="submit">Cari</Button>
    </form>
  );
}
