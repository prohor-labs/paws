import type { Request } from 'express';

export function toWebHeaders(request: Request): Headers {
  const headers = new Headers();
  const rawHeaders = request.rawHeaders as string[];
  for (let index = 0; index < rawHeaders.length; index += 2) {
    headers.append(rawHeaders[index], rawHeaders[index + 1]);
  }
  return headers;
}
