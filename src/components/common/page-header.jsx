import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Consistent page title block: heading + supporting copy on the left,
 * actions on the right. Collapses to a stacked layout on small screens.
 */
export function PageHeader({
  title,
  description,
  actions,
  className,
  ...props
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
      {...props}
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
