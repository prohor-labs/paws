import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../../core/auth/decorators/current-user.decorator.js';
import { Authenticated } from '../../core/auth/decorators/roles.decorator.js';
import type { AuthUser } from '../../core/auth/auth.types.js';
import { ApiError } from '../../common/errors/api-error.js';
import { zodPipe } from '../../core/pipes/zod-validation.pipe.js';
import {
  type CreateWatchCommentDto,
  createWatchCommentSchema,
  type FeedQueryDto,
  feedQuerySchema,
  type WatchInteractionDto,
  watchInteractionSchema,
  type WatchProgressDto,
  watchProgressSchema,
} from './watch.dto.js';
import { WatchService } from './watch.service.js';

@Controller('watch')
export class WatchController {
  constructor(private readonly watchService: WatchService) {}

  @Get('feed')
  feed(
    @CurrentUser() user: AuthUser | null,
    @Query(zodPipe(feedQuerySchema)) query: FeedQueryDto,
  ) {
    return this.watchService.getFeed(user, query);
  }

  @Get('videos/:id')
  video(@Param('id') id: string, @CurrentUser() user: AuthUser | null) {
    return this.watchService.getVideo(id, user);
  }

  @Get('channels/:handle')
  channel(@Param('handle') handle: string, @CurrentUser() user: AuthUser | null) {
    return this.watchService.getChannel(handle, user);
  }

  @Authenticated()
  @Post('channels/:handle/subscribe')
  subscribe(@Param('handle') handle: string, @CurrentUser() user: AuthUser | null) {
    if (!user) {
      throw ApiError.unauthorized();
    }
    return this.watchService.toggleSubscription(handle, user);
  }

  @Get('playlists/:slugOrId')
  playlist(@Param('slugOrId') slugOrId: string) {
    return this.watchService.getPlaylist(slugOrId);
  }

  @Post('videos/:id/view')
  registerView(@Param('id') id: string) {
    return this.watchService.registerView(id);
  }

  @Authenticated()
  @Post('videos/:id/progress')
  syncProgress(
    @Param('id') videoId: string,
    @CurrentUser() user: AuthUser | null,
    @Body(zodPipe(watchProgressSchema)) body: WatchProgressDto,
  ) {
    if (!user) {
      throw ApiError.unauthorized();
    }
    return this.watchService.syncProgress(videoId, user, body);
  }

  @Authenticated()
  @Post('videos/:id/interact')
  toggleInteraction(
    @Param('id') videoId: string,
    @CurrentUser() user: AuthUser | null,
    @Body(zodPipe(watchInteractionSchema)) body: WatchInteractionDto,
  ) {
    if (!user) {
      throw ApiError.unauthorized();
    }
    return this.watchService.toggleInteraction(videoId, user, body);
  }

  @Authenticated()
  @Get('library/saved')
  savedLibrary(@CurrentUser() user: AuthUser | null) {
    if (!user) {
      throw ApiError.unauthorized();
    }
    return this.watchService.getSavedLibrary(user);
  }

  @Get('videos/:id/comments')
  comments(@Param('id') videoId: string, @CurrentUser() user: AuthUser | null) {
    return this.watchService.getComments(videoId, user);
  }

  @Authenticated()
  @Post('videos/:id/comments')
  createComment(
    @Param('id') videoId: string,
    @CurrentUser() user: AuthUser | null,
    @Body(zodPipe(createWatchCommentSchema)) body: CreateWatchCommentDto,
  ) {
    if (!user) {
      throw ApiError.unauthorized();
    }
    return this.watchService.createComment(videoId, user, body);
  }

  @Authenticated()
  @Post('comments/:commentId/like')
  toggleCommentLike(
    @Param('commentId') commentId: string,
    @CurrentUser() user: AuthUser | null,
  ) {
    if (!user) {
      throw ApiError.unauthorized();
    }
    return this.watchService.toggleCommentLike(commentId, user);
  }
}
