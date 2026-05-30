# 退休金算盘小程序 V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the V1 native WeChat mini program for Pension Abacus using the existing product, UI, interaction, and QA documents as the source of truth.

**Architecture:** Use a native mini program structure under `miniprogram/`, with page code kept thin and reusable calculation/data gate logic under `miniprogram/utils/`. Keep data bundled as local JSON snapshots copied from `data/`, and make benchmark-dependent UI hidden by a feature flag until data gates pass.

**Tech Stack:** Native WeChat Mini Program (`WXML`, `WXSS`, `JS`, `JSON`), CommonJS utility modules, Node.js built-in `node:test` for calculation and gate tests.

---

## Source Documents

- `docs/02-functional-design.md`
- `docs/03-interaction-flow.md`
- `docs/04-calculation-and-scoring.md`
- `docs/05-data-library.md`
- `docs/13-ui-style-and-interaction-design.md`
- `docs/14-ui-qa-acceptance-review.md`

## File Structure

- `project.config.json`: WeChat developer tool project metadata.
- `app.js`, `app.json`, `app.wxss`, `sitemap.json`: app shell.
- `miniprogram/data/*.json`: bundled policy, city, payout, retirement, and benchmark metadata snapshots.
- `miniprogram/utils/date.js`: month arithmetic and formatting.
- `miniprogram/utils/retirement.js`: retirement age and minimum contribution rules.
- `miniprogram/utils/dataGate.js`: city availability and benchmark feature flag rules.
- `miniprogram/utils/pensionCalculator.js`: V1 pension estimate and status labels.
- `miniprogram/utils/storage.js`: local cache helpers.
- `miniprogram/pages/home/*`: home page with 6 modules and disabled future modules.
- `miniprogram/pages/calculate/*`: quick calculation form and city/gender/contribution state.
- `miniprogram/pages/result/*`: amount result, range, status labels, assumptions, data quality, share.
- `miniprogram/pages/account/*`: account balance supplement.
- `miniprogram/pages/about/*`: data source, privacy, disclaimer.
- `tests/*.test.js`: Node tests for data gates, retirement rules, calculation output, and benchmark hidden state.

## Tasks

### Task 1: Core Tests

**Files:**
- Create: `package.json`
- Create: `tests/retirement.test.js`
- Create: `tests/dataGate.test.js`
- Create: `tests/pensionCalculator.test.js`

- [ ] Write failing tests for retirement rule samples from `data/official/retirement-age-rules.json`.
- [ ] Write failing tests proving no city is submittable while city data is only partial/pending.
- [ ] Write failing tests proving `benchmark-meta.json` with `benchmarkVersion: null` hides competition features.
- [ ] Write failing tests for calculation result shape, status labels, privacy-safe share payload, and unknown female worker type returning a range.
- [ ] Run `npm test` and verify tests fail because implementation modules do not exist.

### Task 2: Core Utility Implementation

**Files:**
- Create: `miniprogram/data/*.json`
- Create: `miniprogram/utils/date.js`
- Create: `miniprogram/utils/retirement.js`
- Create: `miniprogram/utils/dataGate.js`
- Create: `miniprogram/utils/pensionCalculator.js`
- Create: `miniprogram/utils/storage.js`

- [ ] Copy required JSON snapshots into `miniprogram/data/`.
- [ ] Implement month arithmetic and `YYYY-MM` formatting.
- [ ] Implement retirement age delay rules and minimum contribution months.
- [ ] Implement city availability: only fully reviewed data can submit; pending data shows explanatory non-submit states.
- [ ] Implement benchmark feature flag: only enabled when version, sample file, city review, sample checks, and reverse-check status are all present.
- [ ] Implement V1 pension calculator: basic pension, personal account pension, range, status labels, data warnings, and transition-pension warning.
- [ ] Implement unknown female worker type by calculating both 50 and 55 tracks and returning a wider range.
- [ ] Run `npm test` and verify core tests pass.

### Task 3: Mini Program Shell

**Files:**
- Create: `project.config.json`
- Create: `app.js`
- Create: `app.json`
- Create: `app.wxss`
- Create: `sitemap.json`

- [ ] Register pages: home, calculate, result, account, about.
- [ ] Configure app window colors using the UI design palette.
- [ ] Add global typography, spacing, cards, buttons, status labels, and safe-area helpers.
- [ ] Verify JSON files parse with Node.

### Task 4: Pages

**Files:**
- Create: `miniprogram/pages/home/*`
- Create: `miniprogram/pages/calculate/*`
- Create: `miniprogram/pages/result/*`
- Create: `miniprogram/pages/account/*`
- Create: `miniprogram/pages/about/*`

- [ ] Implement home page: brand header, primary employee pension module, 5 disabled modules, disclaimer link.
- [ ] Implement calculate page: birth month, gender/retirement type, city required state, paid years/months, contribution level, no default contribution choice, account supplement entry.
- [ ] Implement disabled city behavior: toast/inline message, disabled submit, and data-source link.
- [ ] Implement result page: amount, range, breakdown, status labels, assumptions, data warnings, transition-pension warning, account supplement CTA, about link.
- [ ] Keep competition module hidden unless the feature flag is enabled.
- [ ] Implement account page: input account balance, save locally, recalculate.
- [ ] Implement about page: data source, parameter/model version, privacy, disclaimer.
- [ ] Implement share behavior with no amount, birth month, contribution years, or account balance in the default title/path.

### Task 5: Verification

**Files:**
- Modify as needed based on verification.

- [ ] Run `npm test`.
- [ ] Run a JSON parse check for all app/page JSON files.
- [ ] Search for forbidden default UI copy: leaderboard, 打败全国, 真实用户排名, 官方认证, 精确测算, 保证领取, 准确率.
- [ ] Confirm benchmark-related UI is hidden by default.
- [ ] Confirm README points to implementation and tests.

## Notes

- There is no `.git` directory in this workspace, so plan steps do not include commits.
- This plan intentionally implements V1 with current partial data as non-submittable by default. If a city is later reviewed, the gate can be changed in data without rewriting UI flow.
