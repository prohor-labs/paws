# Graph Report - paws.academy  (2026-10-06)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1628 nodes · 2853 edges · 119 communities (78 shown, 15 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 10 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `86651bd6`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- apps/sdk/src/client/api-client.ts
- api/src/index.ts
- schema/qb.ts
- sdk/package.json
- types/qb.ts
- schema/watch.ts
- apps/web/src/components/ui/menubar.tsx
- apps/web/src/components/auth/sign-in-card.tsx
- dependencies
- dependencies
- apps/web/src/components/features/onboarding/onboarding-wizard.tsx
- apps/web/src/components/ui/sidebar.tsx
- biome.json
- scripts
- custom/page.tsx
- apps/api/src/routes/qb.route.ts
- apps/web/components.json
- utils.ts
- tasks
- app/layout.tsx
- toBengaliNumber
- question-card.tsx
- apps/web/src/hooks/use-question-bank.ts
- use-watch.ts
- db/index.ts
- apps/web/src/components/shared/app-sidebar.tsx
- compilerOptions
- apps/web/src/components/exam/custom-exam-steps.tsx
- compilerOptions
- shared/index.ts
- apps/web/src/components/profile/edit-profile-dialog.tsx
- scrape-all-remaining-qb.ts
- apps/api/scripts/scrape-bup-qb.ts
- apps/api/scripts/scrape-engineering-qb.ts
- apps/web/src/components/shared/responsive-dialog.tsx
- apps/web/src/components/ui/questionnaire.tsx
- apps/web/src/lib/sdk/client.ts
- apps/web/src/components/ui/spinner.tsx
- apps/api/scripts/scrape-medical-qb.ts
- compilerOptions
- (landing)/page.tsx
- apps/web/src/components/icons.tsx
- apps/web/src/app/(student)/qb/[targetSlug]/[containerSlug]/[itemSlug]/qb-item-content.tsx
- apps/web/src/components/exam/written-answer-uploader.tsx
- apps/web/src/components/qb/topic-wise-view.tsx
- web/src/types/index.ts
- apps/web/src/components/ui/carousel.tsx
- knip.json
- apps/web/src/app/(student)/qb/qb-hub-content.tsx
- share-sheet.tsx
- apps/web/src/components/ui/chart.tsx
- apps/web/src/components/ui/item.tsx
- solve/page.tsx
- apps/web/src/components/features/onboarding/step-profile.tsx
- apps/web/src/components/ui/attachment.tsx
- apps/web/src/components/ui/field.tsx
- apps/web/src/components/shared/page-breadcrumbs.tsx
- apps/web/src/components/ui/input-group.tsx
- apps/web/src/components/ui/sheet.tsx
- devDependencies
- apps/web/src/components/ui/button.tsx
- apps/web/src/components/landing/landing-stats.tsx
- apps/web/src/components/shared/rich-text.tsx
- apps/web/src/components/shared/theme-toggle.tsx
- apps/web/src/components/ui/navigation-menu.tsx
- apps/web/src/app/api/[...all]/route.ts
- watch-feed.tsx
- apps/web/src/lib/consts/landing.ts
- web/package.json
- scripts
- apps/web/src/components/exam/exam-result-summary.tsx
- apps/web/src/components/ui/empty.tsx
- take/page.tsx
- apps/web/src/components/ui/bubble.tsx
- apps/web/src/components/ui/button-group.tsx
- apps/web/src/components/ui/toggle-group.tsx
- apps/web/src/app/(student)/qb/[targetSlug]/[containerSlug]/qb-container-content.tsx
- playlist-detail-view.tsx
- apps/web/src/components/ui/alert.tsx
- useIsMobile
- apps/web/src/components/ui/tabs.tsx
- apps/web/src/proxy.ts
- doctor.config.json
- apps/web/src/components/ui/marker.tsx
- apps/web/src/components/shared/pill-tabs.tsx
- dashboard/page.tsx
- apps/web/next.config.ts
- apps/web/postcss.config.mjs
- apps/api README
- apps/sdk README
- apps/web AGENTS.md
- apps/web README
- { signIn, signUp, signOut, useSession, getSession }

