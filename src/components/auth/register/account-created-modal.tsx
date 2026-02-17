"use client";
import Link from "next/link";
import { useModal } from "@/stores";
import { Button, Icon } from "@/components";
import { GlobalModal } from "@/components/modal";

export function AccountCreatedModal() {
  const { closeModal } = useModal();

  return (
    <GlobalModal
      canClose={false}
      id="account-created"
      title="Conta Criada"
      className="!w-lg text-center"
      description="Tudo pronto para começar!"
    >
      <div className="flex flex-col items-center justify-center py-6 space-y-4">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-2 animate-bounce">
          <Icon name="Check" className="w-8 h-8 text-green-600 dark:text-green-500" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-bold text-foreground">
            Bem-vindo(a) à Mindgest!
          </h3>
          <p className="text-sm text-muted-foreground">
            Sua conta foi criada com sucesso.
          </p>
        </div>

        <div className="w-full pt-4">
          <Link href="/auth/login" className="w-full block">
            <Button
              className="w-full bg-primary hover:bg-primary/90 font-semibold h-11"
            >
              Ir para o Login
            </Button>
          </Link>
        </div>
      </div>
    </GlobalModal>
  );
}