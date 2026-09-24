"use client";

import React from "react";

interface CanProps {
  check: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Declarative permission wrapper.
 * Usage:
 *   <Can check={isAdmin}><AdminButton /></Can>
 *   <Can check={canCreate} fallback={<LockedBadge />}><CreateButton /></Can>
 */
export function Can({ check, fallback = null, children }: CanProps): React.ReactElement | null {
  if (!check) return fallback as React.ReactElement | null;
  return <>{children}</>;
}