## God Nodes (most connected - your core abstractions)
1. `toBengaliNumber()` - 38 edges
2. `Button()` - 37 edges
3. `recalculateAllCounts()` - 17 edges
4. `compilerOptions` - 16 edges
5. `compilerOptions` - 16 edges
6. `ApiError` - 15 edges
7. `getDefaultApiUrl()` - 15 edges
8. `PageLoading()` - 15 edges
9. `normalizeBaseUrl()` - 14 edges
10. `db` - 14 edges

## Surprising Connections (you probably didn't know these)
- `QuestionHeader()` --calls--> `toBengaliNumber()`  [EXTRACTED]
  apps/web/src/components/shared/question-card.tsx → apps/web/src/lib/utils.ts
- `Calendar()` --calls--> `buttonVariants`  [EXTRACTED]
  apps/web/src/components/ui/calendar.tsx → apps/web/src/components/ui/button.tsx
- `ApiClientConfig` --references--> `RpcHeaders`  [EXTRACTED]
  apps/sdk/src/client/api-client.ts → apps/sdk/src/client/rpc.ts
- `ServerApiClientConfig` --references--> `RpcHeaders`  [EXTRACTED]
  apps/sdk/src/server/index.ts → apps/sdk/src/client/rpc.ts
- `app` --calls--> `isTrustedOrigin()`  [EXTRACTED]
  apps/api/src/index.ts → apps/api/src/lib/origins.ts

## Import Cycles
- None detected.

## Communities (119 total, 15 thin omitted)

### Community 0 - "apps/sdk/src/client/api-client.ts"
Cohesion: 0.05
Nodes (62): ApiClient, ApiClientConfig, createApiClient(), withCredentialsFetch(), AuthClientConfig, createAuthClient(), DefaultAuthClient, getAuthClient() (+54 more)

### Community 1 - "api/src/index.ts"
Cohesion: 0.06
Nodes (38): auth, closeDatabase(), client, db, ALLOWED_METHODS, ApiRoutesType, app, AppType (+30 more)

### Community 2 - "schema/qb.ts"
Cohesion: 0.05
Nodes (43): qbChapterSourcesRelations, qbChaptersRelations, QBChapterTable, qbContainerItemsRelations, QBContainerItemTable, qbContainersRelations, QBContainerTable, qbCustomExamQuestionsRelations (+35 more)

### Community 3 - "sdk/package.json"
Cohesion: 0.06
Nodes (37): dependencies, better-auth, hono, zod, description, devDependencies, tsdown, @types/node (+29 more)

### Community 4 - "types/qb.ts"
Cohesion: 0.05
Nodes (37): CreateCustomExamInput, CustomExamData, CustomExamSolveData, CustomExamSubmissionData, CustomExamTakeData, CustomExamWrittenSubmissionItem, QBChapter, QBChapterDetailData (+29 more)

### Community 5 - "schema/watch.ts"
Cohesion: 0.08
Nodes (31): determineCategory(), extractTags(), parseDurationToSeconds(), parseRelativeDate(), RawVideoItem, run(), account, accountRelations (+23 more)

