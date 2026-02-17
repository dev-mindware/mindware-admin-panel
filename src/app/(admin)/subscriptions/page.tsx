import { PageWrapper, SubscriptionList, TitleList, SubscriptionStats } from "@/components";

export default function Page() {
  return (
    <PageWrapper subRoute="Subscriptions" routeLabel="Subscrições">
      <TitleList title="Subscrições" suTitle="Lista de Subscrições" />
      <SubscriptionStats />
      <SubscriptionList />
    </PageWrapper>
  );
}
