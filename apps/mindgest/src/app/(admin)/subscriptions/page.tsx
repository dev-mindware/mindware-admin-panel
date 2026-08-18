import {
  PageWrapper,
  SubscriptionList,
  TitleList,
  SubscriptionStats,
  SubscriptionHeaderActions,
} from "@/components";

export default function Page() {
  return (
    <PageWrapper subRoute="Subscriptions" routeLabel="Subscrições">
      <TitleList title="Subscrições" suTitle="Lista de Subscrições">
        <SubscriptionHeaderActions />
      </TitleList>
      <SubscriptionStats />
      <SubscriptionList />
    </PageWrapper>
  );
}
