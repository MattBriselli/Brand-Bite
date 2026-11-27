import React, { Suspense } from "react";
import { BrandsDirectoryClient } from "@/components/BrandsDirectoryClient";

export default function BrandsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-12 text-sm text-[var(--text-secondary)]">
          Loading Brands A–Z Directory...
        </div>
      }
    >
      <BrandsDirectoryClient />
    </Suspense>
  );
}
