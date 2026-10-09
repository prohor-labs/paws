# Graph Report - paws.academy  (2026-10-09)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 2078 nodes · 4284 edges · 119 communities (93 shown, 14 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 60 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1214a823`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- exam.controller.ts
- database/schema/relations.ts
- client/src/components/ui/button.tsx
- schema/qb.ts
- client/src/components/upgrade/upgrade-view.tsx
- AuthUser
- client/src/components/ui/field.tsx
- custom/page.tsx
- ApiClient
- billing.controller.ts
- ApiError
- client/src/components/ui/menubar.tsx
- client/src/components/features/onboarding/onboarding-wizard.tsx
- types/qb.ts
- upload.controller.ts
- client/src/hooks/use-question-bank.ts
- toBengaliNumber
- dependencies
- client/src/components/watch/watch-player-view.tsx
- api/client.ts
- scripts
- client/package.json
- client/src/components/exam/custom-exam-steps.tsx
- client/src/components/profile/profile-card.tsx
- app.module.ts
- client/src/lib/utils.ts
- client/src/components/shared/question-card.tsx
- client/src/components/ui/sidebar.tsx
- drizzle.service.ts
- biome.json
- DrizzleService
- @nestjs/common
- client/components.json
- server/package.json
- Authenticated
- compilerOptions
- react
- app/layout.tsx
- tasks
- components/auth/index.ts
- client/src/components/ui/questionnaire.tsx
- client/src/hooks/use-exam.ts
- session.guard.ts
- client/src/components/checkout/order-checkout-view.tsx
- cn
- billing/billing.service.ts
- qb.service.ts
- client/src/components/watch/channel-detail-view.tsx
- compilerOptions
- dependencies
- client/src/components/icons.tsx
- client/src/components/shared/responsive-dialog.tsx
- client/src/components/ui/combobox.tsx
- devDependencies
- client/src/components/ui/spinner.tsx
- list-card.tsx
- scripts
- class-variance-authority
- client/src/components/ui/carousel.tsx
- api-error.ts
- (landing)/page.tsx
- client/src/components/exam/written-answer-uploader.tsx
- client/src/components/ui/chart.tsx
- createApiClient
- client/src/components/ui/item.tsx
- api/index.ts
- auth/client.ts
- client/src/components/ui/attachment.tsx
- knip.json
- coupon-manage-dialog.tsx
- client/src/lib/consts/landing.ts
- client/src/components/shared/page-breadcrumbs.tsx
- client/src/components/ui/command.tsx
- client/src/components/ui/sheet.tsx
- qb.controller.ts
- devDependencies
- client/src/components/ui/navigation-menu.tsx
- AuthInstance
- client/src/app/api/[...all]/route.ts
- client/src/components/shared/grid-cover.tsx
- client/src/components/ui/input-group.tsx
- watch.controller.ts
- scripts
- client/src/components/ui/bubble.tsx
- client/src/components/ui/button-group.tsx
- client/src/components/ui/toggle-group.tsx
- .oxlintrc.json
- tsconfig.build.json
- client/src/components/landing/landing-faq.tsx
- client/src/components/shared/app-shell.tsx
- client/src/components/ui/input-otp.tsx
- client/src/components/ui/tabs.tsx
- client/src/proxy.ts
- nest-cli.json
- doctor.config.json
- client/src/components/exam/exam-result-summary.tsx
- client/src/components/ui/marker.tsx
- client/src/components/ui/resizable.tsx
- useIsMobile
- .handleAuth
- createDedupedFetch
- split-hsc-subjects.ts
- vite-tsconfig-paths
- client/postcss.config.mjs
- AGENTS.md Guidance
- { signIn, signUp, signOut, useSession, getSession }
- Root README

