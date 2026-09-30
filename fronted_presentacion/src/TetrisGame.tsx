import { useCallback, useEffect, useRef, useState } from 'react'
import './TetrisGame.css'

const COLUMNS = 10
const ROWS = 20
const CELL_SIZE = 30
const BASE_DROP_INTERVAL = 800

const PIECES = {
  I: { color: '#42d6d0', shape: [[1, 1, 1, 1]] },
  J: { color: '#5885e8', shape: [[1, 0, 0], [1, 1, 1]] },
  L: { color: '#f3a94e', shape: [[0, 0, 1], [1, 1, 1]] },
  O: { color: '#f5d25f', shape: [[1, 1], [1, 1]] },
  S: { color: '#77bf75', shape: [[0, 1, 1], [1, 1, 0]] },
  T: { color: '#b48acb', shape: [[0, 1, 0], [1, 1, 1]] },
  Z: { color: '#df7181', shape: [[1, 1, 0], [0, 1, 1]] },
} as const

type PieceType = keyof typeof PIECES
type GameStatus = 'ready' | 'running' | 'paused' | 'gameover'
type Piece = { type: PieceType; color: string; shape: number[][]; x: number; y: number }
type Engine = {
  board: (string | null)[][]
  current: Piece
  next: PieceType
  bag: PieceType[]
  score: number
  lines: number
  level: number
}
type Action = 'left' | 'right' | 'rotate' | 'down' | 'drop'

const ACTIONS: { action: Action; label: string; text: string }[] = [
  { action: 'left', label: 'Mover a la izquierda', text: '←' },
  { action: 'rotate', label: 'Rotar pieza', text: '↻' },
  { action: 'right', label: 'Mover a la derecha', text: '→' },
  { action: 'down', label: 'Bajar pieza', text: '↓' },
  { action: 'drop', label: 'Caída rápida', text: '⇊' },
]

function makeBoard() {
  return Array.from({ length: ROWS }, () => Array<string | null>(COLUMNS).fill(null))
}

function shuffledBag(): PieceType[] {
  const bag = Object.keys(PIECES) as PieceType[]
  for (let index = bag.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[bag[index], bag[swapIndex]] = [bag[swapIndex], bag[index]]
  }
  return bag
}

function drawCell(context: CanvasRenderingContext2D, x: number, y: number, color: string, ghost = false) {
  if (y < 0) return
  const inset = ghost ? 3 : 1
  context.globalAlpha = ghost ? 0.25 : 1
  context.fillStyle = color
  context.fillRect(x * CELL_SIZE + inset, y * CELL_SIZE + inset, CELL_SIZE - inset * 2, CELL_SIZE - inset * 2)
  if (!ghost) {
    context.fillStyle = 'rgba(255,255,255,.24)'
    context.fillRect(x * CELL_SIZE + 3, y * CELL_SIZE + 3, CELL_SIZE - 6, 3)
    context.strokeStyle = 'rgba(0,0,0,.22)'
    context.strokeRect(x * CELL_SIZE + 1, y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2)
  }
  context.globalAlpha = 1
}

