# 智芽 AI 伙伴系统整体重构 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将智芽现有二维、分散的 AI 伙伴功能升级为四个小学端三维伙伴共享的换装、互动、语音问答、应用控制和跨页面动画系统，同时保持本地演示账号隔离和儿童安全边界。

**Architecture:** 以账号隔离的 `CompanionAccountRepository` 作为唯一持久化入口，以 `CompanionRenderer` 统一所有 GLB 场景，以 `ConversationController` 管理语音状态机，以白名单 `CommandGateway` 管理应用控制。页面只消费这些稳定接口；真实服务端账号同步后续通过替换仓库实现接入，不改页面组件。

**Tech Stack:** React 19、TypeScript、React Router、Vite、Vitest、Testing Library、Three.js、`@react-three/fiber`、`@react-three/drei`、Node.js 服务端代理、DeepSeek Chat Completions、阿里云百炼 Fun-ASR-Flash、Web Speech API、Web Speech Synthesis

**Spec:** `docs/superpowers/specs/2026-10-16-ai-companion-redesign-design.md`

## Global Constraints

- 项目只允许绒桃 Momo、云朵 Yunduo、云绽 Cloudbloom、云贝儿 Cloudbelle 四个伙伴 ID。
- 正式验收必须使用真正的 GLB/glTF 三维模型，二维图片只允许作为加载失败降级。
- 当前版本只使用按学习账号隔离的本地演示数据，不创建真实账号数据库或伪造云同步。
- DeepSeek、阿里云及其他第三方密钥只能存在于服务端环境变量，禁止进入 `src/`、`VITE_*`、浏览器存储、日志和 Git。
- 登录过渡不允许起跳、原地旋转或突然缩放，总时长控制在 1.2–1.5 秒。
- 长按 450ms 进入聆听；松手后继续听，到自然停顿自动发送。
- 中风险操作必须屏幕确认；高风险操作必须输入当前会话密码；语音确认不能替代屏幕确认。
- 所有代码更改使用测试驱动方式：先写失败测试，再实现，再运行相关测试和全量检查。
- 保留工作区中已有的登录页未提交修改，不覆盖、不回滚、不混入无关提交。
- 每个任务只提交该任务列出的文件；开始前与提交前都执行 `git status --short`。

## File Structure

### 领域与持久化

- `src/app/model.ts`：升级持久化版本，加入伙伴偏好、摘要记忆和会话无关状态。
- `src/app/companionAccountRepository.ts`：按规范化学习账号读取、保存、迁移和清除本地状态。
- `src/app/companionAccountRepository.test.ts`：账号隔离、损坏恢复和旧键迁移测试。
- `src/app/AppState.tsx`：使用仓库接口切换账号，暴露语音偏好和伙伴领域动作。
- `src/features/auth/sessionCredential.tsx`：只在内存保存本次登录密码验证器，高风险确认使用，刷新即失效。

### 三维与换装

- `src/features/ai_companion/companionCatalog.ts`：四个伙伴和商城商品业务目录。
- `src/features/ai_companion/companionAssets.ts`：模型 URL、静态降级图、动画名称和场景预设。
- `src/features/ai_companion/attachments.ts`：服饰/装饰兼容体型、挂点、位置、旋转和比例。
- `src/features/ai_companion/renderer/CompanionCanvas.tsx`：Canvas、相机、灯光、Suspense 和错误边界。
- `src/features/ai_companion/renderer/CompanionModel.tsx`：GLB 加载、骨骼动画、LOD 和附件绑定。
- `src/features/ai_companion/renderer/CompanionFallback.tsx`：WebGL 或模型失败时的静态形象。
- `src/features/ai_companion/renderer/OrbitInteraction.ts`：左右无限、上下 ±25°、惯性和双击回正。
- `scripts/validate-companion-models.mjs`：验证 GLB 文件、大小、伙伴 ID 和必要动画。
- `public/models/companions/*.glb`：四个伙伴正式三维模型。
- `public/models/attachments/*.glb`：商城服饰和装饰三维资产。

### 互动、语音与命令

- `src/features/ai_companion/interaction/gestureMachine.ts`：轻点、长按、拖动和双击判定。
- `src/features/ai_companion/interaction/actionSelector.ts`：页面感知动作池、冷却和去重。
- `src/features/ai_companion/conversation/conversationMachine.ts`：聆听、转写、思考、播报、取消和错误状态机。
- `src/features/ai_companion/conversation/browserRecognizer.ts`：浏览器识别适配。
- `src/features/ai_companion/conversation/serverRecognizer.ts`：服务端转写回退适配。
- `src/features/ai_companion/conversation/speechPlayer.ts`：播放、暂停、继续和停止。
- `src/features/ai_companion/commands/commandTypes.ts`：白名单命令与风险等级。
- `src/features/ai_companion/commands/commandGateway.ts`：校验模型输出并生成执行决策。
- `src/features/ai_companion/commands/AppCommandContext.tsx`：应用内命令执行与确认界面桥接。
- `server/funAsrProvider.mjs`：Fun-ASR-Flash 服务端请求。
- `server/companionIntent.mjs`：DeepSeek JSON 意图提示、解析和白名单过滤。
- `server/ai-proxy.mjs`：聊天、意图和语音转写路由。

### 页面整合

- `src/features/ai_companion/PartnerAppearance.tsx`：替换为统一三维/降级入口。
- `src/features/ai_companion/LoginCompanion.tsx`：登录页互动和语音。
- `src/features/ai_companion/AiCompanion.tsx`：应用悬浮、地图定位和统一气泡。
- `src/features/ai_companion/AiPanel.tsx`：紧凑伙伴名片、消息滚动和安全区输入。
- `src/features/ai_companion/CompanionHandoff.tsx`：登录到应用的共享过渡层。
- `src/features/profile/MallPage.tsx`：三维衣橱、旋转、装上和卸下。
- `src/features/test/TestPage.tsx`：把伙伴绑定到当前关卡内容坐标。
- `src/features/test/TestLevelNode.tsx`：暴露关卡锚点并计算避让。
- `src/features/shell/MainShell.tsx`：注册应用命令和避免测试页重复伙伴。

---

## Phase 1：本地账号与伙伴领域层

### Task 1: 建立按账号隔离的本地演示仓库

