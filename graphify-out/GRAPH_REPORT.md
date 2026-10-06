# Graph Report - paws.academy  (2026-10-06)

## Corpus Check
- 326 files · ~2,785,988 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 16 file(s) not represented in the graph (top: .log 5, (none) 4, .ttf 3)

## Summary
- 1708 nodes · 3205 edges · 101 communities (71 shown, 20 thin omitted)
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
- custom-exam-steps.tsx
- sdk/package.json
- types/qb.ts
- watch.route.ts
- api/src/index.ts
- combobox.tsx
- menubar.tsx
- onboarding-wizard.tsx
- api/package.json
- recalculateAllCounts
- dependencies
- app/layout.tsx
- dependencies
- auth/index.ts
- qb-item-content.tsx
- sidebar.tsx
- biome.json
- package.json
- icons.tsx
- qb.route.ts
- components.json
- utils.ts
- use-watch.ts
- written-answer-uploader.tsx
- use-question-bank.ts
- Fixing Missing Questions & Syncing University Question Banks
- tasks
- questionnaire.tsx
- compilerOptions
- scrape-bup-qb.ts
- compilerOptions
- input-otp.tsx
- qb-hub-content.tsx
- scrape-all-remaining-qb.ts
- button.tsx
- scrape-medical-qb.ts
- take/page.tsx
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
- command.tsx
- shared/index.ts
- grid-cover.tsx
- web/package.json
- scripts
- empty.tsx
- class-variance-authority
- button-group.tsx
- 02. AI Prompt & Workflow for MathJax-Compatible Question Rewriting & Deep Explanations
- input-group.tsx
- toggle-group.tsx
- sign-in-card.tsx
- useIsMobile
- tabs.tsx
- proxy.ts
- doctor.config.json
- react
- marker.tsx
- rich-text.tsx
- cn
- resizable.tsx
- landing.ts
- Web AGENTS.md
- Web DESIGN.md
- postcss.config.mjs
- toBengaliNumber
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
- `QuestionPaletteDialog()` --calls--> `toBengaliNumber()`  [EXTRACTED]
  apps/web/src/components/exam/question-palette-dialog.tsx → apps/web/src/lib/utils.ts
- `QuestionHeader()` --calls--> `toBengaliNumber()`  [EXTRACTED]
  apps/web/src/components/shared/question-card.tsx → apps/web/src/lib/utils.ts
- `main()` --calls--> `recalculateAllCounts()`  [EXTRACTED]
  apps/api/scripts/scrape-all-remaining-qb.ts → apps/api/src/services/qb-count.service.ts
- `main()` --calls--> `recalculateAllCounts()`  [EXTRACTED]
  apps/api/scripts/scrape-bup-qb.ts → apps/api/src/services/qb-count.service.ts
- `main()` --calls--> `recalculateAllCounts()`  [EXTRACTED]
  apps/api/scripts/scrape-engineering-qb.ts → apps/api/src/services/qb-count.service.ts

## Import Cycles
- None detected.

## Communities (101 total, 20 thin omitted)

### Community 0 - "apps/sdk/src/client/api-client.ts"
Cohesion: 0.05
Nodes (62): ApiClient, ApiClientConfig, createApiClient(), withCredentialsFetch(), AuthClientConfig, createAuthClient(), DefaultAuthClient, getAuthClient() (+54 more)

### Community 1 - "question-card.tsx"
Cohesion: 0.13
Nodes (17): DEFAULT_OPTION_KEYS, EvaluatedScriptItem, McqOptionsProps, QuestionAnswersProps, QuestionCard(), QuestionCardProps, QuestionHeader(), QuestionHeaderProps (+9 more)

### Community 2 - "theme-toggle.tsx"
Cohesion: 0.31
Nodes (8): emptySubscribe(), ThemeToggleProps, AnimatedThemeToggler(), AnimatedThemeTogglerProps, getThemeTransitionClipPaths(), polygonCollapsed(), TransitionVariant, react-dom

### Community 3 - "schema/qb.ts"
Cohesion: 0.05
Nodes (43): qbChapterSourcesRelations, qbChaptersRelations, QBChapterTable, qbContainerItemsRelations, QBContainerItemTable, qbContainersRelations, QBContainerTable, qbCustomExamQuestionsRelations (+35 more)

