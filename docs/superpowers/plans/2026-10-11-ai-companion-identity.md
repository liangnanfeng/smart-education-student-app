# AI Companion Identity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the equipped AI appearance, outfit, and decoration consistent across the points mall, login page, in-app companion, and login transition while preserving the existing auth flow.

**Architecture:** Add a stage-scoped companion loadout to the existing `AppState`, with one reducer/API owning purchases and equipment. Render every AI surface through a shared layered appearance component that keeps sprite, outfit, and decoration inside a responsive safe frame. Capture the login appearance bounds and animate that same layered composition into the in-app floating companion after login, with a direct-render fallback.

**Tech Stack:** React 18, TypeScript, React Router, Vitest + Testing Library, Vite, CSS animations/Web Animations API, localStorage.

**Spec:** `docs/superpowers/specs/2026-10-11-ai-companion-identity-design.md`

## Global Constraints

- Keep existing login, registration, forgot-password, guardian-consent, stage switching, AI positioning, bottom navigation, and current uncommitted user changes intact.
- Store elementary and secondary loadouts independently; first defaults are `momo` for elementary and `nimbo` for secondary.
- A loadout equips at most one appearance, one outfit, and one decoration; outfit and decoration start empty.
- A purchase adds the item to ownership and asks whether to equip it; choosing not to equip leaves the current loadout unchanged.
- Every rendered AI surface must read the active stage loadout and preserve image proportions inside a safe frame.
- Login-page guest interaction is local and restricted; it must not read account data, write history, or control the app.
- The login transition runs after every successful login, lasts approximately 0.7–0.9 seconds, and falls back to an immediate render when measurement, assets, or reduced-motion settings prevent animation.
- Do not add real AI/voice APIs, backend authentication, real payment, or new merchandise in this change.
- Use the existing sprite sheets in `public/pets/` and merchandise files in `public/mall/`; do not replace user-provided assets.

## File Map

- Modify `src/app/model.ts`: define stage-scoped loadout types, defaults, and compatibility metadata.
- Modify `src/app/AppState.tsx`: add reducer actions/context methods for ownership, purchases, and equipment.
- Modify `src/app/storage.ts`: persist and migrate loadouts safely.
- Create `src/features/ai_companion/companionCatalog.ts`: typed item catalog and stage/category helpers shared by mall and appearance rendering.
- Create `src/features/ai_companion/PartnerAppearance.tsx`: layered responsive sprite/outfit/decor renderer.
- Modify `src/features/ai_companion/ai-companion.css`: safe frames, sprite sizing, interaction state, and transition overlay styling.
- Modify `src/features/ai_companion/AiCompanion.tsx`: use the active loadout, preserve draggable position, and start the login handoff animation.
- Create `src/features/ai_companion/LoginCompanion.tsx`: login-page appearance and restricted guest interaction.
- Modify `src/features/auth/AuthLayout.tsx` and `src/features/auth/LoginPage.tsx`: render the selected-stage login companion and capture its bounds before login.
- Modify `src/features/profile/MallPage.tsx` and `src/features/profile/profile.css`: details preview, purchase confirmation, equip actions, and shared loadout state.
- Modify `src/features/settings/SettingDetailPage.tsx` and `src/features/settings/settings.css`: replace the legacy emoji skin editor with a mall entry point.
- Add focused tests beside each changed feature and extend `src/app/App.integration.test.tsx` for the auth-to-shell handoff.

### Task 1: Add stage-scoped loadout state and persistence

**Files:**
- Modify: `src/app/model.ts`
- Modify: `src/app/AppState.tsx`
- Modify: `src/app/storage.ts`
- Create: `src/app/companionState.test.ts`

**Interfaces:**
- Produces `CompanionCategory = 'appearance' | 'outfit' | 'decoration'`.
- Produces `CompanionLoadout = { owned: Record<CompanionCategory, string[]>; equipped: Record<CompanionCategory, string | null>; version: number }`.
- Produces `AppState.companions: Record<LearningStage, CompanionLoadout>`.
- Produces context methods `purchaseCompanionItem(id: string)`, `equipCompanionItem(category: CompanionCategory, id: string)`, and `unequipCompanionItem(category: CompanionCategory)`.

