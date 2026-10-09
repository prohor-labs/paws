import { All, Controller, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { Public } from './decorators/public.decorator.js';
import { AuthService } from './auth.service.js';
import { env } from '../../common/env.js';

@Public()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @All('*')
  async handleAuth(@Req() req: Request, @Res() res: Response): Promise<void> {
    try {
      const baseURL = env.betterAuthUrl.replace(/\/+$/, '');
      const rawPath = req.originalUrl.startsWith('/api/v1/auth')
        ? req.originalUrl
        : `/api/v1/auth${req.originalUrl.replace(/^\/api\/auth/, '')}`;
      const url = `${baseURL}${rawPath}`;

      const headers = new Headers();
      for (const [key, value] of Object.entries(req.headers)) {
        if (Array.isArray(value)) {
          for (const v of value) headers.append(key, v);
        } else if (typeof value === 'string') {
          headers.set(key, value);
        }
      }

      const init: RequestInit = {
        method: req.method,
        headers,
      };

      if (req.method !== 'GET' && req.method !== 'HEAD') {
        if (typeof req.body === 'object' && req.body !== null) {
          init.body = JSON.stringify(req.body);
        } else if (typeof req.body === 'string') {
          init.body = req.body;
        }
      }

      const authReq = new globalThis.Request(url, init);
      const authRes = await this.authService.instance.handler(authReq);

      res.status(authRes.status);
      authRes.headers.forEach((val, key) => {
        if (key.toLowerCase() !== 'content-encoding' && key.toLowerCase() !== 'transfer-encoding') {
          res.setHeader(key, val);
        }
      });

      const setCookies = authRes.headers.getSetCookie ? authRes.headers.getSetCookie() : [];
      if (setCookies.length > 0) {
        res.setHeader('Set-Cookie', setCookies);
      }

      const text = await authRes.text();
      res.send(text);
    } catch (err) {
      console.error('[AuthController Error]:', err);
      res.status(500).json({ error: 'Authentication internal error', message: String(err) });
    }
  }
}