**Files:**
- Create: `src/app/companionAccountRepository.ts`
- Create: `src/app/companionAccountRepository.test.ts`
- Modify: `src/app/model.ts`
- Modify: `src/app/storage.ts`
- Modify: `src/app/storage.test.ts`

**Interfaces:**
- Produces: `normalizeAccountId(accountId: string): string`
- Produces: `loadAccountState(accountId: string): AppState`
- Produces: `saveAccountState(accountId: string, state: AppState): void`
- Produces: `peekAccountCompanion(accountId: string): CompanionLoadout`
- Produces: `appendConversationSummary(accountId: string, summary: ConversationSummary): void`
- Produces: `clearAccountState(accountId: string): void`
- Storage key: `zhizya:demo-account:${normalizeAccountId(accountId)}`

- [ ] **Step 1: 写账号隔离失败测试**

```ts
it('keeps companion data isolated by normalized learning account', () => {
  saveAccountState('ChenXi 2026', stateWithAppearance('yunduo'))
  saveAccountState('xiaoyu', stateWithAppearance('cloudbloom'))
  expect(loadAccountState('chenxi 2026').companion.equipped.appearance).toBe('yunduo')
  expect(loadAccountState('xiaoyu').companion.equipped.appearance).toBe('cloudbloom')
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm test -- --run src/app/companionAccountRepository.test.ts`

Expected: FAIL，提示 `companionAccountRepository` 模块不存在。

- [ ] **Step 3: 将状态版本升级为 3 并实现仓库**

```ts
export const APP_STATE_VERSION = 3 as const

export function normalizeAccountId(accountId: string) {
  return accountId.trim().replace(/\s+/g, ' ').toLocaleLowerCase('zh-CN') || 'guest'
}

export function accountStorageKey(accountId: string) {
  return `zhizya:demo-account:${normalizeAccountId(accountId)}`
}
```

仓库复用 `storage.ts` 的字段校验函数，但不允许页面直接访问 `localStorage`。首次读取默认演示账号时迁移旧 `student-app-state`；迁移完成后写入 `zhizya:demo-account:chenxi_2026` 并删除旧键。损坏数据保留可验证字段，伙伴字段回退到绒桃 Momo。

`AppState` 增加 `voiceReplyMode: 'always' | 'voice-only' | 'silent'`、`reduceMotion: boolean` 和最多 20 条 `conversationSummaries: Array<{ id; topic; summary; occurredAt }>`。只保存经过审核的摘要，不保存原始音频。旧 `cloud-backpack` 或 `dawn-cloud-wand` 购买记录无论此前位于哪一分类，都迁移到新目录声明的分类，并保留已购状态；不兼容的已装备商品回到衣橱。

- [ ] **Step 4: 增加旧中学伙伴和无效装扮过滤测试**

```ts
it('removes retired companion ids without clearing learning data', () => {
  localStorage.setItem(accountStorageKey('demo'), JSON.stringify(retiredState))
  const loaded = loadAccountState('demo')
  expect(loaded.companion.equipped.appearance).toBe('momo')
  expect(loaded.learningProgress).toEqual(retiredState.learningProgress)
})
```

- [ ] **Step 5: 运行持久化测试**

Run: `npm test -- --run src/app/companionAccountRepository.test.ts src/app/storage.test.ts src/app/companionState.test.ts`

Expected: PASS。

- [ ] **Step 6: 提交**

```bash
git add src/app/model.ts src/app/storage.ts src/app/storage.test.ts src/app/companionAccountRepository.ts src/app/companionAccountRepository.test.ts
git commit -m "feat: isolate companion demo data by account"
```

### Task 2: 让登录流程切换账号并保护会话密码

**Files:**
- Create: `src/features/auth/sessionCredential.tsx`
- Create: `src/features/auth/sessionCredential.test.tsx`
- Modify: `src/app/AppState.tsx`
- Modify: `src/app/companionState.actions.test.tsx`
- Modify: `src/features/auth/LoginPage.tsx`
- Modify: `src/features/auth/AuthFlow.test.tsx`
- Modify: `src/app/App.tsx`

**Interfaces:**
- Consumes: Task 1 account repository functions.
- Produces: `login(accountId: string): void`
- Produces: `previewCompanion(accountId: string): CompanionLoadout`
- Produces: `useSessionCredential(): { establish(accountId: string, password: string): void; verify(password: string): boolean; clear(): void }`

- [ ] **Step 1: 写登录切换账号与不持久化密码的失败测试**

```tsx
await user.type(screen.getByLabelText('学习账号／学习码'), 'xiaoyu')
await user.type(screen.getByLabelText('密码'), 'demo-pass')
await user.click(screen.getByRole('button', { name: '进入学习世界' }))
expect(loadAccountState('xiaoyu').isLoggedIn).toBe(true)
expect(JSON.stringify(localStorage)).not.toContain('demo-pass')
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm test -- --run src/features/auth/AuthFlow.test.tsx src/features/auth/sessionCredential.test.tsx`

Expected: FAIL，因为 `login` 尚不接收账号，且会话凭证上下文不存在。

- [ ] **Step 3: 实现内存会话凭证与账号切换**

```ts
type SessionCredential = { accountId: string; password: string } | null

function verify(candidate: string) {
  return credential !== null && candidate === credential.password
}
```

`SessionCredentialProvider` 只使用 React 内存状态，不使用 `localStorage`、`sessionStorage` 或 URL。`AppStateProvider.login(accountId)` 读取对应账号状态并保存 `isLoggedIn: true`；退出时清除凭证。登录页账号输入变化时只调用 `peekAccountCompanion` 展示本地装扮，不改变当前持久化状态。

- [ ] **Step 4: 运行登录与状态测试**

Run: `npm test -- --run src/features/auth/AuthFlow.test.tsx src/features/auth/sessionCredential.test.tsx src/app/companionState.actions.test.tsx`

Expected: PASS。

- [ ] **Step 5: 提交**

```bash
git add src/app/App.tsx src/app/AppState.tsx src/app/companionState.actions.test.tsx src/features/auth/LoginPage.tsx src/features/auth/AuthFlow.test.tsx src/features/auth/sessionCredential.tsx src/features/auth/sessionCredential.test.tsx
git commit -m "feat: switch local companion state at login"
```

## Phase 2：三维渲染与商城换装