- [ ] **Step 1: Write failing reducer and persistence tests**

```tsx
it('starts each stage with only its default appearance equipped', () => {
  expect(defaultState.companions.elementary.equipped).toEqual({ appearance: 'momo', outfit: null, decoration: null })
  expect(defaultState.companions.secondary.equipped).toEqual({ appearance: 'nimbo', outfit: null, decoration: null })
  expect(defaultState.companions.elementary.owned.appearance).toContain('momo')
  expect(defaultState.companions.secondary.owned.appearance).toContain('nimbo')
})

it('does not equip a purchased item when only ownership is changed', () => {
  const purchased = reduce(defaultState, { type: 'purchase-companion-item', stage: 'elementary', category: 'appearance', id: 'yunduo' })
  expect(purchased.companions.elementary.owned.appearance).toContain('yunduo')
  expect(purchased.companions.elementary.equipped.appearance).toBe('momo')
})

it('only equips owned items in the active stage', () => {
  const result = reduce(defaultState, { type: 'equip-companion-item', stage: 'elementary', category: 'appearance', id: 'yunduo' })
  expect(result.companions.elementary.equipped.appearance).toBe('yunduo')
  expect(result.companions.secondary.equipped.appearance).toBe('nimbo')
})

it('migrates a stored state without companions to stage defaults', () => {
  localStorage.setItem('student-app-state', JSON.stringify({ ...defaultState, aiSkin: 2 }))
  expect(loadState().companions).toEqual(defaultState.companions)
})
```

- [ ] **Step 2: Run the focused tests and verify the new expectations fail**

Run: `npm test -- --run src/app/companionState.test.ts`

Expected: FAIL because `companions`, the reducer actions, and the persistence migration do not exist yet.

- [ ] **Step 3: Add the types and defaults**

In `model.ts`, add the types above and initialize `defaultState.companions` with empty outfit/decor ownership and the two default appearances. Keep `aiSkin` temporarily for migration compatibility; do not use it as a source for new rendering.

- [ ] **Step 4: Add reducer actions and guarded context methods**

Add actions with an explicit `stage` field:

```ts
| { type: 'purchase-companion-item'; stage: LearningStage; category: CompanionCategory; id: string }
| { type: 'equip-companion-item'; stage: LearningStage; category: CompanionCategory; id: string }
| { type: 'unequip-companion-item'; stage: LearningStage; category: CompanionCategory }
```

`purchase-companion-item` appends an ID only when it is not already owned. `equip-companion-item` writes only when `owned[category]` contains the ID. `unequip-companion-item` writes `null` for outfit or decoration and is not exposed for the required appearance category. Expose the three context methods using `state.stage` so callers cannot accidentally modify the other learning stage.

- [ ] **Step 5: Make persistence backward-compatible**

Extend `saveState` with `companions`. In `loadState`, parse the stored JSON and merge `defaultState` recursively for the new stage/category fields. If a stored loadout is malformed, use the matching stage default instead of failing the entire state. Preserve the existing `aiSkin` value for old settings pages until Task 5 removes their writer.

- [ ] **Step 6: Run tests and commit the state layer**

Run: `npm test -- --run src/app/companionState.test.ts src/app/App.test.tsx`

Expected: PASS.

Commit: `git add src/app/model.ts src/app/AppState.tsx src/app/storage.ts src/app/companionState.test.ts && git commit -m "feat: add stage-scoped companion loadouts"`

### Task 2: Create the shared layered appearance renderer

**Files:**
- Create: `src/features/ai_companion/companionCatalog.ts`
- Create: `src/features/ai_companion/PartnerAppearance.tsx`
- Modify: `src/features/ai_companion/ai-companion.css`
- Create: `src/features/ai_companion/PartnerAppearance.test.tsx`

**Interfaces:**
- `getCompanionItem(id: string): CompanionCatalogItem | undefined`.
- `PartnerAppearance` props: `{ loadout: CompanionLoadout; size: 'login' | 'preview' | 'floating'; interactive?: boolean; className?: string }`.
- The component renders an outer safe frame and stable `data-companion-id`, `data-outfit-id`, and `data-decoration-id` attributes for tests and transition capture.