## God Nodes (most connected - your core abstractions)
1. `react` - 104 edges
2. `cn` - 60 edges
3. `ApiClient` - 49 edges
4. `Button()` - 45 edges
5. `toBengaliNumber()` - 41 edges
6. `@nestjs/common` - 36 edges
7. `AuthUser` - 35 edges
8. `ApiError` - 31 edges
9. `BillingService` - 26 edges
10. `Authenticated()` - 21 edges

## Surprising Connections (you probably didn't know these)
- `CustomExamStep1()` --calls--> `toBengaliNumber()`  [EXTRACTED]
  apps/client/src/components/exam/custom-exam-steps.tsx → apps/client/src/lib/utils.ts
- `CustomExamStep2()` --calls--> `toBengaliNumber()`  [EXTRACTED]
  apps/client/src/components/exam/custom-exam-steps.tsx → apps/client/src/lib/utils.ts
- `CustomExamStep4()` --calls--> `toBengaliNumber()`  [EXTRACTED]
  apps/client/src/components/exam/custom-exam-steps.tsx → apps/client/src/lib/utils.ts
- `StepHeader()` --calls--> `toBengaliNumber()`  [EXTRACTED]
  apps/client/src/components/exam/custom-exam-steps.tsx → apps/client/src/lib/utils.ts
- `QuestionHeader()` --calls--> `toBengaliNumber()`  [EXTRACTED]
  apps/client/src/components/shared/question-card.tsx → apps/client/src/lib/utils.ts

## Import Cycles
- None detected.

## Communities (119 total, 14 thin omitted)

### Community 0 - "exam.controller.ts"
Cohesion: 0.05
Nodes (33): Header(), ExamController, Body, Controller, Get, Param, Post, Query (+25 more)

### Community 1 - "database/schema/relations.ts"
Cohesion: 0.05
Nodes (50): account, session, user, verification, accountRelations, billingOrdersRelations, creditTransactionsRelations, dailyExplanationUsageRelations (+42 more)

### Community 2 - "client/src/components/ui/button.tsx"
Cohesion: 0.09
Nodes (33): metadata, metadata, CouponsView(), formatDate(), isExpired(), formatDate(), getQuickBadgeVariant(), getStatusLabel() (+25 more)

### Community 3 - "schema/qb.ts"
Cohesion: 0.09
Nodes (40): fetchQuestions(), main(), worker(), parseAndDeduplicateMetaTags(), ScrapedOption, ScrapedQuestion, fetchQuestions(), main() (+32 more)

### Community 4 - "client/src/components/upgrade/upgrade-view.tsx"
Cohesion: 0.05
Nodes (20): nextConfig, metadata, metadata, metadata, OrderCheckoutPageProps, metadata, metadata, metadata (+12 more)

### Community 5 - "AuthUser"
Cohesion: 0.13
Nodes (14): formatDuration(), AuthUser, CurrentUser, Body, Controller, Get, Param, Post (+6 more)

### Community 6 - "client/src/components/ui/field.tsx"
Cohesion: 0.08
Nodes (22): AuthFormFields(), AuthFormFieldsProps, AuthMethodToggle(), AuthMethodToggleProps, WrittenAnswerUploader(), StepProfile(), StepProfileProps, AppPreferences() (+14 more)

### Community 7 - "custom/page.tsx"
Cohesion: 0.09
Nodes (24): CustomExamPage(), CustomExamStep1, CustomExamStep2, CustomExamStep4, CustomExamStepStandard, QbHubContent(), QbTargetContent(), GridCard() (+16 more)

### Community 8 - "ApiClient"
Cohesion: 0.10
Nodes (32): ApiClient, AddonConfig, BillingConfigResponse, BillingOrderUser, BillingStatusResponse, CheckoutInput, CheckoutResponse, CreateCouponInput (+24 more)

### Community 9 - "billing.controller.ts"
Cohesion: 0.10
Nodes (32): PaginationQueryDto, IsInt, IsOptional, Max, Min, Type, CheckoutDto, checkoutSchema (+24 more)