### Community 6 - "apps/web/src/components/ui/menubar.tsx"
Cohesion: 0.09
Nodes (13): DropdownMenu(), DropdownMenuContent(), DropdownMenuGroup(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuPortal(), DropdownMenuRadioGroup(), DropdownMenuSeparator() (+5 more)

### Community 7 - "apps/web/src/components/auth/sign-in-card.tsx"
Cohesion: 0.10
Nodes (17): metadata, AuthFormFields(), AuthLogo(), AuthBackdrop(), LoginView(), OAuthButtons(), OAuthButtonsProps, PlusDivider() (+9 more)

### Community 8 - "dependencies"
Cohesion: 0.07
Nodes (29): dependencies, @base-ui/react, class-variance-authority, cmdk, cn, date-fns, embla-carousel-react, input-otp (+21 more)

### Community 9 - "dependencies"
Cohesion: 0.07
Nodes (26): dependencies, @aws-sdk/client-s3, @aws-sdk/s3-request-presigner, better-auth, drizzle-orm, hono, @hono/zod-validator, @paws/sdk (+18 more)

### Community 10 - "apps/web/src/components/features/onboarding/onboarding-wizard.tsx"
Cohesion: 0.12
Nodes (20): LEVEL_ICONS, StepLevel(), StepLevelProps, StepReady(), StepSchedule(), StepScheduleProps, StepSubjects(), StepSubjectsProps (+12 more)

### Community 11 - "apps/web/src/components/ui/sidebar.tsx"
Cohesion: 0.09
Nodes (9): Sidebar(), SidebarContext, SidebarContextProps, SidebarInset(), SidebarMenuButton(), sidebarMenuButtonVariants, SidebarRail(), SidebarTrigger() (+1 more)

### Community 12 - "biome.json"
Cohesion: 0.08
Nodes (25): css, parser, files, ignoreUnknown, includes, formatter, enabled, indentStyle (+17 more)

### Community 13 - "scripts"
Cohesion: 0.08
Nodes (25): devDependencies, prettier, turbo, typescript, devEngines, packageManager, engines, node (+17 more)

### Community 14 - "custom/page.tsx"
Cohesion: 0.11
Nodes (21): CustomExamPage(), CustomExamStep1, CustomExamStep2, CustomExamStep4, CustomExamStepStandard, ExamResultSummary, ExamSubmittingOverlay, CustomExamStep1Props (+13 more)

### Community 15 - "apps/api/src/routes/qb.route.ts"
Cohesion: 0.11
Nodes (21): CHAPTERS_CONFIG, isEnglishQuestion(), setupMedicalEnglish(), qbChapters, qbContainerItems, qbCustomExamQuestions, qbCustomExams, qbCustomExamSubmissions (+13 more)

### Community 16 - "apps/web/components.json"
Cohesion: 0.08
Nodes (23): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+15 more)

### Community 17 - "utils.ts"
Cohesion: 0.17
Nodes (13): metadata, metadata, VerifiedBadge(), ChannelDetailView(), WatchCard(), WatchPlayerView(), WatchThumbnail(), useWatchComments() (+5 more)

### Community 18 - "tasks"
Cohesion: 0.09
Nodes (21): dependsOn, inputs, outputs, dependsOn, cache, cache, persistent, persistent (+13 more)

### Community 19 - "app/layout.tsx"
Cohesion: 0.13
Nodes (14): hindSiliguri, metadata, ConfirmDialog(), ConfirmDialogProps, ConfirmContext, ConfirmContextType, ConfirmOptions, ConfirmProvider() (+6 more)

### Community 20 - "toBengaliNumber"
Cohesion: 0.15
Nodes (17): CustomExamStep1(), CustomExamStep2(), CustomExamStep4(), StepHeader(), ExamBottomBar(), ExamBottomBarProps, QuestionPaletteDialog(), QuestionPaletteDialogProps (+9 more)

### Community 21 - "question-card.tsx"
Cohesion: 0.14
Nodes (15): DEFAULT_OPTION_KEYS, EvaluatedScriptItem, McqOptionsProps, QuestionAnswersProps, QuestionCardProps, QuestionHeader(), QuestionHeaderProps, stripLeadingPartLabel() (+7 more)

### Community 22 - "apps/web/src/hooks/use-question-bank.ts"
Cohesion: 0.21
Nodes (19): useQBChapterDetail(), useQBHub(), fetchQBChapter(), fetchQBContainer(), fetchQBHub(), fetchQBItem(), fetchQBQuestion(), fetchQBTarget() (+11 more)

### Community 23 - "use-watch.ts"
Cohesion: 0.24
Nodes (19): useWatchChannel(), useWatchMutations(), incrementVideoView(), postWatchComment(), syncWatchProgress(), toggleChannelSubscription(), toggleCommentLike(), toggleWatchInteraction() (+11 more)

### Community 24 - "db/index.ts"
Cohesion: 0.18
Nodes (9): formatDatabase(), cleanHtml(), decodeChorcha(), restoreMedicalOptions(), client, db, qbQuestionOptions, qbQuestions (+1 more)

