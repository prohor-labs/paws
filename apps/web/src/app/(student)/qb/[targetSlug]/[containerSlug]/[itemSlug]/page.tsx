import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { qbItemQueryOptions } from "@/lib/qb/query-options";
import { getServerQueryClient } from "@/lib/query/server-query-client";
import { QbItemContent } from "./qb-item-content";

export default async function QBItemPage({
  params,
}: {
  params: Promise<{ targetSlug: string; containerSlug: string; itemSlug: string }>;
}) {
  const { targetSlug, containerSlug, itemSlug } = await params;
  const queryClient = getServerQueryClient();
  await queryClient
    .prefetchQuery(qbItemQueryOptions(targetSlug, containerSlug, itemSlug))
    .catch(() => undefined);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <QbItemContent />
    </HydrationBoundary>
  );
}
