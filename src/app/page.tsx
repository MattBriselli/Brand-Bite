import React, { Suspense } from "react";
import { HomeFeed } from "@/components/HomeFeed";

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div
          data-loading-fallback="true"
          className="max-w-7xl mx-auto px-4 py-12 min-h-screen text-sm text-[var(--text-secondary)]"
        >
          Loading latest fast-food news and snack reviews...
        </div>
      }
    >
      <HomeFeed />
    </Suspense>
  );
}