### Task 3: 建立四伙伴三维目录与挂点模型

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `src/features/ai_companion/companionCatalog.ts`
- Modify: `src/features/ai_companion/companionCatalog.test.ts`
- Create: `src/features/ai_companion/companionAssets.ts`
- Create: `src/features/ai_companion/attachments.ts`
- Create: `src/features/ai_companion/attachments.test.ts`

**Interfaces:**
- Produces: `CompanionId = 'momo' | 'yunduo' | 'cloudbloom' | 'cloudbelle'`
- Produces: `CompanionAnimation = 'idle' | 'blink' | 'wave' | 'tilt' | 'walk' | 'run' | 'sit' | 'listen' | 'think' | 'speak'`
- Produces: `getCompanionAsset(id: CompanionId): CompanionAssetManifest`
- Produces: `resolveAttachmentTransform(companionId, itemId): AttachmentTransform | null`

- [ ] **Step 1: 安装三维运行依赖**

Run: `npm install three @react-three/fiber @react-three/drei`

Expected: `package.json` 和锁文件新增三个依赖，安装成功。

- [ ] **Step 2: 写四伙伴和挂点失败测试**

```ts
expect(COMPANION_IDS).toEqual(['momo', 'yunduo', 'cloudbloom', 'cloudbelle'])
expect(getCompanionAsset('momo').modelUrl).toBe('/models/companions/momo.glb')
expect(resolveAttachmentTransform('momo', 'cloud-backpack')?.bone).toBe('Back_Attach')
expect(resolveAttachmentTransform('yunduo', 'cloud-backpack')).not.toEqual(
  resolveAttachmentTransform('momo', 'cloud-backpack'),
)
```

- [ ] **Step 3: 运行目录测试确认失败**

Run: `npm test -- --run src/features/ai_companion/companionCatalog.test.ts src/features/ai_companion/attachments.test.ts`

Expected: FAIL，因为模型目录和附件变换尚不存在。

- [ ] **Step 4: 实现清单和兼容性数据**

```ts
export type AttachmentTransform = {
  bone: 'Head_Attach' | 'Face_Attach' | 'Back_Attach' | 'Chest_Attach' | 'Hand_L_Attach' | 'Hand_R_Attach' | 'Outfit_Root' | 'Scene_Root'
  position: [number, number, number]
  rotation: [number, number, number]
  scale: number
}
```

为每个伙伴与现有商品填写独立数值。背包绑定 `Back_Attach`；手杖绑定 `Hand_R_Attach`；花灯、云门、风铃和花椅绑定 `Scene_Root`，在伙伴周围的固定安全区域展示，不叠加到身体。商品分类继续沿用形象、服饰、装饰三个栏目，目录中不得出现旧中学端 ID。

- [ ] **Step 5: 运行目录测试和类型检查**

Run: `npm test -- --run src/features/ai_companion/companionCatalog.test.ts src/features/ai_companion/attachments.test.ts && npm run build`

Expected: PASS。

- [ ] **Step 6: 提交**

```bash
git add package.json package-lock.json src/features/ai_companion/companionCatalog.ts src/features/ai_companion/companionCatalog.test.ts src/features/ai_companion/companionAssets.ts src/features/ai_companion/attachments.ts src/features/ai_companion/attachments.test.ts
git commit -m "feat: define 3d companion and attachment manifests"
```

### Task 4: 准备并验证四个正式 GLB 模型

**Files:**
- Create: `scripts/validate-companion-models.mjs`
- Create: `scripts/validate-companion-models.test.mjs`
- Create: `public/models/companions/momo.glb`
- Create: `public/models/companions/yunduo.glb`
- Create: `public/models/companions/cloudbloom.glb`
- Create: `public/models/companions/cloudbelle.glb`
- Create: `public/models/attachments/cloud-backpack.glb`
- Create: `public/models/attachments/dawn-cloud-wand.glb`
- Create: `public/models/attachments/cloud-flower-lamp.glb`
- Create: `public/models/attachments/rainbow-cloud-gate.glb`
- Create: `public/models/attachments/flower-cloud-windchime.glb`
- Create: `public/models/attachments/cloud-flower-chair.glb`

**Interfaces:**
- Consumes: Task 3 manifest URLs and animation names.
- Produces: files beginning with GLB magic `glTF`, containing one skinned root and the required named clips.

- [ ] **Step 1: 写模型验证器失败测试**

```js
it('accepts only the four approved companion model files', async () => {
  const report = await validateCompanionDirectory('public/models/companions')
  expect(report.ids).toEqual(['cloudbelle', 'cloudbloom', 'momo', 'yunduo'])
  expect(report.errors).toEqual([])
})
```

- [ ] **Step 2: 实现二进制和清单验证**

验证器检查文件名、GLB magic、JSON chunk、必要动画名称、单文件大小上限 12MB、贴图最大边 2048px，以及旧中学端文件不存在。缺少任一条件时退出码为 1，并输出具体文件和规则。

- [ ] **Step 3: 制作并导出正式模型**

以已确认的“动画电影造型与动作结构 + 细腻毛绒材质”为准，在 Blender 中统一正面朝 `+Z`、米制单位、根节点 `CompanionRoot`、挂点骨骼命名和动画 clip 名称。每个模型包含高、中、低三个网格层级；毛绒使用法线、柔和高光和边缘层，不使用真实毛发粒子。

导出路径必须与上方文件清单完全一致。模型来源是用户提供的现有四个伙伴视觉素材与已确认方向图；若缺少某个伙伴完整正侧背参考，在执行此步骤前向用户索取对应参考图，不用未经确认的通用角色替代。

- [ ] **Step 4: 运行模型验证**

Run: `node scripts/validate-companion-models.mjs`

Expected: 输出四个伙伴、两个身体附件和四个环境装饰均通过，退出码 0。

- [ ] **Step 5: 提交**

```bash
git add scripts/validate-companion-models.mjs scripts/validate-companion-models.test.mjs public/models/companions public/models/attachments
git commit -m "feat: add validated 3d companion assets"
```

### Task 5: 实现统一三维渲染器与静态降级