### Community 25 - "apps/web/src/components/shared/app-sidebar.tsx"
Cohesion: 0.21
Nodes (12): AppSidebar(), MobileNav(), Header(), SidebarFooter(), Tooltip(), TooltipContent(), TooltipProvider(), TooltipTrigger() (+4 more)

### Community 26 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 27 - "apps/web/src/components/exam/custom-exam-steps.tsx"
Cohesion: 0.12
Nodes (13): CustomExamStep2Props, CustomExamStep4Props, CustomExamStepStandardProps, DURATION_PRESETS, EXAM_STANDARDS, ExamStandardOption, MCQ_PRESETS, QUESTION_TYPE_OPTIONS (+5 more)

### Community 28 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, declaration, emitDeclarationOnly, esModuleInterop, isolatedModules, lib, module, moduleDetection (+9 more)

### Community 29 - "shared/index.ts"
Cohesion: 0.15
Nodes (9): metadata, AppShell(), AuthGuard(), emptySubscribe(), useMounted(), PageLoading(), TabItem, TabsWithSearch() (+1 more)

### Community 30 - "apps/web/src/components/profile/edit-profile-dialog.tsx"
Cohesion: 0.16
Nodes (11): OnboardingWizard(), AppPreferences(), EditProfileDialog, MenuItemProps, EditProfileDialog(), EditProfileDialogProps, ProfileCard(), useConfirm() (+3 more)

### Community 31 - "scrape-all-remaining-qb.ts"
Cohesion: 0.18
Nodes (15): ALL_TARGET_BANKS, BankConfig, cleanSolutionText(), decodeChorcha(), ensureContainerAndItem(), getNormalizedTag(), imageCache, isDummyOption() (+7 more)

### Community 32 - "apps/api/scripts/scrape-bup-qb.ts"
Cohesion: 0.18
Nodes (15): BUP_SERIES, BupSeriesConfig, cleanSolutionText(), decodeChorcha(), ensureBupContainerAndItems(), getNormalizedBupTag(), imageCache, isDummyOption() (+7 more)

### Community 33 - "apps/api/scripts/scrape-engineering-qb.ts"
Cohesion: 0.16
Nodes (15): cleanSolutionText(), decodeChorcha(), EngineeringSeriesConfig, imageCache, isDummyOption(), main(), migrateImagesInText(), S3_PUBLIC_URL (+7 more)

### Community 34 - "apps/web/src/components/shared/responsive-dialog.tsx"
Cohesion: 0.17
Nodes (10): DialogTrigger(), Drawer(), DrawerContent(), DrawerContext, DrawerContextProps, DrawerDescription(), DrawerHeader(), DrawerTitle() (+2 more)

### Community 35 - "apps/web/src/components/ui/questionnaire.tsx"
Cohesion: 0.15
Nodes (5): buttonVariants, QuestionnaireNext(), QuestionnairePrevious(), QuestionnaireSkip(), QuestionnaireSubmit()

### Community 37 - "apps/web/src/lib/sdk/client.ts"
Cohesion: 0.17
Nodes (14): Auth, WrittenAnswerUploader(), StepProfile(), AppApiClient, AuthClient, getApiClient(), getPresignedUploadUrl(), PresignedUploadRequest (+6 more)

### Community 38 - "apps/web/src/components/ui/spinner.tsx"
Cohesion: 0.17
Nodes (9): AuthFormFieldsProps, AuthMethodToggle(), AuthMethodToggleProps, AuthSubmitButton(), AuthSubmitButtonProps, ExamSubmittingOverlayProps, FieldGroup(), Input() (+1 more)

### Community 40 - "apps/api/scripts/scrape-medical-qb.ts"
Cohesion: 0.17
Nodes (13): decodeChorcha(), imageCache, main(), migrateImagesInText(), S3_PUBLIC_URL, s3Client, scrapeSeries(), SeriesConfig (+5 more)

### Community 41 - "compilerOptions"
Cohesion: 0.13
Nodes (14): compilerOptions, jsx, jsxImportSource, module, moduleResolution, paths, skipLibCheck, strict (+6 more)

