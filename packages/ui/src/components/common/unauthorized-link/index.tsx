"use client";

import { Button } from "../../ui/button";
import { Icon } from "../icon";
import Link from "next/link";
import { useAuth } from "@workspace/hooks";
import { getRouteByRole } from "@workspace/utils";

export function UnauthorizedLink() {
  const { setLogout, user } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
      <div className="bg-orange-100 p-4 rounded-full mb-6">
        <Icon name="TriangleAlert" className="w-12 h-12 text-orange-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h2>
      <p className="text-gray-600 mb-8 max-w-md">
        Você não tem permissão para acessar esta funcionalidade ou sua sessão expirou.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild variant="outline">
          <Link href={getRouteByRole(user?.role as any)}>
            Voltar ao Início
          </Link>
        </Button>
        <Button 
          variant="destructive"
          onClick={() => setLogout(true)}
        >
          Sair da Conta
        </Button>
      </div>
    </div>
  );
}