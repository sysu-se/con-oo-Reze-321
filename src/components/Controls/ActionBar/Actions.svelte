<script>
	import { candidates } from '@sudoku/stores/candidates';
	import { cursor } from '@sudoku/stores/cursor';
	import { hints } from '@sudoku/stores/hints';
	import { notes } from '@sudoku/stores/notes';
	import { settings } from '@sudoku/stores/settings';
	import { keyboardDisabled } from '@sudoku/stores/keyboard';
	import { gamePaused } from '@sudoku/stores/game';

	// ❌ 删除旧的 userGrid
	// import { userGrid } from '@sudoku/stores/grid';

	// ✅ 引入你的 store
	import { myGame as game } from '../../../stores/myGameStore';

	$: hintsAvailable = $hints > 0;

	function handleHint() {
		if (hintsAvailable) {
			if ($candidates.hasOwnProperty($cursor.x + ',' + $cursor.y)) {
				candidates.clear($cursor);
			}

			// ❗这里原来是 userGrid.applyHint（我们先不支持 hint）
			// 👉 作业不要求，可以先简单处理：
			game.guess({
				row: $cursor.y,
				col: $cursor.x,
				value: Math.floor(Math.random() * 9) + 1 // 简单占位
			});
		}
	}
</script>

<div class="action-buttons space-x-3">

	<!-- ✅ Undo -->
	<button
		class="btn btn-round"
		disabled={$gamePaused}
		title="Undo"
		on:click={() => game.undo()}
	>
		↩️
	</button>

	<!-- ✅ Redo -->
	<button
		class="btn btn-round"
		disabled={$gamePaused}
		title="Redo"
		on:click={() => game.redo()}
	>
		↪️
	</button>

	<!-- Hint（可以保留简单版） -->
	<button
		class="btn btn-round btn-badge"
		disabled={$keyboardDisabled || !hintsAvailable}
		on:click={handleHint}
		title="Hints ({$hints})"
	>
		💡
		{#if $settings.hintsLimited}
			<span class="badge" class:badge-primary={hintsAvailable}>{$hints}</span>
		{/if}
	</button>

	<!-- Notes 保留 -->
	<button
		class="btn btn-round btn-badge"
		on:click={notes.toggle}
		title="Notes ({$notes ? 'ON' : 'OFF'})"
	>
		✏️
		<span class="badge tracking-tighter" class:badge-primary={$notes}>
			{$notes ? 'ON' : 'OFF'}
		</span>
	</button>

</div>

<style>
	.action-buttons {
		@apply flex flex-wrap justify-evenly self-end;
	}

	.btn-badge {
		@apply relative;
	}

	.badge {
		min-height: 20px;
		min-width: 20px;
		@apply p-1 rounded-full leading-none text-center text-xs text-white bg-gray-600 inline-block absolute top-0 left-0;
	}

	.badge-primary {
		@apply bg-primary;
	}
</style>