### Community 42 - "(landing)/page.tsx"
Cohesion: 0.17
Nodes (8): LandingFaq(), LandingFooter(), LandingHeader(), LandingHero(), LandingRoadmap(), LandingStats(), LandingStory(), LandingSupporters()

### Community 44 - "apps/web/src/app/(student)/qb/[targetSlug]/[containerSlug]/[itemSlug]/qb-item-content.tsx"
Cohesion: 0.24
Nodes (9): QbItemContent(), QBSubSlugPage(), useCreateCustomExam(), useQBItemDetail(), EMPTY_CHAPTERS, EMPTY_QUESTIONS, EMPTY_TOPICS, EMPTY_WATCH_FEED_ITEMS (+1 more)

### Community 45 - "apps/web/src/components/exam/written-answer-uploader.tsx"
Cohesion: 0.20
Nodes (8): EvaluatedScriptItem, WrittenAnswerUploaderProps, WrittenPageItem, Dialog(), DialogContent(), DialogDescription(), DialogHeader(), DialogTitle()

### Community 46 - "apps/web/src/components/qb/topic-wise-view.tsx"
Cohesion: 0.23
Nodes (12): getPageItems(), QuestionTypeFilter, TopicWiseView(), TopicWiseViewProps, Pagination(), PaginationContent(), PaginationEllipsis(), PaginationItem() (+4 more)

### Community 47 - "web/src/types/index.ts"
Cohesion: 0.21
Nodes (11): getBasePalette(), getCoverTheme(), GridCover(), GridCoverProps, PaletteTheme, resolveCoverContent(), resolveStyle(), VariantStyle (+3 more)

### Community 48 - "apps/web/src/components/ui/carousel.tsx"
Cohesion: 0.19
Nodes (12): CarouselApi, CarouselContent(), CarouselContext, CarouselContextProps, CarouselItem(), CarouselNext(), CarouselOptions, CarouselPlugin (+4 more)

### Community 49 - "knip.json"
Cohesion: 0.14
Nodes (13): project, entry, project, entry, next, project, ignore, ignoreBinaries (+5 more)

### Community 50 - "apps/web/src/app/(student)/qb/qb-hub-content.tsx"
Cohesion: 0.26
Nodes (6): QbHubContent(), QbTargetContent(), useQBTargetDetail(), useQBTree(), EMPTY_SUBJECTS, subjectLevelLabel()

### Community 51 - "share-sheet.tsx"
Cohesion: 0.27
Nodes (10): ActionSheet(), ActionSheetGroup, ActionSheetItem, ActionSheetProps, ShareSheet(), ShareSheetProps, getAbsoluteShareUrl(), getSocialShareUrl() (+2 more)

### Community 53 - "apps/web/src/components/ui/chart.tsx"
Cohesion: 0.21
Nodes (10): ChartConfig, ChartContext, ChartContextProps, ChartLegendContent(), ChartTooltipContent(), getPayloadConfigFromPayload(), INITIAL_DIMENSION, THEMES (+2 more)

### Community 54 - "apps/web/src/components/ui/item.tsx"
Cohesion: 0.18
Nodes (4): Item(), ItemMedia(), itemMediaVariants, itemVariants

### Community 55 - "solve/page.tsx"
Cohesion: 0.23
Nodes (9): CustomExamSolveContent(), SingleQuestionPage(), EmptyState(), PageBreadcrumbs(), QuestionCard(), useQuestionOptionSelection(), useCustomExamSolve(), useQBQuestionDetail() (+1 more)

### Community 56 - "apps/web/src/components/features/onboarding/step-profile.tsx"
Cohesion: 0.30
Nodes (5): StepProfileProps, StepReadyProps, Avatar(), AvatarFallback(), AvatarImage()

### Community 57 - "apps/web/src/components/ui/attachment.tsx"
Cohesion: 0.20
Nodes (4): Attachment(), AttachmentMedia(), attachmentMediaVariants, attachmentVariants

