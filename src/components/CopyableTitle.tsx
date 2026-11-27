"use client";

import React from "react";
import { Link2 } from "lucide-react";
import { showCopyToast } from "@/components/CopyToastHost";

interface CopyableTitleProps {
  as?: "h1" | "h2" | "h3";
  id?: string;
  /** Optional relative path or absolute URL to copy; defaults to current page URL (or #id if id is set). */
  href?: string;
  className?: string;
  children: React.ReactNode;
}

export function CopyableTitle({
  as = "h2",
  id,
  href,
  className = "",
  children,
}: CopyableTitleProps) {
  const Tag = as;

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    let urlToCopy = "";
    if (typeof window !== "undefined") {
      if (href) {
        urlToCopy = href.startsWith("http")
          ? href
          : `${window.location.origin}${href.startsWith("/") ? href : `/${href}`}`;
      } else if (id) {
        urlToCopy = `${window.location.origin}${window.location.pathname}${window.location.search}#${id}`;
      } else {
        urlToCopy = window.location.href;
      }
    }

    if (!urlToCopy) return;

    try {
      await navigator.clipboard.writeText(urlToCopy);
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = urlToCopy;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      } catch {
        // Ignore clipboard errors
      }
    }

    showCopyToast("Link copied!");
  };

  return (
    <Tag
      id={id}
      onClick={handleCopy}
      role="button"
      tabIndex={0}
      title="Click to copy link"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          void handleCopy(e as unknown as React.MouseEvent);
        }
      }}
      className={`group/copy cursor-pointer hover:text-[var(--accent-brand)] transition-colors ${className}`}
    >
      <span>{children}</span>
      <Link2
        className="inline-block w-[0.75em] h-[0.75em] ml-2 align-middle opacity-0 group-hover/copy:opacity-70 transition-opacity text-[var(--accent-brand)]"
        aria-hidden="true"
      />
    </Tag>
  );
}
