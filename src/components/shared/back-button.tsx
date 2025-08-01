
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

export function BackButton() {
  const router = useRouter();
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    // This check ensures we only show the button if there's a history to go back to.
    // It runs on the client-side where the history object is available.
    if (typeof window !== "undefined" && window.history.length > 1) {
      setCanGoBack(true);
    }
  }, []);

  if (!canGoBack) {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => router.back()}
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="sr-only">Volver</span>
    </Button>
  );
}
