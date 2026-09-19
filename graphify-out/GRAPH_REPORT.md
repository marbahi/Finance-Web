# Graph Report - finance-monitor  (2026-09-19)

## Corpus Check
- 93 files · ~34,733 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 79 nodes · 85 edges · 15 communities (6 shown, 9 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `09f9ca8c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Transactions.jsx
- transactions.js
- graphify.js
- dependencies
- package.json
- pagination.jsx
- devDependencies
- jsdom
- @testing-library/jest-dom
- @testing-library/react
- @types/react
- @types/react-dom
- vite
- @vitejs/plugin-react
- vitest

## God Nodes (most connected - your core abstractions)
1. `scripts` - 7 edges
2. `Pagination()` - 5 edges
3. `Transactions()` - 5 edges
4. `usePagination()` - 3 edges
5. `lookupName()` - 2 edges
6. `transform()` - 2 edges
7. `@phosphor-icons/react` - 2 edges
8. `@tailwindcss/vite` - 2 edges
9. `motion` - 2 edges
10. `react` - 2 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (15 total, 9 thin omitted)

### Community 0 - "Transactions.jsx"
Cohesion: 0.39
Nodes (7): formatDate(), formatRp(), getMonthRange(), getYearRange(), today, todayStr, Transactions()

### Community 1 - "transactions.js"
Cohesion: 0.40
Nodes (4): lookupName(), router, TRANS_TYPES, transform()

### Community 3 - "dependencies"
Cohesion: 0.12
Nodes (17): dependencies, motion, @phosphor-icons/react, react, react-dom, react-router-dom, recharts, tailwindcss (+9 more)

### Community 4 - "package.json"
Cohesion: 0.17
Nodes (11): name, private, scripts, build, dev, lint, preview, test (+3 more)

### Community 5 - "pagination.jsx"
Cohesion: 0.23
Nodes (9): arrow(), CELL, EASE, paginate(), Pagination(), ROLL, slotFor(), STILL (+1 more)

### Community 6 - "devDependencies"
Cohesion: 0.40
Nodes (5): devDependencies, oxlint, @testing-library/user-event, oxlint, @testing-library/user-event

## Knowledge Gaps
- **36 isolated node(s):** `router`, `TRANS_TYPES`, `name`, `private`, `version` (+31 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `devDependencies` to `package.json`, `jsdom`, `@testing-library/jest-dom`, `@testing-library/react`, `@types/react`, `@types/react-dom`, `vite`, `@vitejs/plugin-react`, `vitest`?**
  _High betweenness centrality (0.253) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.213) - this node is a cross-community bridge._
- **What connects `router`, `TRANS_TYPES`, `name` to the rest of the system?**
  _36 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._