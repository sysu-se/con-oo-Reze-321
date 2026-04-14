<script>
	import { cursor } from '@sudoku/stores/cursor';
	import { notes } from '@sudoku/stores/notes';
	import { candidates } from '@sudoku/stores/candidates';

	import { myGame as game } from '../../stores/myGameStore';

	// TODO: Improve keyboardDisabled
	import { keyboardDisabled } from '@sudoku/stores/keyboard';

	function handleKeyButton(num) {
		if ($keyboardDisabled) return;

		// 没有选中格子直接返回（避免报错）
		if ($cursor.x === null || $cursor.y === null) return;

		if ($notes) {
			if (num === 0) {
				candidates.clear($cursor);
			} else {
				candidates.add($cursor, num);
			}
		} else {
			game.guess({
				row: $cursor.y,
				col: $cursor.x,
				value: num
			});

			// 清除候选
			if ($candidates.hasOwnProperty($cursor.x + ',' + $cursor.y)) {
				candidates.clear($cursor);
			}
		}
	}

	function handleKey(e) {
		switch (e.key || e.keyCode) {
			case 'ArrowUp':
			case 38:
			case 'w':
			case 87:
				cursor.move(0, -1);
				break;

			case 'ArrowDown':
			case 40:
			case 's':
			case 83:
				cursor.move(0, 1);
				break;

			case 'ArrowLeft':
			case 37:
			case 'a':
			case 65:
				cursor.move(-1);
				break;

			case 'ArrowRight':
			case 39:
			case 'd':
			case 68:
				cursor.move(1);
				break;

			case 'Backspace':
			case 8:
			case 'Delete':
			case 46:
				handleKeyButton(0);
				break;

			default:
				if (e.key && e.key * 1 >= 0 && e.key * 1 < 10) {
					handleKeyButton(e.key * 1);
				} else if (e.keyCode - 48 >= 0 && e.keyCode - 48 < 10) {
					handleKeyButton(e.keyCode - 48);
				}
				break;
		}
	}
</script>

<svelte:window on:keydown={handleKey} />

<div class="keyboard-grid">

	{#each Array(10) as _, keyNum}
		{#if keyNum === 9}
			<button class="btn btn-key" disabled={$keyboardDisabled} on:click={() => handleKeyButton(0)}>
				
			</button>
		{:else}
			<button class="btn btn-key" disabled={$keyboardDisabled} on:click={() => handleKeyButton(keyNum + 1)}>
				{keyNum + 1}
			</button>
		{/if}
	{/each}

</div>

<style>
	.keyboard-grid {
		@apply grid grid-rows-2 grid-cols-5 gap-3;
	}

	.btn-key {
		@apply py-4 px-0;
	}
</style>