### Community 4 - "responsive-dialog.tsx"
Cohesion: 0.17
Nodes (10): DialogContent(), Drawer(), DrawerContent(), DrawerContext, DrawerContextProps, DrawerDescription(), DrawerHeader(), DrawerTitle() (+2 more)

### Community 5 - "custom-exam-steps.tsx"
Cohesion: 0.07
Nodes (32): CustomExamPage(), CustomExamStep1, CustomExamStep2, CustomExamStep4, CustomExamStepStandard, QuestionPaletteDialog, CustomExamStep1Props, CustomExamStep2Props (+24 more)

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
Cohesion: 0.06
Nodes (36): auth, client, closeDatabase(), client, db, ALLOWED_METHODS, ApiRoutesType, app (+28 more)

### Community 11 - "menubar.tsx"
Cohesion: 0.09
Nodes (13): DropdownMenu(), DropdownMenuContent(), DropdownMenuGroup(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuPortal(), DropdownMenuRadioGroup(), DropdownMenuSeparator() (+5 more)

### Community 12 - "onboarding-wizard.tsx"
Cohesion: 0.07
Nodes (40): Auth, WrittenAnswerUploader(), OnboardingWizard(), LEVEL_ICONS, StepLevel(), StepLevelProps, StepProfile(), StepReady() (+32 more)

### Community 13 - "api/package.json"
Cohesion: 0.07
Nodes (27): devDependencies, drizzle-kit, @types/bun, typescript, exports, better-auth, hono, @paws/sdk (+19 more)

### Community 14 - "recalculateAllCounts"
Cohesion: 0.26
Nodes (9): formatDatabase(), cleanHtml(), decodeChorcha(), restoreMedicalOptions(), db, qbQuestionOptions, qbQuestions, recalculateAllCounts() (+1 more)

### Community 15 - "dependencies"
Cohesion: 0.07
Nodes (29): dependencies, @base-ui/react, class-variance-authority, cmdk, cn, date-fns, embla-carousel-react, input-otp (+21 more)

### Community 16 - "app/layout.tsx"
Cohesion: 0.21
Nodes (9): hindSiliguri, metadata, getQueryClient(), makeQueryClient(), QueryProvider(), ThemeProvider(), Toaster(), TooltipProvider() (+1 more)

### Community 17 - "dependencies"
Cohesion: 0.18
Nodes (11): dependencies, @aws-sdk/client-s3, @aws-sdk/s3-request-presigner, better-auth, drizzle-orm, hono, @hono/zod-validator, @paws/sdk (+3 more)

### Community 18 - "auth/index.ts"
Cohesion: 0.15
Nodes (10): metadata, AuthBackdrop(), LoginView(), PlusDivider(), PlusFrame(), TrustStrip(), CUSTOMER_LOGOS, CustomerLogo (+2 more)

### Community 19 - "qb-item-content.tsx"
Cohesion: 0.13
Nodes (17): CustomExamSolveContent(), ExamResultSummary, QbItemContent(), QBSubSlugPage(), EmptyState(), PageBreadcrumbs(), useCreateCustomExam(), useCustomExamSolve() (+9 more)

### Community 20 - "sidebar.tsx"
Cohesion: 0.09
Nodes (8): Sidebar(), SidebarContext, SidebarContextProps, SidebarMenuButton(), sidebarMenuButtonVariants, SidebarRail(), SidebarTrigger(), useSidebar()

### Community 21 - "biome.json"
Cohesion: 0.08
Nodes (25): css, parser, files, ignoreUnknown, includes, formatter, enabled, indentStyle (+17 more)

### Community 22 - "package.json"
Cohesion: 0.07
Nodes (26): devDependencies, prettier, turbo, typescript, devEngines, packageManager, engines, node (+18 more)

### Community 23 - "icons.tsx"
Cohesion: 0.16
Nodes (15): PawsLogo(), AppSidebar(), MobileNav(), Header(), SidebarFooter(), ThemeToggle(), AvatarImage(), SidebarInset() (+7 more)

### Community 24 - "qb.route.ts"
Cohesion: 0.15
Nodes (14): qbContainers, qbCustomExamQuestions, qbCustomExams, qbCustomExamSubmissions, qbCustomExamWrittenSubmissions, qbTargets, cleanAndFormatMathText(), mapQuestion() (+6 more)

### Community 25 - "components.json"
Cohesion: 0.08
Nodes (23): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+15 more)

