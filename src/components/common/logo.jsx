import * as React from "react";
import { Box } from "lucide-react";

import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

/**
 * Brand mark: a compact gradient glyph plus the product wordmark.
 */
export function Logo({ iconOnly = false, className, ...props }) {
  return (
    <div className={cn("flex items-center gap-2", className)} {...props}>
      <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <Box className="size-4.5" strokeWidth={2.25} />
      </div>
      {!iconOnly && (
        <div className="grid leading-none">
          <span className="text-sm font-semibold tracking-tight">
            {siteConfig.name}
          </span>
          <span className="text-[11px] font-medium text-muted-foreground">
            {siteConfig.tagline}
          </span>
        </div>
      )}
    </div>
  );
}
