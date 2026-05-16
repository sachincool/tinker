"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    onOpenChange(false);
    if (q) router.push(`/blog?q=${encodeURIComponent(q)}`);
    else router.push("/blog");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Search posts</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="flex items-center gap-3 p-4">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search posts by title, excerpt, or tag…"
            className="border-0 shadow-none focus-visible:ring-0 px-0 h-9 text-base"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 rounded border border-border/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
            ↵
          </kbd>
        </form>
      </DialogContent>
    </Dialog>
  );
}