- [ ] **Step 1: Add failing renderer tests**

```tsx
it('renders the equipped appearance and optional layers in one safe frame', () => {
  render(<PartnerAppearance loadout={elementaryWithLayers} size="login" />)
  expect(screen.getByRole('img', { name: '绒桃 Momo AI 伙伴形象' })).toBeInTheDocument()
  expect(screen.getByTestId('companion-outfit')).toHaveAttribute('src', '/mall/elementary/cloud-backpack.png')
  expect(screen.getByTestId('companion-decoration')).toHaveAttribute('src', '/mall/elementary/cloud-flower-lamp.png')
})

it('uses a fallback appearance when an asset ID is missing', () => {
  render(<PartnerAppearance loadout={invalidLoadout} size="floating" />)
  expect(screen.getByRole('img', { name: '绒桃 Momo AI 伙伴形象' })).toBeInTheDocument()
})
```

- [ ] **Step 2: Run the renderer test and verify it fails**

Run: `npm test -- --run src/features/ai_companion/PartnerAppearance.test.tsx`

Expected: FAIL because the catalog and component are not present.

- [ ] **Step 3: Define the catalog and asset compatibility metadata**

Move the existing item metadata out of `MallPage.tsx` into `companionCatalog.ts`. Keep the exact IDs and assets already present (`momo`, `yunduo`, `cloudbloom`, `cloudbelle`, `nimbo`, `nimbli`, `aether`, `yunluo`, and current mall outfit/decor IDs). Add category, stage, display label, and layer anchor metadata. Filter by the current stage before any item is offered to an equipment action.

- [ ] **Step 4: Implement the layered component**

Render the appearance sprite as the base layer and optional outfit/decor images in positioned layer wrappers. Use CSS variables for layer offsets and a `contain`-style safe frame. The sprite keeps its existing 8-frame horizontal sheet behavior; the first frame is the default display. Use `aria-label` from catalog labels and mark decorative layers appropriately.

- [ ] **Step 5: Add responsive safe-frame styling**

Add `.partner-appearance`, `.partner-appearance__safe-frame`, and size modifiers for login, preview, and floating contexts. Keep `overflow: visible` only for the inner layer stack and use `aspect-ratio` plus `max-width/max-height` to prevent distortion. Add a short `is-interacting` keyframe for a subtle scale/translate response.

- [ ] **Step 6: Run tests and commit the shared renderer**

Run: `npm test -- --run src/features/ai_companion/PartnerAppearance.test.tsx`

Expected: PASS.

Commit: `git add src/features/ai_companion/companionCatalog.ts src/features/ai_companion/PartnerAppearance.tsx src/features/ai_companion/ai-companion.css src/features/ai_companion/PartnerAppearance.test.tsx && git commit -m "feat: add shared layered companion appearance"`

### Task 3: Upgrade the mall to preview, buy, and equip through AppState

**Files:**
- Modify: `src/features/profile/MallPage.tsx`
- Modify: `src/features/profile/profile.css`
- Modify: `src/features/profile/MallPage.test.tsx`

**Interfaces:**
- Mall consumes the catalog from `companionCatalog.ts` and the context methods from Task 1.
- Mall maintains only transient UI state: selected detail item, purchase confirmation item, equip confirmation item, and toast; ownership/equipment is never local component state.

- [ ] **Step 1: Add failing mall tests**

