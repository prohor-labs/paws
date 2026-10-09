import { Body, Controller, Get, Header, Param, Post, Query } from '@nestjs/common';
import { zodPipe } from '../../core/pipes/zod-validation.pipe.js';
import { type BulkImportDto, bulkImportSchema, type ChapterQueryDto, chapterQuerySchema } from './qb.dto.js';
import { QbService } from './qb.service.js';

const CACHE_CONTROL_PUBLIC = 'no-cache, no-store, max-age=0, must-revalidate';

@Controller('qb')
export class QbController {
  constructor(private readonly qbService: QbService) {}

  @Get('recalculate')
  @Post('recalculate')
  recalculate() {
    return this.qbService.recalculate();
  }

  @Get('hub')
  @Header('Cache-Control', CACHE_CONTROL_PUBLIC)
  hub() {
    return this.qbService.getHub();
  }

  @Get('tree')
  @Header('Cache-Control', CACHE_CONTROL_PUBLIC)
  tree() {
    return this.qbService.getTree();
  }

  @Get('targets/:slug')
  @Header('Cache-Control', CACHE_CONTROL_PUBLIC)
  target(@Param('slug') slug: string) {
    return this.qbService.getTarget(slug);
  }

  @Get('targets/:targetSlug/containers/:containerSlug')
  @Header('Cache-Control', CACHE_CONTROL_PUBLIC)
  container(
    @Param('targetSlug') targetSlug: string,
    @Param('containerSlug') containerSlug: string,
  ) {
    return this.qbService.getContainer(targetSlug, containerSlug);
  }

  @Get('targets/:targetSlug/containers/:containerSlug/items/:itemSlug')
  @Header('Cache-Control', CACHE_CONTROL_PUBLIC)
  containerItem(
    @Param('targetSlug') targetSlug: string,
    @Param('containerSlug') containerSlug: string,
    @Param('itemSlug') itemSlug: string,
  ) {
    return this.qbService.getContainerItem(targetSlug, containerSlug, itemSlug);
  }

  @Get('subjects/:slug')
  @Header('Cache-Control', CACHE_CONTROL_PUBLIC)
  subject(@Param('slug') slug: string) {
    return this.qbService.getSubject(slug);
  }

  @Get('subjects/:subjectSlug/chapters/:chapterSlug')
  @Header('Cache-Control', CACHE_CONTROL_PUBLIC)
  chapter(
    @Param('subjectSlug') subjectSlug: string,
    @Param('chapterSlug') chapterSlug: string,
    @Query(zodPipe(chapterQuerySchema)) query: ChapterQueryDto,
  ) {
    return this.qbService.getChapterQuestions(subjectSlug, chapterSlug, query);
  }

  @Get('questions/:id')
  @Header('Cache-Control', CACHE_CONTROL_PUBLIC)
  question(@Param('id') id: string) {
    return this.qbService.getQuestion(id);
  }

  @Post('bulk-import')
  bulkImport(@Body(zodPipe(bulkImportSchema)) body: BulkImportDto) {
    return this.qbService.bulkImport(body);
  }
}
