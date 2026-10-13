import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { sql } from 'drizzle-orm';
import { DrizzleService } from '../../common/database/drizzle.service.js';
import { Public } from '../../core/auth/decorators/public.decorator.js';

@Controller('health')
export class HealthController {
  constructor(private readonly db: DrizzleService) {}

  @Public()
  @Get()
  async check(@Res({ passthrough: true }) response: Response) {
    response.setHeader('Cache-Control', 'no-store');

    const result = await this.db.db.execute(sql`
      SELECT 
        (SELECT COUNT(DISTINCT user_id) FROM public.session WHERE expires_at > NOW()) AS online_users,
        (SELECT COUNT(*) FROM public.user) AS total_users,
        (SELECT COUNT(*) FROM public.qb_questions WHERE status = 'published') AS total_questions
    `);

    const row = ((result as unknown as Array<Record<string, unknown>>)[0] ?? {}) as {
      online_users?: string | number;
      total_users?: string | number;
      total_questions?: string | number;
    };

    const onlineUsers = Math.max(1, Number(row.online_users ?? 1));
    const totalUsers = Math.max(onlineUsers, Number(row.total_users ?? 1));
    const totalQuestions = Number(row.total_questions ?? 0);

    return {
      status: 'ok' as const,
      uptime: process.uptime(),
      onlineUsers,
      totalUsers,
      totalQuestions,
      timestamp: new Date().toISOString(),
    };
  }
}