### Community 10 - "ApiError"
Cohesion: 0.10
Nodes (5): ApiError, BillingService, Injectable, CouponInput, UpdateCouponInput

### Community 11 - "client/src/components/ui/menubar.tsx"
Cohesion: 0.09
Nodes (13): DropdownMenu(), DropdownMenuContent(), DropdownMenuGroup(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuPortal(), DropdownMenuRadioGroup(), DropdownMenuSeparator() (+5 more)

### Community 12 - "client/src/components/features/onboarding/onboarding-wizard.tsx"
Cohesion: 0.10
Nodes (23): metadata, OnboardingWizard(), LEVEL_ICONS, StepLevel(), StepLevelProps, StepReady(), StepSchedule(), StepScheduleProps (+15 more)

### Community 13 - "types/qb.ts"
Cohesion: 0.07
Nodes (30): CreateExamResult, CustomExamData, CustomExamSubmissionData, CustomExamWrittenSubmissionItem, QBChapterDetailData, QBContainer, QBContainerDetailData, QBContainerItem (+22 more)

### Community 14 - "upload.controller.ts"
Cohesion: 0.11
Nodes (20): buildObjectKey(), resolveUploadFolder(), sanitizeFilename(), PresignedUrlResult, StorageService, Injectable, UploadResult, PresignedUploadInput (+12 more)

### Community 15 - "client/src/hooks/use-question-bank.ts"
Cohesion: 0.13
Nodes (20): CustomExamSolveContent(), ExamResultSummary, SingleQuestionPage(), QbItemContent(), QbContainerContent(), EmptyState(), PageBreadcrumbs(), QuestionCard() (+12 more)

### Community 16 - "toBengaliNumber"
Cohesion: 0.11
Nodes (23): ActiveExamSession(), ActiveExamSessionProps, CustomExamTakePage(), ExamSubmittingOverlay, QuestionPaletteDialog, ExamBottomBar(), ExamBottomBarProps, QuestionPaletteDialog() (+15 more)

### Community 17 - "dependencies"
Cohesion: 0.07
Nodes (29): dependencies, @base-ui/react, better-auth, class-variance-authority, cmdk, cn, date-fns, disable-devtool (+21 more)

### Community 18 - "client/src/components/watch/watch-player-view.tsx"
Cohesion: 0.15
Nodes (23): ScrollArea(), Textarea(), ChannelDetailView(), WatchPlayerView(), useWatchChannel(), useWatchComments(), useWatchMutations(), useWatchPlaylist() (+15 more)

### Community 19 - "api/client.ts"
Cohesion: 0.11
Nodes (24): API_V1_PREFIX, ApiClientConfig, getPresignedUploadUrlRequest(), parseUploadResponse(), QueryParams, RequestOptions, uploadFileRequest(), UploadRequestOptions (+16 more)

### Community 20 - "scripts"
Cohesion: 0.07
Nodes (28): devDependencies, prettier, turbo, @types/bun, typescript, devEngines, packageManager, engines (+20 more)

### Community 21 - "client/package.json"
Cohesion: 0.08
Nodes (26): ignoreScripts, name, packageManager, private, trustedDependencies, version, RichText, RichTextProps (+18 more)

### Community 22 - "client/src/components/exam/custom-exam-steps.tsx"
Cohesion: 0.08
Nodes (22): CustomExamStep1(), CustomExamStep1Props, CustomExamStep2(), CustomExamStep2Props, CustomExamStep4(), CustomExamStep4Props, CustomExamStepStandardProps, DURATION_PRESETS (+14 more)

### Community 23 - "client/src/components/profile/profile-card.tsx"
Cohesion: 0.17
Nodes (14): StepReadyProps, QuickListProps, QuickListTag, SidebarFooter(), Avatar(), AvatarFallback(), AvatarImage(), Tooltip() (+6 more)

### Community 24 - "app.module.ts"
Cohesion: 0.09
Nodes (19): AppModule, Module, AuthModule, Global, Module, RolesGuard, Injectable, BillingModule (+11 more)

### Community 25 - "client/src/lib/utils.ts"
Cohesion: 0.16
Nodes (17): ActionSheet(), ActionSheetGroup, ActionSheetItem, ActionSheetProps, ShareSheet(), ShareSheetProps, PlaylistDetailView(), WatchCard() (+9 more)

### Community 26 - "client/src/components/shared/question-card.tsx"
Cohesion: 0.10
Nodes (22): DEFAULT_OPTION_KEYS, EvaluatedScriptItem, McqOptionsProps, QuestionAnswersProps, QuestionCardProps, QuestionExplanation(), QuestionHeader(), QuestionHeaderProps (+14 more)

### Community 27 - "client/src/components/ui/sidebar.tsx"
Cohesion: 0.09
Nodes (8): Sidebar(), SidebarContext, SidebarContextProps, SidebarMenuButton(), sidebarMenuButtonVariants, SidebarRail(), SidebarTrigger(), useSidebar()

### Community 28 - "drizzle.service.ts"
Cohesion: 0.13
Nodes (13): DRIZZLE, DRIZZLE_CLIENT, DatabaseModule, Global, Module, Database, env, isTrustedOrigin() (+5 more)

### Community 29 - "biome.json"
Cohesion: 0.08
Nodes (25): css, parser, files, ignoreUnknown, includes, formatter, enabled, indentStyle (+17 more)

### Community 30 - "DrizzleService"
Cohesion: 0.11
Nodes (13): DrizzleService, Inject, Injectable, dailyExplanationUsage, subscriptions, DHAKA_TIMEZONE, getDhakaDateString(), getDhakaNow() (+5 more)

### Community 31 - "@nestjs/common"
Cohesion: 0.14
Nodes (14): AUTH_INSTANCE, AuthController, Controller, AuthService, Injectable, AuthSessionResult, Public(), SessionGuard (+6 more)

### Community 32 - "client/components.json"
Cohesion: 0.08
Nodes (23): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+15 more)