**Files:**
- Create: `src/features/ai_companion/renderer/CompanionCanvas.tsx`
- Create: `src/features/ai_companion/renderer/CompanionModel.tsx`
- Create: `src/features/ai_companion/renderer/CompanionFallback.tsx`
- Create: `src/features/ai_companion/renderer/CompanionCanvas.test.tsx`
- Modify: `src/features/ai_companion/PartnerAppearance.tsx`
- Modify: `src/features/ai_companion/PartnerAppearance.test.tsx`
- Modify: `src/features/ai_companion/ai-companion.css`

**Interfaces:**
- Consumes: Task 3 manifests and Task 4 GLB assets.
- Produces: `<PartnerAppearance loadout size motion interactive rotationEnabled />`
- Produces: `CompanionScenePreset = 'login' | 'floating' | 'test-map' | 'mall' | 'conversation' | 'handoff'`

- [ ] **Step 1: 写场景预设和降级失败测试**

```tsx
render(<PartnerAppearance loadout={loadout} size="login" motion="wave" interactive />)
expect(screen.getByLabelText('绒桃 Momo AI 伙伴形象')).toHaveAttribute('data-renderer', 'webgl')

mockUseGLTFError()
render(<PartnerAppearance loadout={loadout} size="floating" />)
expect(screen.getByLabelText('绒桃 Momo AI 伙伴形象')).toHaveAttribute('data-renderer', 'fallback')
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm test -- --run src/features/ai_companion/renderer/CompanionCanvas.test.tsx src/features/ai_companion/PartnerAppearance.test.tsx`

Expected: FAIL，因为 WebGL 渲染器不存在。

- [ ] **Step 3: 实现 Canvas、模型克隆和动画切换**

使用 `<Canvas frameloop="demand">`、`useGLTF`、`useAnimations` 和 `SkeletonUtils.clone`。场景预设控制相机距离、阴影、模型比例与灯光，不在页面 CSS 中直接缩放内部骨骼。模型加载与附件变化时调用 `invalidate()`；页面不可见时暂停动画。

- [ ] **Step 4: 实现错误边界和减少动画**

WebGL 不可用、加载超时或模型异常时显示目录中的静态 `asset`。`prefers-reduced-motion` 下只保留呼吸和单次淡入，不循环播放复杂动作。

- [ ] **Step 5: 运行测试与构建**

Run: `npm test -- --run src/features/ai_companion/renderer/CompanionCanvas.test.tsx src/features/ai_companion/PartnerAppearance.test.tsx && npm run build`

Expected: PASS，生产构建包含按需模型资源引用。

- [ ] **Step 6: 提交**

```bash
git add src/features/ai_companion/renderer src/features/ai_companion/PartnerAppearance.tsx src/features/ai_companion/PartnerAppearance.test.tsx src/features/ai_companion/ai-companion.css
git commit -m "feat: render companion scenes with glb models"
```

### Task 6: 实现商城三维旋转与正确换装

**Files:**
- Create: `src/features/ai_companion/renderer/OrbitInteraction.ts`
- Create: `src/features/ai_companion/renderer/OrbitInteraction.test.ts`
- Modify: `src/features/profile/MallPage.tsx`
- Modify: `src/features/profile/MallPage.test.tsx`
- Modify: `src/features/profile/profile.css`
- Modify: `src/app/AppState.tsx`

**Interfaces:**
- Consumes: `resolveAttachmentTransform` and `PartnerAppearance`.
- Produces: `createOrbitController({ yaw, pitch }): OrbitController`
- Produces: `equipCompanionItem(category, id)` that automatically shelves incompatible clothing.

- [ ] **Step 1: 写旋转边界和换装失败测试**

```ts
const orbit = createOrbitController({ yaw: 0, pitch: 0 })
orbit.drag({ dx: 720, dy: 500 })
expect(orbit.snapshot().yaw).toBeGreaterThan(Math.PI * 1.5)
expect(orbit.snapshot().pitch).toBeCloseTo(25 * Math.PI / 180)
orbit.doubleClick()
expect(orbit.snapshot()).toMatchObject({ yaw: 0, pitch: 0 })
```

```tsx
await user.click(screen.getByRole('button', { name: '装上 云朵小背包' }))
expect(screen.getByTestId('companion-attachment-cloud-backpack')).toHaveAttribute('data-bone', 'Back_Attach')
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm test -- --run src/features/ai_companion/renderer/OrbitInteraction.test.ts src/features/profile/MallPage.test.tsx`

Expected: FAIL。

- [ ] **Step 3: 实现无限 yaw、受限 pitch、惯性和回正**

`yaw` 不截断；`pitch` 限制在 `[-25°, 25°]`；松手后以每帧 `velocity *= 0.9` 衰减，速度低于 `0.001` 停止。双击和语音开始调用 `reset({ durationMs: 260 })`。

- [ ] **Step 4: 重做“我的”预览和衣橱操作**

顶部使用 `scene="mall"` 的三维伙伴，不加圆形框并上移。商品卡仍显示轻量缩略图；打开预览时加载对应三维附件。装上/卸下/恢复默认后所有伙伴场景通过统一状态立即同步。

- [ ] **Step 5: 运行商城、积分和构建测试**

Run: `npm test -- --run src/features/profile/MallPage.test.tsx src/app/companionState.actions.test.tsx src/app/points.test.ts && npm run build`

Expected: PASS。

- [ ] **Step 6: 提交**

```bash
git add src/features/ai_companion/renderer/OrbitInteraction.ts src/features/ai_companion/renderer/OrbitInteraction.test.ts src/features/profile/MallPage.tsx src/features/profile/MallPage.test.tsx src/features/profile/profile.css src/app/AppState.tsx
git commit -m "feat: add 3d wardrobe preview and attachment fitting"
```

## Phase 3：互动、语音与应用控制

### Task 7: 统一轻点、长按、拖动和页面动作

**Files:**
- Create: `src/features/ai_companion/interaction/gestureMachine.ts`
- Create: `src/features/ai_companion/interaction/gestureMachine.test.ts`
- Create: `src/features/ai_companion/interaction/actionSelector.ts`
- Create: `src/features/ai_companion/interaction/actionSelector.test.ts`
- Modify: `src/features/ai_companion/LoginCompanion.tsx`
- Modify: `src/features/ai_companion/AiCompanion.tsx`

**Interfaces:**
- Produces: `GestureEvent = { type: 'tap' | 'long-press' | 'drag' | 'double-tap' | 'cancel' }`
- Produces: `selectCompanionReaction(page, recentActions, now): { animation; bubble }`

