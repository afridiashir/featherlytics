// TEMPORARY verification route — deleted after screenshot.
"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export default function ToastPreview() {
  useEffect(() => {
    toast.success("Funnel created");
    setTimeout(() => toast.loading("Deleting funnel…"), 50);
    setTimeout(() => toast("Funnel updated"), 100);
  }, []);
  return (
    <div className="min-h-svh bg-muted/30 p-8">
      <p className="text-sm text-muted-foreground">Toast preview</p>
    </div>
  );
}
