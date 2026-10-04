import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { qbContainerQueryOptions } from "@/lib/qb/query-options";
import { getServerQueryClient } from "@/lib/query/server-query-client";
import { QbContainerContent } from "./qb-container-content";

export default async function QBContainerPage({
  params,
}: {
  params: Promise<{ targetSlug: string; containerSlug: string }>;
}) {
  const { targetSlug, containerSlug } = await params;
  const queryClient = getServerQueryClient();
  await queryClient
    .prefetchQuery(qbContainerQueryOptions(targetSlug, containerSlug))
    .catch(() => undefined);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <QbContainerContent />
    </HydrationBoundary>
  );
}
