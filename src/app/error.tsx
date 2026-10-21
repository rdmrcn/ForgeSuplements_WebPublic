"use client";

import { useEffect } from "react";
import { Button, LinkButton } from "@/components/ui/button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="container-x flex min-h-[60vh] flex-col items-start justify-center py-20" role="alert">
      <p className="eyebrow text-stone">Something went wrong</p>
      <h1 className="display mt-3 text-[clamp(3.5rem,11vw,9rem)]">Dropped the bar</h1>
      <p className="mt-4 max-w-md text-lg text-ink/70">An unexpected error stopped this page from loading. Your cart is saved in this browser. Try again, or head back to the shop.</p>
      <div className="mt-8 flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <LinkButton href="/shop" variant="outline">Back to shop</LinkButton>
      </div>
    </div>
  );
}
