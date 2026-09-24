import React from "react";
import { UserList } from "@/components/admin/users/user-list";

export const metadata = {
  title: "Gestão de Utilizadores | Doc Generator",
  description: "Administração de utilizadores, permissões e acessos ao sistema",
};

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Gestão de Utilizadores</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Crie e gerencie utilizadores, defina papéis e controle os tipos de documentos que cada utilizador pode criar.
        </p>
      </div>
      <UserList />
    </div>
  );
}