### Community 33 - "server/package.json"
Cohesion: 0.09
Nodes (22): @types/node, author, description, prettier, license, name, private, type (+14 more)

### Community 34 - "Authenticated"
Cohesion: 0.21
Nodes (11): Authenticated(), Roles(), BillingController, Body, Controller, Get, Param, Post (+3 more)

### Community 35 - "compilerOptions"
Cohesion: 0.09
Nodes (22): compilerOptions, allowSyntheticDefaultImports, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, incremental, isolatedModules (+14 more)

### Community 36 - "react"
Cohesion: 0.15
Nodes (9): AppShell(), AuthGuard(), emptySubscribe(), Role, useMounted(), PageLoading(), PillTabItem, PillTabsProps (+1 more)

### Community 37 - "app/layout.tsx"
Cohesion: 0.13
Nodes (15): hindSiliguri, metadata, DisableDevtool(), ConfirmContext, ConfirmContextType, ConfirmOptions, ConfirmProvider(), getQueryClient() (+7 more)

### Community 38 - "tasks"
Cohesion: 0.09
Nodes (21): dependsOn, inputs, outputs, dependsOn, cache, cache, persistent, persistent (+13 more)

### Community 39 - "components/auth/index.ts"
Cohesion: 0.14
Nodes (11): metadata, AuthBackdrop(), LoginView(), PlusDivider(), PlusFrame(), SignInCard(), TrustStrip(), CUSTOMER_LOGOS (+3 more)

### Community 40 - "client/src/components/ui/questionnaire.tsx"
Cohesion: 0.12
Nodes (7): buttonVariants, Calendar(), QuestionnaireNext(), QuestionnairePrevious(), QuestionnaireSkip(), QuestionnaireSubmit(), react-day-picker