### Community 26 - "utils.ts"
Cohesion: 0.16
Nodes (14): VerifiedBadge(), PageLoading(), ShareSheet(), Avatar(), AvatarFallback(), ScrollArea(), Textarea(), WatchCard() (+6 more)

### Community 27 - "use-watch.ts"
Cohesion: 0.08
Nodes (34): nextConfig, metadata, metadata, metadata, metadata, metadata, ChannelDetailView(), PlaylistDetailView() (+26 more)

### Community 28 - "written-answer-uploader.tsx"
Cohesion: 0.19
Nodes (8): EvaluatedScriptItem, WrittenAnswerUploaderProps, WrittenPageItem, Dialog(), DialogDescription(), DialogHeader(), DialogTitle(), DialogTrigger()

### Community 29 - "use-question-bank.ts"
Cohesion: 0.18
Nodes (21): SingleQuestionPage(), useQBHub(), useQBQuestionDetail(), fetchQBChapter(), fetchQBContainer(), fetchQBHub(), fetchQBItem(), fetchQBQuestion() (+13 more)

### Community 30 - "Fixing Missing Questions & Syncing University Question Banks"
Cohesion: 0.15
Nodes (12): 1. Problem Context & Root Cause, 2. Chorcha Decryption & Solution Cleaning, 3. S3 Image Migration Pipeline, 4. Complete Question Ingestion & Re-sync Script Template, 5. Standardizing Naming & Slugs Across the DB, 6. Removing Unwanted "Practice Set" Exam Sheets, 7. Verifying Consistency, Convention (+4 more)

### Community 31 - "tasks"
Cohesion: 0.09
Nodes (21): dependsOn, inputs, outputs, dependsOn, cache, cache, persistent, persistent (+13 more)

### Community 32 - "questionnaire.tsx"
Cohesion: 0.12
Nodes (7): buttonVariants, Calendar(), QuestionnaireNext(), QuestionnairePrevious(), QuestionnaireSkip(), QuestionnaireSubmit(), react-day-picker

### Community 33 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 34 - "scrape-bup-qb.ts"
Cohesion: 0.15
Nodes (17): BUP_SERIES, BupSeriesConfig, cleanSolutionText(), decodeChorcha(), ensureBupContainerAndItems(), getNormalizedBupTag(), imageCache, isDummyOption() (+9 more)

### Community 35 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, declaration, emitDeclarationOnly, esModuleInterop, isolatedModules, lib, module, moduleDetection (+9 more)

### Community 37 - "qb-hub-content.tsx"
Cohesion: 0.18
Nodes (8): QbHubContent(), QbContainerContent(), QbTargetContent(), GridCard(), useQBContainerDetail(), useQBTargetDetail(), useQBTree(), subjectLevelLabel()

### Community 38 - "scrape-all-remaining-qb.ts"
Cohesion: 0.18
Nodes (15): ALL_TARGET_BANKS, BankConfig, cleanSolutionText(), decodeChorcha(), ensureContainerAndItem(), getNormalizedTag(), imageCache, isDummyOption() (+7 more)

### Community 39 - "button.tsx"
Cohesion: 0.12
Nodes (9): AuthSubmitButton(), AuthSubmitButtonProps, OAuthButtonsProps, ExamSubmittingOverlayProps, StepReadyProps, EmptyStateProps, Button(), ButtonProps (+1 more)

### Community 40 - "scrape-medical-qb.ts"
Cohesion: 0.17
Nodes (13): decodeChorcha(), imageCache, main(), migrateImagesInText(), S3_PUBLIC_URL, s3Client, scrapeSeries(), SeriesConfig (+5 more)

### Community 41 - "take/page.tsx"
Cohesion: 0.20
Nodes (12): ActiveExamSession(), ActiveExamSessionProps, CustomExamTakePage(), ExamSubmittingOverlay, ExamResultSummary(), ExamResultSummaryProps, ExamSolveFilter, formatDuration() (+4 more)

### Community 43 - "compilerOptions"
Cohesion: 0.13
Nodes (14): compilerOptions, jsx, jsxImportSource, module, moduleResolution, paths, skipLibCheck, strict (+6 more)

### Community 44 - "app-preferences.tsx"
Cohesion: 0.11
Nodes (14): QuestionPaletteDialog(), QuestionPaletteDialogProps, QuestionPaletteItem, AppPreferences(), EditProfileDialog, MenuItemProps, ConfirmDialog(), ConfirmDialogProps (+6 more)

