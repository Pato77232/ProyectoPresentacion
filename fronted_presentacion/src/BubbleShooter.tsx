import { useEffect, useRef, useState } from 'react'
import austinImage from '../../images/Austin.png'
import pabloImage from '../../images/pablo.png'
import tashaImage from '../../images/tasha.png'
import tyroneImage from '../../images/Tyrone.jpg'
import uniquaImage from '../../images/Uniqua.png'

const WIDTH = 400
const HEIGHT = 480
const RADIUS = 18
const characters = {
  yellow: { name: 'Tasha', color: '#ffdf00', stroke: '#c3a900', image: tashaImage },
  blue: { name: 'Pablo', color: '#2196f3', stroke: '#1976d2', image: pabloImage },
  purple: { name: 'Austin', color: '#9c27b0', stroke: '#7b1fa2', image: austinImage },
  orange: { name: 'Tyrone', color: '#ff9800', stroke: '#f57c00', image: tyroneImage },
  pink: { name: 'Uniqua', color: '#e91e63', stroke: '#c2185b', image: uniquaImage },
} as const

type ColorKey = keyof typeof characters
type Bubble = { x: number; y: number; key: ColorKey }
type Particle = { x: number; y: number; vx: number; vy: number; radius: number; color: string; alpha: number }
type Game = {
  grid: (Bubble | null)[][]
  bullet: (Bubble & { vx: number; vy: number }) | null
  active: ColorKey
  mouseX: number
  mouseY: number
  particles: Particle[]
  won: boolean
}

function cellPosition(row: number, column: number) {
  return {
    x: column * RADIUS * 2 + RADIUS + (row % 2 === 1 ? RADIUS : 0),
    y: row * RADIUS * 1.73 + RADIUS + 10,
  }
}

function createGame(): Game {
  const keys = Object.keys(characters) as ColorKey[]
  const grid: (Bubble | null)[][] = Array.from({ length: 8 }, (_, row) =>
    Array.from({ length: 10 }, (_, column) => {
      const position = cellPosition(row, column)
      if (row >= 3 || position.x + RADIUS > WIDTH + 5) return null
      return { ...position, key: keys[Math.floor(Math.random() * keys.length)] }
    }),
  )
  const existing = grid.flatMap((row) => row.flatMap((bubble) => bubble ? [bubble.key] : []))
  return {
    grid,
    bullet: null,
    active: existing[Math.floor(Math.random() * existing.length)] ?? 'yellow',
    mouseX: WIDTH / 2,
    mouseY: 0,
    particles: [],
    won: false,
  }
}