- [ ] **Step 1: 写 450ms 长按和手势互斥失败测试**

```ts
machine.pointerDown({ x: 10, y: 10, at: 0 })
expect(machine.tick(449)).toEqual([])
expect(machine.tick(450)).toEqual([{ type: 'long-press' }])
machine.pointerMove({ x: 30, y: 10, at: 300 })
expect(machine.pointerUp({ x: 30, y: 10, at: 500 })).not.toContainEqual({ type: 'tap' })
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm test -- --run src/features/ai_companion/interaction/gestureMachine.test.ts src/features/ai_companion/interaction/actionSelector.test.ts`

Expected: FAIL。

- [ ] **Step 3: 实现状态机和页面动作池**

拖动阈值 8px；长按 450ms；双击窗口 280ms。首页、知识、测试、商城分别配置动作与短气泡。相同动作不能连续两次出现，特殊反应冷却 20 秒，测试页气泡不得包含答案。

- [ ] **Step 4: 将登录页和应用内组件改为消费统一手势**

删除两个组件中重复的 `setTimeout` 长按判断。长按只发出“开始聆听”事件，松手不调用 `stop()`；取消触摸才调用 `cancel()`。

- [ ] **Step 5: 运行交互测试**

Run: `npm test -- --run src/features/ai_companion/interaction src/features/ai_companion/AiCompanion.test.tsx src/features/auth/LoginCompanion.test.tsx`

Expected: PASS。

- [ ] **Step 6: 提交**

```bash
git add src/features/ai_companion/interaction src/features/ai_companion/LoginCompanion.tsx src/features/ai_companion/AiCompanion.tsx src/features/ai_companion/AiCompanion.test.tsx src/features/auth/LoginCompanion.test.tsx
git commit -m "feat: unify companion gestures and reactions"
```

### Task 8: 建立可取消的语音对话状态机

**Files:**
- Create: `src/features/ai_companion/conversation/conversationMachine.ts`
- Create: `src/features/ai_companion/conversation/conversationMachine.test.ts`
- Create: `src/features/ai_companion/conversation/browserRecognizer.ts`
- Create: `src/features/ai_companion/conversation/serverRecognizer.ts`
- Create: `src/features/ai_companion/conversation/speechPlayer.ts`
- Modify: `src/features/ai_companion/browserSpeech.ts`
- Modify: `src/features/ai_companion/companionChat.ts`

**Interfaces:**
- Produces: `ConversationStatus = 'idle' | 'arming' | 'listening' | 'transcribing' | 'thinking' | 'speaking' | 'cancelled' | 'error'`
- Produces: `createConversationController(deps): ConversationController`
- Produces: `SpeechPlayer = { speak(text); pause(); resume(); stop(); state() }`

- [ ] **Step 1: 写松手继续听、自然停顿发送和打断测试**

```ts
controller.arm()
clock.advanceBy(450)
expect(controller.snapshot().status).toBe('listening')
controller.pointerReleased()
expect(controller.snapshot().status).toBe('listening')
recognizer.emitSilence(900)
expect(controller.snapshot().status).toBe('transcribing')
controller.arm()
expect(speechPlayer.stop).toHaveBeenCalledOnce()
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm test -- --run src/features/ai_companion/conversation/conversationMachine.test.ts`

Expected: FAIL。

- [ ] **Step 3: 实现状态机和气泡文案映射**

状态映射固定为：`listening → 我在听…`、`transcribing → 听到：{transcript}`、`thinking → 正在想…`。取消会终止识别、fetch 和播报；新问题先停止上一段播报。

- [ ] **Step 4: 实现浏览器优先、服务端回退策略**

浏览器识别不可用、错误、空文本或置信度低于 `0.6` 时调用 `serverRecognizer.transcribe(blob, signal)`。两者都失败时进入 `error`，保留重试和文字输入。

- [ ] **Step 5: 实现三种语音回复模式**

增加 `VoiceReplyMode = 'always' | 'voice-only' | 'silent'`。默认 `voice-only`；语音问题自动播报，键盘问题仅显示文字并提供播放按钮。

- [ ] **Step 6: 运行语音单元测试**

Run: `npm test -- --run src/features/ai_companion/conversation src/features/ai_companion/companionChat.test.ts`

Expected: PASS。

- [ ] **Step 7: 提交**

```bash
git add src/features/ai_companion/conversation src/features/ai_companion/browserSpeech.ts src/features/ai_companion/companionChat.ts
git commit -m "feat: add resilient companion voice state machine"
```

### Task 9: 接入 Fun-ASR-Flash 服务端回退

**Files:**
- Create: `server/funAsrProvider.mjs`
- Create: `server/funAsrProvider.test.mjs`
- Modify: `server/ai-proxy.mjs`
- Create: `server/ai-proxy.test.mjs`
- Modify: `server/dev.mjs`
- Modify: `vite.config.ts`
- Modify: `docs/deepseek-companion-setup.md`

**Interfaces:**
- Produces: `transcribeAudio({ bytes, mimeType, signal }): Promise<{ text: string; confidence: number }>`
- Endpoint: `POST /api/companion/transcribe` with raw `audio/webm`, `audio/ogg` or `audio/wav`, maximum 8MB and 60 seconds client recording limit.
- Environment: `DASHSCOPE_API_KEY`, `DASHSCOPE_WORKSPACE_ID`, `DASHSCOPE_REGION=cn-beijing`

- [ ] **Step 1: 写缺少凭证、超限和成功转写失败测试**

```js
await expect(transcribeAudio({ bytes, mimeType: 'audio/webm', env: {} }))
  .rejects.toThrow('missing_asr_configuration')
expect(validateAudioRequest({ size: 9 * 1024 * 1024, mimeType: 'audio/webm' }))
  .toEqual({ ok: false, error: 'audio_too_large' })
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm test -- --run server/funAsrProvider.test.mjs server/ai-proxy.test.mjs`

Expected: FAIL。

- [ ] **Step 3: 实现官方同步 HTTP 请求**

请求目标为 `https://${DASHSCOPE_WORKSPACE_ID}.cn-beijing.maas.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation`，模型固定 `fun-asr-flash-2026-06-15`，将最长 60 秒录音编码为 Base64 data URL。服务端不记录音频、Base64 内容或转写原文。