### Community 45 - "carousel.tsx"
Cohesion: 0.17
Nodes (13): CarouselApi, CarouselContent(), CarouselContext, CarouselContextProps, CarouselItem(), CarouselNext(), CarouselOptions, CarouselPlugin (+5 more)

### Community 46 - "knip.json"
Cohesion: 0.14
Nodes (13): project, entry, project, entry, next, project, ignore, ignoreBinaries (+5 more)

### Community 47 - "topic-wise-view.tsx"
Cohesion: 0.16
Nodes (15): getPageItems(), QuestionTypeFilter, TopicWiseView(), TopicWiseViewProps, Pagination(), PaginationContent(), PaginationEllipsis(), PaginationItem() (+7 more)

### Community 49 - "chart.tsx"
Cohesion: 0.19
Nodes (11): ChartConfig, ChartContext, ChartContextProps, ChartLegendContent(), ChartTooltipContent(), getPayloadConfigFromPayload(), INITIAL_DIMENSION, THEMES (+3 more)

### Community 50 - "field.tsx"
Cohesion: 0.13
Nodes (12): AuthFormFieldsProps, AuthMethodToggle(), AuthMethodToggleProps, StepProfileProps, EditProfileDialogProps, Field(), FieldDescription(), FieldGroup() (+4 more)

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
Cohesion: 0.13
Nodes (20): cleanSolutionText(), decodeChorcha(), EngineeringSeriesConfig, imageCache, isDummyOption(), main(), migrateImagesInText(), S3_PUBLIC_URL (+12 more)

### Community 59 - "route.ts"
Cohesion: 0.22
Nodes (7): DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT

### Community 61 - "shared/index.ts"
Cohesion: 0.13
Nodes (16): ActionSheet(), ActionSheetGroup, ActionSheetItem, ActionSheetProps, CodeBlock(), ShareSheetProps, TabItem, TabsWithSearch() (+8 more)

### Community 62 - "grid-cover.tsx"
Cohesion: 0.33
Nodes (8): getBasePalette(), getCoverTheme(), GridCover(), GridCoverProps, PaletteTheme, resolveCoverContent(), resolveStyle(), VariantStyle

### Community 64 - "web/package.json"
Cohesion: 0.08
Nodes (24): ignoreScripts, @paws/sdk, @types/node, typescript, name, packageManager, private, trustedDependencies (+16 more)

### Community 65 - "scripts"
Cohesion: 0.25
Nodes (8): scripts, build, check-types, dev, dev:https, format, lint, start

### Community 67 - "class-variance-authority"
Cohesion: 0.18
Nodes (7): Alert(), alertVariants, Bubble(), BubbleReactions(), bubbleReactionsVariants, bubbleVariants, class-variance-authority

### Community 68 - "button-group.tsx"
Cohesion: 0.38
Nodes (3): ButtonGroup(), buttonGroupVariants, Separator()

### Community 70 - "02. AI Prompt & Workflow for MathJax-Compatible Question Rewriting & Deep Explanations"
Cohesion: 0.20
Nodes (9): 02. AI Prompt & Workflow for MathJax-Compatible Question Rewriting & Deep Explanations, 1. Objectives & Non-Negotiable Rules, 2. Formatting & MathJax Specification, 3. Production AI System Prompt, 4. Few-Shot Examples, 5. Batch Automation Script (`apps/api`), 6. QA & Verification Checklist, Example 1: Physics (Kinematics & Vector) (+1 more)

### Community 71 - "input-group.tsx"
Cohesion: 0.28
Nodes (6): InputGroup(), InputGroupAddon(), inputGroupAddonVariants, InputGroupButton(), inputGroupButtonVariants, InputGroupInput()

### Community 72 - "toggle-group.tsx"
Cohesion: 0.43
Nodes (4): ToggleGroupContext, ToggleGroupItem(), Toggle(), toggleVariants

### Community 73 - "sign-in-card.tsx"
Cohesion: 0.29
Nodes (6): AuthFormFields(), AuthLogo(), OAuthButtons(), AuthMode, SignInCard(), SignInMethod

### Community 75 - "useIsMobile"
Cohesion: 0.53
Nodes (5): SidebarProvider(), getServerSnapshot(), getSnapshot(), subscribe(), useIsMobile()

### Community 77 - "proxy.ts"
Cohesion: 0.33
Nodes (4): ALLOWED_BOT_PATTERNS, BLOCKED_SCRAPER_PATTERNS, config, middleware

