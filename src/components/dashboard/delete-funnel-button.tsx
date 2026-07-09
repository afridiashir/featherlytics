"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteFunnelAction } from "@/app/funnel/actions";

export function DeleteFunnelButton({
  id,
  name,
  redirectTo,
  variant = "icon",
}: {
  id: string;
  name: string;
  /** where to navigate after deleting (e.g. "/funnel" from a detail page) */
  redirectTo?: string;
  variant?: "icon" | "button";
}) {
  const [pending, start] = useTransition();
  const router = useRouter();

  function onDelete() {
    start(async () => {
      const run = deleteFunnelAction(id);
      toast.promise(run, {
        loading: "Deleting funnel…",
        success: `Deleted “${name}”`,
        error: "Couldn't delete funnel",
      });
      try {
        await run;
        if (redirectTo) router.push(redirectTo);
      } catch {
        // error toast already shown
      }
    });
  }

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={onDelete}
        disabled={pending}
        className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
        aria-label={`Delete ${name}`}
      >
        {pending ? (
          <Loader2 className="size-3.5 animate-spin" aria-hidden />
        ) : (
          <Trash2 className="size-3.5" aria-hidden />
        )}
        Delete
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={pending}
      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
      aria-label={`Delete ${name}`}
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" aria-hidden />
      ) : (
        <Trash2 className="size-4" aria-hidden />
      )}
    </button>
  );
}
