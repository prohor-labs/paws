import { Body, Controller, Get, Header, Param, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../../core/auth/decorators/current-user.decorator.js';
import type { AuthUser } from '../../core/auth/auth.types.js';
import { zodPipe } from '../../core/pipes/zod-validation.pipe.js';
import {
  type CreateCustomExamDto,
  createCustomExamSchema,
  type SolveCustomExamQueryDto,
  solveCustomExamQuerySchema,
  type SubmitCustomExamDto,
  submitCustomExamSchema,
} from './exam.dto.js';
import { ExamService } from './exam.service.js';

@Controller(['exam', 'qb'])
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  @Post('custom')
  async create(
    @CurrentUser() user: AuthUser | null,
    @Body(zodPipe(createCustomExamSchema)) body: CreateCustomExamDto,
  ) {
    const data = await this.examService.createCustomExam(body, user?.id ?? null);
    return { success: true, data };
  }

  @Get('custom/:id/take')
  @Header('Cache-Control', 'private, no-store')
  async take(@Param('id') examId: string) {
    const data = await this.examService.getTakeSession(examId);
    return { success: true, data };
  }

  @Post('custom/:id/submit')
  async submit(
    @Param('id') examId: string,
    @CurrentUser() user: AuthUser | null,
    @Body(zodPipe(submitCustomExamSchema)) body: SubmitCustomExamDto,
  ) {
    const data = await this.examService.submitCustomExam(examId, body, user?.id ?? null);
    return { success: true, data };
  }

  @Get('custom/:id/solve')
  @Header('Cache-Control', 'private, no-store')
  async solve(
    @Param('id') examId: string,
    @Query(zodPipe(solveCustomExamQuerySchema)) query: SolveCustomExamQueryDto,
  ) {
    const data = await this.examService.getSolution(examId, query.submissionId);
    return { success: true, data };
  }
}