```tsx
it('opens a large preview before showing the purchase action', async () => {
  render(<MallPage onBack={vi.fn()} />)
  await userEvent.click(screen.getByRole('button', { name: /云朵 Yunduo/ }))
  expect(screen.getByRole('dialog', { name: /云朵 Yunduo/ })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /购买/ })).toBeInTheDocument()
})

it('offers equip confirmation after purchase and keeps the old appearance when declined', async () => {
  render(<MallPage onBack={vi.fn()} />)
  await userEvent.click(screen.getByRole('button', { name: /云朵 Yunduo/ }))
  await userEvent.click(screen.getByRole('button', { name: /购买/ }))
  expect(screen.getByRole('dialog', { name: /现在换上吗/ })).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: '暂不更换' }))
  expect(screen.getByText('当前搭配：绒桃 Momo')).toBeInTheDocument()
})

it('equips an owned item when the student confirms', async () => {
  render(<MallPage onBack={vi.fn()} />)
  await userEvent.click(screen.getByRole('button', { name: /云朵 Yunduo/ }))
  await userEvent.click(screen.getByRole('button', { name: /装备/ }))
  expect(screen.getByText('已装备')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run the mall tests and verify the new tests fail**

Run: `npm test -- --run src/features/profile/MallPage.test.tsx`

Expected: FAIL because the current mall owns items locally and has no detail or equipment dialogs.

- [ ] **Step 3: Replace local ownership with AppState selectors**

Read `state.companions[state.stage]`, derive `isOwned` and `isEquipped` from the active category, and dispatch `purchaseCompanionItem` only after the points check succeeds. Keep the existing balance and coming-soon treatment unchanged for categories without visible items.

- [ ] **Step 4: Add accessible detail and confirmation dialogs**

Clicking a card opens a dialog containing `PartnerAppearance` for appearance items or the existing product art for outfits/decorations, the item name/description, ownership state, and one primary action. After purchase, show a second confirmation dialog with “现在换上吗？” and buttons “现在换上” and “暂不更换”. The latter closes without dispatching an equipment action.

- [ ] **Step 5: Add equipment states to cards**

Show “已拥有” for owned, “已装备” for the currently equipped item, and “装备” for owned but unequipped items. Keep all buttons keyboard accessible and prevent a second purchase dispatch while a dialog is open.

- [ ] **Step 6: Run focused and existing mall tests, then commit**

Run: `npm test -- --run src/features/profile/MallPage.test.tsx`

Expected: PASS for the new preview/equipment tests and all existing stage/category tests.

Commit: `git add src/features/profile/MallPage.tsx src/features/profile/profile.css src/features/profile/MallPage.test.tsx && git commit -m "feat: add companion preview and equipment flow"`

### Task 4: Render the selected companion on the login page and support guest interaction

**Files:**
- Create: `src/features/ai_companion/LoginCompanion.tsx`
- Modify: `src/features/auth/AuthLayout.tsx`
- Modify: `src/features/auth/LoginPage.tsx`
- Modify: `src/features/auth/auth.css`
- Create: `src/features/auth/LoginCompanion.test.tsx`

**Interfaces:**
- `LoginCompanion` receives `onBoundsChange: (rect: DOMRect) => void` and `onGuestChat: () => void`.
- It consumes `state.stage` and `state.companions[state.stage]` but never writes login/account state.
- It writes the measured bounds to `sessionStorage` under `student-app-login-companion-bounds` immediately before the login action.

- [ ] **Step 1: Add failing login companion tests**

```tsx
it('shows the active stage companion and provides an accessible interactive target', () => {
  render(<LoginCompanion onBoundsChange={vi.fn()} onGuestChat={vi.fn()} />)
  expect(screen.getByRole('img', { name: /绒桃 Momo/ })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /和绒桃 Momo互动/ })).toBeInTheDocument()
})

