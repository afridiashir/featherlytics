"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FunnelBuilder } from "./funnel-builder";
import type { FunnelStep } from "@/lib/funnel-store";

export function EditFunnelDialog({
  funnelId,
  name,
  availableEvents,
  initialSteps,
}: {
  funnelId: string;
  name: string;
  availableEvents: string[];
  initialSteps: FunnelStep[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Pencil className="size-3.5" aria-hidden />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit funnel</DialogTitle>
          <DialogDescription>
            Update the steps or names, then save your changes.
          </DialogDescription>
        </DialogHeader>
        <FunnelBuilder
          funnelId={funnelId}
          initialName={name}
          availableEvents={availableEvents}
          initialSteps={initialSteps}
          onSaved={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
