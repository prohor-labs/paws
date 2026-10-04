const GET_METHOD = "GET";

function resolveMethod(input: RequestInfo | URL, init?: RequestInit): string {
  if (init?.method) {
    return init.method.toUpperCase();
  }
  if (typeof input === "object" && input !== null && "method" in input) {
    return (input as Request).method.toUpperCase();
  }
  return GET_METHOD;
}

function resolveUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") {
    return input;
  }
  if (input instanceof URL) {
    return input.toString();
  }
  return input.url;
}

export function createDedupedFetch(baseFetch: typeof fetch = fetch): typeof fetch {
  const inFlight = new Map<string, Promise<Response>>();

  return (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    if (resolveMethod(input, init) !== GET_METHOD) {
      return baseFetch(input, init);
    }

    const key = resolveUrl(input);
    const existing = inFlight.get(key);
    if (existing) {
      return existing.then((response) => response.clone());
    }

    const request = baseFetch(input, init);
    inFlight.set(key, request);
    request
      .finally(() => {
        inFlight.delete(key);
      })
      .catch(() => undefined);

    return request.then((response) => response.clone());
  };
}
