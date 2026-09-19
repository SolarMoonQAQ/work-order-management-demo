# 工单管理系统开发框架大纲

## 1. 项目定位

以“客户问题工单管理”为业务背景，完成一个桌面端与移动端都可使用的 Next.js 全栈应用。项目以表单为学习主线，同时覆盖 React 组件设计、服务端与客户端边界、数据请求、状态管理、测试、性能优化和基础工程化。

核心目标不是堆叠依赖，而是让每项技术对应一个真实问题：

- Server Components 负责首屏数据读取和静态界面。
- Client Components 只承载表单、交互和浏览器 API。
- Server Actions 负责表单提交和数据变更。
- URL 负责可分享的搜索、筛选、排序状态。
- 数据库负责刷新后仍然存在的数据。
- TanStack Query 和 Zustand 只在扩展场景使用，避免与 Next.js 数据流重复。

## 2. MVP 验收范围

### 2.1 工单列表

- 展示标题、客户、优先级、状态、负责人、更新时间。
- 按标题或客户名称搜索。
- 按状态和优先级组合筛选。
- 按更新时间或优先级排序。
- 支持清除筛选。
- 展示加载、空数据、无匹配结果和错误状态。
- 375px 宽度下没有横向滚动，主要操作可用。

### 2.2 新建工单

- 标题：必填，至少 5 个字符。
- 客户名称：必填。
- 问题描述：必填。
- 优先级：低、中、高。
- 负责人：可选。
- 提交期间禁用重复提交。
- 成功后提示、关闭表单并在列表顶部显示新工单。
- 刷新页面后数据仍然存在。

### 2.3 工单详情与更新

- 使用 `/tickets/[ticketId]` 动态路由。
- 展示工单完整信息和处理记录。
- 更新状态、负责人和优先级。
- 添加包含内容与时间的处理备注。
- 保存后，详情页和列表页数据保持一致。
- 不存在的工单显示 `not-found.tsx`。

## 3. 推荐技术栈

### 核心栈

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- pnpm
- React Hook Form + Zod
- PostgreSQL + ORM（实现时选定 Drizzle 或 Prisma，不同时引入两套）

### UI 与交互

- shadcn/ui：Dialog、Drawer、Form、Select、Dropdown、Toast 等基础组件。
- `clsx` + `class-variance-authority`：条件样式和组件变体。
- CSS Modules：选择一个复杂局部动画作为了解练习，不作为主样式方案。

### 测试与工程化

- Vitest + React Testing Library
- Playwright
- ESLint + Prettier
- Husky + lint-staged（MVP 稳定后接入）
- GitHub Actions

## 4. 建议目录结构

```text
app/
  layout.tsx
  globals.css
  global-error.tsx
  (dashboard)/
    layout.tsx
    tickets/
      page.tsx
      loading.tsx
      error.tsx
      new/
        page.tsx
      [ticketId]/
        page.tsx
        loading.tsx
        not-found.tsx
  api/
    assignees/
      route.ts

components/
  ui/                         # 通用视觉组件
  layout/                     # Header、Sidebar、MobileNav

features/
  tickets/
    components/
      ticket-list.tsx
      ticket-card.tsx
      ticket-filters.tsx
      ticket-form.tsx
      ticket-edit-form.tsx
      ticket-note-form.tsx
      ticket-status-badge.tsx
    server/
      actions.ts              # create/update/addNote
      queries.ts              # 列表与详情查询
      repository.ts           # 数据访问边界
    schema.ts                 # Zod schema
    types.ts
    constants.ts
  assignees/
    components/
    server/

lib/
  db/
    client.ts
    schema.ts
    seed.ts
  errors/
  utils/

tests/
  unit/
  integration/
  e2e/
```

目录原则：

- 路由文件留在 `app`，业务代码集中在 `features`。
- 数据库连接、查询和 Server Actions 必须留在服务端模块。
- 不要因为某个子组件需要交互，就把整页标记为 `'use client'`。
- 通用 UI 与业务组件分开，避免把工单规则写进基础 Button、Dialog 等组件。

## 5. 领域模型

### Ticket

