# con-oo-Reze-321 - Review

## Review 结论

当前实现已经有了 `Sudoku` / `Game` 的基本领域抽象，也把棋盘渲染、数字输入、Undo/Redo 局部接到了自定义 store 上；但整体仍是“半接入”状态。开始新局、载入题目、暂停/恢复、分享等关键流程依旧依赖旧的 `@sudoku/game` / `@sudoku/stores/*`，而 `Sudoku` 本身也没有真正建模固定题面、冲突校验和完成态，因此在 OOP、OOD、数独业务语义和 Svelte 主流程整合上都存在明显缺口。

## 总体评价

| 维度 | 评价 |
| --- | --- |
| OOP | fair |
| JS Convention | fair |
| Sudoku Business | poor |
| OOD | poor |

## 缺点

### 1. 根组件把自定义 store 当成旧游戏对象使用

- 严重程度：core
- 位置：src/App.svelte:4-30
- 原因：这里既有损坏的 import 语句，又调用了 `game.pause()` / `game.resume()`，但 `src/stores/myGameStore.js` 只暴露 `subscribe/guess/undo/redo`。这说明领域层没有完成根生命周期接入，暂停、恢复和游戏结束流程在接口层面已经失配。

### 2. 新局、自定义题目与暂停恢复仍依赖旧引擎

- 严重程度：core
- 位置：src/components/Header/Dropdown.svelte:11-65
- 原因：菜单中的 `game.pause()`、`game.resume()`、`game.startNew()`、`game.startCustom()` 全部来自旧 `@sudoku/game`，`src/components/Modal/Types/Welcome.svelte:16-23` 也延续了同样模式。按照作业要求，开始一局游戏应创建或加载新的领域对象；当前实现只在默认盘面上局部接入了领域层，没有覆盖真实开局流程。

### 3. Sudoku 只做边界检查，没有建模数独规则

- 严重程度：core
- 位置：src/domain/index.js:21-40
- 原因：`guess` 只校验坐标和值范围，不区分题目给定格与玩家输入，也不提供行/列/宫冲突校验、完成态判断等业务规则。结果是领域对象无法表达“哪些格子可编辑、哪些输入非法、何时获胜”，其 OOP 建模价值明显不足。

### 4. Hint 逻辑直接写入随机数字，违背数独业务

- 严重程度：core
- 位置：src/components/Controls/ActionBar/Actions.svelte:15-27
- 原因：提示按钮用 `Math.random()` 生成 1-9 后直接调用 `game.guess`，既不来源于题目解，也不经过校验。它把“提示”实现成了随机改盘，说明领域层没有提供可信的高层游戏操作。

### 5. 棋盘视图缺少题面与冲突语义，UI 被迫写死错误状态

- 严重程度：major
- 位置：src/components/Board/index.svelte:55-61
- 原因：`userNumber` 被固定为 `true`，`conflictingNumber` 被固定为 `false`。这意味着界面无法区分 givens 与玩家填写，也无法显示冲突；根因是领域对象和 store 没有导出这些业务语义，导致视图层只能硬编码。

### 6. Store adapter 只暴露 grid，导致新旧状态源并存

- 严重程度：major
- 位置：src/stores/myGameStore.js:25-51
- 原因：快照里只有 `grid`，没有 `canUndo/canRedo`、无效格、胜利态、暂停态、分享/序列化能力、开始新局/载入题目的命令。于是组件不得不继续混用 `@sudoku/stores/*` 和旧 game API，形成 split-brain 架构，领域对象无法成为唯一真相源。

### 7. 分享流程读取旧 grid store，而不是领域对象当前局面

- 严重程度：major
- 位置：src/components/Modal/Types/Share.svelte:5-13
- 原因：分享码通过 `@sudoku/stores/grid` 生成，但棋盘渲染来自 `$game.grid`。一旦两套状态不同步，用户看到的盘面与分享出去的盘面就可能不一致，这直接说明领域对象没有接管完整用户流程。

### 8. Game 向外暴露可变的 Sudoku 实例，破坏历史边界

- 严重程度：major
- 位置：src/domain/index.js:70-72
- 原因：`getSudoku()` 返回的是 `history[pointer]` 的活对象，而 `Sudoku` 自身又有可变的 `guess()`。任何拿到该引用的调用方都可以绕过 `Game.guess()` 直接修改盘面，跳过历史管理与后续通知，这不是好的 OOD 边界。

### 9. 反序列化路径复制了整套 Game 实现

- 严重程度：minor
- 位置：src/domain/index.js:117-166
- 原因：`createGameFromJSON` 基本重复了 `createGame` 的逻辑，没有复用统一构造路径，也没有校验 `history/pointer` 的合法性。两处实现后续容易漂移，属于典型的可维护性问题。

## 优点

### 1. Sudoku 对 grid 做了基本封装

- 位置：src/domain/index.js:6-18
- 原因：内部状态保存在闭包里，`getGrid()` 返回副本而不是直接暴露底层二维数组，至少避免了 UI 直接持有原始引用后随意改值。

### 2. Game 把猜测与历史推进集中管理

- 位置：src/domain/index.js:74-86
- 原因：每次 `guess` 都基于当前 `Sudoku` 克隆出新状态，并在写入前截断 redo 分支，Undo/Redo 的核心规则集中在领域层而不是散落在组件里。

### 3. 采用了符合 Svelte 3 的 store adapter 思路

- 位置：src/stores/myGameStore.js:23-33
- 原因：通过 `writable` 包装领域对象，并在每次命令后 `set(getSnapshot())`，这是让普通 JS 领域对象与 `$store` 协作的正确方向。

### 4. 棋盘渲染已经切到领域 store 快照

- 位置：src/components/Board/index.svelte:45-64
- 原因：Board 直接消费 `$game.grid` 渲染局面，说明领域对象至少进入了真实界面的主要渲染链路，而不是只存在于独立模块或测试里。

### 5. 数字输入通过领域命令落盘

- 位置：src/components/Controls/Keyboard.svelte:23-34
- 原因：非 notes 模式下的数字输入调用 `game.guess(...)`，没有在组件里直接改二维数组，这一点符合题目对职责边界的要求。

### 6. 撤销与重做入口已接到自定义 Game store

- 位置：src/components/Controls/ActionBar/Actions.svelte:33-49
- 原因：按钮直接调用 `game.undo()` / `game.redo()`，说明历史操作开始由领域对象负责，而不是继续放在组件状态里。

## 补充说明

- 未运行测试、未启动 Svelte 应用；以上结论全部基于对 `src/domain/index.js`、`src/stores/myGameStore.js` 以及关联 `.svelte` 文件的静态阅读。
- 对“未真正接入主流程”的判断来自当前仓库内的调用点：开始新局、载入题目、暂停/恢复、分享等流程仍直接引用 `@sudoku/game` 或 `@sudoku/stores/grid`，而不是统一走自定义领域 store。
- 未审查 `@sudoku/*` 外部模块实现，因此凡涉及旧游戏引擎行为的判断，都仅针对当前代码中的接入方式与边界设计，不代表外部模块本身一定有问题。
