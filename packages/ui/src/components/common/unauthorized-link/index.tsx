"use client";

import { Button } from "../../ui/button";
import { Icon } from "../icon";
import Link from "next/link";
import { useAuth } from "@workspace/hooks";
import { getRouteByRole } from "@workspace/utils";

export function UnauthorizedLink() {
  const { setLogout, user } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
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