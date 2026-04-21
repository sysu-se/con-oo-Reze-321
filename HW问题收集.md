已解决
1. Svelte中对象内部修改为什么不会触发UI更新？
上下文：
在HW1中我实现了Sudoku和Game，但是在接入UI时我发现了一个问题：调用 game.guess() 后，内部的grid已经变化，但页面没有更新。
解决手段：
查阅资料并实验后发现，Svelte的响应式是基于“变量赋值”，而不是深层对象变化。
也就是说：
game.getSudoku().guess(...)虽然数据变了，但Svelte不会自动检测到。
最终通过引入store（writable）解决：每次操作后调用 set() 更新状态，从而触发UI刷新。
2. Game/Sudoku如何正确接入UI，而不是被绕开？
上下文：
一开始虽然实现了领域对象，但UI还是直接操作二维数组，比如：
grid[row][col] = value导致领域对象没有真正参与流程。
解决手段：
参考作业要求后，我改为引入GameStore 作为中间层：
UI 只调用store.guess()
store内部调用Game
Game 再操作Sudoku
从而保证所有逻辑都经过领域对象，UI不再直接操作数据
3. Undo/Redo如何与UI同步？
上下文：
HW1中Undo/Redo已经实现，但接入UI后发现：调用undo后数据变了，但按钮状态和界面没有同步更新
解决手段：
在store中统一维护canUndo、canRedo、grid
每次 undo/redo 后调用 set() 更新状态
从而保证：
UI 按钮状态正确、棋盘同步更新
未解决
1. sameArea 的具体作用和实现逻辑还不完全理解
上下文：
在 src/components/Board/index.svelte 中看到：
sameArea={$settings.highlightCells && !isSelected($cursor, x, y) && isSameArea($cursor, x, y)}
尝试解决手段：
目前理解是用于高亮“同一行/列/宫”的格子，但是isSameArea 的具体实现逻辑没有完全看懂，不确定是否包含行、列、九宫格三种情况
后续准备结合调试进一步理解。
2. store 和领域对象的职责边界仍有点模糊
上下文：
在实现 GameStore 时，有些逻辑不确定应该放在哪一层，例如：是否在 store 中计算 won，是否在Sudoku中提供更多UI相关方法
尝试解决手段：
我目前采用的是：
Sudoku 只负责规则
Game 负责历史
Store 负责 UI 状态
但对于一些“介于UI和领域之间”的逻辑（如提示、高亮），还不确定最佳位置。
3. Svelte 响应式机制的一些细节还不完全清楚
上下文：
在使用 $: 和 store 时发现：
有时候 reactive statement 会触发，有时候不会触发
尝试解决手段：
查阅资料后我大致理解：依赖必须是“直接引用”，间接依赖不会触发更新
但对于复杂场景（如嵌套对象、函数返回值），还不能完全确定其行为。