### Community 58 - "apps/web/src/components/ui/field.tsx"
Cohesion: 0.20
Nodes (4): Field(), FieldDescription(), fieldVariants, Label()

### Community 59 - "apps/web/src/components/shared/page-breadcrumbs.tsx"
Cohesion: 0.31
Nodes (9): BreadcrumbStep, PageBreadcrumbsProps, Breadcrumb(), BreadcrumbEllipsis(), BreadcrumbItem(), BreadcrumbLink(), BreadcrumbList(), BreadcrumbPage() (+1 more)

### Community 60 - "apps/web/src/components/ui/input-group.tsx"
Cohesion: 0.24
Nodes (7): InputGroup(), InputGroupAddon(), inputGroupAddonVariants, InputGroupButton(), inputGroupButtonVariants, InputGroupInput(), Textarea()

### Community 61 - "apps/web/src/components/ui/sheet.tsx"
Cohesion: 0.18
Nodes (5): Sheet(), SheetContent(), SheetDescription(), SheetHeader(), SheetTitle()

### Community 62 - "devDependencies"
Cohesion: 0.20
Nodes (10): devDependencies, babel-plugin-react-compiler, @biomejs/biome, shadcn, tailwindcss, @tailwindcss/postcss, @types/node, @types/react (+2 more)

### Community 63 - "apps/web/src/components/ui/button.tsx"
Cohesion: 0.27
Nodes (4): EmptyStateProps, Button(), ButtonProps, Calendar()

### Community 64 - "apps/web/src/components/landing/landing-stats.tsx"
Cohesion: 0.29
Nodes (5): Card(), CardContent(), CardHeader(), CardTitle(), LANDING_STATS

### Community 65 - "apps/web/src/components/shared/rich-text.tsx"
Cohesion: 0.33
Nodes (7): CodeBlock(), convertHtmlTableToMarkdown(), preprocessRichContent(), RichText, useCopyToClipboard(), UseCopyToClipboardOptions, copyToClipboard()

### Community 66 - "apps/web/src/components/shared/theme-toggle.tsx"
Cohesion: 0.33
Nodes (8): emptySubscribe(), ThemeToggle(), ThemeToggleProps, AnimatedThemeToggler(), AnimatedThemeTogglerProps, getThemeTransitionClipPaths(), polygonCollapsed(), TransitionVariant

### Community 70 - "apps/web/src/app/api/[...all]/route.ts"
Cohesion: 0.22
Nodes (7): DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT

### Community 71 - "watch-feed.tsx"
Cohesion: 0.31
Nodes (4): metadata, PlaylistCard(), WatchFeed(), useWatchInfiniteFeed()

### Community 72 - "apps/web/src/lib/consts/landing.ts"
Cohesion: 0.25
Nodes (7): FaqItem, LANDING_FAQS, LANDING_NAV_LINKS, LANDING_ROADMAP, NavItem, RoadmapItem, StatCardItem

### Community 74 - "web/package.json"
Cohesion: 0.25
Nodes (7): ignoreScripts, name, packageManager, private, trustedDependencies, version, @paws/api

### Community 75 - "scripts"
Cohesion: 0.25
Nodes (8): scripts, build, check-types, dev, dev:https, format, lint, start

### Community 76 - "apps/web/src/components/exam/exam-result-summary.tsx"
Cohesion: 0.36
Nodes (6): ExamResultSummary(), ExamResultSummaryProps, ExamSolveFilter, formatDuration(), Badge(), badgeVariants

### Community 78 - "take/page.tsx"
Cohesion: 0.43
Nodes (6): ActiveExamSession(), ActiveExamSessionProps, CustomExamTakePage(), QuestionPaletteDialog, useCustomExamTake(), useSubmitCustomExam()

### Community 79 - "apps/web/src/components/ui/bubble.tsx"
Cohesion: 0.38
Nodes (4): Bubble(), BubbleReactions(), bubbleReactionsVariants, bubbleVariants

### Community 80 - "apps/web/src/components/ui/button-group.tsx"
Cohesion: 0.38
Nodes (3): ButtonGroup(), buttonGroupVariants, Separator()

