import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { qbTreeQueryOptions } from "@/lib/qb/query-options";
import { getServerQueryClient } from "@/lib/query/server-query-client";
import { QbHubContent } from "./qb-hub-content";

export const revalidate = 300;

export default async function QuestionBankHubPage() {
  const queryClient = getServerQueryClient();
  await queryClient.prefetchQuery(qbTreeQueryOptions()).catch(() => undefined);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <QbHubContent />
    </HydrationBoundary>
  );
}