### Community 41 - "client/src/hooks/use-exam.ts"
Cohesion: 0.13
Nodes (17): apiQueryKeys, billingKeys, examKeys, qbKeys, healthQueryOptions(), api, getApiClient(), getPresignedUploadUrl() (+9 more)

### Community 42 - "session.guard.ts"
Cohesion: 0.20
Nodes (14): AUTHENTICATED_KEY, IS_PUBLIC_KEY, REQUEST_SESSION_KEY, REQUEST_USER_KEY, ROLES_KEY, toWebHeaders(), AuthSession, AuthSessionData (+6 more)

### Community 43 - "client/src/components/checkout/order-checkout-view.tsx"
Cohesion: 0.16
Nodes (15): formatDate(), getStatusBadge(), OrderManageDialog(), OrderManageDialogProps, OrderCheckoutView(), OrderCheckoutViewProps, PaymentMethod, CodeBlock() (+7 more)

### Community 45 - "billing/billing.service.ts"
Cohesion: 0.14
Nodes (17): billingOrders, coupons, creditTransactions, orderStatusEnum, planTypeEnum, subStatusEnum, transactionTypeEnum, userBatchAccess (+9 more)

### Community 46 - "qb.service.ts"
Cohesion: 0.11
Nodes (16): qbChapterSources, qbExamSheets, cleanAndFormatMathText(), MappableQuestion, MappableSource, MappableTopic, QBQuestionTypeValue, QBSourceGroupValue (+8 more)

### Community 47 - "client/src/components/watch/channel-detail-view.tsx"
Cohesion: 0.16
Nodes (12): metadata, VerifiedBadge(), PlaylistCard(), WatchFeed(), useWatchInfiniteFeed(), WatchFeedItem, WatchPlaylist, EMPTY_CHAPTERS (+4 more)

### Community 48 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 49 - "dependencies"
Cohesion: 0.11
Nodes (19): dependencies, @aws-sdk/client-s3, @aws-sdk/s3-request-presigner, better-auth, cheerio, class-transformer, class-validator, compression (+11 more)

### Community 50 - "client/src/components/icons.tsx"
Cohesion: 0.20
Nodes (10): PawsLogo(), emptySubscribe(), ThemeToggle(), ThemeToggleProps, AnimatedThemeToggler(), AnimatedThemeTogglerProps, getThemeTransitionClipPaths(), polygonCollapsed() (+2 more)

### Community 51 - "client/src/components/shared/responsive-dialog.tsx"
Cohesion: 0.16
Nodes (11): DialogContent(), Drawer(), DrawerContent(), DrawerContext, DrawerContextProps, DrawerDescription(), DrawerHeader(), DrawerTitle() (+3 more)

### Community 53 - "devDependencies"
Cohesion: 0.11
Nodes (18): devDependencies, drizzle-kit, @nestjs/cli, @nestjs/schematics, @nestjs/testing, oxlint, oxlint-tsgolint, prettier (+10 more)

### Community 54 - "client/src/components/ui/spinner.tsx"
Cohesion: 0.16
Nodes (9): AuthLogo(), AuthSubmitButton(), AuthSubmitButtonProps, OAuthButtons(), OAuthButtonsProps, AuthMode, SignInMethod, ExamSubmittingOverlayProps (+1 more)

### Community 55 - "list-card.tsx"
Cohesion: 0.19
Nodes (9): ListCardAction, ListCardMetaItem, ListCardProps, Badge(), badgeVariants, Card(), CardContent(), CardHeader() (+1 more)

### Community 57 - "scripts"
Cohesion: 0.12
Nodes (16): scripts, build, check-types, db:generate, db:migrate, dev, dev:https, format (+8 more)

### Community 58 - "class-variance-authority"
Cohesion: 0.15
Nodes (5): Alert(), alertVariants, EmptyMedia(), emptyMediaVariants, class-variance-authority