it('opens restricted guest chat on long press without changing AppState', async () => {
  const onGuestChat = vi.fn()
  render(<LoginCompanion onBoundsChange={vi.fn()} onGuestChat={onGuestChat} />)
  const button = screen.getByRole('button', { name: /互动/ })
  fireEvent.pointerDown(button)
  await act(() => new Promise((resolve) => setTimeout(resolve, 650)))
  fireEvent.pointerUp(button)
  expect(onGuestChat).toHaveBeenCalledTimes(1)
})
```

- [ ] **Step 2: Run the new tests and verify they fail**

Run: `npm test -- --run src/features/auth/LoginCompanion.test.tsx`

Expected: FAIL because the login companion does not exist.

- [ ] **Step 3: Add the login companion and restricted guest sheet**

Render a `PartnerAppearance size="login"` inside an anchored hero block. A short pointer interaction triggers a friendly stage-specific welcome message and a visual interaction state. A 600ms long press opens a local guest dialog with an explicit “未登录体验” label and safe demo replies; it must not call `login`, write history, or expose app control chips.

- [ ] **Step 4: Wire the companion into AuthLayout without changing existing auth fields**

Place the companion above the existing heading/card, pass `showLoginCompanion` only from `LoginPage`, and keep register/forgot/guardian routes unchanged. Keep the stage selector as the single source of the selected stage so changing it also changes the preview and subtitle.

- [ ] **Step 5: Capture bounds immediately before login**

Expose a `getCompanionBounds` callback/ref from `LoginCompanion`. In `LoginPage.submit`, after validation and before `login()`, serialize the selected-stage item IDs and `getBoundingClientRect()` values to `sessionStorage`. Clear stale values after a failed measurement rather than blocking authentication.

- [ ] **Step 6: Run auth tests and commit**

Run: `npm test -- --run src/features/auth/LoginCompanion.test.tsx src/features/auth/AuthFlow.test.tsx src/app/App.test.tsx`

Expected: PASS, with existing register/forgot-password behavior unchanged.

Commit: `git add src/features/ai_companion/LoginCompanion.tsx src/features/auth/AuthLayout.tsx src/features/auth/LoginPage.tsx src/features/auth/auth.css src/features/auth/LoginCompanion.test.tsx && git commit -m "feat: add equipped companion to login"`

### Task 5: Replace the in-app emoji button and add the login handoff animation

**Files:**
- Modify: `src/features/ai_companion/AiCompanion.tsx`
- Modify: `src/features/ai_companion/ai-companion.css`
- Modify: `src/features/shell/MainShell.tsx`
- Modify: `src/features/shell/shell.css`
- Modify: `src/app/App.integration.test.tsx`
- Modify: `src/features/ai_companion/AiCompanion.test.tsx`

**Interfaces:**
- `AiCompanion` consumes the active stage loadout and renders `PartnerAppearance size="floating"`.
- `AiCompanion` accepts no new external props; it reads the one-shot session handoff record and removes it after use.
- A `CompanionHandoffOverlay` internal component receives `{ start: Rect, end: Rect, loadout: CompanionLoadout }` and exposes `data-handoff-status="running|complete|skipped"` for tests.

- [ ] **Step 1: Add failing companion and integration tests**

```tsx
it('renders the equipped layered companion instead of the legacy bot icon', () => {
  render(<AiCompanion />)
  expect(screen.getByRole('img', { name: /绒桃 Momo/ })).toBeInTheDocument()
  expect(screen.queryByText('AI')).not.toBeInTheDocument()
})

it('uses saved login bounds for one handoff and then removes the record', async () => {
  sessionStorage.setItem('student-app-login-companion-bounds', JSON.stringify(savedHandoff))
  render(<AiCompanion />)
  expect(screen.getByTestId('companion-handoff')).toHaveAttribute('data-handoff-status', 'running')
  await waitFor(() => expect(screen.getByTestId('companion-handoff')).toHaveAttribute('data-handoff-status', 'complete'))
  expect(sessionStorage.getItem('student-app-login-companion-bounds')).toBeNull()
})