function TetrisGame() {
  const boardCanvas = useRef<HTMLCanvasElement>(null)
  const nextCanvas = useRef<HTMLCanvasElement>(null)
  const engine = useRef<Engine | null>(null)
  const [status, setStatus] = useState<GameStatus>('ready')
  const [score, setScore] = useState(0)
  const [lines, setLines] = useState(0)
  const [level, setLevel] = useState(1)

  if (engine.current == null) {
    const initialBag = shuffledBag()
    const firstType = initialBag.pop() ?? 'T'
    const nextType = initialBag.pop() ?? 'I'
    const definition = PIECES[firstType]
    engine.current = {
      board: makeBoard(),
      current: {
        type: firstType,
        color: definition.color,
        shape: definition.shape.map((row) => [...row]),
        x: Math.floor((COLUMNS - definition.shape[0].length) / 2),
        y: 0,
      },
      next: nextType,
      bag: initialBag,
      score: 0,
      lines: 0,
      level: 1,
    }
  }

  const takeType = useCallback((game: Engine): PieceType => {
    if (game.bag.length === 0) game.bag = shuffledBag()
    return game.bag.pop() ?? 'T'
  }, [])

  const collides = useCallback((game: Engine, shape: number[][], offsetX: number, offsetY: number) => {
    return shape.some((row, rowIndex) => row.some((cell, columnIndex) => {
      if (!cell) return false
      const x = offsetX + columnIndex
      const y = offsetY + rowIndex
      return x < 0 || x >= COLUMNS || y >= ROWS || (y >= 0 && Boolean(game.board[y][x]))
    }))
  }, [])

  const draw = useCallback(() => {
    const game = engine.current
    const canvas = boardCanvas.current
    const preview = nextCanvas.current
    const context = canvas?.getContext('2d')
    const previewContext = preview?.getContext('2d')
    if (!game || !canvas || !preview || !context || !previewContext) return

    context.clearRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = 'rgba(8, 18, 29, .9)'
    context.fillRect(0, 0, canvas.width, canvas.height)
    game.board.forEach((row, y) => row.forEach((color, x) => {
      if (color) drawCell(context, x, y, color)
    }))

    let ghostY = game.current.y
    while (!collides(game, game.current.shape, game.current.x, ghostY + 1)) ghostY += 1
    game.current.shape.forEach((row, rowIndex) => row.forEach((cell, columnIndex) => {
      if (!cell) return
      const x = game.current.x + columnIndex
      drawCell(context, x, ghostY + rowIndex, game.current.color, true)
      drawCell(context, x, game.current.y + rowIndex, game.current.color)
    }))

    context.strokeStyle = 'rgba(255,255,255,.08)'
    context.lineWidth = 1
    for (let column = 0; column <= COLUMNS; column += 1) {
      context.beginPath()
      context.moveTo(column * CELL_SIZE + .5, 0)
      context.lineTo(column * CELL_SIZE + .5, canvas.height)
      context.stroke()
    }
    for (let row = 0; row <= ROWS; row += 1) {
      context.beginPath()
      context.moveTo(0, row * CELL_SIZE + .5)
      context.lineTo(canvas.width, row * CELL_SIZE + .5)
      context.stroke()
    }

    previewContext.clearRect(0, 0, preview.width, preview.height)
    const nextPiece = PIECES[game.next]
    const previewCell = 22
    const offsetX = (preview.width - nextPiece.shape[0].length * previewCell) / 2
    const offsetY = (preview.height - nextPiece.shape.length * previewCell) / 2
    previewContext.fillStyle = nextPiece.color
    nextPiece.shape.forEach((row, rowIndex) => row.forEach((cell, columnIndex) => {
      if (cell) previewContext.fillRect(offsetX + columnIndex * previewCell + 1, offsetY + rowIndex * previewCell + 1, previewCell - 2, previewCell - 2)
    }))
  }, [collides])

  const spawnPiece = useCallback((game: Engine) => {
    const type = game.next
    const definition = PIECES[type]
    game.current = {
      type,
      color: definition.color,
      shape: definition.shape.map((row) => [...row]),
      x: Math.floor((COLUMNS - definition.shape[0].length) / 2),
      y: 0,
    }
    game.next = takeType(game)
    if (collides(game, game.current.shape, game.current.x, game.current.y)) setStatus('gameover')
  }, [collides, takeType])

  const lockPiece = useCallback((game: Engine) => {
    game.current.shape.forEach((row, rowIndex) => row.forEach((cell, columnIndex) => {
      if (cell && game.current.y + rowIndex >= 0) {
        game.board[game.current.y + rowIndex][game.current.x + columnIndex] = game.current.color
      }
    }))

    let cleared = 0
    for (let row = ROWS - 1; row >= 0; row -= 1) {
      if (game.board[row].every(Boolean)) {
        game.board.splice(row, 1)
        game.board.unshift(Array<string | null>(COLUMNS).fill(null))
        cleared += 1
        row += 1
      }
    }
    if (cleared) {
      game.score += [0, 100, 300, 500, 800][cleared] * game.level
      game.lines += cleared
      game.level = Math.floor(game.lines / 10) + 1
    }

    setScore(game.score)
    setLines(game.lines)
    setLevel(game.level)
    spawnPiece(game)
  }, [spawnPiece])

  const movePiece = useCallback((offsetX: number, offsetY: number) => {
    const game = engine.current
    if (!game) return false
    if (collides(game, game.current.shape, game.current.x + offsetX, game.current.y + offsetY)) {
      if (offsetY > 0) lockPiece(game)
      return false
    }
    game.current.x += offsetX
    game.current.y += offsetY
    return true
  }, [collides, lockPiece])

  const performAction = useCallback((action: Action) => {
    if (status !== 'running' || !engine.current) return
    const game = engine.current
    if (action === 'left') movePiece(-1, 0)
    if (action === 'right') movePiece(1, 0)
    if (action === 'down' && movePiece(0, 1)) {
      game.score += 1
      setScore(game.score)
    }
    if (action === 'rotate') {
      const rotated = game.current.shape[0].map((_, column) => game.current.shape.map((row) => row[column]).reverse())
      for (const offset of [0, -1, 1, -2, 2]) {
        if (!collides(game, rotated, game.current.x + offset, game.current.y)) {
          game.current.shape = rotated
          game.current.x += offset
          break
        }
      }
    }
    if (action === 'drop') {
      let distance = 0
      while (!collides(game, game.current.shape, game.current.x, game.current.y + 1)) {
        game.current.y += 1
        distance += 1
      }
      game.score += distance * 2
      setScore(game.score)
      lockPiece(game)
    }
    draw()
  }, [collides, draw, lockPiece, movePiece, status])

  function resetGame(start = true) {
    const bag = shuffledBag()
    const firstType = bag.pop() ?? 'T'
    const nextType = bag.pop() ?? 'I'
    const definition = PIECES[firstType]
    engine.current = {
      board: makeBoard(),
      current: {
        type: firstType,
        color: definition.color,
        shape: definition.shape.map((row) => [...row]),
        x: Math.floor((COLUMNS - definition.shape[0].length) / 2),
        y: 0,
      },
      next: nextType,
      bag,
      score: 0,
      lines: 0,
      level: 1,
    }
    setScore(0)
    setLines(0)
    setLevel(1)
    setStatus(start ? 'running' : 'ready')
    draw()
  }

  function togglePause() {
    setStatus((current) => current === 'running' ? 'paused' : current === 'paused' ? 'running' : current)
  }

  useEffect(() => {
    draw()
  }, [draw])

  useEffect(() => {
    if (status !== 'running') {
      draw()
      return
    }

    let frame = 0
    let previousTime = 0
    let elapsed = 0

    function update(time: number) {
      const game = engine.current
      if (!game) return
      if (!previousTime) previousTime = time
      elapsed += time - previousTime
      previousTime = time

      const interval = Math.max(100, BASE_DROP_INTERVAL - (game.level - 1) * 65)
      while (elapsed >= interval) {
        elapsed -= interval
        movePiece(0, 1)
      }
      draw()
      if (status === 'running') frame = requestAnimationFrame(update)
    }

    frame = requestAnimationFrame(update)
    return () => cancelAnimationFrame(frame)
  }, [draw, movePiece, status])

  useEffect(() => {
    if (status !== 'running') return

    function onKeyDown(event: KeyboardEvent) {
      if (event.target instanceof HTMLElement && event.target.closest('button, input, textarea, select, [contenteditable="true"]')) return
      const actions: Record<string, Action> = {
        ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'rotate', ArrowDown: 'down', ' ': 'drop',
      }
      if (event.key.toLowerCase() === 'p' || event.key === 'Escape') {
        event.preventDefault()
        togglePause()
        return
      }
      const action = actions[event.key]
      if (!action) return
      event.preventDefault()
      performAction(action)
    }

    function onVisibilityChange() {
      if (document.hidden) setStatus('paused')
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [performAction, status])

  const overlayTitle = status === 'paused' ? 'PAUSA' : status === 'gameover' ? 'FIN DEL JUEGO' : 'TETRIS'
  const overlayMessage = status === 'paused'
    ? 'La partida está en pausa'
    : status === 'gameover'
      ? `Puntuación final: ${score}`
      : 'Pulsa comenzar para jugar'

  return (
    <div className="tetris-game">
      <div className="tetris-game__top">
        <div className="tetris-game__next">
          <span>Siguiente</span>
          <canvas ref={nextCanvas} width="120" height="96" aria-label="Vista previa de la siguiente pieza" />
        </div>
        <div className="tetris-game__stats" aria-label="Estadísticas de la partida">
          <div><span>Puntos</span><strong>{score}</strong></div>
          <div><span>Líneas</span><strong>{lines}</strong></div>
          <div><span>Nivel</span><strong>{level}</strong></div>
        </div>
      </div>

      <div className="tetris-game__board">
        <canvas ref={boardCanvas} width={COLUMNS * CELL_SIZE} height={ROWS * CELL_SIZE} aria-label="Tablero de Tetris de 10 columnas y 20 filas" />
        {status !== 'running' && (
          <div className="tetris-game__overlay" role="status">
            <h3>{overlayTitle}</h3>
            <p>{overlayMessage}</p>
            <button className="tetris-game__primary" onClick={() => status === 'gameover' ? resetGame() : setStatus('running')} type="button">
              {status === 'paused' ? 'Continuar' : status === 'gameover' ? 'Jugar de nuevo' : 'Comenzar'}
            </button>
          </div>
        )}
      </div>

      <div className="tetris-game__controls">
        <div className="tetris-game__dpad" aria-label="Controles de movimiento">
          {ACTIONS.map(({ action, label, text }) => (
            <button aria-label={label} key={action} onClick={() => performAction(action)} type="button">{text}</button>
          ))}
        </div>
        <div className="tetris-game__buttons">
          <button onClick={togglePause} type="button" disabled={status === 'ready' || status === 'gameover'}>
            {status === 'paused' ? 'Continuar' : 'Pausar'}
          </button>
          <button onClick={() => resetGame()} type="button">Reiniciar</button>
        </div>
      </div>
      <p className="tetris-game__hint"><kbd>←</kbd> <kbd>→</kbd> mover · <kbd>↑</kbd> rotar · <kbd>↓</kbd> bajar · <kbd>Espacio</kbd> caída rápida · <kbd>P</kbd> pausa</p>
    </div>
  )
}

export default TetrisGame