官方参考：`https://help.aliyun.com/en/model-studio/fun-asr-flash-recorded-speech-recognition-http-api`

- [ ] **Step 4: 增加受限二进制请求读取与错误映射**

`missing_asr_configuration` 返回 503；格式或大小不合法返回 400；上游超时和失败返回 502。路由使用独立 8MB 限制，不能放宽聊天 JSON 的 16KB 限制。

- [ ] **Step 5: 运行服务端测试**

Run: `npm test -- --run server/funAsrProvider.test.mjs server/ai-proxy.test.mjs server/companionPolicy.test.mjs`

Expected: PASS。

- [ ] **Step 6: 提交**

```bash
git add server/funAsrProvider.mjs server/funAsrProvider.test.mjs server/ai-proxy.mjs server/ai-proxy.test.mjs server/dev.mjs vite.config.ts docs/deepseek-companion-setup.md
git commit -m "feat: add server speech recognition fallback"
```

### Task 10: 建立白名单应用命令与风险网关

**Files:**
- Create: `src/features/ai_companion/commands/commandTypes.ts`
- Create: `src/features/ai_companion/commands/commandGateway.ts`
- Create: `src/features/ai_companion/commands/commandGateway.test.ts`
- Create: `server/companionIntent.mjs`
- Create: `server/companionIntent.test.mjs`
- Modify: `server/companionPolicy.mjs`
- Modify: `server/companionPolicy.test.mjs`
- Modify: `server/ai-proxy.mjs`

**Interfaces:**
- Endpoint: `POST /api/companion/interpret`
- Produces: `CompanionCommand` discriminated union.
- Produces: `evaluateCommand(command, appState): CommandDecision`
- `CommandDecision = { kind: 'execute'; command } | { kind: 'confirm'; preview; command } | { kind: 'password'; preview; command } | { kind: 'clarify'; message } | { kind: 'reject'; message }`

- [ ] **Step 1: 写风险分级和未知命令拒绝测试**

```ts
expect(evaluateCommand({ type: 'navigate', target: 'knowledge' }, state).kind).toBe('execute')
expect(evaluateCommand({ type: 'purchase', itemId: 'cloud-backpack' }, state).kind).toBe('confirm')
expect(evaluateCommand({ type: 'clear-account-data' }, state).kind).toBe('password')
expect(parseModelCommand({ type: 'open-url', url: 'https://example.com' }).kind).toBe('reject')
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm test -- --run src/features/ai_companion/commands/commandGateway.test.ts server/companionIntent.test.mjs`

Expected: FAIL。

- [ ] **Step 3: 定义有限命令联合类型**

低风险仅含 `navigate`、`continue-learning`、`resume-game`、`search-course`、`play-course`、`show-points`、`show-medals`。中风险仅含 `purchase`、`equip`、`unequip`、`submit-test`、`publish-work`、`post-comment`、`update-schedule`、`replace-progress`。高风险仅含 `update-account-security`、`view-guardian`、`update-guardian`、`clear-account-data`、`sign-out-devices`、`delete-account`。

- [ ] **Step 4: 实现 DeepSeek JSON 意图请求和双重校验**

服务端请求使用 `response_format: { type: 'json_object' }`，提示要求只输出 `kind`、`reply` 和允许的 `command`。解析 JSON 后仍以本地 schema 白名单过滤；空内容、未知字段、参数缺失和含糊输入返回澄清，不执行命令。

官方参考：`https://api-docs.deepseek.com/guides/json_mode/`

- [ ] **Step 5: 运行安全与服务端测试**

Run: `npm test -- --run src/features/ai_companion/commands server/companionIntent.test.mjs server/companionPolicy.test.mjs server/ai-proxy.test.mjs`

Expected: PASS。

- [ ] **Step 6: 提交**

```bash
git add src/features/ai_companion/commands/commandTypes.ts src/features/ai_companion/commands/commandGateway.ts src/features/ai_companion/commands/commandGateway.test.ts server/companionIntent.mjs server/companionIntent.test.mjs server/companionPolicy.mjs server/companionPolicy.test.mjs server/ai-proxy.mjs
git commit -m "feat: gate companion app commands by risk"
```

### Task 11: 将命令执行接入应用导航、商城和确认界面

**Files:**
- Create: `src/features/ai_companion/commands/AppCommandContext.tsx`
- Create: `src/features/ai_companion/commands/AppCommandContext.test.tsx`
- Create: `src/features/ai_companion/commands/CommandConfirmationDialog.tsx`
- Modify: `src/features/shell/MainShell.tsx`
- Modify: `src/features/shell/MainShell.test.tsx`
- Modify: `src/features/ai_companion/AiCompanion.tsx`
- Modify: `src/features/profile/MallPage.tsx`

**Interfaces:**
- Consumes: `CommandDecision` and `useSessionCredential`.
- Produces: `useAppCommand(): { submitText(text, source); confirm(); cancel(); verifyPassword(password) }`

- [ ] **Step 1: 写低风险直达、中风险屏幕确认和高风险密码测试**

```tsx
await command.submitText('带我继续上次学习', 'voice')
expect(screen.getByText('继续学习')).toBeInTheDocument()

await command.submitText('购买云朵小背包', 'voice')
expect(screen.getByRole('dialog', { name: '确认使用 160 积分购买云朵小背包' })).toBeInTheDocument()
expect(points()).toBe(before)

await user.click(screen.getByRole('button', { name: '确认购买' }))
expect(points()).toBe(before - 160)
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm test -- --run src/features/ai_companion/commands/AppCommandContext.test.tsx src/features/shell/MainShell.test.tsx`

Expected: FAIL。

- [ ] **Step 3: 注册页面和业务执行器**

`MainShell` 将 `navigate` 映射到现有 tab/stack API，将 `continue-learning` 映射到最近课程，将 `show-points` 和 `show-medals` 映射到现有详情页。商城购买继续调用现有原子 `purchaseCompanionItem`，命令层不直接改积分数组。

- [ ] **Step 4: 实现确认和密码对话框**

中风险对话框显示动作、对象、积分或进度影响，只有点击按钮执行。高风险对话框使用 `useSessionCredential.verify`；没有当前会话凭证时要求重新登录。密码值只存在受控输入的短生命周期组件状态中，关闭后清空。

