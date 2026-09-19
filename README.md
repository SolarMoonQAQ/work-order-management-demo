# 工单管理系统

一个使用 Next.js 16 构建的全栈工单管理演示项目，用于完成客户问题工单的查询、筛选、创建、更新和处理记录管理。

项目采用 App Router 和 Server Actions：页面读取由 Server Components 完成，交互表单由 Client Components 负责，数据通过 Drizzle ORM 持久化到 Neon PostgreSQL。

## 功能

- 展示工单标题、客户、公司、优先级、状态、负责人和更新时间
- 根据标题或客户名称即时搜索，支持空格分词
- 多选状态和优先级，可组合筛选
- 按更新时间或优先级排序
- 使用 URL 查询参数保存筛选条件，支持一键清除
- 通过弹窗创建工单
- 使用 Zod 执行服务端表单校验
- 防止提交过程中重复创建或修改
- 创建成功后关闭弹窗、显示提示并刷新列表
- 查看完整工单信息
- 修改工单状态、优先级和负责人
- 修改工单时添加可选处理备注
- 展示包含内容和时间的历史处理备注
- 使用数据库持久化数据，刷新页面后数据仍然存在
- 中文界面、响应式布局和基础无障碍属性

## 技术栈

| 分类       | 技术                                             |
| ---------- | ------------------------------------------------ |
| 框架       | Next.js 16、React 19、TypeScript                 |
| UI         | Tailwind CSS 4、shadcn/ui、Base UI、Lucide React |
| 表单与校验 | Server Actions、`useActionState`、Zod            |
| 数据库     | Neon PostgreSQL、Drizzle ORM、Drizzle Kit        |
| 国际化     | next-intl                                        |
| 测试       | Vitest、React Testing Library、JSDOM             |
| 工程化     | pnpm、ESLint、Prettier                           |

## 环境要求

- Node.js 20.9 或更高版本
- pnpm
- 一个可用的 PostgreSQL 数据库；推荐使用 [Neon](https://neon.com/)

## 本地启动

### 1. 克隆项目

```bash
git clone https://github.com/SolarMoonQAQ/work-order-management-demo.git
cd work-order-management-demo
```

### 2. 安装依赖

```bash
pnpm install
```

如果 pnpm 阻止了依赖构建脚本，可以先审核需要执行的脚本：

```bash
pnpm approve-builds
```

### 3. 配置环境变量

复制环境变量示例：

```powershell
Copy-Item .env.example .env.local
```

macOS 或 Linux：

```bash
cp .env.example .env.local
```

然后将 `.env.local` 中的 `DATABASE_URL` 替换为自己的 PostgreSQL 连接地址：

```dotenv
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
```

不要提交包含真实数据库密码的 `.env.local`。

### 4. 执行数据库迁移

```bash
pnpm db:migrate
```

该迁移会创建：

- `tickets`：工单信息
- `ticket_notes`：工单处理备注

### 5. 启动开发服务器

```bash
pnpm dev
```

浏览器打开 [http://localhost:3000](http://localhost:3000)。

## 常用命令

```bash
# 启动开发服务器
pnpm dev

# 代码检查
pnpm lint

# 运行测试并退出
pnpm test:run

# 监听模式运行测试
pnpm test

# 检查代码格式
pnpm format:check

# 自动格式化
pnpm format

# 生成 Drizzle 迁移
pnpm db:generate

# 执行数据库迁移
pnpm db:migrate

# 打开 Drizzle Studio
pnpm db:studio

# 生产构建与启动
pnpm build
pnpm start
```

## 项目结构

```text
app/                         Next.js 路由、页面和全局样式
  tickets/[ticketId]/        工单详情路由
components/ui/               shadcn/ui 基础组件
db/                          Drizzle 数据库连接和表结构
drizzle/                     数据库迁移文件
features/tickets/            工单业务模块
  actions/                   创建和修改工单的 Server Actions
  components/                工单卡片、筛选器和表单组件
  server/                    仅服务端使用的查询逻辑
i18n/                        next-intl 配置
messages/                    中文翻译文案
test/                        Vitest 与 React Testing Library 测试
```

## 数据与交互流程

```text
Server Component 查询数据库
          ↓
      渲染工单页面
          ↓
Client Component 提交表单
          ↓
Server Action + Zod 校验
          ↓
Drizzle 写入 PostgreSQL
          ↓
revalidatePath 刷新页面数据
```

筛选条件保存在 URL 查询参数中，例如：

```text
/?q=登录&status=PENDING&priorities=HIGH&sort=updated_desc
```

因此筛选结果可以刷新和分享，而不依赖全局客户端状态。

## 测试与构建

提交代码前建议依次执行：

```bash
pnpm lint
pnpm test:run
pnpm build
```

现有自动化测试主要覆盖工单卡片渲染和即时搜索行为。

## 已知限制

- 当前只提供简体中文界面
- 状态导航和各状态工单数量统计尚未实现
- 页面级加载骨架和数据库查询错误重试页尚未完成
- 修改工单成功后仍停留在详情页，需要手动返回列表
- 自动化测试尚未覆盖完整的新建、修改、备注和数据库持久化流程
- 暂未添加 Playwright 端到端测试、GitHub Actions 和线上部署配置

## 后续计划

- 增加响应式状态导航和工单数量统计
- 补充 `loading.tsx`、`error.tsx` 和更完整的空状态
- 保存修改后自动返回列表
- 添加 Playwright 端到端测试和 GitHub Actions
- 完成 375px 移动端验收并部署到 Vercel
