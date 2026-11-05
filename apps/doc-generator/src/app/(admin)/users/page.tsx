import { UserList } from "@/components/admin/users/user-list";

export const metadata = {
  title: "Gestão de Utilizadores | Doc Generator",
  description: "Administração de utilizadores, permissões e acessos ao sistema",
};

export default function UsersPage() {
  return <UserList />;
}
