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

interface ModalProps {
  id: string;
  title: ReactNode;
  description?: string;
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
  type?: "default" | "success" | "warning";
}

export function GlobalModal({
  id,
  title,
  description,
  children,
  className,
  footer,
  type = "default",
}: ModalProps) {
  const { open, closeModal } = useModalStore();
  const isOpen = !!open[id];

  return (
    <Dialog open={isOpen} onOpenChange={() => closeModal(id)}>
      <DialogContent className={cn("sm:max-w-[425px]", className)}>
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