### Community 59 - "client/src/components/ui/carousel.tsx"
Cohesion: 0.17
Nodes (13): CarouselApi, CarouselContent(), CarouselContext, CarouselContextProps, CarouselItem(), CarouselNext(), CarouselOptions, CarouselPlugin (+5 more)

### Community 60 - "api-error.ts"
Cohesion: 0.20
Nodes (10): ApiErrorOptions, codeForStatus(), errorBody(), STATUS_CODES, AllExceptionsFilter, AppPipelineMiddleware, runMiddleware(), Injectable (+2 more)

### Community 61 - "(landing)/page.tsx"
Cohesion: 0.19
Nodes (7): LandingFaq(), LandingFooter(), LandingHeader(), LandingHero(), LandingStats(), LandingStory(), LandingSupporters()

### Community 62 - "client/src/components/exam/written-answer-uploader.tsx"
Cohesion: 0.19
Nodes (8): EvaluatedScriptItem, WrittenAnswerUploaderProps, WrittenPageItem, Dialog(), DialogDescription(), DialogHeader(), DialogTitle(), DialogTrigger()

### Community 63 - "client/src/components/ui/chart.tsx"
Cohesion: 0.19
Nodes (11): ChartConfig, ChartContext, ChartContextProps, ChartLegendContent(), ChartTooltipContent(), getPayloadConfigFromPayload(), INITIAL_DIMENSION, THEMES (+3 more)

### Community 64 - "createApiClient"
Cohesion: 0.29
Nodes (7): buildQuery(), createApiClient(), getDefaultApiUrl(), normalizeBaseUrl(), RequestCore, getServerApiClient(), resolveServerApiUrl()

### Community 66 - "client/src/components/ui/item.tsx"
Cohesion: 0.18
Nodes (4): Item(), ItemMedia(), itemMediaVariants, itemVariants

### Community 67 - "api/index.ts"
Cohesion: 0.17
Nodes (7): ApiError, ApiErrorOptions, ApiErrorResponse, ApiResponse, IdParam, PaginatedResponse, PaginationQuery

### Community 68 - "auth/client.ts"
Cohesion: 0.18
Nodes (11): AuthClient, AuthSession, AuthSessionData, AuthUser, AuthClient, AuthSession, AuthSessionData, AuthUser (+3 more)

### Community 69 - "client/src/components/ui/attachment.tsx"
Cohesion: 0.20
Nodes (4): Attachment(), AttachmentMedia(), attachmentMediaVariants, attachmentVariants

### Community 70 - "knip.json"
Cohesion: 0.17
Nodes (11): entry, next, project, entry, project, ignore, ignoreBinaries, $schema (+3 more)

### Community 71 - "coupon-manage-dialog.tsx"
Cohesion: 0.29
Nodes (8): CouponManageDialog(), CouponManageDialogProps, Label(), Switch(), useCreateCoupon(), useDeleteCoupon(), useUpdateCoupon(), Coupon

### Community 72 - "client/src/lib/consts/landing.ts"
Cohesion: 0.20
Nodes (9): LandingRoadmap(), FaqItem, LANDING_FAQS, LANDING_NAV_LINKS, LANDING_ROADMAP, LANDING_STATS, NavItem, RoadmapItem (+1 more)

### Community 73 - "client/src/components/shared/page-breadcrumbs.tsx"
Cohesion: 0.31
Nodes (9): BreadcrumbStep, PageBreadcrumbsProps, Breadcrumb(), BreadcrumbEllipsis(), BreadcrumbItem(), BreadcrumbLink(), BreadcrumbList(), BreadcrumbPage() (+1 more)

### Community 75 - "client/src/components/ui/sheet.tsx"
Cohesion: 0.18
Nodes (5): Sheet(), SheetContent(), SheetDescription(), SheetHeader(), SheetTitle()

### Community 76 - "qb.controller.ts"
Cohesion: 0.25
Nodes (6): Injectable, zodPipe(), ZodValidationPipe, bulkImportSchema, chapterQuerySchema, sourceTypeSchema

