"use client";

import { useMutation } from "@tanstack/react-query";
import { userService } from "@/services/user-service";
import { useModal } from "@/stores";
import type { ResetUserPasswordData, User } from "@/types";

export function useUserActions() {
  const { openModal } = useModal();
  const resetPasswordMutation = useMutation({
    mutationFn: (data: ResetUserPasswordData) => userService.resetPassword(data),
  });

  return {
    openDetails: (user: User) => openModal("view-user-details", user),
    openResetPassword: (user: User) => openModal("reset-user-password", user),
    resetPassword: resetPasswordMutation.mutateAsync,
    isResettingPassword: resetPasswordMutation.isPending,
  };
}
