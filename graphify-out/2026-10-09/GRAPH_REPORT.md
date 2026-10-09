# Graph Report - paws.academy  (2026-10-08)

## Corpus Check
- 192 files · ~338,046 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1900 nodes · 3312 edges · 165 communities (89 shown, 19 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 17 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- api/src/index.ts
- relations.ts
- qb.route.ts
- question-card.tsx
- responsive-dialog.tsx
- sidebar.tsx
- rpc-pattern.ts
- sdk/package.json
- custom-exam-steps.tsx
- upload.route.ts
- menubar.tsx
- toBengaliNumber
- step-profile.tsx
- dependencies
- types/qb.ts
- combobox.tsx
- sign-in-card.tsx
- cn
- client/errors.ts
- shared/index.ts
- biome.json
- field.tsx
- use-watch.ts
- components.json
- react
- next
- use-question-bank.ts
- web/package.json
- tasks
- validation-zod.ts
- assemble-19-20.ts
- questionnaire.tsx
- db/index.ts
- item.tsx
- compilerOptions
- packages/sdk/src/client/rpc.ts
- client/qb.ts
- utils.ts
- packages/sdk/src/client/api-client.ts
- PageLoading
- share-sheet.tsx
- compilerOptions
- middleware-composition.ts
- app/layout.tsx
- [subSlug]/page.tsx
- qb-target-content.tsx
- templates/package.json
- validation-valibot.ts
- take/page.tsx
- assemble_bup_fsss_15_16.ts
- assemble_bup_fsss_17_18.ts
- sync-exam.ts
- compilerOptions
- carousel.tsx
- chart.tsx
- knip.json
- error-handling.ts
- spinner.tsx
- topic-wise-view.tsx
- class-variance-authority
- button.tsx
- attachment.tsx
- dependencies
- page-breadcrumbs.tsx
- theme-toggle.tsx
- client/auth.ts
- devDependencies
- navigation-menu.tsx
- scripts
- optionalDependencies
- api/package.json
- build-explanations.ts
- validate-processed.ts
- route.ts
- grid-cover.tsx
- package.json
- exam.ts
- storage.service.ts
- scripts
- empty.tsx
- types/watch.ts
- routing-patterns.ts
- rich-text.tsx
- bubble.tsx
- context-extension.ts
- scripts
- alert.tsx
- input-otp.tsx
- tabs.tsx
- proxy.ts
- doctor.config.json
- scripts
- resizable.tsx
- devDependencies
- devDependencies
- devDependencies
- packageManager
- check-versions.sh
- engines
- bup_fst_25_26/part5.py
- Web AGENTS.md
- Web DESIGN.md
- postcss.config.mjs
- AGENTS.md Guidance
- API README
- { signIn, signUp, signOut, useSession, getSession }
- Chorcha Migration Doc
- Root README

## God Nodes (most connected - your core abstractions)
1. `react` - 95 edges
2. `cn` - 60 edges
3. `Button()` - 37 edges
4. `toBengaliNumber()` - 34 edges
5. `class-variance-authority` - 17 edges
6. `compilerOptions` - 16 edges
7. `compilerOptions` - 16 edges
8. `ApiError` - 15 edges
9. `getDefaultApiUrl()` - 15 edges
10. `normalizeBaseUrl()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `ActiveExamSession()` --calls--> `toBengaliNumber()`  [EXTRACTED]
  apps/web/src/app/(student)/exam/[id]/take/page.tsx → apps/web/src/lib/utils.ts
- `WrittenAnswerUploader()` --calls--> `toBengaliNumber()`  [EXTRACTED]
  apps/web/src/components/exam/written-answer-uploader.tsx → apps/web/src/lib/utils.ts
- `EditProfileDialog()` --calls--> `updateUser()`  [EXTRACTED]
  apps/web/src/components/profile/edit-profile-dialog.tsx → apps/web/src/lib/sdk/client.ts
- `healthQueryOptions()` --calls--> `getApiClient()`  [EXTRACTED]
  apps/web/src/lib/sdk/queries.ts → apps/web/src/lib/sdk/client.ts
- `QbItemContent()` --calls--> `useQBItemDetail()`  [EXTRACTED]
  apps/web/src/app/(student)/qb/[targetSlug]/[containerSlug]/[itemSlug]/qb-item-content.tsx → apps/web/src/hooks/use-question-bank.ts

## Import Cycles
- None detected.

## Communities (165 total, 19 thin omitted)

### Community 0 - "api/src/index.ts"
Cohesion: 0.05
Nodes (49): closeDatabase(), ALLOWED_METHODS, ApiRoutesType, app, AppType, Auth, authApp, ApiRoutes (+41 more)

### Community 1 - "relations.ts"
Cohesion: 0.06
Nodes (47): account, session, user, verification, accountRelations, qbChapterSourcesRelations, qbChaptersRelations, qbContainerItemsRelations (+39 more)

### Community 2 - "qb.route.ts"
Cohesion: 0.08
Nodes (44): cleanSolutionText(), decodeChorcha(), fetchChorchaExam(), imageCache, migrateImagesInText(), S3_PUBLIC_URL, s3Client, sanitizeRichText() (+36 more)

### Community 3 - "question-card.tsx"
Cohesion: 0.06
Nodes (32): LandingFaq(), LandingFooter(), LandingHeader(), LandingHero(), LandingRoadmap(), LandingStats(), LandingStory(), LandingSupporters() (+24 more)

### Community 4 - "responsive-dialog.tsx"
Cohesion: 0.07
Nodes (20): EvaluatedScriptItem, WrittenAnswerUploaderProps, WrittenPageItem, Dialog(), DialogContent(), DialogDescription(), DialogHeader(), DialogTitle() (+12 more)

### Community 5 - "sidebar.tsx"
Cohesion: 0.06
Nodes (18): Sheet(), SheetContent(), SheetDescription(), SheetHeader(), SheetTitle(), Sidebar(), SidebarContext, SidebarContextProps (+10 more)

### Community 6 - "rpc-pattern.ts"
Cohesion: 0.06
Nodes (28): client, postsClient, searchClient, UsersComponent(), app, AppType, commentsApp, CommentsType (+20 more)

### Community 7 - "sdk/package.json"
Cohesion: 0.06
Nodes (37): dependencies, better-auth, hono, zod, description, devDependencies, tsdown, @types/node (+29 more)

### Community 8 - "custom-exam-steps.tsx"
Cohesion: 0.08
Nodes (24): CustomExamStep1Props, CustomExamStep2Props, CustomExamStep4Props, CustomExamStepStandardProps, DURATION_PRESETS, EXAM_STANDARDS, ExamStandardOption, ExamStandardType (+16 more)

### Community 9 - "upload.route.ts"
Cohesion: 0.11
Nodes (17): ApiError, ApiErrorOptions, codeForStatus(), STATUS_CODES, buildObjectKey(), resolveUploadFolder(), sanitizeFilename(), attachSession (+9 more)

### Community 10 - "menubar.tsx"
Cohesion: 0.09
Nodes (13): DropdownMenu(), DropdownMenuContent(), DropdownMenuGroup(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuPortal(), DropdownMenuRadioGroup(), DropdownMenuSeparator() (+5 more)

### Community 11 - "toBengaliNumber"
Cohesion: 0.11
Nodes (23): QbItemContent(), CustomExamStep1(), CustomExamStep2(), CustomExamStep4(), StepHeader(), ExamBottomBar(), ExamBottomBarProps, ExamResultSummary() (+15 more)

### Community 12 - "step-profile.tsx"
Cohesion: 0.14
Nodes (17): StepProfileProps, StepReadyProps, AppSidebar(), MobileNav(), Header(), SidebarFooter(), Avatar(), AvatarFallback() (+9 more)

### Community 13 - "dependencies"
Cohesion: 0.07
Nodes (30): dependencies, @base-ui/react, class-variance-authority, cmdk, cn, date-fns, disable-devtool, embla-carousel-react (+22 more)

### Community 14 - "types/qb.ts"
Cohesion: 0.07
Nodes (28): CustomExamData, CustomExamSubmissionData, CustomExamWrittenSubmissionItem, QBChapter, QBContainer, QBContainerDetailData, QBContainerItem, QBExamSheet (+20 more)

### Community 15 - "combobox.tsx"
Cohesion: 0.09
Nodes (7): InputGroupAddon(), inputGroupAddonVariants, InputGroupButton(), inputGroupButtonVariants, InputGroupInput(), Textarea(), @base-ui/react

### Community 16 - "sign-in-card.tsx"
Cohesion: 0.11
Nodes (16): metadata, AuthLogo(), AuthBackdrop(), LoginView(), OAuthButtons(), OAuthButtonsProps, PlusDivider(), PlusFrame() (+8 more)

### Community 18 - "client/errors.ts"
Cohesion: 0.10
Nodes (15): ApiErrorOptions, isApiError(), idParamSchema, paginationQuerySchema, healthResponseSchema, FOLDER_PATTERN, presignedUploadSchema, createWatchCommentSchema (+7 more)

### Community 19 - "shared/index.ts"
Cohesion: 0.09
Nodes (15): AppPreferences(), EditProfileDialog, MenuItemProps, ConfirmDialog(), ConfirmDialogProps, ConfirmContext, ConfirmContextType, ConfirmOptions (+7 more)

### Community 20 - "biome.json"
Cohesion: 0.08
Nodes (25): css, parser, files, ignoreUnknown, includes, formatter, enabled, indentStyle (+17 more)

### Community 21 - "field.tsx"
Cohesion: 0.11
Nodes (13): AuthFormFields(), AuthFormFieldsProps, AuthMethodToggle(), AuthMethodToggleProps, AuthSubmitButton(), EditProfileDialogProps, Field(), FieldDescription() (+5 more)

### Community 22 - "use-watch.ts"
Cohesion: 0.19
Nodes (23): useWatchChannel(), useWatchComments(), useWatchInfiniteFeed(), useWatchMutations(), useWatchPlaylist(), useWatchVideo(), incrementVideoView(), postWatchComment() (+15 more)

### Community 23 - "components.json"
Cohesion: 0.08
Nodes (23): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+15 more)

### Community 24 - "react"
Cohesion: 0.14
Nodes (8): metadata, PawsLogo(), PlaylistCard(), WatchFeed(), GridCardProps, ResponsiveDialogProps, RichTextProps, react

### Community 25 - "next"
Cohesion: 0.09
Nodes (10): nextConfig, metadata, metadata, metadata, metadata, metadata, ChannelDetailView(), PlaylistDetailView() (+2 more)

### Community 26 - "use-question-bank.ts"
Cohesion: 0.18
Nodes (20): useCustomExamSolve(), useCustomExamTake(), useSubmitCustomExam(), useQBTree(), fetchQBChapter(), fetchQBContainer(), fetchQBItem(), fetchQBQuestion() (+12 more)

### Community 27 - "web/package.json"
Cohesion: 0.09
Nodes (21): ignoreScripts, name, packageManager, private, trustedDependencies, version, babel-plugin-react-compiler, @biomejs/biome (+13 more)

### Community 28 - "tasks"
Cohesion: 0.09
Nodes (21): dependsOn, inputs, outputs, dependsOn, cache, cache, persistent, persistent (+13 more)

### Community 29 - "validation-zod.ts"
Cohesion: 0.10
Nodes (20): addressSchema, app, batchCreateSchema, bodyDataSchema, contentSchema, customErrorSchema, eventSchema, formSchema (+12 more)

### Community 30 - "assemble-19-20.ts"
Cohesion: 0.13
Nodes (15): allExps, chById, cleanHtml(), customMap19_20, processed, raw, resolve(), taxonomy (+7 more)

### Community 31 - "questionnaire.tsx"
Cohesion: 0.12
Nodes (7): buttonVariants, Calendar(), QuestionnaireNext(), QuestionnairePrevious(), QuestionnaireSkip(), QuestionnaireSubmit(), react-day-picker

### Community 32 - "db/index.ts"
Cohesion: 0.16
Nodes (10): auth, client, db, client, db, env, isTrustedOrigin(), LOOPBACK_HOSTNAMES (+2 more)

### Community 33 - "item.tsx"
Cohesion: 0.13
Nodes (7): ButtonGroup(), buttonGroupVariants, Item(), ItemMedia(), itemMediaVariants, itemVariants, Separator()

### Community 34 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 35 - "packages/sdk/src/client/rpc.ts"
Cohesion: 0.23
Nodes (16): ApiClientConfig, getDefaultApiUrl(), normalizeBaseUrl(), createDedupedFetch(), resolveMethod(), resolveUrl(), API_V1_PREFIX, createRpcClient() (+8 more)

### Community 36 - "client/qb.ts"
Cohesion: 0.17
Nodes (9): QuestionBankClient, RpcClient, QBChapterDetailData, QBChapterQueryParams, QBHubData, QBItemDetailData, QBQuestion, QBTargetDetailData (+1 more)

### Community 37 - "utils.ts"
Cohesion: 0.25
Nodes (9): VerifiedBadge(), ScrollArea(), WatchCard(), WatchThumbnail(), EMPTY_WATCH_VIDEOS, formatBengaliCount(), formatBengaliRelativeTime(), getYouTubeThumbnailUrl() (+1 more)

### Community 38 - "packages/sdk/src/client/api-client.ts"
Cohesion: 0.25
Nodes (15): ApiClient, createApiClient(), withCredentialsFetch(), ApiError, ExamClient, getPresignedUploadUrl(), parseUploadResponse(), UploadEnvelope (+7 more)

### Community 39 - "PageLoading"
Cohesion: 0.14
Nodes (9): SingleQuestionPage(), QbContainerContent(), AppShell(), EmptyState(), GridCard(), PageBreadcrumbs(), PageLoading(), useQBContainerDetail() (+1 more)

### Community 40 - "share-sheet.tsx"
Cohesion: 0.20
Nodes (13): ActionSheet(), ActionSheetGroup, ActionSheetItem, ActionSheetProps, ShareSheet(), ShareSheetProps, useCopyToClipboard(), UseCopyToClipboardOptions (+5 more)

### Community 41 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, declaration, emitDeclarationOnly, esModuleInterop, isolatedModules, lib, module, moduleDetection (+9 more)

### Community 42 - "middleware-composition.ts"
Cohesion: 0.12
Nodes (5): app, Bindings, rateLimits, typedApp, Variables

### Community 43 - "app/layout.tsx"
Cohesion: 0.17
Nodes (11): hindSiliguri, metadata, DisableDevtool(), getQueryClient(), makeQueryClient(), QueryProvider(), ThemeProvider(), Toaster() (+3 more)

### Community 44 - "[subSlug]/page.tsx"
Cohesion: 0.16
Nodes (12): ExamResultSummary, QBSubSlugPage(), QuestionTypeFilter, useQBChapterDetail(), useQBItemDetail(), EMPTY_CHAPTERS, EMPTY_QUESTIONS, EMPTY_STRING_MAP (+4 more)

### Community 45 - "qb-target-content.tsx"
Cohesion: 0.18
Nodes (9): QbHubContent(), QbTargetContent(), useQBTargetDetail(), ICON_KEYWORDS, QB_TARGET_GROUP_LABELS, QB_TARGET_GROUPS, QBTargetGroupKey, chapterLevelLabel() (+1 more)

### Community 46 - "templates/package.json"
Cohesion: 0.12
Nodes (15): dependencies, hono, description, hono, zod, name, type, version (+7 more)

### Community 47 - "validation-valibot.ts"
Cohesion: 0.12
Nodes (15): addressSchema, app, batchCreateSchema, contentSchema, customErrorSchema, eventSchema, headerSchema, numericIdSchema (+7 more)

### Community 48 - "take/page.tsx"
Cohesion: 0.19
Nodes (11): CustomExamPage(), CustomExamStep1, CustomExamStep2, CustomExamStep4, CustomExamStepStandard, ActiveExamSession(), ActiveExamSessionProps, ExamSubmittingOverlay (+3 more)

### Community 50 - "assemble_bup_fsss_15_16.ts"
Cohesion: 0.19
Nodes (9): all, cleanHtml(), processed, raw, b1, b2, b3, b4 (+1 more)

### Community 51 - "assemble_bup_fsss_17_18.ts"
Cohesion: 0.19
Nodes (9): all, cleanHtml(), processed, raw, b1, b2, b3, b4 (+1 more)

### Community 52 - "sync-exam.ts"
Cohesion: 0.21
Nodes (12): importExamQuestionsToDb(), dumpExamQuestions(), ExamMetadata, extractExamIdFromUrl(), extractExamsFromPage(), extractSheetSlugFromUrl(), extractUnitsFromBundle(), importProcessedQuestions() (+4 more)

### Community 53 - "compilerOptions"
Cohesion: 0.13
Nodes (14): compilerOptions, jsx, jsxImportSource, module, moduleResolution, paths, skipLibCheck, strict (+6 more)

### Community 54 - "carousel.tsx"
Cohesion: 0.17
Nodes (13): CarouselApi, CarouselContent(), CarouselContext, CarouselContextProps, CarouselItem(), CarouselNext(), CarouselOptions, CarouselPlugin (+5 more)

### Community 55 - "chart.tsx"
Cohesion: 0.19
Nodes (11): ChartConfig, ChartContext, ChartContextProps, ChartLegendContent(), ChartTooltipContent(), getPayloadConfigFromPayload(), INITIAL_DIMENSION, THEMES (+3 more)

### Community 56 - "knip.json"
Cohesion: 0.14
Nodes (13): project, entry, next, project, ignore, ignoreBinaries, entry, project (+5 more)

### Community 57 - "error-handling.ts"
Cohesion: 0.15
Nodes (7): app, AuthenticationError, AuthorizationError, ErrorResponse, NotFoundError, userSchema, ValidationError

### Community 58 - "spinner.tsx"
Cohesion: 0.23
Nodes (6): AuthSubmitButtonProps, ExamSubmittingOverlayProps, AuthGuard(), emptySubscribe(), useMounted(), Spinner()

### Community 59 - "topic-wise-view.tsx"
Cohesion: 0.26
Nodes (11): getPageItems(), TopicWiseView(), TopicWiseViewProps, Pagination(), PaginationContent(), PaginationEllipsis(), PaginationItem(), PaginationLink() (+3 more)

### Community 61 - "class-variance-authority"
Cohesion: 0.22
Nodes (7): Marker(), markerVariants, ToggleGroupContext, ToggleGroupItem(), Toggle(), toggleVariants, class-variance-authority

### Community 63 - "attachment.tsx"
Cohesion: 0.20
Nodes (4): Attachment(), AttachmentMedia(), attachmentMediaVariants, attachmentVariants

### Community 64 - "dependencies"
Cohesion: 0.18
Nodes (11): dependencies, @aws-sdk/client-s3, @aws-sdk/s3-request-presigner, better-auth, drizzle-orm, hono, @hono/zod-validator, @paws/sdk (+3 more)

### Community 65 - "page-breadcrumbs.tsx"
Cohesion: 0.31
Nodes (9): BreadcrumbStep, PageBreadcrumbsProps, Breadcrumb(), BreadcrumbEllipsis(), BreadcrumbItem(), BreadcrumbLink(), BreadcrumbList(), BreadcrumbPage() (+1 more)

### Community 66 - "theme-toggle.tsx"
Cohesion: 0.29
Nodes (9): emptySubscribe(), ThemeToggle(), ThemeToggleProps, AnimatedThemeToggler(), AnimatedThemeTogglerProps, getThemeTransitionClipPaths(), polygonCollapsed(), TransitionVariant (+1 more)

### Community 67 - "client/auth.ts"
Cohesion: 0.24
Nodes (9): AuthClientConfig, createAuthClient(), DefaultAuthClient, getAuthClient(), updateUser(), AuthClient, AuthSession, AuthSessionData (+1 more)

### Community 68 - "devDependencies"
Cohesion: 0.20
Nodes (10): devDependencies, babel-plugin-react-compiler, @biomejs/biome, shadcn, tailwindcss, @tailwindcss/postcss, @types/node, @types/react (+2 more)

### Community 71 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, build, check-types, dev, dev:https, format, graphify, graphify:apps (+2 more)

### Community 72 - "optionalDependencies"
Cohesion: 0.22
Nodes (9): optionalDependencies, arktype, @hono/arktype-validator, @hono/typia-validator, @hono/valibot-validator, @hono/zod-validator, typia, valibot (+1 more)

### Community 73 - "api/package.json"
Cohesion: 0.22
Nodes (7): exports, hono, @hono/zod-validator, @paws/sdk, zod, name, drizzle-kit

### Community 74 - "build-explanations.ts"
Cohesion: 0.22
Nodes (6): chById, raw, taxonomy, tById, tBySlug, unmapped

### Community 75 - "validate-processed.ts"
Cohesion: 0.22
Nodes (6): byIndex, errors, inPath, processed, raw, rawPath

### Community 76 - "route.ts"
Cohesion: 0.22
Nodes (7): DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT

### Community 77 - "grid-cover.tsx"
Cohesion: 0.33
Nodes (8): getBasePalette(), getCoverTheme(), GridCover(), GridCoverProps, PaletteTheme, resolveCoverContent(), resolveStyle(), VariantStyle

### Community 79 - "package.json"
Cohesion: 0.22
Nodes (8): engines, node, @types/bun, name, private, workspaces, prettier, turbo

### Community 80 - "exam.ts"
Cohesion: 0.22
Nodes (5): CreateExamResult, SubmitExamResult, CreateCustomExamInput, CustomExamSolveData, CustomExamTakeData

### Community 81 - "storage.service.ts"
Cohesion: 0.25
Nodes (6): PresignedUrlResult, s3Client, storageService, UploadResult, @aws-sdk/client-s3, @aws-sdk/s3-request-presigner

### Community 82 - "scripts"
Cohesion: 0.25
Nodes (8): scripts, build, check-types, dev, dev:https, format, lint, start

### Community 84 - "types/watch.ts"
Cohesion: 0.25
Nodes (7): WatchChannel, WatchCommentItem, WatchFeedItem, WatchPlaylist, WatchUserInteraction, WatchUserProgress, WatchVideo

### Community 85 - "routing-patterns.ts"
Cohesion: 0.29
Nodes (6): admin, api, app, Bindings, typedApp, Variables

### Community 86 - "rich-text.tsx"
Cohesion: 0.29
Nodes (5): RichText, react-markdown, rehype-raw, remark-gfm, remark-math

### Community 87 - "bubble.tsx"
Cohesion: 0.38
Nodes (4): Bubble(), BubbleReactions(), bubbleReactionsVariants, bubbleVariants

### Community 89 - "context-extension.ts"
Cohesion: 0.40
Nodes (5): app, Bindings, getAuthenticatedUser(), requireAdmin(), Variables

### Community 90 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, build, check-types, db:generate, db:migrate, dev

### Community 95 - "proxy.ts"
Cohesion: 0.33
Nodes (4): ALLOWED_BOT_PATTERNS, BLOCKED_SCRAPER_PATTERNS, config, middleware

### Community 96 - "doctor.config.json"
Cohesion: 0.33
Nodes (5): ignore, files, rules, react-doctor/nextjs-no-client-side-redirect, $schema

### Community 97 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, start, type-check

### Community 99 - "devDependencies"
Cohesion: 0.40
Nodes (5): devDependencies, prettier, turbo, @types/bun, typescript

### Community 100 - "devDependencies"
Cohesion: 0.50
Nodes (4): devDependencies, tsx, @types/node, typescript

### Community 101 - "devDependencies"
Cohesion: 0.50
Nodes (4): devDependencies, drizzle-kit, @types/bun, typescript

### Community 103 - "packageManager"
Cohesion: 0.50
Nodes (4): devEngines, packageManager, name, version

## Knowledge Gaps
- **627 isolated node(s):** `StepLevelProps`, `StepScheduleProps`, `StepSubjectsProps`, `WizardFooterProps`, `WizardFormBodyProps` (+622 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1006 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `api/src/index.ts`, `question-card.tsx`, `responsive-dialog.tsx`, `sidebar.tsx`, `rpc-pattern.ts`, `custom-exam-steps.tsx`, `menubar.tsx`, `toBengaliNumber`, `step-profile.tsx`, `combobox.tsx`, `sign-in-card.tsx`, `cn`, `shared/index.ts`, `field.tsx`, `next`, `web/package.json`, `questionnaire.tsx`, `item.tsx`, `utils.ts`, `PageLoading`, `share-sheet.tsx`, `app/layout.tsx`, `[subSlug]/page.tsx`, `qb-target-content.tsx`, `take/page.tsx`, `context-menu.tsx`, `carousel.tsx`, `chart.tsx`, `spinner.tsx`, `topic-wise-view.tsx`, `alert-dialog.tsx`, `class-variance-authority`, `button.tsx`, `attachment.tsx`, `page-breadcrumbs.tsx`, `theme-toggle.tsx`, `select.tsx`, `table.tsx`, `rich-text.tsx`, `bubble.tsx`, `popover.tsx`, `alert.tsx`, `input-otp.tsx`?**
  _High betweenness centrality (0.206) - this node is a cross-community bridge._
- **Why does `@paws/sdk` connect `api/package.json` to `web/package.json`?**
  _High betweenness centrality (0.126) - this node is a cross-community bridge._
- **Why does `cn` connect `cn` to `api/src/index.ts`, `question-card.tsx`, `responsive-dialog.tsx`, `sidebar.tsx`, `custom-exam-steps.tsx`, `menubar.tsx`, `step-profile.tsx`, `combobox.tsx`, `field.tsx`, `web/package.json`, `questionnaire.tsx`, `item.tsx`, `utils.ts`, `context-menu.tsx`, `carousel.tsx`, `chart.tsx`, `spinner.tsx`, `topic-wise-view.tsx`, `alert-dialog.tsx`, `class-variance-authority`, `button.tsx`, `attachment.tsx`, `page-breadcrumbs.tsx`, `navigation-menu.tsx`, `select.tsx`, `table.tsx`, `empty.tsx`, `bubble.tsx`, `popover.tsx`, `alert.tsx`, `input-otp.tsx`, `progress.tsx`, `tabs.tsx`, `resizable.tsx`?**
  _High betweenness centrality (0.081) - this node is a cross-community bridge._
- **What connects `StepLevelProps`, `StepScheduleProps`, `StepSubjectsProps` to the rest of the system?**
  _627 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `api/src/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05076679005817028 - nodes in this community are weakly interconnected._
- **Should `relations.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05805515239477504 - nodes in this community are weakly interconnected._
- **Should `qb.route.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08163265306122448 - nodes in this community are weakly interconnected._