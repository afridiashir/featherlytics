"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

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
import type { FunnelStepResult } from "@/lib/ga";
import type { FunnelStep } from "@/lib/funnel-store";

export function NewFunnelDialog({
  availableEvents,
  initialSteps,
  initialResults,
}: {
  availableEvents: string[];
  initialSteps: FunnelStep[];
  initialResults: FunnelStepResult[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="size-4" aria-hidden />
          New funnel
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>New funnel</DialogTitle>
          <DialogDescription>
            Add events as steps, give each a custom name, then save.
          </DialogDescription>
        </DialogHeader>
        <FunnelBuilder
          availableEvents={availableEvents}
          initialSteps={initialSteps}
          initialResults={initialResults}
          onSaved={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