it('skips the handoff when reduced motion is requested', () => {
  mockReducedMotion(true)
  render(<AiCompanion />)
  expect(screen.queryByTestId('companion-handoff')).not.toBeInTheDocument()
  expect(screen.getByRole('img', { name: /绒桃 Momo/ })).toBeInTheDocument()
})
```

- [ ] **Step 2: Run the focused tests and verify the new tests fail**

Run: `npm test -- --run src/features/ai_companion/AiCompanion.test.tsx src/app/App.integration.test.tsx`

Expected: FAIL because the floating companion still renders the Bot icon and has no handoff overlay.

- [ ] **Step 3: Replace the floating button content with the shared appearance**

Keep the existing pointer/drag/long-press behavior and `setAiPosition` calls. Replace the `AI` text and `Bot` icon with `PartnerAppearance size="floating"`; preserve the current aria label and open `AiPanel` on tap/long press. Update the floating button CSS so the safe frame, not a fixed circular icon, determines the visual bounds while retaining the draggable control hit area.

- [ ] **Step 4: Implement the one-shot handoff overlay**

On mount, read and validate the session handoff record. If valid and motion is not reduced, render a fixed overlay with the same loadout and animate `transform`/`opacity` from the saved start rectangle to the measured floating target rectangle using a cubic-bezier curve over 780ms. Use a short scale interpolation so different login/floating ratios change continuously. On `animationend`, remove the overlay and delete the session record. If data is invalid, the target cannot be measured, or the media query matches `prefers-reduced-motion: reduce`, render the final companion immediately and clear the record.

- [ ] **Step 5: Keep MainShell mount timing deterministic**

Ensure the shell mounts `AiCompanion` once after `state.isLoggedIn` changes and does not remount it on bottom-navigation changes. If `MainShell` currently conditionally renders pages around the companion, move the companion to the stable shell layer while retaining page content and navigation behavior.

- [ ] **Step 6: Run companion, shell, and full regression tests; commit**

Run: `npm test -- --run src/features/ai_companion/AiCompanion.test.tsx src/features/shell/MainShell.test.tsx src/app/App.integration.test.tsx`

Expected: PASS. Keep any pre-existing user-authored AI position expectation unchanged unless the test is specifically updated to assert the new shared appearance.

Commit: `git add src/features/ai_companion/AiCompanion.tsx src/features/ai_companion/ai-companion.css src/features/shell/MainShell.tsx src/features/shell/shell.css src/app/App.integration.test.tsx src/features/ai_companion/AiCompanion.test.tsx && git commit -m "feat: animate companion into the app shell"`

### Task 6: Remove the conflicting emoji skin writer and verify the complete flow

**Files:**
- Modify: `src/features/settings/SettingDetailPage.tsx`
- Modify: `src/features/settings/settings.css`
- Modify: `src/features/settings/SettingsPage.test.tsx`
- Modify: `src/features/profile/ProfilePage.tsx` only if the existing AI center link needs to target the mall route

**Interfaces:**
- Settings reads the current equipped appearance for display and navigates to the existing mall entry callback instead of dispatching `set-ai-skin`.
- No settings test should depend on the removed emoji options.

- [ ] **Step 1: Add a failing settings test**

```tsx
it('directs companion customization to the points mall', async () => {
  render(<SettingDetailPage section="companion" onNavigate={onNavigate} />)
  expect(screen.queryByText('🤖')).not.toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: /前往积分商城调整伙伴/ }))
  expect(onNavigate).toHaveBeenCalledWith('mall')
})
```

- [ ] **Step 2: Run the settings test and verify it fails**

Run: `npm test -- --run src/features/settings/SettingsPage.test.tsx`

Expected: FAIL because the current companion settings render emoji skin choices.

- [ ] **Step 3: Replace the emoji writer with a current-loadout summary and mall CTA**

Render the equipped appearance name and a small `PartnerAppearance size="preview"`; provide one clearly labeled button that uses the existing navigation contract to open the points mall. Leave voice, memory, safety, and position settings intact.

- [ ] **Step 4: Run complete verification**

Run:

```powershell
npm test -- --run
npm run build
git diff --check
```

Expected: all tests pass, the production build completes, and `git diff --check` reports no whitespace errors. If the pre-existing AI position test remains unrelatedly red, report it with its exact assertion rather than changing its user-authored expectation.

- [ ] **Step 5: Commit the settings cleanup**

Commit: `git add src/features/settings/SettingDetailPage.tsx src/features/settings/settings.css src/features/settings/SettingsPage.test.tsx src/features/profile/ProfilePage.tsx && git commit -m "refactor: route companion customization through mall"`

## Completion Checklist

- [ ] Two stage-specific default companions are initialized and persisted.
- [ ] Mall purchase, preview, “现在换上吗？” confirmation, and manual equipment work for all three categories.
- [ ] Login page displays the equipped stage companion and supports restricted guest interaction.
- [ ] In-app floating companion uses the same layered loadout and keeps its draggable position behavior.
- [ ] Every successful login animates the equipped companion into the floating position, with robust fallback.
- [ ] Settings no longer writes a competing emoji skin value.
- [ ] Existing auth, mall filtering, AI positioning, and navigation tests remain intact.
- [ ] Full test suite, build, and whitespace checks pass.
