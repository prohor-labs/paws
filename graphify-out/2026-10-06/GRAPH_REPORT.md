# Graph Report - paws.academy  (2026-10-06)

## Corpus Check
- 325 files · ~2,784,348 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 16 file(s) not represented in the graph (top: .log 5, (none) 4, .ttf 3)

## Summary
- 1698 nodes · 3196 edges · 107 communities (76 shown, 19 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 10 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `34ab9764`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- apps/sdk/src/client/api-client.ts
- question-card.tsx
- theme-toggle.tsx
- schema/qb.ts
- responsive-dialog.tsx
- custom/page.tsx
- sdk/package.json
- types/qb.ts
- watch.route.ts
- api/src/index.ts
- combobox.tsx
- menubar.tsx
- onboarding-wizard.tsx
- api/package.json
- db/index.ts
- dependencies
- react
- dependencies
- sign-in-card.tsx
- qb-item-content.tsx
- sidebar.tsx
- biome.json
- package.json
- profile-card.tsx
- qb.route.ts
- components.json
- icons.tsx
- use-watch.ts
- client.ts
- use-question-bank.ts
- watch-player-view.tsx
- tasks
- questionnaire.tsx
- compilerOptions
- scrape-bup-qb.ts
- compilerOptions
- input-otp.tsx
- qb-hub-content.tsx
- scrape-all-remaining-qb.ts
- spinner.tsx
- scrape-medical-qb.ts
- exam-result-summary.tsx
- compilerOptions
- app-preferences.tsx
- carousel.tsx
- knip.json
- topic-wise-view.tsx
- chart.tsx
- field.tsx
- item.tsx
- attachment.tsx
- page-breadcrumbs.tsx
- sheet.tsx
- devDependencies
- scrape-engineering-qb.ts
- navigation-menu.tsx
- route.ts
- custom-exam-steps.tsx
- watch-card.tsx
- web/src/types/index.ts
- web/package.json
- scripts
- empty.tsx
- bubble.tsx
- button-group.tsx
- class-variance-authority
- alert.tsx
- useIsMobile
- tabs.tsx
- proxy.ts
- doctor.config.json
- shared/index.ts
- marker.tsx
- rich-text.tsx
- cn
- resizable.tsx
- (landing)/page.tsx
- Fixing Missing Questions & Syncing University Question Banks
- button.tsx
- Web AGENTS.md
- Web DESIGN.md
- landing.ts
- postcss.config.mjs
- exam-action-dialog.tsx
- qb-container-content.tsx
- landing-stats.tsx
- take/page.tsx
- AGENTS.md Guidance
- native-select.tsx
- API README
- SDK README
- { signIn, signUp, signOut, useSession, getSession }
- Chorcha Migration Doc
- Public HTML Index
- Root README

## God Nodes (most connected - your core abstractions)
1. `react` - 93 edges
2. `cn` - 60 edges
3. `toBengaliNumber()` - 38 edges
4. `Button()` - 37 edges
5. `recalculateAllCounts()` - 17 edges
6. `class-variance-authority` - 17 edges
7. `PageLoading()` - 17 edges
8. `drizzle-orm` - 16 edges
9. `compilerOptions` - 16 edges
10. `compilerOptions` - 16 edges

## Surprising Connections (you probably didn't know these)
- `StepHeader()` --calls--> `toBengaliNumber()`  [EXTRACTED]
  apps/web/src/components/exam/custom-exam-steps.tsx → apps/web/src/lib/utils.ts
- `CustomExamStep1()` --calls--> `toBengaliNumber()`  [EXTRACTED]
  apps/web/src/components/exam/custom-exam-steps.tsx → apps/web/src/lib/utils.ts
- `CustomExamStep2()` --calls--> `toBengaliNumber()`  [EXTRACTED]
  apps/web/src/components/exam/custom-exam-steps.tsx → apps/web/src/lib/utils.ts
- `CustomExamStep4()` --calls--> `toBengaliNumber()`  [EXTRACTED]
  apps/web/src/components/exam/custom-exam-steps.tsx → apps/web/src/lib/utils.ts
- `EditProfileDialog()` --calls--> `updateUser()`  [EXTRACTED]
  apps/web/src/components/profile/edit-profile-dialog.tsx → apps/web/src/lib/sdk/client.ts

## Import Cycles
- None detected.

## Communities (107 total, 19 thin omitted)

### Community 0 - "apps/sdk/src/client/api-client.ts"
Cohesion: 0.05
Nodes (62): ApiClient, ApiClientConfig, createApiClient(), withCredentialsFetch(), AuthClientConfig, createAuthClient(), DefaultAuthClient, getAuthClient() (+54 more)

### Community 1 - "question-card.tsx"
Cohesion: 0.13
Nodes (16): DEFAULT_OPTION_KEYS, EvaluatedScriptItem, McqOptionsProps, QuestionAnswersProps, QuestionCardProps, QuestionHeader(), QuestionHeaderProps, stripLeadingPartLabel() (+8 more)

### Community 2 - "theme-toggle.tsx"
Cohesion: 0.17
Nodes (12): PawsLogo(), LandingHeader(), emptySubscribe(), ThemeToggle(), ThemeToggleProps, AnimatedThemeToggler(), AnimatedThemeTogglerProps, getThemeTransitionClipPaths() (+4 more)

### Community 3 - "schema/qb.ts"
Cohesion: 0.05
Nodes (43): qbChapterSourcesRelations, qbChaptersRelations, QBChapterTable, qbContainerItemsRelations, QBContainerItemTable, qbContainersRelations, QBContainerTable, qbCustomExamQuestionsRelations (+35 more)

### Community 4 - "responsive-dialog.tsx"
Cohesion: 0.07
Nodes (19): EvaluatedScriptItem, WrittenAnswerUploaderProps, WrittenPageItem, Dialog(), DialogContent(), DialogDescription(), DialogHeader(), DialogTitle() (+11 more)

### Community 5 - "custom/page.tsx"
Cohesion: 0.11
Nodes (21): CustomExamPage(), CustomExamStep1, CustomExamStep2, CustomExamStep4, CustomExamStepStandard, ExamResultSummary, ExamSubmittingOverlay, QuestionPaletteDialog (+13 more)

### Community 6 - "sdk/package.json"
Cohesion: 0.05
Nodes (41): dependencies, better-auth, hono, zod, description, devDependencies, tsdown, @types/node (+33 more)

### Community 7 - "types/qb.ts"
Cohesion: 0.05
Nodes (37): CreateCustomExamInput, CustomExamData, CustomExamSolveData, CustomExamSubmissionData, CustomExamTakeData, CustomExamWrittenSubmissionItem, QBChapter, QBChapterDetailData (+29 more)

### Community 8 - "watch.route.ts"
Cohesion: 0.09
Nodes (32): determineCategory(), extractTags(), parseDurationToSeconds(), parseRelativeDate(), RawVideoItem, run(), account, accountRelations (+24 more)

### Community 9 - "api/src/index.ts"
Cohesion: 0.07
Nodes (33): auth, closeDatabase(), ALLOWED_METHODS, ApiRoutesType, app, AppType, Auth, authApp (+25 more)

### Community 10 - "combobox.tsx"
Cohesion: 0.08
Nodes (10): metadata, InputGroup(), InputGroupAddon(), inputGroupAddonVariants, InputGroupButton(), inputGroupButtonVariants, InputGroupInput(), Textarea() (+2 more)

### Community 11 - "menubar.tsx"
Cohesion: 0.09
Nodes (13): DropdownMenu(), DropdownMenuContent(), DropdownMenuGroup(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuPortal(), DropdownMenuRadioGroup(), DropdownMenuSeparator() (+5 more)

### Community 12 - "onboarding-wizard.tsx"
Cohesion: 0.11
Nodes (22): LEVEL_ICONS, StepLevel(), StepLevelProps, StepReady(), StepReadyProps, StepSchedule(), StepScheduleProps, StepSubjects() (+14 more)

### Community 13 - "api/package.json"
Cohesion: 0.08
Nodes (21): devDependencies, drizzle-kit, @types/bun, typescript, exports, better-auth, hono, @paws/sdk (+13 more)

### Community 14 - "db/index.ts"
Cohesion: 0.14
Nodes (12): formatDatabase(), cleanHtml(), decodeChorcha(), restoreMedicalOptions(), client, db, client, db (+4 more)

### Community 15 - "dependencies"
Cohesion: 0.07
Nodes (29): dependencies, @base-ui/react, class-variance-authority, cmdk, cn, date-fns, embla-carousel-react, input-otp (+21 more)

### Community 16 - "react"
Cohesion: 0.12
Nodes (16): hindSiliguri, metadata, ConfirmDialog(), ConfirmDialogProps, ConfirmContext, ConfirmContextType, ConfirmOptions, ConfirmProvider() (+8 more)

### Community 17 - "dependencies"
Cohesion: 0.10
Nodes (18): dependencies, @aws-sdk/client-s3, @aws-sdk/s3-request-presigner, better-auth, drizzle-orm, hono, @hono/zod-validator, @paws/sdk (+10 more)

### Community 18 - "sign-in-card.tsx"
Cohesion: 0.08
Nodes (19): nextConfig, metadata, metadata, AuthLogo(), AuthBackdrop(), LoginView(), OAuthButtons(), OAuthButtonsProps (+11 more)

### Community 19 - "qb-item-content.tsx"
Cohesion: 0.16
Nodes (15): CustomExamSolveContent(), QbItemContent(), QBSubSlugPage(), EmptyState(), useCreateCustomExam(), useCustomExamSolve(), useQBChapterDetail(), useQBItemDetail() (+7 more)

### Community 20 - "sidebar.tsx"
Cohesion: 0.09
Nodes (8): Sidebar(), SidebarContext, SidebarContextProps, SidebarMenuButton(), sidebarMenuButtonVariants, SidebarRail(), SidebarTrigger(), useSidebar()

### Community 21 - "biome.json"
Cohesion: 0.08
Nodes (25): css, parser, files, ignoreUnknown, includes, formatter, enabled, indentStyle (+17 more)

### Community 22 - "package.json"
Cohesion: 0.07
Nodes (26): devDependencies, prettier, turbo, typescript, devEngines, packageManager, engines, node (+18 more)

### Community 23 - "profile-card.tsx"
Cohesion: 0.15
Nodes (16): AppShell(), AppSidebar(), MobileNav(), Header(), SidebarFooter(), Avatar(), AvatarFallback(), AvatarImage() (+8 more)

### Community 24 - "qb.route.ts"
Cohesion: 0.14
Nodes (15): qbContainers, qbCustomExamQuestions, qbCustomExams, qbCustomExamSubmissions, qbCustomExamWrittenSubmissions, qbExamSheets, qbTargets, cleanAndFormatMathText() (+7 more)

### Community 25 - "components.json"
Cohesion: 0.08
Nodes (23): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+15 more)

### Community 26 - "icons.tsx"
Cohesion: 0.16
Nodes (14): metadata, ExamBottomBar(), ExamBottomBarProps, QuestionPaletteDialog(), QuestionPaletteDialogProps, QuestionPaletteItem, VerifiedBadge(), ChannelDetailView() (+6 more)

### Community 27 - "use-watch.ts"
Cohesion: 0.20
Nodes (22): useWatchComments(), useWatchInfiniteFeed(), useWatchMutations(), useWatchVideo(), incrementVideoView(), postWatchComment(), syncWatchProgress(), toggleChannelSubscription() (+14 more)

### Community 28 - "client.ts"
Cohesion: 0.16
Nodes (17): WrittenAnswerUploader(), OnboardingWizard(), StepProfile(), api, AppApiClient, authClient, getApiClient(), getAuthClient() (+9 more)

### Community 29 - "use-question-bank.ts"
Cohesion: 0.25
Nodes (16): fetchQBChapter(), fetchQBContainer(), fetchQBHub(), fetchQBItem(), fetchQBQuestion(), fetchQBTarget(), fetchQBTree(), qbChapterQueryOptions() (+8 more)

### Community 30 - "watch-player-view.tsx"
Cohesion: 0.19
Nodes (7): metadata, metadata, ScrollArea(), PlaylistDetailView(), WatchPlayerView(), useWatchPlaylist(), EMPTY_WATCH_VIDEOS

### Community 31 - "tasks"
Cohesion: 0.09
Nodes (21): dependsOn, inputs, outputs, dependsOn, cache, cache, persistent, persistent (+13 more)

### Community 32 - "questionnaire.tsx"
Cohesion: 0.15
Nodes (5): buttonVariants, QuestionnaireNext(), QuestionnairePrevious(), QuestionnaireSkip(), QuestionnaireSubmit()

### Community 33 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 34 - "scrape-bup-qb.ts"
Cohesion: 0.19
Nodes (14): BUP_SERIES, BupSeriesConfig, cleanSolutionText(), decodeChorcha(), ensureBupContainerAndItems(), getNormalizedBupTag(), imageCache, isDummyOption() (+6 more)

### Community 35 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, declaration, emitDeclarationOnly, esModuleInterop, isolatedModules, lib, module, moduleDetection (+9 more)

### Community 37 - "qb-hub-content.tsx"
Cohesion: 0.19
Nodes (8): QbHubContent(), QbTargetContent(), TabItem, TabsWithSearch(), TabsWithSearchProps, useQBTargetDetail(), useQBTree(), subjectLevelLabel()

### Community 38 - "scrape-all-remaining-qb.ts"
Cohesion: 0.18
Nodes (15): ALL_TARGET_BANKS, BankConfig, cleanSolutionText(), decodeChorcha(), ensureContainerAndItem(), getNormalizedTag(), imageCache, isDummyOption() (+7 more)

### Community 39 - "spinner.tsx"
Cohesion: 0.31
Nodes (4): AuthSubmitButton(), AuthSubmitButtonProps, ExamSubmittingOverlayProps, Spinner()

### Community 40 - "scrape-medical-qb.ts"
Cohesion: 0.16
Nodes (14): decodeChorcha(), imageCache, main(), migrateImagesInText(), S3_PUBLIC_URL, s3Client, scrapeSeries(), SeriesConfig (+6 more)

### Community 41 - "exam-result-summary.tsx"
Cohesion: 0.36
Nodes (6): ExamResultSummary(), ExamResultSummaryProps, ExamSolveFilter, formatDuration(), Badge(), badgeVariants

### Community 43 - "compilerOptions"
Cohesion: 0.13
Nodes (14): compilerOptions, jsx, jsxImportSource, module, moduleResolution, paths, skipLibCheck, strict (+6 more)

### Community 44 - "app-preferences.tsx"
Cohesion: 0.22
Nodes (5): AppPreferences(), EditProfileDialog, MenuItemProps, ProfileCard(), useConfirm()

### Community 45 - "carousel.tsx"
Cohesion: 0.17
Nodes (13): CarouselApi, CarouselContent(), CarouselContext, CarouselContextProps, CarouselItem(), CarouselNext(), CarouselOptions, CarouselPlugin (+5 more)

### Community 46 - "knip.json"
Cohesion: 0.14
Nodes (13): project, entry, project, entry, next, project, ignore, ignoreBinaries (+5 more)

### Community 47 - "topic-wise-view.tsx"
Cohesion: 0.23
Nodes (12): getPageItems(), QuestionTypeFilter, TopicWiseView(), TopicWiseViewProps, Pagination(), PaginationContent(), PaginationEllipsis(), PaginationItem() (+4 more)

### Community 49 - "chart.tsx"
Cohesion: 0.19
Nodes (11): ChartConfig, ChartContext, ChartContextProps, ChartLegendContent(), ChartTooltipContent(), getPayloadConfigFromPayload(), INITIAL_DIMENSION, THEMES (+3 more)

### Community 50 - "field.tsx"
Cohesion: 0.12
Nodes (14): AuthFormFields(), AuthFormFieldsProps, AuthMethodToggle(), AuthMethodToggleProps, StepProfileProps, EditProfileDialog(), EditProfileDialogProps, Field() (+6 more)

### Community 51 - "item.tsx"
Cohesion: 0.18
Nodes (4): Item(), ItemMedia(), itemMediaVariants, itemVariants

### Community 52 - "attachment.tsx"
Cohesion: 0.20
Nodes (4): Attachment(), AttachmentMedia(), attachmentMediaVariants, attachmentVariants

### Community 53 - "page-breadcrumbs.tsx"
Cohesion: 0.31
Nodes (9): BreadcrumbStep, PageBreadcrumbsProps, Breadcrumb(), BreadcrumbEllipsis(), BreadcrumbItem(), BreadcrumbLink(), BreadcrumbList(), BreadcrumbPage() (+1 more)

### Community 54 - "sheet.tsx"
Cohesion: 0.18
Nodes (5): Sheet(), SheetContent(), SheetDescription(), SheetHeader(), SheetTitle()

### Community 55 - "devDependencies"
Cohesion: 0.20
Nodes (10): devDependencies, babel-plugin-react-compiler, @biomejs/biome, shadcn, tailwindcss, @tailwindcss/postcss, @types/node, @types/react (+2 more)

### Community 56 - "scrape-engineering-qb.ts"
Cohesion: 0.12
Nodes (21): cleanSolutionText(), decodeChorcha(), EngineeringSeriesConfig, imageCache, isDummyOption(), main(), migrateImagesInText(), S3_PUBLIC_URL (+13 more)

### Community 59 - "route.ts"
Cohesion: 0.22
Nodes (7): DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT

### Community 60 - "custom-exam-steps.tsx"
Cohesion: 0.09
Nodes (18): CustomExamStep1(), CustomExamStep1Props, CustomExamStep2(), CustomExamStep2Props, CustomExamStep4(), CustomExamStep4Props, CustomExamStepStandardProps, DURATION_PRESETS (+10 more)

### Community 61 - "watch-card.tsx"
Cohesion: 0.17
Nodes (14): ActionSheet(), ActionSheetGroup, ActionSheetItem, ActionSheetProps, ResponsiveDialog(), ShareSheet(), ShareSheetProps, WatchThumbnail() (+6 more)

### Community 62 - "web/src/types/index.ts"
Cohesion: 0.21
Nodes (11): GridCard(), getBasePalette(), getCoverTheme(), GridCover(), GridCoverProps, PaletteTheme, resolveCoverContent(), resolveStyle() (+3 more)

### Community 64 - "web/package.json"
Cohesion: 0.08
Nodes (24): ignoreScripts, @paws/sdk, @types/node, typescript, name, packageManager, private, trustedDependencies (+16 more)

### Community 65 - "scripts"
Cohesion: 0.25
Nodes (8): scripts, build, check-types, dev, dev:https, format, lint, start

### Community 67 - "bubble.tsx"
Cohesion: 0.38
Nodes (4): Bubble(), BubbleReactions(), bubbleReactionsVariants, bubbleVariants

### Community 68 - "button-group.tsx"
Cohesion: 0.38
Nodes (3): ButtonGroup(), buttonGroupVariants, Separator()

### Community 72 - "class-variance-authority"
Cohesion: 0.39
Nodes (5): ToggleGroupContext, ToggleGroupItem(), Toggle(), toggleVariants, class-variance-authority

### Community 75 - "useIsMobile"
Cohesion: 0.53
Nodes (5): SidebarProvider(), getServerSnapshot(), getSnapshot(), subscribe(), useIsMobile()

### Community 77 - "proxy.ts"
Cohesion: 0.33
Nodes (4): ALLOWED_BOT_PATTERNS, BLOCKED_SCRAPER_PATTERNS, config, middleware

### Community 78 - "doctor.config.json"
Cohesion: 0.33
Nodes (5): ignore, files, rules, react-doctor/nextjs-no-client-side-redirect, $schema

### Community 79 - "shared/index.ts"
Cohesion: 0.17
Nodes (7): metadata, AuthGuard(), emptySubscribe(), useMounted(), PageLoading(), PillTabItem, PillTabsProps

### Community 81 - "rich-text.tsx"
Cohesion: 0.19
Nodes (12): CodeBlock(), convertHtmlTableToMarkdown(), preprocessRichContent(), RichText, useCopyToClipboard(), UseCopyToClipboardOptions, copyToClipboard(), RichTextProps (+4 more)

### Community 85 - "(landing)/page.tsx"
Cohesion: 0.21
Nodes (6): LandingFaq(), LandingFooter(), LandingHero(), LandingStats(), LandingStory(), LandingSupporters()

### Community 86 - "Fixing Missing Questions & Syncing University Question Banks"
Cohesion: 0.15
Nodes (12): 1. Problem Context & Root Cause, 2. Chorcha Decryption & Solution Cleaning, 3. S3 Image Migration Pipeline, 4. Complete Question Ingestion & Re-sync Script Template, 5. Standardizing Naming & Slugs Across the DB, 6. Removing Unwanted "Practice Set" Exam Sheets, 7. Verifying Consistency, Convention (+4 more)

### Community 87 - "button.tsx"
Cohesion: 0.24
Nodes (5): EmptyStateProps, Button(), ButtonProps, Calendar(), react-day-picker

### Community 90 - "landing.ts"
Cohesion: 0.22
Nodes (8): LandingRoadmap(), FaqItem, LANDING_FAQS, LANDING_ROADMAP, LANDING_STATS, NavItem, RoadmapItem, StatCardItem

### Community 92 - "exam-action-dialog.tsx"
Cohesion: 0.31
Nodes (7): ExamActionDialog(), ExamActionDialogProps, formatDurationBengali(), ExamSet, ExamWiseView(), ExamWiseViewProps, formatDurationBengali()

### Community 94 - "qb-container-content.tsx"
Cohesion: 0.31
Nodes (5): SingleQuestionPage(), QbContainerContent(), PageBreadcrumbs(), useQBContainerDetail(), useQBQuestionDetail()

### Community 95 - "landing-stats.tsx"
Cohesion: 0.33
Nodes (4): Card(), CardContent(), CardHeader(), CardTitle()

### Community 96 - "take/page.tsx"
Cohesion: 0.43
Nodes (6): ActiveExamSession(), ActiveExamSessionProps, CustomExamTakePage(), QuestionCard(), useCustomExamTake(), useSubmitCustomExam()

## Knowledge Gaps
- **560 isolated node(s):** `name`, `exports`, `dev`, `build`, `check-types` (+555 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 860 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `question-card.tsx`, `theme-toggle.tsx`, `responsive-dialog.tsx`, `custom/page.tsx`, `combobox.tsx`, `menubar.tsx`, `onboarding-wizard.tsx`, `sign-in-card.tsx`, `qb-item-content.tsx`, `sidebar.tsx`, `profile-card.tsx`, `icons.tsx`, `watch-player-view.tsx`, `questionnaire.tsx`, `input-otp.tsx`, `qb-hub-content.tsx`, `context-menu.tsx`, `app-preferences.tsx`, `carousel.tsx`, `topic-wise-view.tsx`, `alert-dialog.tsx`, `chart.tsx`, `field.tsx`, `item.tsx`, `attachment.tsx`, `page-breadcrumbs.tsx`, `sheet.tsx`, `select.tsx`, `custom-exam-steps.tsx`, `watch-card.tsx`, `web/src/types/index.ts`, `table.tsx`, `web/package.json`, `bubble.tsx`, `message.tsx`, `message-scroller.tsx`, `popover.tsx`, `class-variance-authority`, `alert.tsx`, `useIsMobile`, `shared/index.ts`, `marker.tsx`, `rich-text.tsx`, `(landing)/page.tsx`, `button.tsx`, `qb-container-content.tsx`, `landing-stats.tsx`, `take/page.tsx`, `native-select.tsx`?**
  _High betweenness centrality (0.221) - this node is a cross-community bridge._
- **Why does `cn` connect `cn` to `question-card.tsx`, `responsive-dialog.tsx`, `combobox.tsx`, `menubar.tsx`, `onboarding-wizard.tsx`, `sidebar.tsx`, `profile-card.tsx`, `icons.tsx`, `watch-player-view.tsx`, `questionnaire.tsx`, `input-otp.tsx`, `spinner.tsx`, `exam-result-summary.tsx`, `context-menu.tsx`, `carousel.tsx`, `topic-wise-view.tsx`, `alert-dialog.tsx`, `chart.tsx`, `field.tsx`, `item.tsx`, `attachment.tsx`, `page-breadcrumbs.tsx`, `sheet.tsx`, `navigation-menu.tsx`, `select.tsx`, `custom-exam-steps.tsx`, `table.tsx`, `web/package.json`, `empty.tsx`, `bubble.tsx`, `button-group.tsx`, `message.tsx`, `message-scroller.tsx`, `popover.tsx`, `class-variance-authority`, `alert.tsx`, `progress.tsx`, `tabs.tsx`, `marker.tsx`, `resizable.tsx`, `button.tsx`, `landing-stats.tsx`, `native-select.tsx`?**
  _High betweenness centrality (0.074) - this node is a cross-community bridge._
- **Why does `uploadFile()` connect `client.ts` to `field.tsx`, `responsive-dialog.tsx`, `app-preferences.tsx`, `profile-card.tsx`?**
  _High betweenness centrality (0.062) - this node is a cross-community bridge._
- **What connects `name`, `exports`, `dev` to the rest of the system?**
  _560 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `apps/sdk/src/client/api-client.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05170998632010944 - nodes in this community are weakly interconnected._
- **Should `question-card.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12987012987012986 - nodes in this community are weakly interconnected._
- **Should `schema/qb.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.045454545454545456 - nodes in this community are weakly interconnected._