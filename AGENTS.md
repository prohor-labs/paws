<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->

# Codebase Knowledge Graph & Architecture (`graphify`)

A knowledge graph is maintained in `graphify-out/` to trace relationships, dependencies, AST symbols, and cross-module connections across the codebase.

## Available Scripts

- `bun run graphify` (or `npm run graphify`): Run full knowledge graph pipeline across the entire repository.
- `bun run graphify:apps`: Build knowledge graph specifically targeting `apps/`.
- `bun run graphify:update`: Incrementally re-extract only modified and newly added files.

## Agent Guidelines for `graphify`

1. **Query Existing Graph First**: Before doing broad blind searches across workspaces, check if `graphify-out/graph.json` exists. Use `graphify query "<question>"` or `graphify path "<nodeA>" "<nodeB>"` for context traversal.
2. **Reviewing Reports**: Check [`graphify-out/GRAPH_REPORT.md`](file:///root/paws.academy/graphify-out/GRAPH_REPORT.md) to inspect God Nodes (core abstractions), community clusters, and surprise dependencies.
3. **Visualization**: An interactive visualization is available at [`graphify-out/graph.html`](file:///root/paws.academy/graphify-out/graph.html).
