import { PageWrapper, TitleList, UserList } from "@/components";

export default function Page() {
  return (
    <PageWrapper
      subRoute="Users"
      routeLabel="Utilizadores"
    >
      <TitleList
        title="Utilizadores"
        suTitle="Gestão de utilizadores"
      />
      <UserList />
    </PageWrapper>
  );
}
