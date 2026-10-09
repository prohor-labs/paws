import { queryOptions } from "@tanstack/react-query";
import { apiQueryKeys } from "./keys";
import { getApiClient } from "./singleton";

export function healthQueryOptions() {
  return queryOptions({
    queryKey: apiQueryKeys.health(),
    queryFn: () => getApiClient().health.check(),
    staleTime: 30_000,
  });
}
