# Graph Report - apps  (2026-10-06)

## Corpus Check
- 288 files · ~169,133 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 3, .ttf 3, .example 1)

## Summary
- 1617 nodes · 3066 edges · 88 communities (65 shown, 11 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 10 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `52db605b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- api-client.ts
- use-question-bank.ts
- use-watch.ts
- schema/qb.ts
- sdk/package.json
- sidebar.tsx
- DESIGN.md
- api/package.json
- types/qb.ts
- shared/index.ts
- icons.tsx
- scrape-bup-qb.ts
- watch.route.ts
- auth-form-fields.tsx
- react
- menubar.tsx
- api/src/index.ts
- utils.ts
- dependencies
- upload.route.ts
- web/package.json
- step-ready.tsx
- responsive-dialog.tsx
- qb.route.ts
- components.json
- custom-exam-steps.tsx
- cn
- combobox.tsx
- step-profile.tsx
- compilerOptions
- onboarding-wizard.tsx
- app/layout.tsx
- field.tsx
- compilerOptions
- questionnaire.tsx
- scrape-all-remaining-qb.ts
- question-card.tsx
- compilerOptions
- carousel.tsx
- edit-profile-dialog.tsx
- drawer.tsx
- scrape-engineering-qb.ts
- chart.tsx
- app-sidebar.tsx
- class-variance-authority
- (landing)/page.tsx
- topic-wise-view.tsx
- item.tsx
- recalculateAllCounts
- landing-stats.tsx
- attachment.tsx
- theme-toggle.tsx
- landing.ts
- page-breadcrumbs.tsx
- devDependencies
- navigation-menu.tsx
- rich-text.tsx
- route.ts
- grid-cover.tsx
- storage.service.ts
- scripts
- pill-tabs.tsx
- empty.tsx
- use-copy-to-clipboard.ts
- bubble.tsx
- input-otp.tsx
- landing-faq.tsx
- alert.tsx
- tabs.tsx
- proxy.ts
- resizable.tsx
- web/README.md
- tsdown-starter
- AGENTS.md
- postcss.config.mjs
- { signIn, signUp, signOut, useSession, getSession }

## God Nodes (most connected - your core abstractions)
1. `react` - 92 edges
2. `cn` - 60 edges
3. `Button()` - 38 edges
4. `toBengaliNumber()` - 34 edges
5. `recalculateAllCounts()` - 17 edges
6. `class-variance-authority` - 17 edges
7. `PageLoading()` - 17 edges
8. `drizzle-orm` - 16 edges
9. `compilerOptions` - 16 edges
10. `compilerOptions` - 16 edges

## Surprising Connections (you probably didn't know these)
- `StepHeader()` --calls--> `toBengaliNumber()`  [EXTRACTED]
  web/src/components/exam/custom-exam-steps.tsx → web/src/lib/utils.ts
- `CustomExamStep1()` --calls--> `toBengaliNumber()`  [EXTRACTED]
  web/src/components/exam/custom-exam-steps.tsx → web/src/lib/utils.ts
- `CustomExamStep2()` --calls--> `toBengaliNumber()`  [EXTRACTED]
  web/src/components/exam/custom-exam-steps.tsx → web/src/lib/utils.ts
- `CustomExamStep4()` --calls--> `toBengaliNumber()`  [EXTRACTED]
  web/src/components/exam/custom-exam-steps.tsx → web/src/lib/utils.ts
- `QuestionPaletteDialog()` --calls--> `toBengaliNumber()`  [EXTRACTED]
  web/src/components/exam/question-palette-dialog.tsx → web/src/lib/utils.ts

## Import Cycles
- None detected.

## Communities (88 total, 11 thin omitted)

### Community 0 - "api-client.ts"
Cohesion: 0.05
Nodes (62): ApiClient, ApiClientConfig, createApiClient(), withCredentialsFetch(), AuthClientConfig, createAuthClient(), DefaultAuthClient, getAuthClient() (+54 more)

### Community 1 - "use-question-bank.ts"
Cohesion: 0.05
Nodes (52): CustomExamPage(), CustomExamStep1, CustomExamStep2, CustomExamStep4, CustomExamStepStandard, ExamResultSummary, ExamSubmittingOverlay, QuestionPaletteDialog (+44 more)

### Community 2 - "use-watch.ts"
Cohesion: 0.07
Nodes (34): next, @tanstack/react-query, nextConfig, metadata, metadata, metadata, metadata, metadata (+26 more)

### Community 3 - "schema/qb.ts"
Cohesion: 0.05
Nodes (43): qbChapterSourcesRelations, qbChaptersRelations, QBChapterTable, qbContainerItemsRelations, QBContainerItemTable, qbContainersRelations, QBContainerTable, qbCustomExamQuestionsRelations (+35 more)

### Community 4 - "sdk/package.json"
Cohesion: 0.05
Nodes (41): tsdown, dependencies, better-auth, hono, zod, description, devDependencies, tsdown (+33 more)

### Community 5 - "sidebar.tsx"
Cohesion: 0.06
Nodes (18): Sheet(), SheetContent(), SheetDescription(), SheetHeader(), SheetTitle(), Sidebar(), SidebarContext, SidebarContextProps (+10 more)

### Community 6 - "DESIGN.md"
Cohesion: 0.05
Nodes (40): Badges & Status, Border Radius Scale, Brand & Accent, Breakpoints, Buttons, Cards & Containers, Code, Collapsing Strategy (+32 more)

### Community 7 - "api/package.json"
Cohesion: 0.05
Nodes (35): dependencies, @aws-sdk/client-s3, @aws-sdk/s3-request-presigner, better-auth, drizzle-orm, hono, @hono/zod-validator, @paws/sdk (+27 more)

### Community 8 - "types/qb.ts"
Cohesion: 0.05
Nodes (37): CreateCustomExamInput, CustomExamData, CustomExamSolveData, CustomExamSubmissionData, CustomExamTakeData, CustomExamWrittenSubmissionItem, QBChapter, QBChapterDetailData (+29 more)

### Community 9 - "shared/index.ts"
Cohesion: 0.10
Nodes (20): metadata, CustomExamSolveContent(), ExamSolveFilter, QuestionTypeFilter, AuthGuard(), emptySubscribe(), useMounted(), EmptyState() (+12 more)

### Community 10 - "icons.tsx"
Cohesion: 0.09
Nodes (13): AuthSubmitButtonProps, OAuthButtonsProps, QuestionPaletteDialog(), QuestionPaletteDialogProps, QuestionPaletteItem, WizardFooterProps, PawsLogo(), ConfirmDialog() (+5 more)

### Community 11 - "scrape-bup-qb.ts"
Cohesion: 0.08
Nodes (32): BUP_SERIES, BupSeriesConfig, cleanSolutionText(), decodeChorcha(), ensureBupContainerAndItems(), getNormalizedBupTag(), imageCache, isDummyOption() (+24 more)

### Community 12 - "watch.route.ts"
Cohesion: 0.09
Nodes (30): determineCategory(), extractTags(), parseDurationToSeconds(), parseRelativeDate(), RawVideoItem, run(), account, accountRelations (+22 more)

### Community 13 - "auth-form-fields.tsx"
Cohesion: 0.08
Nodes (21): metadata, AuthFormFields(), AuthFormFieldsProps, AuthLogo(), AuthMethodToggle(), AuthMethodToggleProps, AuthSubmitButton(), AuthBackdrop() (+13 more)

### Community 14 - "react"
Cohesion: 0.12
Nodes (15): react, VerifiedBadge(), InputGroup(), InputGroupAddon(), inputGroupAddonVariants, InputGroupInput(), Textarea(), PlaylistCard() (+7 more)

### Community 15 - "menubar.tsx"
Cohesion: 0.09
Nodes (13): DropdownMenu(), DropdownMenuContent(), DropdownMenuGroup(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuPortal(), DropdownMenuRadioGroup(), DropdownMenuSeparator() (+5 more)

### Community 16 - "api/src/index.ts"
Cohesion: 0.12
Nodes (20): auth, client, closeDatabase(), ALLOWED_METHODS, ApiRoutesType, app, AppType, authApp (+12 more)

### Community 17 - "utils.ts"
Cohesion: 0.14
Nodes (20): ActiveExamSession(), ActiveExamSessionProps, CustomExamTakePage(), QbItemContent(), ExamBottomBar(), ExamBottomBarProps, ExamResultSummary(), ExamResultSummaryProps (+12 more)

### Community 18 - "dependencies"
Cohesion: 0.07
Nodes (29): dependencies, @base-ui/react, class-variance-authority, cmdk, cn, date-fns, embla-carousel-react, input-otp (+21 more)

### Community 19 - "upload.route.ts"
Cohesion: 0.12
Nodes (13): ApiError, ApiErrorOptions, STATUS_CODES, buildObjectKey(), resolveUploadFolder(), sanitizeFilename(), attachSession, AuthContextVariables (+5 more)

### Community 20 - "web/package.json"
Cohesion: 0.07
Nodes (26): babel-plugin-react-compiler, @biomejs/biome, cmdk, date-fns, @next/third-parties, @paws/api, react-day-picker, rehype-mathjax (+18 more)

### Community 21 - "step-ready.tsx"
Cohesion: 0.11
Nodes (20): LEVEL_ICONS, StepLevel(), StepLevelProps, StepReady(), StepReadyProps, StepSchedule(), StepScheduleProps, StepSubjects() (+12 more)

### Community 22 - "responsive-dialog.tsx"
Cohesion: 0.13
Nodes (9): EvaluatedScriptItem, WrittenAnswerUploaderProps, WrittenPageItem, Dialog(), DialogContent(), DialogDescription(), DialogHeader(), DialogTitle() (+1 more)

### Community 23 - "qb.route.ts"
Cohesion: 0.11
Nodes (22): CHAPTERS_CONFIG, isEnglishQuestion(), setupMedicalEnglish(), qbChapters, qbContainerItems, qbCustomExamQuestions, qbCustomExams, qbCustomExamSubmissions (+14 more)

### Community 24 - "components.json"
Cohesion: 0.08
Nodes (23): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+15 more)

### Community 25 - "custom-exam-steps.tsx"
Cohesion: 0.09
Nodes (19): CustomExamStep1(), CustomExamStep1Props, CustomExamStep2(), CustomExamStep2Props, CustomExamStep4(), CustomExamStep4Props, CustomExamStepStandardProps, DURATION_PRESETS (+11 more)

### Community 27 - "combobox.tsx"
Cohesion: 0.10
Nodes (3): @base-ui/react, InputGroupButton(), inputGroupButtonVariants

### Community 28 - "step-profile.tsx"
Cohesion: 0.23
Nodes (10): StepProfile(), StepProfileProps, ProfileCard(), Avatar(), AvatarFallback(), AvatarImage(), Tooltip(), TooltipContent() (+2 more)

### Community 29 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 30 - "onboarding-wizard.tsx"
Cohesion: 0.17
Nodes (16): Auth, OnboardingWizard(), WizardFooter(), EditProfileDialog(), AppApiClient, authClient, getApiClient(), getAuthClient() (+8 more)

### Community 31 - "app/layout.tsx"
Cohesion: 0.15
Nodes (13): next-themes, hindSiliguri, metadata, ConfirmContext, ConfirmContextType, ConfirmOptions, ConfirmProvider(), getQueryClient() (+5 more)

### Community 32 - "field.tsx"
Cohesion: 0.13
Nodes (7): ButtonGroup(), buttonGroupVariants, Field(), FieldDescription(), fieldVariants, Label(), Separator()

### Community 33 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, declaration, emitDeclarationOnly, esModuleInterop, isolatedModules, lib, module, moduleDetection (+9 more)

### Community 34 - "questionnaire.tsx"
Cohesion: 0.14
Nodes (6): buttonVariants, Calendar(), QuestionnaireNext(), QuestionnairePrevious(), QuestionnaireSkip(), QuestionnaireSubmit()

### Community 35 - "scrape-all-remaining-qb.ts"
Cohesion: 0.18
Nodes (15): ALL_TARGET_BANKS, BankConfig, cleanSolutionText(), decodeChorcha(), ensureContainerAndItem(), getNormalizedTag(), imageCache, isDummyOption() (+7 more)

### Community 36 - "question-card.tsx"
Cohesion: 0.13
Nodes (12): WrittenAnswerUploader(), DEFAULT_OPTION_KEYS, EvaluatedScriptItem, McqOptionsProps, QuestionAnswersProps, QuestionCardProps, QuestionHeader(), QuestionHeaderProps (+4 more)

### Community 38 - "compilerOptions"
Cohesion: 0.13
Nodes (14): compilerOptions, jsx, jsxImportSource, module, moduleResolution, paths, skipLibCheck, strict (+6 more)

### Community 39 - "carousel.tsx"
Cohesion: 0.17
Nodes (13): embla-carousel-react, CarouselApi, CarouselContent(), CarouselContext, CarouselContextProps, CarouselItem(), CarouselNext(), CarouselOptions (+5 more)

### Community 40 - "edit-profile-dialog.tsx"
Cohesion: 0.17
Nodes (9): sonner, AppPreferences(), EditProfileDialog, MenuItemProps, EditProfileDialogProps, useConfirm(), SHARE_PROVIDERS, ShareDialogProps (+1 more)

### Community 41 - "drawer.tsx"
Cohesion: 0.14
Nodes (9): Drawer(), DrawerContent(), DrawerContext, DrawerContextProps, DrawerDescription(), DrawerHeader(), DrawerTitle(), DrawerTrigger() (+1 more)

### Community 42 - "scrape-engineering-qb.ts"
Cohesion: 0.21
Nodes (12): cleanSolutionText(), decodeChorcha(), EngineeringSeriesConfig, imageCache, isDummyOption(), main(), migrateImagesInText(), S3_PUBLIC_URL (+4 more)

### Community 43 - "chart.tsx"
Cohesion: 0.19
Nodes (11): recharts, ChartConfig, ChartContext, ChartContextProps, ChartLegendContent(), ChartTooltipContent(), getPayloadConfigFromPayload(), INITIAL_DIMENSION (+3 more)

### Community 44 - "app-sidebar.tsx"
Cohesion: 0.21
Nodes (10): AppShell(), AppSidebar(), MobileNav(), Header(), SidebarFooter(), SidebarInset(), ADMIN_NAV_ITEMS, MENTOR_NAV_ITEMS (+2 more)

### Community 45 - "class-variance-authority"
Cohesion: 0.22
Nodes (7): class-variance-authority, Marker(), markerVariants, ToggleGroupContext, ToggleGroupItem(), Toggle(), toggleVariants

### Community 46 - "(landing)/page.tsx"
Cohesion: 0.19
Nodes (7): LandingFaq(), LandingFooter(), LandingHeader(), LandingHero(), LandingStats(), LandingStory(), LandingSupporters()

### Community 47 - "topic-wise-view.tsx"
Cohesion: 0.26
Nodes (11): getPageItems(), TopicWiseView(), TopicWiseViewProps, Pagination(), PaginationContent(), PaginationEllipsis(), PaginationItem(), PaginationLink() (+3 more)

### Community 49 - "item.tsx"
Cohesion: 0.18
Nodes (4): Item(), ItemMedia(), itemMediaVariants, itemVariants

### Community 50 - "recalculateAllCounts"
Cohesion: 0.33
Nodes (7): formatDatabase(), cleanHtml(), decodeChorcha(), restoreMedicalOptions(), db, recalculateAllCounts(), drizzle-orm

### Community 51 - "landing-stats.tsx"
Cohesion: 0.26
Nodes (6): Badge(), badgeVariants, Card(), CardContent(), CardHeader(), CardTitle()

### Community 52 - "attachment.tsx"
Cohesion: 0.20
Nodes (4): Attachment(), AttachmentMedia(), attachmentMediaVariants, attachmentVariants

### Community 53 - "theme-toggle.tsx"
Cohesion: 0.29
Nodes (9): react-dom, emptySubscribe(), ThemeToggle(), ThemeToggleProps, AnimatedThemeToggler(), AnimatedThemeTogglerProps, getThemeTransitionClipPaths(), polygonCollapsed() (+1 more)

### Community 54 - "landing.ts"
Cohesion: 0.20
Nodes (9): LandingRoadmap(), FaqItem, LANDING_FAQS, LANDING_NAV_LINKS, LANDING_ROADMAP, LANDING_STATS, NavItem, RoadmapItem (+1 more)

### Community 55 - "page-breadcrumbs.tsx"
Cohesion: 0.31
Nodes (9): BreadcrumbStep, PageBreadcrumbsProps, Breadcrumb(), BreadcrumbEllipsis(), BreadcrumbItem(), BreadcrumbLink(), BreadcrumbList(), BreadcrumbPage() (+1 more)

### Community 56 - "devDependencies"
Cohesion: 0.20
Nodes (10): devDependencies, babel-plugin-react-compiler, @biomejs/biome, shadcn, tailwindcss, @tailwindcss/postcss, @types/node, @types/react (+2 more)

### Community 59 - "rich-text.tsx"
Cohesion: 0.28
Nodes (8): react-markdown, rehype-raw, remark-gfm, remark-math, convertHtmlTableToMarkdown(), preprocessRichContent(), RichText, RichTextProps

### Community 60 - "route.ts"
Cohesion: 0.22
Nodes (7): DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT

### Community 61 - "grid-cover.tsx"
Cohesion: 0.33
Nodes (8): getBasePalette(), getCoverTheme(), GridCover(), GridCoverProps, PaletteTheme, resolveCoverContent(), resolveStyle(), VariantStyle

### Community 63 - "storage.service.ts"
Cohesion: 0.25
Nodes (6): PresignedUrlResult, s3Client, storageService, UploadResult, @aws-sdk/client-s3, @aws-sdk/s3-request-presigner

### Community 64 - "scripts"
Cohesion: 0.25
Nodes (8): scripts, build, check-types, dev, dev:https, format, lint, start

### Community 65 - "pill-tabs.tsx"
Cohesion: 0.21
Nodes (5): PillTabItem, PillTabsProps, TabItem, TabsWithSearch(), TabsWithSearchProps

### Community 67 - "use-copy-to-clipboard.ts"
Cohesion: 0.38
Nodes (5): CodeBlock(), ShareDialog(), useCopyToClipboard(), UseCopyToClipboardOptions, copyToClipboard()

### Community 68 - "bubble.tsx"
Cohesion: 0.38
Nodes (4): Bubble(), BubbleReactions(), bubbleReactionsVariants, bubbleVariants

### Community 72 - "landing-faq.tsx"
Cohesion: 0.60
Nodes (4): Accordion(), AccordionContent(), AccordionItem(), AccordionTrigger()

### Community 76 - "proxy.ts"
Cohesion: 0.33
Nodes (4): ALLOWED_BOT_PATTERNS, BLOCKED_SCRAPER_PATTERNS, config, middleware

### Community 78 - "web/README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

## Knowledge Gaps
- **513 isolated node(s):** `name`, `exports`, `dev`, `build`, `check-types` (+508 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 816 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `use-question-bank.ts`, `sidebar.tsx`, `shared/index.ts`, `icons.tsx`, `auth-form-fields.tsx`, `menubar.tsx`, `utils.ts`, `web/package.json`, `step-ready.tsx`, `responsive-dialog.tsx`, `custom-exam-steps.tsx`, `cn`, `combobox.tsx`, `step-profile.tsx`, `onboarding-wizard.tsx`, `app/layout.tsx`, `field.tsx`, `questionnaire.tsx`, `question-card.tsx`, `context-menu.tsx`, `carousel.tsx`, `edit-profile-dialog.tsx`, `drawer.tsx`, `chart.tsx`, `app-sidebar.tsx`, `class-variance-authority`, `topic-wise-view.tsx`, `alert-dialog.tsx`, `item.tsx`, `landing-stats.tsx`, `attachment.tsx`, `theme-toggle.tsx`, `page-breadcrumbs.tsx`, `select.tsx`, `rich-text.tsx`, `table.tsx`, `pill-tabs.tsx`, `use-copy-to-clipboard.ts`, `bubble.tsx`, `message.tsx`, `popover.tsx`, `input-otp.tsx`, `alert.tsx`?**
  _High betweenness centrality (0.225) - this node is a cross-community bridge._
- **Why does `cn` connect `cn` to `sidebar.tsx`, `icons.tsx`, `react`, `menubar.tsx`, `utils.ts`, `web/package.json`, `step-ready.tsx`, `responsive-dialog.tsx`, `custom-exam-steps.tsx`, `combobox.tsx`, `step-profile.tsx`, `field.tsx`, `questionnaire.tsx`, `context-menu.tsx`, `carousel.tsx`, `edit-profile-dialog.tsx`, `drawer.tsx`, `chart.tsx`, `class-variance-authority`, `topic-wise-view.tsx`, `alert-dialog.tsx`, `item.tsx`, `landing-stats.tsx`, `attachment.tsx`, `page-breadcrumbs.tsx`, `navigation-menu.tsx`, `select.tsx`, `table.tsx`, `empty.tsx`, `bubble.tsx`, `message.tsx`, `popover.tsx`, `input-otp.tsx`, `landing-faq.tsx`, `alert.tsx`, `progress.tsx`, `tabs.tsx`, `resizable.tsx`?**
  _High betweenness centrality (0.089) - this node is a cross-community bridge._
- **Why does `uploadFile()` connect `step-profile.tsx` to `question-card.tsx`, `responsive-dialog.tsx`, `onboarding-wizard.tsx`?**
  _High betweenness centrality (0.062) - this node is a cross-community bridge._
- **What connects `name`, `exports`, `dev` to the rest of the system?**
  _513 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `api-client.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05170998632010944 - nodes in this community are weakly interconnected._
- **Should `use-question-bank.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05443371378402107 - nodes in this community are weakly interconnected._
- **Should `use-watch.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07312925170068027 - nodes in this community are weakly interconnected._