### Community 77 - "devDependencies"
Cohesion: 0.20
Nodes (10): devDependencies, babel-plugin-react-compiler, @biomejs/biome, shadcn, tailwindcss, @tailwindcss/postcss, @types/node, @types/react (+2 more)

### Community 80 - "AuthInstance"
Cohesion: 0.22
Nodes (5): AuthInstance, Inject, AuthRouteMiddleware, Inject, Injectable

### Community 81 - "client/src/app/api/[...all]/route.ts"
Cohesion: 0.22
Nodes (7): DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT

### Community 82 - "client/src/components/shared/grid-cover.tsx"
Cohesion: 0.33
Nodes (8): getBasePalette(), getCoverTheme(), GridCover(), GridCoverProps, PaletteTheme, resolveCoverContent(), resolveStyle(), VariantStyle

### Community 83 - "client/src/components/ui/input-group.tsx"
Cohesion: 0.28
Nodes (6): InputGroup(), InputGroupAddon(), inputGroupAddonVariants, InputGroupButton(), inputGroupButtonVariants, InputGroupInput()

### Community 85 - "watch.controller.ts"
Cohesion: 0.42
Nodes (7): CreateWatchCommentDto, createWatchCommentSchema, feedQuerySchema, WatchInteractionDto, watchInteractionSchema, WatchProgressDto, watchProgressSchema

### Community 86 - "scripts"
Cohesion: 0.25
Nodes (8): scripts, build, check-types, dev, dev:https, format, lint, start

### Community 87 - "client/src/components/ui/bubble.tsx"
Cohesion: 0.38
Nodes (4): Bubble(), BubbleReactions(), bubbleReactionsVariants, bubbleVariants

### Community 88 - "client/src/components/ui/button-group.tsx"
Cohesion: 0.38
Nodes (3): ButtonGroup(), buttonGroupVariants, Separator()

### Community 92 - "client/src/components/ui/toggle-group.tsx"
Cohesion: 0.43
Nodes (4): ToggleGroupContext, ToggleGroupItem(), Toggle(), toggleVariants

### Community 93 - ".oxlintrc.json"
Cohesion: 0.29
Nodes (6): env, node, rules, typescript/no-explicit-any, typescript/no-floating-promises, $schema

### Community 94 - "tsconfig.build.json"
Cohesion: 0.29
Nodes (6): compilerOptions, rootDir, exclude, extends, include, ./tsconfig.json

### Community 95 - "client/src/components/landing/landing-faq.tsx"
Cohesion: 0.60
Nodes (4): Accordion(), AccordionContent(), AccordionItem(), AccordionTrigger()

### Community 96 - "client/src/components/shared/app-shell.tsx"
Cohesion: 0.33
Nodes (4): AppSidebar(), MobileNav(), SidebarInset(), SidebarProvider()

### Community 100 - "client/src/proxy.ts"
Cohesion: 0.33
Nodes (4): ALLOWED_BOT_PATTERNS, BLOCKED_SCRAPER_PATTERNS, config, middleware

### Community 101 - "nest-cli.json"
Cohesion: 0.33
Nodes (5): collection, compilerOptions, deleteOutDir, $schema, sourceRoot

### Community 102 - "doctor.config.json"
Cohesion: 0.33
Nodes (5): ignore, files, rules, react-doctor/nextjs-no-client-side-redirect, $schema

### Community 103 - "client/src/components/exam/exam-result-summary.tsx"
Cohesion: 0.50
Nodes (4): ExamResultSummary(), ExamResultSummaryProps, ExamSolveFilter, formatDuration()

### Community 106 - "useIsMobile"
Cohesion: 0.70
Nodes (4): getServerSnapshot(), getSnapshot(), subscribe(), useIsMobile()

### Community 107 - ".handleAuth"
Cohesion: 0.50
Nodes (3): All, Res, Req