```text
id
title
customerName
description
priority       LOW | MEDIUM | HIGH
status         PENDING | IN_PROGRESS | RESOLVED
assigneeId     nullable
createdAt
updatedAt
```

### TicketNote

```text
id
ticketId
content
createdAt
```

### Assignee

```text
id
name
avatarUrl      nullable
active
```

可选进阶字段：标签、客户联系方式、截止时间。高优先级必须填写截止时间，可以用来练习跨字段校验；联系方式数组可以用来练习动态字段。

## 6. 表单学习主线

### 6.1 筛选表单

学习点：受控/非受控输入、即时搜索、防抖、自定义 Hook、URL 状态。

- 输入关键词后更新 URL `searchParams`。
- 状态、优先级、排序可以组合。
- 后退/前进时自动恢复筛选条件。
- 筛选结果应从原始数据派生，不额外维护一份重复列表状态。
- 实现 `useDebouncedValue`，但不要用 Effect 保存可直接计算的派生状态。

### 6.2 新建工单表单

学习点：React Hook Form、Zod、Server Actions、`useActionState`、pending 状态。

- 客户端使用 Zod 提供即时反馈。
- Server Action 必须再次使用同一业务 schema 校验，不能信任客户端。
- Action 返回统一结构：`fieldErrors`、`formError`、`success`、必要的表单值。
- 使用 `aria-describedby`、`aria-invalid` 和 `aria-live` 提供可访问的错误反馈。
- 成功后跳转或关闭弹窗，并刷新工单数据。

### 6.3 编辑工单表单

学习点：默认值、脏字段、受控组件、并发提交和乐观交互。

- 修改状态、优先级和负责人。
- 没有修改时禁用保存。
- 提交期间禁止重复操作。
- 状态按钮可使用 `useOptimistic` 提供即时反馈，失败时恢复并显示错误。

### 6.4 处理备注表单

学习点：小型渐进增强表单、列表追加、焦点恢复。

- JS 未加载时仍可通过原生 `<form action>` 提交。
- JS 可用时显示 pending 状态，并乐观追加备注。
- 成功后清空输入框，并将焦点留在合理位置。

### 6.5 进阶表单练习

- 使用 `useFieldArray` 管理多个客户联系方式。
- “高优先级必须填写截止时间”作为跨字段校验。
- 负责人选择器通过 `/api/assignees` 异步搜索，练习异步校验和请求取消。
- 自动保存草稿到本地存储，练习自定义 Hook；草稿只属于客户端状态。

## 7. Server/Client 组件边界

### Server Components

- 页面布局、列表首屏、详情读取、统计数字。
- 从数据库读取数据。
- 根据 `searchParams` 执行搜索、筛选和排序。
- 只把可序列化的最小数据传给客户端组件。

### Client Components

- Dialog/Drawer 开关。
- React Hook Form 表单。
- 拖拽、Toast、浏览器本地存储。
- 需要事件处理器、状态 Hook 或浏览器 API 的局部区域。

边界练习：把表单作为小型 Client Component 嵌入 Server Component 页面，而不是把整个 dashboard 客户端化。

## 8. 数据读取、变更与缓存

### 第一阶段

- Server Components 直接调用服务端查询函数。
- Server Actions 执行创建、更新和添加备注。
- 变更成功后用 `revalidatePath` 刷新对应路由。
- 不为同一份数据同时维护 RSC 缓存和 TanStack Query 缓存。

### 第二阶段：Next.js 16 Cache Components

- 开启 `cacheComponents` 后再引入 `'use cache'`。
- 给工单列表和详情设置明确 cache tag。
- 需要“用户立即看到自己的修改”时使用 `updateTag`。
- 允许短暂旧数据时使用 `revalidateTag`。
- 动态内容放入 `<Suspense>`，设计有意义的 fallback。

### 第三阶段：TanStack Query 专项练习

只选择下列一个真实场景：

- 负责人远程搜索与缓存。
- 处理记录无限滚动。
- 后台轮询工单状态。

练习 `useQuery`、`useMutation`、缓存失效、乐观更新、并行/依赖请求和 `AbortSignal`，但不重写已经由 Server Components 合理完成的数据流。

