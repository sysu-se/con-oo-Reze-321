# DESIGN.md

 一、总体设计说明
在 Homework 1 中，我已经实现了Sudoku和Game两个领域对象，并支持了基本的填数、克隆以及 Undo/Redo 功能。但当时的实现主要用于通过测试，并没有真正接入到 Svelte 的实际界面中。
本次作业的核心目标是：让领域对象成为真实游戏流程的核心，而不是只存在于测试代码中。
因此，我在本次作业中采用了Store Adapter 的设计方式，通过一个自定义的 myGameStore将领域对象与 Svelte 的响应式机制连接起来，使 UI 可以真正消费领域对象的数据与行为。

二、领域对象设计
1. Sudoku
Sudoku负责表示当前数独盘面，其主要职责包括：
* 存储当前 grid（二维数组）
* 提供 guess({row, col, value}) 接口修改盘面
* 提供 getGrid()获取当前状态（返回深拷贝）
* 提供 clone()用于生成快照（支持 Undo / Redo）
* 提供 toJSON() / toString()用于序列化
设计要点
* 使用 deepCopy保证外部无法直接修改内部状态
* 所有修改必须通过 guess()进行
* 在 guess()中加入基本的参数合法性检查（保证contract）
2. Game
Game作为更高层的领域对象，负责管理游戏过程：
* 持有当前 Sudoku
* 使用 history+pointer维护历史记录
* 提供：
  * guess(move)
  * undo()
  * redo()
* 提供 toJSON()用于序列化
设计要点
* 每次guess都基于 clone()生成新状态（避免共享引用）
* 使用 slice 截断历史（保证 redo 正确）
* UI 不直接操作 Sudoku，而是通过 Game统一入口
  
三、领域对象的改进
相比 Homework 1，我主要做了以下改进：
1. 增强封装性
在 HW1 中：
* grid 可能被外部直接修改
现在：
* 所有状态通过 getGrid()返回深拷贝
* 外部无法直接修改内部数据
2. 明确职责边界
* Sudoku：只负责“一个盘面”
* Game：负责“状态演进+历史”
避免了逻辑混乱
3. 改进序列化设计
* toJSON()返回纯数据结构
* createGameFromJSON/createSudokuFromJSON可恢复状态
* 
四、领域对象如何接入 Svelte
本次作业采用 Store Adapter 模式：
createMyGameStore()
该 store 内部：
* 持有 Game实例
* 使用 Svelte 的 writable`store 包装状态
* 1. View 层消费的对象
View 层并不直接使用 Game 或 Sudoku，而是使用：
myGame store
2. View 层获取的数据
通过 $myGame，UI 可以获取：
{
  grid
}
这些数据来源于：
game.getSudoku().getGrid()
3. 用户操作如何进入领域对象
例如在输入数字时：
myGame.guess({ row, col, value })
流程为：
UI → store → Game → Sudoku

Undo / Redo 同理：
myGame.undo()
myGame.redo()

4. UI 为什么会更新？
关键在于：
writable store 的 set()
myGameStore中：
function update() {
  set(getSnapshot())
}
每次调用：
guess / undo / redo
都会触发：
set(...)
Svelte 检测到 store 变化
自动重新渲染 UI
五、Svelte 响应式机制说明
本方案主要依赖：
store + $store 自动订阅机制
1. 为什么直接修改对象不会更新 UI？
例如：
grid[0][0] = 5
Svelte 不会检测到变化，因为：
* 没有触发重新赋值
* 没有调用 store 的 set
2. 为什么 store 可以更新 UI？
因为：
set(newValue)
会通知所有订阅者（组件）
组件中的：
$myGame
会自动更新
3. 响应式边界在哪里？
* UI 层：只依赖 $myGame
* 领域层：完全不依赖 Svelte
store 是中间桥梁
4. 如果直接 mutate 会发生什么？
如果这样写：
game.getSudoku().grid[0][0] = 5
可能出现：
* UI 不更新 
* 状态不一致 
* Undo/Redo 失效 
六、为什么选择 Store Adapter
相比直接让领域对象可订阅：
优点：
* 解耦 UI 与领域层
* 领域对象可以独立测试
* 更符合 Svelte 使用习惯
trade-off：
* 需要额外一层 store
* 多了一次状态同步
但整体更清晰、可维护性更高
七、总结
本次作业的核心在于：
> 让领域对象真正成为系统核心，而不是测试工具
通过：
* Sudoku +Game 作为领域模型
* myGameStore 作为适配层
* Svelte store 作为响应式桥梁
实现了：
领域层 → store → UI
从而保证：
UI 不直接操作数据
所有逻辑统一进入领域对象
状态变化可以驱动界面更新
相比 Homework 1，是一次从“能运行”到“合理架构”的提升。
