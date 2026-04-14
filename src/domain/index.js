function deepCopy(grid) {
  return grid.map(row => [...row])
}

// ===== Sudoku =====
export function createSudoku(input) {
  let grid = deepCopy(input)

  return {
    getGrid,
    guess,
    clone,
    toJSON,
    toString
  }

  function getGrid() {
    return deepCopy(grid)
  }

  function guess({ row, col, value }) {
    // ✅ contract check
    if (
      typeof row !== 'number' ||
      typeof col !== 'number' ||
      typeof value !== 'number'
    ) {
      throw new Error('Invalid input type')
    }

    if (row < 0 || row > 8 || col < 0 || col > 8) {
      throw new Error('Index out of bounds')
    }

    if (value < 0 || value > 9) {
      throw new Error('Invalid value')
    }

    grid[row][col] = value
  }

  function clone() {
    return createSudoku(deepCopy(grid))
  }

  function toJSON() {
    return { grid: deepCopy(grid) }
  }

  function toString() {
    return grid.map(row => row.join(" ")).join("\n")
  }
}

// ===== Game =====
export function createGame({ sudoku }) {
  let history = [sudoku.clone()]
  let pointer = 0

  return {
    getSudoku,
    guess,
    undo,
    redo,
    canUndo,
    canRedo,
    toJSON
  }

  function getSudoku() {
    return history[pointer]
  }

  function guess(move) {
    // ✅ basic check
    if (!move || typeof move !== 'object') {
      throw new Error('Invalid move')
    }

    let newSudoku = getSudoku().clone()
    newSudoku.guess(move)

    history = history.slice(0, pointer + 1)
    history.push(newSudoku)
    pointer++
  }

  function undo() {
    if (pointer > 0) pointer--
  }

  function redo() {
    if (pointer < history.length - 1) pointer++
  }

  function canUndo() {
    return pointer > 0
  }

  function canRedo() {
    return pointer < history.length - 1
  }

  function toJSON() {
    return {
      history: history.map(s => s.toJSON()),
      pointer
    }
  }
}

// ===== Serialization =====
export function createSudokuFromJSON(json) {
  return createSudoku(json.grid)
}

export function createGameFromJSON(json) {
  let history = json.history.map(createSudokuFromJSON)
  let pointer = json.pointer

  return {
    getSudoku,
    guess,
    undo,
    redo,
    canUndo,
    canRedo,
    toJSON
  }

  function getSudoku() {
    return history[pointer]
  }

  function guess(move) {
    let newSudoku = getSudoku().clone()
    newSudoku.guess(move)

    history = history.slice(0, pointer + 1)
    history.push(newSudoku)
    pointer++
  }

  function undo() {
    if (pointer > 0) pointer--
  }

  function redo() {
    if (pointer < history.length - 1) pointer++
  }

  function canUndo() {
    return pointer > 0
  }

  function canRedo() {
    return pointer < history.length - 1
  }

  function toJSON() {
    return {
      history: history.map(s => s.toJSON()),
      pointer
    }
  }
}