## 9. 状态管理分层

- URL 状态：关键词、筛选、排序、分页。
- 服务端状态：工单、负责人、备注，由数据库和服务端查询管理。
- 表单状态：React Hook Form。
- 短期局部 UI 状态：`useState` 或 `useReducer`。
- 全局客户端状态：只有主题、移动端导航、未提交草稿等确有跨页面需求时才使用 Zustand。
- Redux Toolkit 作为阅读与迁移练习，不在 MVP 中同时引入。

## 10. 页面状态与错误处理

- `loading.tsx`：列表和详情骨架屏。
- `error.tsx`：路由级错误、重试按钮。
- `not-found.tsx`：无对应工单。
- 空列表：系统还没有工单。
- 无匹配结果：当前筛选条件没有结果，并提供清除筛选。
- 表单错误：字段错误与全局错误分开。
- Server Action 中把预期业务错误建模为返回值；真正异常继续抛出，由错误边界处理。

## 11. 组件设计练习

- 受控与非受控：Select、Dialog、搜索框分别实践。
- 组合模式：`TicketForm` 通过 children/slot 接收动作区域。
- `useReducer`：复杂筛选器或多步骤表单。
- `useContext`：只用于稳定、低频变化的数据，如当前主题或表单步骤上下文。
- `useMemo`/`useCallback`：先用 Profiler 发现问题，再决定是否添加。
- 自定义 Hook：`useDebouncedValue`、`useDraftStorage`、`useMediaQuery`。
- 避免滥用 Effect：派生数据在渲染时计算，用户操作放事件处理器，与外部系统同步才使用 Effect。

## 12. 样式、响应式与可访问性

- 使用 Tailwind 建立一致的间距、颜色、圆角和状态 token。
- 桌面端采用侧边栏 + 主内容布局；移动端改为顶部状态标签或 Drawer。
- 表格在窄屏切换成卡片列表，而不是依赖横向滚动。
- 支持系统暗色模式，后续可加入手动主题。
- 所有输入都有可见 label；错误信息可被读屏读取。
- Dialog 打开后正确管理焦点，关闭后焦点返回触发按钮。
- 所有交互支持键盘，并尊重 `prefers-reduced-motion`。

## 13. 测试策略

### Vitest 单元测试

- Zod schema：必填、最小长度、跨字段规则。
- 排序和筛选纯函数。
- 优先级映射、状态迁移规则。
- 自定义 Hook。

### React Testing Library 组件测试

- 用户输入无效内容后看到相应错误。
- 合法提交只触发一次。
- 筛选表单更新 URL。
- loading、error、empty 状态正确显示。

### Playwright E2E

- 创建工单，刷新后仍存在。
- 搜索、组合筛选和清除筛选。
- 进入详情页，更新状态和负责人。
- 添加备注并返回列表。
- 375px 视口下完成核心操作。

说明：异步 Server Components 主要交给 E2E 测试；Vitest 集中测试同步组件、schema 和纯业务逻辑。

## 14. 工程化与交付

### pnpm

- 仓库只保留 `pnpm-lock.yaml`。
- 在 `package.json` 固定 `packageManager` 版本。
- CI 使用 `pnpm install --frozen-lockfile`。

### 质量命令

计划形成以下脚本：

```text
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
```

### GitHub Actions

Pull Request 自动执行：

1. 冻结锁文件安装。
2. ESLint。
3. TypeScript 类型检查。
4. Vitest。
5. Next.js production build。
6. 核心 Playwright 流程。

### README

- 项目背景与截图。
- 环境要求和启动方式。
- 功能清单。
- 架构和 Server/Client 边界说明。
- 测试方式。
- 已知限制。
- 部署地址。

## 15. 性能与可观测性阶段

- 使用 `next/font`，图片使用 `next/image`。
- 用 React DevTools Profiler 查找真实重渲染问题。
- 检查 LCP、INP、CLS，不为没有测量的问题提前优化。
- 大型客户端组件动态加载。
- 使用 bundle analyzer 检查客户端 bundle。
- 接入 Sentry 错误追踪和基础性能监控。
- 部署到 Vercel，配置 Preview Deployments 和环境变量。

