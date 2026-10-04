import { ApiError } from "@paws/sdk";
import { queryOptions } from "@tanstack/react-query";
import { getApiClient } from "./client";

export const apiQueryKeys = {
  all: ["api"] as const,
  health: () => [...apiQueryKeys.all, "health"] as const,
};

export function healthQueryOptions() {
  return queryOptions({
    queryKey: apiQueryKeys.health(),
    queryFn: async () => {
      const response = await getApiClient().rpc.health.$get();
      if (!response.ok) {
        throw new ApiError(`Health check failed with status ${response.status}`, {
          status: response.status,
          code: `HTTP_${response.status}`,
        });
      }
      return response.json();
    },
    staleTime: 30_000,
  });
}
