"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

export function CustomToaster({ ...props }: ToasterProps) {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      richColors
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground font-medium",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground font-medium",
          error: "group-[.toast]:bg-destructive group-[.toast]:text-destructive-foreground",
          success: "group-[.toast]:bg-success group-[.toast]:text-success-foreground",
          warning: "group-[.toast]:bg-warning group-[.toast]:text-warning-foreground",
          info: "group-[.toast]:bg-info group-[.toast]:text-info-foreground",
        },
      }}
      {...props}
    />
  )
}