## 16. Monorepo 扩展阶段

MVP 完成后再迁移，避免初期复杂度干扰业务开发。

```text
apps/
  web/
packages/
  ui/
  validation/
  config-eslint/
  config-typescript/
  types/
```

练习内容：

- `pnpm-workspace.yaml`
- `workspace:*`
- `pnpm --filter`
- Turborepo 任务依赖与缓存
- 共享 TypeScript/ESLint 配置
- Changesets（仅在共享包需要发布时加入）

## 17. 分阶段开发顺序

### 阶段 0：环境和基线

- 完成 pnpm 迁移。
- 确保 `pnpm dev`、`pnpm lint`、`pnpm build` 全部通过。
- 更新项目标题、语言和基础布局。

### 阶段 1：静态管理台

- 完成桌面/移动布局。
- 用种子数据展示列表、统计和全部状态页面。
- 建立基础 UI 组件和设计 token。

### 阶段 2：筛选表单

- 完成搜索、状态/优先级筛选、排序和清除筛选。
- 将状态写入 URL。
- 为筛选纯函数和表单交互添加测试。

### 阶段 3：新建表单与持久化

- 建立数据库和 schema。
- 完成 React Hook Form + Zod。
- 实现 Server Action、pending、成功和错误反馈。
- 添加刷新后仍存在的 E2E 测试。

### 阶段 4：详情、编辑和备注

- 完成动态路由和 `not-found.tsx`。
- 更新状态、负责人、优先级。
- 添加处理备注和乐观反馈。

### 阶段 5：可靠性与交付

- 补齐 loading、empty、error、移动端和无障碍。
- 配置 Vitest、RTL、Playwright 和 GitHub Actions。
- 完成 README 和部署。

### 阶段 6：专项扩展

- Cache Components。
- TanStack Query 专项场景。
- Zustand 草稿或 UI 状态。
- 性能分析、Sentry、Vercel Analytics。
- Monorepo 迁移。

## 18. 学习内容覆盖对照

| 学习主题 | 项目落点 |
| --- | --- |
| JSX、组件、不可变状态 | 列表、卡片、表单组件 |
| `useState`、`useEffect`、`useRef` | Dialog、草稿同步、焦点管理 |
| `useReducer`、Context、自定义 Hook | 复杂筛选、多步骤表单、主题与工具 Hook |
| 组件组合 | 表单布局、Dialog/Drawer 共用表单主体 |
| TypeScript | DTO、Action 状态、表单字段、领域联合类型 |
| 路由 | App Router、动态详情路由、loading/error/not-found |
| TanStack Query | 异步负责人搜索或备注无限滚动 |
| Zustand | 可选草稿或跨页面 UI 状态 |
| React Hook Form + Zod | 新建、编辑、备注、动态字段和跨字段校验 |
| Tailwind、shadcn、CVA | 响应式管理台与组件变体 |
| Core Web Vitals、Profiler | 性能阶段 |
| `next/image`、`next/font` | 头像和字体 |
| GitHub Actions、Vercel | 自动检查、预览部署 |
| Vitest、RTL、Playwright | 单元、组件和端到端测试 |
| Server Components/Actions | 读取数据、提交表单和数据变更 |
| Suspense、缓存和重新验证 | loading、Cache Components、tag 更新 |
| `useActionState`、`useOptimistic` | 提交反馈、状态更新和备注 |
| pnpm、Monorepo、Turborepo | MVP 后扩展阶段 |

## 19. 明确暂缓的内容

- 不在 MVP 中同时使用 Redux Toolkit 和 Zustand。
- 不为了演示而在 Server Components 已解决的列表上重复套 TanStack Query。
- 不在业务稳定前迁移 Monorepo。
- 不在测量前大量添加 `memo`、`useMemo`、`useCallback`。
- 不把本应存在服务端的数据只保存在浏览器状态中。

这样可以覆盖学习目标，同时保持架构边界清楚、项目能够按阶段交付。
