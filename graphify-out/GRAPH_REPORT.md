# Graph Report - apps (2026-10-05)

## Corpus Check

- 293 files · ~156,031 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 3, .ttf 3, .example 1)

## Summary

- 1458 nodes · 2721 edges · 94 communities (66 shown, 15 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 10 edges (avg confidence: 0.85)
- Token cost: 1,200 input · 300 output

## Community Hubs (Navigation)

- SDK API Client
- Authentication & Layout
- Question Bank Schema & Types
- SDK & Shared Modules
- UI Primitives (sidebar)
- UI Primitives (drawer)
- UI Primitives (animated-theme-toggler)
- Question Bank Schema & Types
- UI Primitives (menubar)
- UI Primitives (combobox)
- Exam & Assessment System
- Onboarding Flow
- Dependencies & Core (dependencies)
- Question Bank Schema & Types
- UI Primitives (share-dialog)
- Dependencies & Core (babel-plugin-react-compiler)
- Web Components
- Question Bank Schema & Types
- Exam & Assessment System
- Shared Question-card
- Question Bank Schema & Types
- Authentication & Layout
- UI Primitives (item)
- Web Tsconfig
- Dependencies & Core (drizzle.config.ts)
- Question Bank Schema & Types
- Src Index
- UI Primitives (native-select)
- UI Primitives (avatar)
- SDK & Shared Modules
- Config Navigation
- UI Primitives (questionnaire)
- Question Bank Schema & Types
- Question Bank Schema & Types
- Authentication & Layout
- Scripts Restore-mcq-options
- Api Tsconfig
- UI Primitives (carousel)
- Shared Rich-text
- (landing) Page
- Question Bank Schema & Types
- Question Bank Schema & Types
- Lib Upload
- UI Primitives (chart)
- Question Bank Schema & Types
- Authentication & Layout
- UI Primitives (card)
- UI Primitives (attachment)
- Dependencies & Core (dependencies)
- Profile App-preferences
- UI Primitives (pagination)
- UI Primitives (breadcrumb)
- Question Bank Schema & Types
- Lib Errors
- Dependencies & Core (devDependencies)
- Consts Landing
- UI Primitives (navigation-menu)
- Lib Errors
- [...all] Route
- Shared Grid-cover
- UI Primitives (toggle-group)
- Dependencies & Core (scripts)
- UI Primitives (empty)
- Dependencies & Core (scripts)
- Exam & Assessment System
- UI Primitives (bubble)
- UI Primitives (input-otp)
- UI Primitives (alert)
- UI Primitives (tabs)
- Src Proxy
- Database & Schema
- UI Primitives (resizable)
- UI Primitives (marker)
- Dependencies & Core (devDependencies)
- SDK API Client
- Web Postcss.config
- Api Readme
- SDK & Shared Modules
- Web Agents
- Web Readme
- SDK & Shared Modules

## God Nodes (most connected - your core abstractions)

1. `react` - 86 edges
2. `cn` - 60 edges
3. `Button()` - 36 edges
4. `toBengaliNumber()` - 34 edges
5. `class-variance-authority` - 17 edges
6. `compilerOptions` - 16 edges
7. `compilerOptions` - 16 edges
8. `recalculateAllCounts()` - 15 edges
9. `getDefaultApiUrl()` - 15 edges
10. `ApiError` - 14 edges

## Surprising Connections (you probably didn't know these)

- `StepHeader()` --calls--> `toBengaliNumber()` [EXTRACTED]
  web/src/components/exam/custom-exam-steps.tsx → web/src/lib/utils.ts
- `CustomExamStep1()` --calls--> `toBengaliNumber()` [EXTRACTED]
  web/src/components/exam/custom-exam-steps.tsx → web/src/lib/utils.ts
- `CustomExamStep2()` --calls--> `toBengaliNumber()` [EXTRACTED]
  web/src/components/exam/custom-exam-steps.tsx → web/src/lib/utils.ts
- `CustomExamStep4()` --calls--> `toBengaliNumber()` [EXTRACTED]
  web/src/components/exam/custom-exam-steps.tsx → web/src/lib/utils.ts
- `QuestionHeader()` --calls--> `toBengaliNumber()` [EXTRACTED]
  web/src/components/shared/question-card.tsx → web/src/lib/utils.ts

## Import Cycles

- None detected.

## Communities (94 total, 15 thin omitted)

### Community 0 - "SDK API Client"

Cohesion: 0.07
Nodes (52): ApiClient, ApiClientConfig, createApiClient(), withCredentialsFetch(), AuthClientConfig, createAuthClient(), DefaultAuthClient, getAuthClient() (+44 more)

### Community 1 - "Authentication & Layout"

Cohesion: 0.06
Nodes (27): metadata, AuthFormFields(), AuthFormFieldsProps, AuthLogo(), AuthMethodToggle(), AuthMethodToggleProps, AuthSubmitButton(), AuthBackdrop() (+19 more)

### Community 2 - "Question Bank Schema & Types"

Cohesion: 0.05
Nodes (43): qbChapterSourcesRelations, qbChaptersRelations, QBChapterTable, qbContainerItemsRelations, QBContainerItemTable, qbContainersRelations, QBContainerTable, qbCustomExamQuestionsRelations (+35 more)

### Community 3 - "SDK & Shared Modules"

Cohesion: 0.05
Nodes (41): tsdown, dependencies, better-auth, hono, zod, description, devDependencies, tsdown (+33 more)

### Community 4 - "UI Primitives (sidebar)"

Cohesion: 0.06
Nodes (18): Sheet(), SheetContent(), SheetDescription(), SheetHeader(), SheetTitle(), Sidebar(), SidebarContext, SidebarContextProps (+10 more)

### Community 5 - "UI Primitives (drawer)"

Cohesion: 0.07
Nodes (19): cmdk, EvaluatedScriptItem, WrittenAnswerUploaderProps, WrittenPageItem, Dialog(), DialogContent(), DialogDescription(), DialogHeader() (+11 more)

### Community 6 - "UI Primitives (animated-theme-toggler)"

Cohesion: 0.06
Nodes (27): next, next-themes, react-dom, sonner, nextConfig, metadata, hindSiliguri, metadata (+19 more)

### Community 7 - "Question Bank Schema & Types"

Cohesion: 0.05
Nodes (37): CreateCustomExamInput, CustomExamData, CustomExamSolveData, CustomExamSubmissionData, CustomExamTakeData, CustomExamWrittenSubmissionItem, QBChapter, QBChapterDetailData (+29 more)

### Community 8 - "UI Primitives (menubar)"

Cohesion: 0.09
Nodes (13): DropdownMenu(), DropdownMenuContent(), DropdownMenuGroup(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuPortal(), DropdownMenuRadioGroup(), DropdownMenuSeparator() (+5 more)

### Community 9 - "UI Primitives (combobox)"

Cohesion: 0.09
Nodes (8): @base-ui/react, InputGroup(), InputGroupAddon(), inputGroupAddonVariants, InputGroupButton(), inputGroupButtonVariants, InputGroupInput(), Textarea()

### Community 10 - "Exam & Assessment System"

Cohesion: 0.11
Nodes (22): CustomExamPage(), CustomExamStep1, CustomExamStep2, CustomExamStep4, CustomExamStepStandard, ExamResultSummary, QuestionPaletteDialog, QbHubContent() (+14 more)

### Community 11 - "Onboarding Flow"

Cohesion: 0.11
Nodes (21): LEVEL_ICONS, StepLevel(), StepLevelProps, StepReady(), StepSchedule(), StepScheduleProps, StepSubjects(), StepSubjectsProps (+13 more)

### Community 12 - "Dependencies & Core (dependencies)"

Cohesion: 0.07
Nodes (28): dependencies, @base-ui/react, class-variance-authority, cmdk, cn, date-fns, embla-carousel-react, input-otp (+20 more)

### Community 13 - "Question Bank Schema & Types"

Cohesion: 0.14
Nodes (19): ExamBottomBar(), ExamBottomBarProps, ExamResultSummary(), ExamResultSummaryProps, formatDuration(), QuestionPaletteDialog(), QuestionPaletteDialogProps, QuestionPaletteItem (+11 more)

### Community 14 - "UI Primitives (share-dialog)"

Cohesion: 0.14
Nodes (12): react, react-day-picker, EditProfileDialogProps, ConfirmDialogProps, EmptyStateProps, ResponsiveDialog(), SHARE_PROVIDERS, ShareDialog() (+4 more)

### Community 15 - "Dependencies & Core (babel-plugin-react-compiler)"

Cohesion: 0.08
Nodes (23): babel-plugin-react-compiler, @biomejs/biome, date-fns, @next/third-parties, rehype-mathjax, reicon-react, shadcn, @shadcn/react (+15 more)

### Community 16 - "Web Components"

Cohesion: 0.08
Nodes (23): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+15 more)

### Community 17 - "Question Bank Schema & Types"

Cohesion: 0.19
Nodes (20): @tanstack/react-query, SingleQuestionPage(), useQBQuestionDetail(), fetchQBChapter(), fetchQBContainer(), fetchQBHub(), fetchQBItem(), fetchQBQuestion() (+12 more)

### Community 18 - "Exam & Assessment System"

Cohesion: 0.09
Nodes (18): CustomExamStep1(), CustomExamStep1Props, CustomExamStep2(), CustomExamStep2Props, CustomExamStep4(), CustomExamStep4Props, CustomExamStepStandardProps, DURATION_PRESETS (+10 more)

### Community 19 - "Shared Question-card"

Cohesion: 0.13
Nodes (17): DEFAULT_OPTION_KEYS, EvaluatedScriptItem, McqOptionsProps, QuestionAnswersProps, QuestionCard(), QuestionCardProps, QuestionHeader(), QuestionHeaderProps (+9 more)

### Community 20 - "Question Bank Schema & Types"

Cohesion: 0.17
Nodes (14): CustomExamSolveContent(), QbItemContent(), QBSubSlugPage(), ExamSolveFilter, QuestionTypeFilter, PageBreadcrumbs(), useCreateCustomExam(), useCustomExamSolve() (+6 more)

### Community 21 - "Authentication & Layout"

Cohesion: 0.15
Nodes (18): Auth, WrittenAnswerUploader(), OnboardingWizard(), StepProfile(), EditProfileDialog(), AppApiClient, authClient, getApiClient() (+10 more)

### Community 22 - "UI Primitives (item)"

Cohesion: 0.13
Nodes (7): ButtonGroup(), buttonGroupVariants, Item(), ItemMedia(), itemMediaVariants, itemVariants, Separator()

### Community 23 - "Web Tsconfig"

Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 24 - "Dependencies & Core (drizzle.config.ts)"

Cohesion: 0.11
Nodes (15): better-auth, hono, @paws/sdk, typescript, zod, name, PresignedUrlResult, s3Client (+7 more)

### Community 25 - "Question Bank Schema & Types"

Cohesion: 0.15
Nodes (17): BUP_SERIES, BupSeriesConfig, cleanSolutionText(), decodeChorcha(), ensureBupContainerAndItems(), getNormalizedBupTag(), imageCache, isDummyOption() (+9 more)

### Community 26 - "Src Index"

Cohesion: 0.18
Nodes (12): auth, closeDatabase(), ALLOWED_METHODS, app, AppType, authApp, shutdown(), env (+4 more)

### Community 28 - "UI Primitives (avatar)"

Cohesion: 0.25
Nodes (8): StepProfileProps, StepReadyProps, Avatar(), AvatarFallback(), AvatarImage(), Tooltip(), TooltipContent(), TooltipTrigger()

### Community 29 - "SDK & Shared Modules"

Cohesion: 0.11
Nodes (17): compilerOptions, declaration, emitDeclarationOnly, esModuleInterop, isolatedModules, lib, module, moduleDetection (+9 more)

### Community 30 - "Config Navigation"

Cohesion: 0.17
Nodes (11): PawsLogo(), AppSidebar(), MobileNav(), Header(), SidebarFooter(), SidebarInset(), TooltipProvider(), ADMIN_NAV_ITEMS (+3 more)

### Community 31 - "UI Primitives (questionnaire)"

Cohesion: 0.14
Nodes (6): buttonVariants, Calendar(), QuestionnaireNext(), QuestionnairePrevious(), QuestionnaireSkip(), QuestionnaireSubmit()

### Community 32 - "Question Bank Schema & Types"

Cohesion: 0.16
Nodes (14): decodeChorcha(), imageCache, main(), migrateImagesInText(), S3_PUBLIC_URL, s3Client, scrapeSeries(), SeriesConfig (+6 more)

### Community 33 - "Question Bank Schema & Types"

Cohesion: 0.15
Nodes (14): qbCustomExamQuestions, qbCustomExams, qbCustomExamSubmissions, qbCustomExamWrittenSubmissions, qbQuestionParts, qbTargets, cleanAndFormatMathText(), mapQuestion() (+6 more)

### Community 34 - "Authentication & Layout"

Cohesion: 0.17
Nodes (7): AuthSubmitButtonProps, ExamSubmittingOverlayProps, AppShell(), AuthGuard(), emptySubscribe(), useMounted(), Spinner()

### Community 36 - "Scripts Restore-mcq-options"

Cohesion: 0.29
Nodes (8): formatDatabase(), cleanHtml(), decodeChorcha(), restoreMedicalOptions(), client, db, recalculateAllCounts(), drizzle-orm

### Community 37 - "Api Tsconfig"

Cohesion: 0.13
Nodes (14): compilerOptions, jsx, jsxImportSource, module, moduleResolution, paths, skipLibCheck, strict (+6 more)

### Community 38 - "UI Primitives (carousel)"

Cohesion: 0.17
Nodes (13): embla-carousel-react, CarouselApi, CarouselContent(), CarouselContext, CarouselContextProps, CarouselItem(), CarouselNext(), CarouselOptions (+5 more)

### Community 39 - "Shared Rich-text"

Cohesion: 0.19
Nodes (12): react-markdown, rehype-raw, remark-gfm, remark-math, CodeBlock(), convertHtmlTableToMarkdown(), preprocessRichContent(), RichText (+4 more)

### Community 40 - "(landing) Page"

Cohesion: 0.17
Nodes (8): LandingFaq(), LandingFooter(), LandingHeader(), LandingHero(), LandingRoadmap(), LandingStats(), LandingStory(), LandingSupporters()

### Community 41 - "Question Bank Schema & Types"

Cohesion: 0.15
Nodes (8): QbContainerContent(), PageLoading(), PillTabItem, PillTabsProps, TabItem, TabsWithSearch(), TabsWithSearchProps, useQBContainerDetail()

### Community 42 - "Question Bank Schema & Types"

Cohesion: 0.21
Nodes (12): cleanSolutionText(), decodeChorcha(), EngineeringSeriesConfig, imageCache, isDummyOption(), main(), migrateImagesInText(), S3_PUBLIC_URL (+4 more)

### Community 43 - "Lib Upload"

Cohesion: 0.30
Nodes (9): buildObjectKey(), resolveUploadFolder(), sanitizeFilename(), attachSession, AuthContextVariables, requireAuth, healthRoute, uploadRoute (+1 more)

### Community 44 - "UI Primitives (chart)"

Cohesion: 0.19
Nodes (11): recharts, ChartConfig, ChartContext, ChartContextProps, ChartLegendContent(), ChartTooltipContent(), getPayloadConfigFromPayload(), INITIAL_DIMENSION (+3 more)

### Community 45 - "Question Bank Schema & Types"

Cohesion: 0.23
Nodes (7): QbTargetContent(), GridCard(), useQBTargetDetail(), EMPTY_SUBJECTS, subjectLevelLabel(), GridCardProps, ResponsiveDialogProps

### Community 47 - "Authentication & Layout"

Cohesion: 0.17
Nodes (11): account, accountRelations, AccountTable, session, sessionRelations, SessionTable, user, userRelations (+3 more)

### Community 48 - "UI Primitives (card)"

Cohesion: 0.26
Nodes (6): Badge(), badgeVariants, Card(), CardContent(), CardHeader(), CardTitle()

### Community 49 - "UI Primitives (attachment)"

Cohesion: 0.20
Nodes (4): Attachment(), AttachmentMedia(), attachmentMediaVariants, attachmentVariants

### Community 50 - "Dependencies & Core (dependencies)"

Cohesion: 0.18
Nodes (11): dependencies, @aws-sdk/client-s3, @aws-sdk/s3-request-presigner, better-auth, drizzle-orm, hono, @hono/zod-validator, @paws/sdk (+3 more)

### Community 51 - "Profile App-preferences"

Cohesion: 0.22
Nodes (5): AppPreferences(), EditProfileDialog, MenuItemProps, ProfileCard(), useConfirm()

### Community 52 - "UI Primitives (pagination)"

Cohesion: 0.31
Nodes (9): TopicWiseViewProps, Pagination(), PaginationContent(), PaginationEllipsis(), PaginationItem(), PaginationLink(), PaginationLinkProps, PaginationNext() (+1 more)

### Community 53 - "UI Primitives (breadcrumb)"

Cohesion: 0.31
Nodes (9): BreadcrumbStep, PageBreadcrumbsProps, Breadcrumb(), BreadcrumbEllipsis(), BreadcrumbItem(), BreadcrumbLink(), BreadcrumbList(), BreadcrumbPage() (+1 more)

### Community 54 - "Question Bank Schema & Types"

Cohesion: 0.22
Nodes (9): CHAPTERS_CONFIG, isEnglishQuestion(), setupMedicalEnglish(), qbChapters, qbContainerItems, qbQuestionChapters, qbQuestions, qbSubjects (+1 more)

### Community 56 - "Dependencies & Core (devDependencies)"

Cohesion: 0.20
Nodes (10): devDependencies, babel-plugin-react-compiler, @biomejs/biome, shadcn, tailwindcss, @tailwindcss/postcss, @types/node, @types/react (+2 more)

### Community 57 - "Consts Landing"

Cohesion: 0.22
Nodes (8): FaqItem, LANDING_FAQS, LANDING_NAV_LINKS, LANDING_ROADMAP, LANDING_STATS, NavItem, RoadmapItem, StatCardItem

### Community 60 - "Lib Errors"

Cohesion: 0.33
Nodes (7): ApiErrorOptions, codeForStatus(), STATUS_CODES, errorBody(), handleError(), handleNotFound(), requestBodyLimit

### Community 61 - "[...all] Route"

Cohesion: 0.22
Nodes (7): DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT

### Community 62 - "Shared Grid-cover"

Cohesion: 0.33
Nodes (8): getBasePalette(), getCoverTheme(), GridCover(), GridCoverProps, PaletteTheme, resolveCoverContent(), resolveStyle(), VariantStyle

### Community 64 - "UI Primitives (toggle-group)"

Cohesion: 0.39
Nodes (5): class-variance-authority, ToggleGroupContext, ToggleGroupItem(), Toggle(), toggleVariants

### Community 65 - "Dependencies & Core (scripts)"

Cohesion: 0.25
Nodes (8): scripts, build, check-types, dev, dev:https, format, lint, start

### Community 67 - "Dependencies & Core (scripts)"

Cohesion: 0.29
Nodes (7): scripts, build, check-types, db:format, db:generate, db:migrate, dev

### Community 68 - "Exam & Assessment System"

Cohesion: 0.43
Nodes (6): ActiveExamSession(), ActiveExamSessionProps, CustomExamTakePage(), ExamSubmittingOverlay, useCustomExamTake(), useSubmitCustomExam()

### Community 69 - "UI Primitives (bubble)"

Cohesion: 0.38
Nodes (4): Bubble(), BubbleReactions(), bubbleReactionsVariants, bubbleVariants

### Community 77 - "Src Proxy"

Cohesion: 0.33
Nodes (4): ALLOWED_BOT_PATTERNS, BLOCKED_SCRAPER_PATTERNS, config, middleware

### Community 78 - "Database & Schema"

Cohesion: 0.40
Nodes (3): client, db, postgres

### Community 81 - "Dependencies & Core (devDependencies)"

Cohesion: 0.50
Nodes (4): devDependencies, drizzle-kit, @types/bun, typescript

### Community 82 - "SDK API Client"

Cohesion: 0.67
Nodes (3): ApiRoutesType, getServerApiClient(), resolveApiUrl()

## Knowledge Gaps

- **447 isolated node(s):** `name`, `dev`, `build`, `check-types`, `db:generate` (+442 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 740 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `UI Primitives (share-dialog)` to `Authentication & Layout`, `UI Primitives (sidebar)`, `UI Primitives (drawer)`, `UI Primitives (animated-theme-toggler)`, `UI Primitives (menubar)`, `UI Primitives (combobox)`, `Exam & Assessment System`, `Onboarding Flow`, `Dependencies & Core (babel-plugin-react-compiler)`, `Question Bank Schema & Types`, `Exam & Assessment System`, `Shared Question-card`, `Question Bank Schema & Types`, `UI Primitives (item)`, `UI Primitives (native-select)`, `UI Primitives (avatar)`, `Config Navigation`, `UI Primitives (questionnaire)`, `Authentication & Layout`, `UI Primitives (context-menu)`, `UI Primitives (carousel)`, `Shared Rich-text`, `(landing) Page`, `Question Bank Schema & Types`, `UI Primitives (chart)`, `Question Bank Schema & Types`, `UI Primitives (alert-dialog)`, `UI Primitives (card)`, `UI Primitives (attachment)`, `Profile App-preferences`, `UI Primitives (pagination)`, `UI Primitives (breadcrumb)`, `UI Primitives (select)`, `UI Primitives (table)`, `UI Primitives (toggle-group)`, `Exam & Assessment System`, `UI Primitives (bubble)`, `UI Primitives (message)`, `UI Primitives (message-scroller)`, `UI Primitives (popover)`, `UI Primitives (input-otp)`, `UI Primitives (alert)`, `UI Primitives (marker)`?**
  _High betweenness centrality (0.257) - this node is a cross-community bridge._
- **Why does `cn` connect `UI Primitives (native-select)` to `Authentication & Layout`, `UI Primitives (sidebar)`, `UI Primitives (drawer)`, `UI Primitives (menubar)`, `UI Primitives (combobox)`, `Onboarding Flow`, `Question Bank Schema & Types`, `UI Primitives (share-dialog)`, `Dependencies & Core (babel-plugin-react-compiler)`, `Exam & Assessment System`, `Shared Question-card`, `UI Primitives (item)`, `UI Primitives (avatar)`, `UI Primitives (questionnaire)`, `Authentication & Layout`, `UI Primitives (context-menu)`, `UI Primitives (carousel)`, `UI Primitives (chart)`, `UI Primitives (alert-dialog)`, `UI Primitives (card)`, `UI Primitives (attachment)`, `UI Primitives (pagination)`, `UI Primitives (breadcrumb)`, `UI Primitives (navigation-menu)`, `UI Primitives (select)`, `UI Primitives (table)`, `UI Primitives (toggle-group)`, `UI Primitives (empty)`, `UI Primitives (bubble)`, `UI Primitives (message)`, `UI Primitives (message-scroller)`, `UI Primitives (popover)`, `UI Primitives (input-otp)`, `UI Primitives (alert)`, `UI Primitives (progress)`, `UI Primitives (tabs)`, `UI Primitives (resizable)`, `UI Primitives (marker)`, `UI Primitives (hover-card)`?**
  _High betweenness centrality (0.089) - this node is a cross-community bridge._
- **Why does `uploadFile()` connect `Authentication & Layout` to `Profile App-preferences`, `UI Primitives (avatar)`, `UI Primitives (drawer)`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **What connects `name`, `dev`, `build` to the rest of the system?**
  _447 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `SDK API Client` be split into smaller, more focused modules?**
  _Cohesion score 0.06553128470936691 - nodes in this community are weakly interconnected._
- **Should `Authentication & Layout` be split into smaller, more focused modules?**
  _Cohesion score 0.05714285714285714 - nodes in this community are weakly interconnected._
- **Should `Question Bank Schema & Types` be split into smaller, more focused modules?**
  _Cohesion score 0.045454545454545456 - nodes in this community are weakly interconnected._