- [ ] **Step 5: 运行命令集成测试**

Run: `npm test -- --run src/features/ai_companion/commands src/features/shell/MainShell.test.tsx src/features/profile/MallPage.test.tsx`

Expected: PASS。

- [ ] **Step 6: 提交**

```bash
git add src/features/ai_companion/commands/AppCommandContext.tsx src/features/ai_companion/commands/AppCommandContext.test.tsx src/features/ai_companion/commands/CommandConfirmationDialog.tsx src/features/shell/MainShell.tsx src/features/shell/MainShell.test.tsx src/features/ai_companion/AiCompanion.tsx src/features/profile/MallPage.tsx
git commit -m "feat: execute companion commands with confirmations"
```

## Phase 4：页面整合、动画与验收

### Task 12: 重做 AI 对话页和统一气泡

**Files:**
- Modify: `src/features/ai_companion/AiPanel.tsx`
- Create: `src/features/ai_companion/AiPanel.test.tsx`
- Create: `src/features/ai_companion/CompanionBubble.tsx`
- Create: `src/features/ai_companion/CompanionBubble.test.tsx`
- Modify: `src/features/ai_companion/ai-companion.css`
- Modify: `src/features/settings/SettingDetailPage.tsx`
- Modify: `src/features/settings/SettingsPage.test.tsx`

**Interfaces:**
- Consumes: `ConversationController`, `PartnerAppearance`, `VoiceReplyMode`, `useAppCommand`.
- Produces: responsive conversation UI with fixed safe-area composer.

- [ ] **Step 1: 写布局、播报控制和设置失败测试**

```tsx
expect(screen.getByLabelText('当前 AI 伙伴三维预览')).toBeInTheDocument()
expect(screen.getByRole('textbox', { name: '输入想问的问题' })).toBeVisible()
expect(screen.getByRole('button', { name: '播放回答' })).toBeInTheDocument()
await user.click(screen.getByLabelText('仅语音提问时回答'))
expect(loadAccountState('chenxi_2026').voiceReplyMode).toBe('voice-only')
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm test -- --run src/features/ai_companion/AiPanel.test.tsx src/features/ai_companion/CompanionBubble.test.tsx src/features/settings/SettingsPage.test.tsx`

Expected: FAIL。

- [ ] **Step 3: 实现 A2 紧凑伙伴名片与可旋转预览**

顶部显示当前伙伴、昵称、等级和问候；去掉圆形框并上移。聊天开始后名片收紧但模型仍可见。拖动模型使用 Task 6 相同旋转控制器。

- [ ] **Step 4: 固定安全区输入并整合状态气泡**

消息区使用 `min-height: 0; overflow-y: auto`；输入区使用 `position: sticky; bottom: 0; padding-bottom: max(12px, env(safe-area-inset-bottom))`。统一气泡负责“我在听”“听到”“正在想”、简短回答、暂停和取消。

- [ ] **Step 5: 运行页面测试和 320px 浏览器检查**

Run: `npm test -- --run src/features/ai_companion/AiPanel.test.tsx src/features/ai_companion/CompanionBubble.test.tsx src/features/settings/SettingsPage.test.tsx && npm run build`

Expected: PASS；在 320×568 视口中输入框和发送按钮完整可见。

- [ ] **Step 6: 提交**

```bash
git add src/features/ai_companion/AiPanel.tsx src/features/ai_companion/AiPanel.test.tsx src/features/ai_companion/CompanionBubble.tsx src/features/ai_companion/CompanionBubble.test.tsx src/features/ai_companion/ai-companion.css src/features/settings/SettingDetailPage.tsx src/features/settings/SettingsPage.test.tsx
git commit -m "feat: redesign companion conversation experience"
```

### Task 13: 实现连续自然的登录过渡

**Files:**
- Create: `src/features/ai_companion/CompanionHandoff.tsx`
- Create: `src/features/ai_companion/CompanionHandoff.test.tsx`
- Modify: `src/features/auth/LoginCompanion.tsx`
- Modify: `src/features/auth/LoginPage.tsx`
- Modify: `src/features/auth/auth.css`
- Modify: `src/features/ai_companion/AiCompanion.tsx`
- Modify: `src/app/App.tsx`

**Interfaces:**
- Produces: `HandoffSnapshot = { companionId; loadoutVersion; startRect; target: 'floating' }`
- Produces: `<CompanionHandoff snapshot onComplete />`

- [ ] **Step 1: 写共享实例轨迹和减少动画失败测试**

```tsx
expect(calculateHandoffKeyframes(start, end, false)).toMatchObject([
  { progress: 0, action: 'look' },
  { progress: 0.18, action: 'wave' },
  { progress: 0.78, action: 'walk' },
  { progress: 1, action: 'idle' },
])
expect(calculateHandoffKeyframes(start, end, true)).toHaveLength(2)
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm test -- --run src/features/ai_companion/CompanionHandoff.test.tsx src/features/auth/AuthFlow.test.tsx src/features/ai_companion/AiCompanion.test.tsx`

Expected: FAIL。

- [ ] **Step 3: 实现顶层共享过渡层**

登录成功前记录起始矩形和当前装扮；应用壳完成布局后测量目标。顶层只渲染一个 `scene="handoff"` 的伙伴，使用浅贝塞尔路径、2–3 个步行动作、同步透视比例和阴影。完成后再显示右下角场景。

- [ ] **Step 4: 实现 1.2–1.5 秒动作和延迟降级**

默认 1350ms：眨眼看向内容、挥手、轻步、减速、整理姿态。禁止起跳、旋转和独立缩小。应用未准备好时保持观察动作；超过 3 秒时直接柔和落位。减少动画时使用 220ms 淡入。

- [ ] **Step 5: 运行登录流程测试**

Run: `npm test -- --run src/features/ai_companion/CompanionHandoff.test.tsx src/features/auth/AuthFlow.test.tsx src/features/ai_companion/AiCompanion.test.tsx`

Expected: PASS。

- [ ] **Step 6: 提交**

```bash
git add src/features/ai_companion/CompanionHandoff.tsx src/features/ai_companion/CompanionHandoff.test.tsx src/features/auth/LoginCompanion.tsx src/features/auth/LoginPage.tsx src/features/auth/auth.css src/features/ai_companion/AiCompanion.tsx src/app/App.tsx
git commit -m "feat: animate companion handoff into the app"
```