### Community 84 - "apps/web/src/components/ui/toggle-group.tsx"
Cohesion: 0.43
Nodes (4): ToggleGroupContext, ToggleGroupItem(), Toggle(), toggleVariants

### Community 85 - "apps/web/src/app/(student)/qb/[targetSlug]/[containerSlug]/qb-container-content.tsx"
Cohesion: 0.47
Nodes (3): QbContainerContent(), GridCard(), useQBContainerDetail()

### Community 86 - "playlist-detail-view.tsx"
Cohesion: 0.47
Nodes (3): metadata, PlaylistDetailView(), useWatchPlaylist()

### Community 89 - "useIsMobile"
Cohesion: 0.53
Nodes (5): SidebarProvider(), getServerSnapshot(), getSnapshot(), subscribe(), useIsMobile()

### Community 91 - "apps/web/src/proxy.ts"
Cohesion: 0.33
Nodes (4): ALLOWED_BOT_PATTERNS, BLOCKED_SCRAPER_PATTERNS, config, middleware

### Community 92 - "doctor.config.json"
Cohesion: 0.33
Nodes (5): ignore, files, rules, react-doctor/nextjs-no-client-side-redirect, $schema

## Knowledge Gaps
- **522 isolated node(s):** `AuthClientConfig`, `DefaultAuthClient`, `ApiErrorOptions`, `RpcClientConfig`, `UploadEnvelope` (+517 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 828 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `uploadFile()` connect `apps/web/src/lib/sdk/client.ts` to `apps/web/src/components/features/onboarding/step-profile.tsx`, `apps/web/src/components/shared/app-sidebar.tsx`, `apps/web/src/components/exam/written-answer-uploader.tsx`, `apps/web/src/components/profile/edit-profile-dialog.tsx`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Why does `Button()` connect `apps/web/src/components/ui/button.tsx` to `apps/web/src/components/auth/sign-in-card.tsx`, `apps/web/src/components/features/onboarding/onboarding-wizard.tsx`, `apps/web/src/components/ui/sidebar.tsx`, `utils.ts`, `app/layout.tsx`, `toBengaliNumber`, `question-card.tsx`, `apps/web/src/components/exam/custom-exam-steps.tsx`, `apps/web/src/components/profile/edit-profile-dialog.tsx`, `apps/web/src/components/ui/questionnaire.tsx`, `apps/web/src/components/ui/combobox.tsx`, `apps/web/src/components/ui/spinner.tsx`, `apps/web/src/components/icons.tsx`, `apps/web/src/app/(student)/qb/[targetSlug]/[containerSlug]/[itemSlug]/qb-item-content.tsx`, `apps/web/src/components/exam/written-answer-uploader.tsx`, `apps/web/src/components/qb/topic-wise-view.tsx`, `apps/web/src/components/ui/carousel.tsx`, `apps/web/src/components/ui/alert-dialog.tsx`, `solve/page.tsx`, `apps/web/src/components/features/onboarding/step-profile.tsx`, `apps/web/src/components/ui/attachment.tsx`, `apps/web/src/components/ui/input-group.tsx`, `apps/web/src/components/ui/sheet.tsx`, `apps/web/src/components/shared/rich-text.tsx`, `apps/web/src/components/exam/exam-result-summary.tsx`, `take/page.tsx`, `apps/web/src/components/ui/message-scroller.tsx`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Why does `updateUser()` connect `apps/web/src/components/profile/edit-profile-dialog.tsx` to `apps/web/src/components/shared/app-sidebar.tsx`, `apps/web/src/components/features/onboarding/onboarding-wizard.tsx`, `apps/web/src/lib/sdk/client.ts`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **What connects `AuthClientConfig`, `DefaultAuthClient`, `ApiErrorOptions` to the rest of the system?**
  _522 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `apps/sdk/src/client/api-client.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05143638850889193 - nodes in this community are weakly interconnected._
- **Should `api/src/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.059907834101382486 - nodes in this community are weakly interconnected._
- **Should `schema/qb.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.045454545454545456 - nodes in this community are weakly interconnected._