### Community 109 - "createDedupedFetch"
Cohesion: 0.83
Nodes (3): createDedupedFetch(), resolveMethod(), resolveUrl()

## Knowledge Gaps
- **550 isolated node(s):** `ExamResultSummaryProps`, `StepLevelProps`, `StepScheduleProps`, `StepSubjectsProps`, `WizardFooterProps` (+545 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 923 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `@types/node` connect `server/package.json` to `client/package.json`?**
  _High betweenness centrality (0.290) - this node is a cross-community bridge._
- **Why does `react` connect `react` to `client/src/components/ui/button.tsx`, `client/src/components/upgrade/upgrade-view.tsx`, `client/src/components/ui/field.tsx`, `custom/page.tsx`, `client/src/components/ui/menubar.tsx`, `client/src/components/features/onboarding/onboarding-wizard.tsx`, `client/src/hooks/use-question-bank.ts`, `toBengaliNumber`, `client/src/components/watch/watch-player-view.tsx`, `client/package.json`, `client/src/components/exam/custom-exam-steps.tsx`, `client/src/components/profile/profile-card.tsx`, `client/src/lib/utils.ts`, `client/src/components/shared/question-card.tsx`, `client/src/components/ui/sidebar.tsx`, `app/layout.tsx`, `components/auth/index.ts`, `client/src/components/ui/questionnaire.tsx`, `client/src/components/checkout/order-checkout-view.tsx`, `cn`, `client/src/components/watch/channel-detail-view.tsx`, `client/src/components/icons.tsx`, `client/src/components/shared/responsive-dialog.tsx`, `client/src/components/ui/combobox.tsx`, `client/src/components/ui/spinner.tsx`, `list-card.tsx`, `client/src/components/ui/context-menu.tsx`, `class-variance-authority`, `client/src/components/ui/carousel.tsx`, `(landing)/page.tsx`, `client/src/components/exam/written-answer-uploader.tsx`, `client/src/components/ui/chart.tsx`, `client/src/components/ui/alert-dialog.tsx`, `client/src/components/ui/item.tsx`, `client/src/components/ui/attachment.tsx`, `coupon-manage-dialog.tsx`, `client/src/components/shared/page-breadcrumbs.tsx`, `client/src/components/ui/command.tsx`, `client/src/components/ui/sheet.tsx`, `client/src/components/ui/select.tsx`, `client/src/components/ui/input-group.tsx`, `client/src/components/ui/table.tsx`, `client/src/components/ui/bubble.tsx`, `client/src/components/ui/message.tsx`, `client/src/components/ui/message-scroller.tsx`, `client/src/components/ui/popover.tsx`, `client/src/components/ui/toggle-group.tsx`, `client/src/components/shared/app-shell.tsx`, `client/src/components/ui/input-otp.tsx`, `client/src/components/ui/marker.tsx`, `useIsMobile`?**
  _High betweenness centrality (0.287) - this node is a cross-community bridge._
- **Why does `@nestjs/common` connect `@nestjs/common` to `exam.controller.ts`, `server/package.json`, `database/schema/relations.ts`, `schema/qb.ts`, `AuthUser`, `billing.controller.ts`, `session.guard.ts`, `qb.controller.ts`, `billing/billing.service.ts`, `api-error.ts`, `qb.service.ts`, `AuthInstance`, `upload.controller.ts`, `watch.controller.ts`, `app.module.ts`, `drizzle.service.ts`, `DrizzleService`?**
  _High betweenness centrality (0.209) - this node is a cross-community bridge._
- **What connects `ExamResultSummaryProps`, `StepLevelProps`, `StepScheduleProps` to the rest of the system?**
  _550 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `exam.controller.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.054244306418219465 - nodes in this community are weakly interconnected._
- **Should `database/schema/relations.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05117845117845118 - nodes in this community are weakly interconnected._
- **Should `client/src/components/ui/button.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0898989898989899 - nodes in this community are weakly interconnected._