function BubbleShooter() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameRef = useRef<Game | null>(null)
  const [score, setScore] = useState(0)
  const [activeKey, setActiveKey] = useState<ColorKey>('yellow')
  const [won, setWon] = useState(false)
  const [round, setRound] = useState(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    const game = createGame()
    gameRef.current = game
    setActiveKey(game.active)

    const drawBubble = (bubble: Bubble, radius = RADIUS) => {
      const character = characters[bubble.key]
      context.beginPath()
      context.arc(bubble.x, bubble.y, radius, 0, Math.PI * 2)
      context.fillStyle = character.color
      context.fill()
      context.lineWidth = 2
      context.strokeStyle = character.stroke
      context.stroke()
      context.beginPath()
      context.arc(bubble.x - radius / 3, bubble.y - radius / 3, radius / 3.5, 0, Math.PI * 2)
      context.fillStyle = 'rgba(255, 255, 255, .58)'
      context.fill()
    }

    const attachBullet = () => {
      if (game.bullet || game.won) return
      const shooterY = HEIGHT - 35
      const angle = Math.atan2(game.mouseY - shooterY, game.mouseX - WIDTH / 2)
      if (angle >= -0.15 || angle <= -Math.PI + 0.15) return
      game.bullet = {
        x: WIDTH / 2,
        y: shooterY,
        key: game.active,
        vx: Math.cos(angle) * 9,
        vy: Math.sin(angle) * 9,
      }
    }

    const updatePointer = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect()
      game.mouseX = (event.clientX - bounds.left) * (WIDTH / bounds.width)
      game.mouseY = (event.clientY - bounds.top) * (HEIGHT / bounds.height)
    }

    const onPointerDown = (event: PointerEvent) => {
      updatePointer(event)
      attachBullet()
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault()
        attachBullet()
      }
    }

    const snapBullet = () => {
      const bullet = game.bullet
      if (!bullet) return
      let target: { row: number; column: number; x: number; y: number } | null = null
      let closest = Infinity
      game.grid.forEach((row, rowIndex) => row.forEach((bubble, columnIndex) => {
        if (bubble) return
        const position = cellPosition(rowIndex, columnIndex)
        if (position.x + RADIUS > WIDTH + 5) return
        const distance = Math.hypot(bullet.x - position.x, bullet.y - position.y)
        if (distance < closest) {
          closest = distance
          target = { row: rowIndex, column: columnIndex, ...position }
        }
      }))
      if (!target) {
        game.bullet = null
        return
      }

      const { row, column, x, y } = target
      game.grid[row][column] = { x, y, key: bullet.key }
      const queue: { row: number; column: number }[] = [{ row, column }]
      const visited = new Set([`${row}:${column}`])
      const matches: { row: number; column: number }[] = []
      while (queue.length) {
        const current = queue.shift()!
        matches.push(current)
        const diagonal = current.row % 2 === 1 ? 1 : -1
        const neighbors = [
          [current.row, current.column - 1], [current.row, current.column + 1],
          [current.row - 1, current.column], [current.row + 1, current.column],
          [current.row - 1, current.column + diagonal], [current.row + 1, current.column + diagonal],
        ]
        neighbors.forEach(([nextRow, nextColumn]) => {
          const id = `${nextRow}:${nextColumn}`
          const neighbor = game.grid[nextRow]?.[nextColumn]
          if (neighbor?.key === bullet.key && !visited.has(id)) {
            visited.add(id)
            queue.push({ row: nextRow, column: nextColumn })
          }
        })
      }

      if (matches.length >= 3) {
        matches.forEach(({ row: matchRow, column: matchColumn }) => {
          const bubble = game.grid[matchRow][matchColumn]
          if (!bubble) return
          for (let index = 0; index < 8; index += 1) {
            const angle = Math.random() * Math.PI * 2
            const speed = Math.random() * 4 + 1
            game.particles.push({ x: bubble.x, y: bubble.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, radius: Math.random() * 4 + 2, color: characters[bubble.key].color, alpha: 1 })
          }
          game.grid[matchRow][matchColumn] = null
        })
        setScore((current) => current + matches.length * 15)
      }

      game.bullet = null
      const remaining = game.grid.flatMap((gridRow) => gridRow.flatMap((bubble) => bubble ? [bubble.key] : []))
      if (remaining.length === 0) {
        game.won = true
        setWon(true)
      } else {
        game.active = remaining[Math.floor(Math.random() * remaining.length)]
        setActiveKey(game.active)
      }
    }

    const draw = () => {
      context.clearRect(0, 0, WIDTH, HEIGHT)
      game.grid.forEach((row) => row.forEach((bubble) => bubble && drawBubble(bubble)))

      if (game.bullet) {
        drawBubble(game.bullet)
        game.bullet.x += game.bullet.vx
        game.bullet.y += game.bullet.vy
        if (game.bullet.x - RADIUS <= 2 || game.bullet.x + RADIUS >= WIDTH - 2) game.bullet.vx *= -1
        const collision = game.bullet.y - RADIUS <= 10 || game.grid.some((row) => row.some((bubble) => bubble && Math.hypot(game.bullet!.x - bubble.x, game.bullet!.y - bubble.y) < RADIUS * 1.75))
        if (collision) snapBullet()
      } else if (!game.won) {
        drawBubble({ x: WIDTH / 2, y: HEIGHT - 35, key: game.active }, RADIUS + 2)
        const angle = Math.atan2(game.mouseY - (HEIGHT - 35), game.mouseX - WIDTH / 2)
        if (angle < -0.15 && angle > -Math.PI + 0.15) {
          context.setLineDash([5, 8])
          context.beginPath()
          context.moveTo(WIDTH / 2, HEIGHT - 35)
          context.lineTo(WIDTH / 2 + Math.cos(angle) * 250, HEIGHT - 35 + Math.sin(angle) * 250)
          context.strokeStyle = characters[game.active].color
          context.lineWidth = 2
          context.stroke()
          context.setLineDash([])
        }
      }

      game.particles = game.particles.filter((particle) => particle.alpha > 0.05 && particle.radius > 0.5)
      game.particles.forEach((particle) => {
        particle.x += particle.vx
        particle.y += particle.vy
        particle.alpha *= 0.92
        particle.radius *= 0.96
        context.globalAlpha = particle.alpha
        context.beginPath()
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        context.fillStyle = particle.color
        context.fill()
      })
      context.globalAlpha = 1

      if (game.won) {
        context.fillStyle = 'rgba(255, 246, 221, .94)'
        context.fillRect(0, 0, WIDTH, HEIGHT)
        context.textAlign = 'center'
        context.fillStyle = '#d62828'
        context.font = '700 28px Fredoka, sans-serif'
        context.fillText('¡Lo lograste!', WIDTH / 2, HEIGHT / 2 - 10)
      }
      frame = requestAnimationFrame(draw)
    }

    let frame = requestAnimationFrame(draw)
    canvas.addEventListener('pointermove', updatePointer)
    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('keydown', onKeyDown)
    return () => {
      cancelAnimationFrame(frame)
      canvas.removeEventListener('pointermove', updatePointer)
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('keydown', onKeyDown)
    }
  }, [round])

  const reset = () => {
    const game = createGame()
    gameRef.current = game
    setActiveKey(game.active)
    setScore(0)
    setWon(false)
    setRound((current) => current + 1)
  }

  const character = characters[activeKey]

  return (
    <section className="shirley-game" id="shirley-game" aria-labelledby="shirley-game-title">
      <header className="shirley-section-heading">
        <p className="shirley-kicker">Minijuego</p>
        <h2 id="shirley-game-title">Backyardigans Bubble Shooter</h2>
        <p>Apunta y dispara. Junta tres o más burbujas del mismo color para despejar el tablero.</p>
      </header>
      <div className="shirley-game__panel">
        <div className="shirley-game__toolbar">
          <p className="shirley-game__score" aria-live="polite">Puntos: <strong>{score}</strong>{won && <span> · ¡Victoria!</span>}</p>
          <button type="button" className="shirley-game__reset" onClick={reset}>Reiniciar juego</button>
        </div>
        <div className="shirley-game__layout">
          <canvas ref={canvasRef} className="shirley-game__canvas" width={WIDTH} height={HEIGHT} tabIndex={0} aria-label="Bubble Shooter. Mueve el puntero para apuntar; haz clic, pulsa espacio o Enter para disparar." />
          <aside className="shirley-active-character" aria-live="polite">
            <h3>Personaje activo</h3>
            <img src={character.image} alt={character.name} />
            <p>{character.name}</p>
          </aside>
        </div>
      </div>
    </section>
  )
}

export default BubbleShooter