"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Log to console for developers; could be extended to report to an error service
    // eslint-disable-next-line no-console
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="max-w-lg w-full bg-card text-card-foreground border rounded-xl shadow-sm p-8 text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-destructive" />
        </div>
        <h2 className="text-xl font-semibold">Something went wrong</h2>
        <p className="text-muted-foreground text-sm">
          An unexpected error occurred. You can try again or return to the previous page.
        </p>
        {error?.digest && (
          <p className="text-[10px] text-muted-foreground/70 break-all">Digest: {error.digest}</p>
        )}
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button onClick={() => reset()}>Try again</Button>
          <a href="#" onClick={(e) => { e.preventDefault(); history.back(); }} className="text-sm text-primary hover:underline">
            Go back
          </a>
        </div>
      </div>
    </div>
  );
}


