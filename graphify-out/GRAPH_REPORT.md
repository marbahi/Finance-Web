# Graph Report - finance-monitor  (2026-10-09)

## Corpus Check
- 95 files · ~36,147 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 120 nodes · 134 edges · 14 communities (12 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `94497d9e`
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

## God Nodes (most connected - your core abstractions)
1. `scripts` - 7 edges
2. `Transactions()` - 6 edges
3. `Reports()` - 5 edges
4. `Wallets()` - 4 edges
5. `buildReportCSV()` - 4 edges
6. `Pagination()` - 4 edges
7. `formatRp()` - 3 edges
8. `Templates()` - 3 edges
9. `usePagination()` - 3 edges
10. `getDbUrl()` - 2 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (14 total, 2 thin omitted)

### Community 0 - "Transactions.jsx"
Cohesion: 0.31
Nodes (8): formatDate(), formatRp(), getMonthRange(), getYearRange(), today, todayStr, Transactions(), mocks

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
Cohesion: 0.10
Nodes (21): devDependencies, jsdom, oxlint, @testing-library/jest-dom, @testing-library/react, @testing-library/user-event, @types/react, @types/react-dom (+13 more)

### Community 7 - "jsdom"
Cohesion: 0.19
Nodes (13): COLORS, CustomTooltip(), formatAxis(), formatRp(), isoDay(), MONTH_SHORT, Reports(), sumBy() (+5 more)

### Community 8 - "@testing-library/jest-dom"
Cohesion: 0.31
Nodes (4): formatRp(), Wallets(), walletTypes, mockCtx

### Community 9 - "@testing-library/react"
Cohesion: 0.60
Nodes (3): formatRp(), Templates(), mocks

## Knowledge Gaps
- **43 isolated node(s):** `COLORS`, `MONTH_SHORT`, `today`, `todayStr`, `walletTypes` (+38 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `devDependencies` to `package.json`?**
  _High betweenness centrality (0.108) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.091) - this node is a cross-community bridge._
- **What connects `COLORS`, `MONTH_SHORT`, `today` to the rest of the system?**
  _43 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._