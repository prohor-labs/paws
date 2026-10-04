export function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, "");
}

export function getDefaultApiUrl(): string {
  if (typeof window !== "undefined") {
    if (process.env.NEXT_PUBLIC_API_URL) {
      return normalizeBaseUrl(process.env.NEXT_PUBLIC_API_URL);
    }
    return normalizeBaseUrl(window.location.origin);
  }

  return (
    process.env.INTERNAL_API_URL ||
    process.env.API_INTERNAL_URL ||
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    ""
  );
}
