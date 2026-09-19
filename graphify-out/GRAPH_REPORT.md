# Graph Report - finance-monitor  (2026-08-09)

## Corpus Check
- 92 files · ~33,676 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 17 nodes · 19 edges · 3 communities (2 shown, 1 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b7a4bde6`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Transactions.jsx
- transactions.js
- graphify.js

## God Nodes (most connected - your core abstractions)
1. `Transactions()` - 5 edges
2. `lookupName()` - 2 edges
3. `transform()` - 2 edges
4. `getMonthRange()` - 2 edges
5. `getYearRange()` - 2 edges
6. `formatRp()` - 2 edges
7. `formatDate()` - 2 edges
8. `IMPORTANT: keep the reminder string free of backticks and $(...) constructs.` - 1 edges
9. `router` - 1 edges
10. `TRANS_TYPES` - 1 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (3 total, 1 thin omitted)

### Community 0 - "Transactions.jsx"
Cohesion: 0.39
Nodes (7): formatDate(), formatRp(), getMonthRange(), getYearRange(), today, todayStr, Transactions()

### Community 1 - "transactions.js"
Cohesion: 0.40
Nodes (4): lookupName(), router, TRANS_TYPES, transform()

## Knowledge Gaps
- **4 isolated node(s):** `router`, `TRANS_TYPES`, `today`, `todayStr`
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What connects `router`, `TRANS_TYPES`, `today` to the rest of the system?**
  _4 weakly-connected nodes found - possible documentation gaps or missing edges._