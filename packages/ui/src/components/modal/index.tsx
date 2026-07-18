"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { cn } from "@workspace/utils";
import { ReactNode } from "react";
import { IconCheckSucessfull } from "./icon-success";
import { IconWarning } from "./icon-warning";
import { useModalStore } from "@workspace/hooks";

type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

const SIZE_CLASSES: Record<ModalSize, string> = {
  sm: "sm:max-w-[425px]",
  md: "sm:max-w-2xl",
  lg: "sm:max-w-3xl",
  xl: "sm:max-w-5xl",
  full: "sm:max-w-[95vw]",
};

interface ModalProps {
  id: string;
  title: ReactNode;
  description?: string;
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
  type?: "default" | "success" | "warning";
  size?: ModalSize;
}

export function GlobalModal({
  id,
  title,
  description,
  children,
  className,
  footer,
  type = "default",
  size = "sm",
}: ModalProps) {
  const { open, closeModal } = useModalStore();
  const isOpen = !!open[id];

  return (
    <Dialog open={isOpen} onOpenChange={() => closeModal(id)}>
      <DialogContent className={cn(SIZE_CLASSES[size], className)}>
        <DialogHeader>
          {type === "success" && (
            <div className="flex justify-center mb-4">
              <IconCheckSucessfull />
            </div>
          )}
          {type === "warning" && (
            <div className="flex justify-center mb-4">
              <IconWarning />
            </div>
          )}
          <DialogTitle
            className={cn("text-xl", type !== "default" && "text-center")}
          >
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription
              className={cn(type !== "default" && "text-center")}
            >
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="py-4">{children}</div>
        {footer && <div className="pt-4 border-t">{footer}</div>}
      </DialogContent>
    </Dialog>
  );
}