### Community 78 - "doctor.config.json"
Cohesion: 0.33
Nodes (5): ignore, files, rules, react-doctor/nextjs-no-client-side-redirect, $schema

### Community 79 - "react"
Cohesion: 0.11
Nodes (9): metadata, AppShell(), AuthGuard(), emptySubscribe(), useMounted(), PillTabItem, PillTabsProps, PlaylistCard() (+1 more)

### Community 81 - "rich-text.tsx"
Cohesion: 0.32
Nodes (7): convertHtmlTableToMarkdown(), preprocessRichContent(), RichText, react-markdown, rehype-raw, remark-gfm, remark-math

### Community 85 - "landing.ts"
Cohesion: 0.08
Nodes (20): LandingFaq(), LandingFooter(), LandingHeader(), LandingHero(), LandingRoadmap(), LandingStats(), LandingStory(), LandingSupporters() (+12 more)

### Community 92 - "toBengaliNumber"
Cohesion: 0.18
Nodes (14): CustomExamStep1(), CustomExamStep2(), CustomExamStep4(), StepHeader(), ExamBottomBar(), ExamBottomBarProps, ExamActionDialog(), ExamActionDialogProps (+6 more)

## Knowledge Gaps
- **567 isolated node(s):** `name`, `exports`, `dev`, `build`, `check-types` (+562 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 868 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **20 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `question-card.tsx`, `theme-toggle.tsx`, `responsive-dialog.tsx`, `custom-exam-steps.tsx`, `combobox.tsx`, `menubar.tsx`, `onboarding-wizard.tsx`, `app/layout.tsx`, `auth/index.ts`, `qb-item-content.tsx`, `sidebar.tsx`, `icons.tsx`, `utils.ts`, `written-answer-uploader.tsx`, `use-question-bank.ts`, `questionnaire.tsx`, `input-otp.tsx`, `qb-hub-content.tsx`, `button.tsx`, `take/page.tsx`, `context-menu.tsx`, `app-preferences.tsx`, `carousel.tsx`, `topic-wise-view.tsx`, `alert-dialog.tsx`, `chart.tsx`, `field.tsx`, `item.tsx`, `attachment.tsx`, `page-breadcrumbs.tsx`, `sheet.tsx`, `select.tsx`, `command.tsx`, `shared/index.ts`, `table.tsx`, `web/package.json`, `class-variance-authority`, `message.tsx`, `input-group.tsx`, `toggle-group.tsx`, `sign-in-card.tsx`, `useIsMobile`, `marker.tsx`, `rich-text.tsx`, `cn`, `landing.ts`, `native-select.tsx`?**
  _High betweenness centrality (0.218) - this node is a cross-community bridge._
- **Why does `cn` connect `cn` to `question-card.tsx`, `responsive-dialog.tsx`, `custom-exam-steps.tsx`, `combobox.tsx`, `menubar.tsx`, `onboarding-wizard.tsx`, `sidebar.tsx`, `icons.tsx`, `utils.ts`, `written-answer-uploader.tsx`, `questionnaire.tsx`, `input-otp.tsx`, `button.tsx`, `take/page.tsx`, `context-menu.tsx`, `carousel.tsx`, `topic-wise-view.tsx`, `alert-dialog.tsx`, `chart.tsx`, `field.tsx`, `item.tsx`, `attachment.tsx`, `page-breadcrumbs.tsx`, `sheet.tsx`, `navigation-menu.tsx`, `select.tsx`, `command.tsx`, `table.tsx`, `web/package.json`, `empty.tsx`, `class-variance-authority`, `button-group.tsx`, `message.tsx`, `input-group.tsx`, `toggle-group.tsx`, `progress.tsx`, `tabs.tsx`, `marker.tsx`, `resizable.tsx`, `landing.ts`, `native-select.tsx`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **Why does `uploadFile()` connect `onboarding-wizard.tsx` to `field.tsx`, `written-answer-uploader.tsx`, `icons.tsx`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **What connects `name`, `exports`, `dev` to the rest of the system?**
  _567 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `apps/sdk/src/client/api-client.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05170998632010944 - nodes in this community are weakly interconnected._
- **Should `question-card.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12648221343873517 - nodes in this community are weakly interconnected._
- **Should `schema/qb.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.045454545454545456 - nodes in this community are weakly interconnected._