### Task 14: 完成悬浮边界与测试地图关卡锚定

**Files:**
- Modify: `src/features/ai_companion/AiCompanion.tsx`
- Modify: `src/features/ai_companion/AiCompanion.test.tsx`
- Modify: `src/features/test/TestLevelNode.tsx`
- Modify: `src/features/test/TestPage.tsx`
- Modify: `src/features/test/TestPage.test.tsx`
- Modify: `src/features/test/test.css`
- Modify: `src/features/shell/MainShell.tsx`

**Interfaces:**
- Consumes: Task 5 renderer, Task 7 gesture controller.
- Produces: `calculateFloatingBounds(frame, nav, safeArea, modelSize): NormalizedBounds`
- Produces: `calculateMapCompanionAnchor(nodeRect, blockers, viewport): { x; y }`

- [ ] **Step 1: 写右下角框内和关卡正上方失败测试**

```ts
expect(calculateFloatingBounds(frame, nav, safeArea, 78).maxY).toBeLessThan(1)
expect(calculateMapCompanionAnchor(nodeRect, blockers, viewport).y)
  .toBeGreaterThanOrEqual(nodeRect.top - modelHeight - 12)
expect(calculateMapCompanionAnchor(nodeRect, blockers, viewport).y)
  .toBeLessThanOrEqual(nodeRect.top - modelHeight - 8)
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm test -- --run src/features/ai_companion/AiCompanion.test.tsx src/features/test/TestPage.test.tsx`

Expected: FAIL。

- [ ] **Step 3: 实现应用框约束和位置保存**

悬浮坐标基于 `.app-frame` 可见区域、底部导航高度、模型实际尺寸和安全区动态计算。拖动结束后保存归一化坐标；窗口和路由变化时重新夹取到合法区域。

- [ ] **Step 4: 实现关卡 DOM 锚点与避让**

`TestLevelNode` 在按钮元素上提供 ref/`data-node-anchor`。伙伴底边保持在按钮顶边上方 8–12px；若遮挡标题、星级或贴近边缘，只做最小水平内移。伙伴与地图内容同坐标系，滚动时随关卡移动。进度改变后沿路径小跑到新节点。

- [ ] **Step 5: 确保测试页只有地图伙伴**

`MainShell` 在测试 tab 不渲染右下角伙伴；`TestPage` 只渲染一次当前装扮伙伴。退出测试页后恢复保存的悬浮位置。

- [ ] **Step 6: 运行地图和壳层测试**

Run: `npm test -- --run src/features/ai_companion/AiCompanion.test.tsx src/features/test/TestPage.test.tsx src/features/shell/MainShell.test.tsx`

Expected: PASS。

- [ ] **Step 7: 提交**

```bash
git add src/features/ai_companion/AiCompanion.tsx src/features/ai_companion/AiCompanion.test.tsx src/features/test/TestLevelNode.tsx src/features/test/TestPage.tsx src/features/test/TestPage.test.tsx src/features/test/test.css src/features/shell/MainShell.tsx
git commit -m "feat: anchor companions inside app and test map"
```

### Task 15: 安全规则、文档和全量验收

**Files:**
- Modify: `docs/ai-companion-dialogue-rules.md`
- Modify: `docs/deepseek-companion-setup.md`
- Create: `docs/ai-companion-acceptance.md`
- Modify: `README.md`
- Modify: `src/app/App.integration.test.tsx`
- Modify: `server/companionPolicy.test.mjs`

**Interfaces:**
- Consumes: all previous tasks.
- Produces: reproducible automated and browser acceptance record.

- [ ] **Step 1: 修正文档中的旧伙伴数量和旧长按规则**

将“八个伙伴”统一为四个；将“松开即发送”统一为“松开后继续识别，到自然停顿自动发送”；补充低、中、高风险表、Fun-ASR 环境变量和本地账号隔离说明。

- [ ] **Step 2: 增加端到端集成测试**

```tsx
it('keeps one equipped 3d companion through login, mall, chat and test map', async () => {
  await loginAs('chenxi_2026')
  await purchaseAndEquip('cloud-backpack')
  await openCompanionChat()
  expect(currentLoadout()).toMatchObject({ appearance: 'momo', decoration: 'cloud-backpack' })
  await openCurrentTest()
  expect(mapCompanionLoadout()).toEqual(currentLoadout())
})
```

- [ ] **Step 3: 运行全量自动化检查**

Run: `npm test -- --run`

Expected: 所有测试 PASS。

Run: `npm run build`

Expected: TypeScript 和 Vite 生产构建 PASS；浏览器包中搜索不到 `DEEPSEEK_API_KEY`、`DASHSCOPE_API_KEY` 或实际密钥值。

- [ ] **Step 4: 执行真实浏览器验收**

在 320×568、375×667、390×844 和桌面应用框中逐项验证：登录伙伴比例、1.2–1.5 秒过渡、悬浮边界、商城背包背面、上下 ±25°、双击回正、测试地图关卡上方、底部输入可见、减少动画、静音、麦克风拒绝、浏览器识别、服务端回退、DeepSeek 失败、中风险屏幕确认和高风险密码。

- [ ] **Step 5: 记录验收证据**

在 `docs/ai-companion-acceptance.md` 用表格记录每项自动化测试、浏览器视口、结果和截图路径。任何失败项必须修复并重新验证，不能以“已知问题”完成任务。

- [ ] **Step 6: 最终安全扫描**

Run: `git grep -n -I -E "sk-[A-Za-z0-9]|DEEPSEEK_API_KEY=.+|DASHSCOPE_API_KEY=.+" -- . ':!package-lock.json'`

Expected: 没有真实密钥内容；仅允许文档中的空变量名说明。

- [ ] **Step 7: 提交**

```bash
git add docs/ai-companion-dialogue-rules.md docs/deepseek-companion-setup.md docs/ai-companion-acceptance.md README.md src/app/App.integration.test.tsx server/companionPolicy.test.mjs
git commit -m "docs: verify AI companion redesign"
```

- [ ] **Step 8: 完成前复核**

运行 `git status --short`，确认只保留任务开始前已有且明确不属于本次重构的修改；检查最近 15 个提交均对应本计划任务，并向用户报告模型资料、API 配置、测试、构建和浏览器验收结果。
