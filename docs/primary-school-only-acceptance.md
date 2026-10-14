# Primary-school-only acceptance

Inspected on 2026-10-14 using the running Vite app at `http://127.0.0.1:5179/`, Playwright Chromium 151.0.7922.34, and screenshot review. Viewports were **320 × 800** and **430 × 932** CSS pixels, device scale factor 1. These are browser viewport checks, not physical-device certification; safe-area insets were zero.

The browser used an isolated context. Login used `chenxi_2026` / `demo-password`. Other grade fixtures reused the valid saved demonstration state with only `grade` changed to `grade1` or `grade3`, followed by reload. This checks the actual rendered grade-specific screens without modifying a user's browser data. Navigation below identifies in-app views: the shell keeps the URL at `/`.

## Visual and interaction acceptance

Each checked box reflects an actual running-app inspection, not an inference from unit tests.

| Check | 320 × 800 | 430 × 932 | Actions and observations |
| --- | --- | --- | --- |
| Login without stage chooser or prototype disclaimer | [x] | [x] | Cleared the isolated app state, inspected the full login screen, entered credentials and logged in. Brand, welcome, companion and account/password controls fit. |
| qmx complete comic, uncropped panels | [x] | [x] | Knowledge → each of days 1–8 → 阅读本集内容; scrolled every image into view. Page counts were 8/8/8/9/7/10/8/9 (67 total). Every image decoded successfully at both widths. Full 16:9 panels retain dialogue and scene edges. Reviewed chapter screenshots and a centered-panel contact sheet. Fine embedded text naturally appears smaller at 320px. |
| cxd inline video and original-platform action | [x] | [x] | Knowledge → chapter 1; inspected both video cards and links. Clicked the first embedded player's play control: video had `readyState=4`, duration 341s, and advanced from 0.01s to over 11s while playing; inspected playback at both widths. Player and link stay within the page. |
| Original Bilibili destination successfully serves its watch page | [ ] | [ ] | Both external-link clicks opened `https://www.bilibili.com/video/BV12dwVzuEmF` in a new tab, but the provider returned title `出错啦! - bilibili.com`. Navigation works; successful external playback is not certified. |
| ael warm chapter layout | [x] | [x] | Default Knowledge → 第一次 AI 实验 → 阅读本章内容. All five warm sections (生活问题、核心知识、小实验、安全提醒、本章挑战) and the completion button fit; no dark laboratory layout. |
| Full vertical maps | [x] | [x] | Test for grades 1, 3 and 5; inspected top, midpoint and bottom of each scroll region. All 8/6/9 nodes are present and reachable, including 我的 AI 小项目. Narrow labels remain visible below icons; wider layouts retain side labels and status. |
| Companion above current node and within map frame | [x] | [x] | Inspected each map on entry. Companion bottom is above current-node top; its horizontal bounds and initial vertical bounds are inside the map viewport for all six grade/viewport combinations. |
| Bottom navigation clearance | [x] | [x] | Scrolled Knowledge, ael reading, Test, Profile, Mall and Points to their ends, reviewed screenshots and measured the final content boundary above navigation. All clearances are positive; see table below. |
| Mall purchase and wardrobe | [x] | [x] | My → 积分商城 → buy 云朵 Yunduo (360) → 暂不更换 → 我的 wardrobe → 装上. Bought 云朵小背包 (160), selected 现在换上, then 卸下 from the wardrobe. At 320px also equipped the backpack again. Dialogs, owned cards and action controls remained usable. |
| Ledger consistency | [x] | [x] | On each fresh fixture: 2,000 → 1,640 → 1,480 after the two purchases. Profile/Mall/Points agree; Points shows earned +2,000, spent -520, and individual -360/-160 transactions. Equip/unequip adds no spending. Saved transaction sum is 1,480. |
| Horizontal containment | [x] | [x] | Document scroll width matched viewport width on inspected login, knowledge, reading, maps, profile, mall, wardrobe and ledger screens. Internal map scroll/client widths matched at 258/258 and 368/368 respectively. |

Additional 320px interaction: clicking locked `第一次 AI 实验` displayed `先完成第 4 部分知识`; clicking current `算法工具箱` opened its introduction and then its five-question quiz.

## Measured bottom clearance

Values are rounded CSS pixels from the final content boundary to the fixed navigation's top, after scrolling to the document end. The content boundary is `.treasure-toggle`, `.content-completion`, `.test-route-card`, `.settings-entry`, `.mall-grid`, or `.points-list` respectively. Navigation top was 729px / 861px.

| Screen | 320 × 800 | 430 × 932 |
| --- | ---: | ---: |
| Knowledge | 125 | 125 |
| ael chapter | 29 | 219 |
| Test map card | 125 | 141 |
| Profile | 125 | 125 |
| Mall catalogue | 17 | 149 |
| Default points ledger | 178 | 310 |

## Fixes and regression coverage

- Preserved the existing Task 12 test drafts: approved login → Knowledge → Test → My → Mall journey, complete course/map counts across all three bands, and direct purchase ledger consistency. Retained the explicit ninth project-node assertion.
- Added page/media containment and navigation-aware bottom padding. Reapplying the old reading-page 40px padding in the browser reproduced a negative section clearance (-5.84px) at 320px; the final rule leaves 29px.
- Wrapped narrow knowledge headings and chapter rows after seeing truncated titles. Kept narrow map names visible below their icons instead of the draft's hidden-label rule. Secondary status text on the narrow map remains available through each button's accessible name and state icon.

## Automated verification

- [x] `npm test -- src/app/App.integration.test.tsx --run`: 1 file, 3 tests pass.
- [x] `npm test -- src/app/App.integration.test.tsx src/features/knowledge/KnowledgePage.test.tsx src/features/test/TestPage.test.tsx src/features/profile/MallPage.test.tsx --run`: 4 files, 34 tests pass.
- [x] `npm test -- --run`: 26 files, 161 tests pass.
- [x] `npm run build`: TypeScript and Vite build pass.
- [x] `git diff --check`: no whitespace errors.
- [x] `rg -n "中学端|初中|七至九年级|7—9|secondary|LearningStage" src server public`: no matches (exit 1 is the expected no-match result).

Non-failing diagnostics: jsdom reports unimplemented `window.scrollTo`; Vite reports ignored `inlineDynamicImports`, IIFE `import.meta` replacement and bundle size above 500kB. Real browser scrolling was inspected independently. Native speech/microphone, physical safe-area devices and successful Bilibili watch-page service were not manually certified in this task; existing automated speech, safety, drag, guardian and handoff coverage remains in the passing suite.

Local screenshots are retained under `.superpowers/sdd/2026-10-12-primary-school-only-redesign/task-12-evidence/` as uncommitted scratch evidence. Examples include `320-login.png`, `430-login.png`, `{320,430}-qmx-day{1..8}.png`, `{320,430}-cxd-playback.png`, `{320,430}-grade{1,3,5}-map-{0,0.5,1}.png`, `{320,430}-wardrobe.png` and `{320,430}-ledger.png`.
