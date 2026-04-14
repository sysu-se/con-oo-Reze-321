import { writable } from 'svelte/store'
import { createGame, createSudoku } from '../domain'

const defaultGrid = [
  [0,0,0, 2,6,0, 7,0,1],
  [6,8,0, 0,7,0, 0,9,0],
  [1,9,0, 0,0,4, 5,0,0],

  [8,2,0, 1,0,0, 0,4,0],
  [0,0,4, 6,0,2, 9,0,0],
  [0,5,0, 0,0,3, 0,2,8],

  [0,0,9, 3,0,0, 0,7,4],
  [0,4,0, 0,5,0, 0,3,6],
  [7,0,3, 0,1,8, 0,0,0]
]

export function createMyGameStore() {
  let game = createGame({
    sudoku: createSudoku(defaultGrid)
  })

  const { subscribe, set } = writable(getSnapshot())

  function getSnapshot() {
    return {
      grid: game.getSudoku().getGrid()
    }
  }

  function update() {
    set(getSnapshot())
  }

  return {
    subscribe,

    guess(move) {
      game.guess(move)
      update()
    },

    undo() {
      game.undo()
      update()
    },

    redo() {
      game.redo()
      update()
    }
  }
}

export const myGame = createMyGameStore()
