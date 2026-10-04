import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { qbTargetQueryOptions } from "@/lib/qb/query-options";
import { getServerQueryClient } from "@/lib/query/server-query-client";
import { QbTargetContent } from "./qb-target-content";

export default async function QBTargetPage({
  params,
}: {
  params: Promise<{ targetSlug: string }>;
}) {
  const { targetSlug } = await params;
  const queryClient = getServerQueryClient();
  await queryClient.prefetchQuery(qbTargetQueryOptions(targetSlug)).catch(() => undefined);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <QbTargetContent />
    </HydrationBoundary>
  );
}
