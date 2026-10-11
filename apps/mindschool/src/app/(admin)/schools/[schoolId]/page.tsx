import { PageWrapper } from "@workspace/ui";
import { SchoolDetailContent } from "@/components/admin/schools/school-detail-content";

export default async function SchoolPage({ params }: { params: Promise<{ schoolId: string }> }) {
  const { schoolId } = await params;
  return (
    <PageWrapper routePath="/schools" routeLabel="Escolas" subRoute="Ficha da escola">
      <SchoolDetailContent schoolId={schoolId} />
    </PageWrapper>
  );
}
