import { useEffect, useMemo, useState } from 'react'
import './LeslieFair.css'

type GameId = 'targets' | 'balloons' | 'memory' | 'whack' | 'racing'
type GameDefinition = { id: GameId; title: string; icon: string; description: string; duration: number }
type MemoryCard = { id: number; icon: string; open: boolean; matched: boolean }
type Target = { id: number; left: number; top: number }
type Balloon = { id: number; left: number; bottom: number; icon: string }
type Mole = { id: number; icon: string; active: boolean }
type Obstacle = { id: number; lane: number; top: number; icon: string }

const games: GameDefinition[] = [
  { id: 'targets', title: 'Tiro al blanco', icon: '🎯', description: 'Acierta las dianas antes de que desaparezcan.', duration: 30 },
  { id: 'balloons', title: 'Revienta globos', icon: '🎈', description: 'Haz clic en los globos mientras suben.', duration: 30 },
  { id: 'memory', title: 'Memoria', icon: '🧠', description: 'Encuentra todos los pares ocultos.', duration: 45 },
  { id: 'whack', title: 'Atrapa al personaje', icon: '🐹', description: 'Atrapa a los personajes que aparecen.', duration: 30 },
  { id: 'racing', title: 'Mini carrera', icon: '🏎️', description: 'Esquiva obstáculos y suma distancia.', duration: 30 },
]

const memoryIcons = ['🌸', '🐧', '🦌', '🦛']
const moleIcons = ['🌸', '🐧', '🦌', '🦛', '🦘', '⭐']
const balloonIcons = ['🎈', '💖', '⭐']

function randomNumber(max: number) {
  return Math.floor(Math.random() * max)
}

function createMemoryCards() {
  return [...memoryIcons, ...memoryIcons]
    .sort(() => Math.random() - 0.5)
    .map((icon, id) => ({ id, icon, open: false, matched: false }))
}

function createTarget(): Target {
  return { id: Date.now() + randomNumber(1000), left: 10 + randomNumber(80), top: 12 + randomNumber(70) }
}

function createTargets() {
  return Array.from({ length: 2 }, () => createTarget())
}

function createBalloon(): Balloon {
  return { id: Date.now() + randomNumber(1000), left: 10 + randomNumber(80), bottom: 0, icon: balloonIcons[randomNumber(balloonIcons.length)] }
}

function createObstacle(): Obstacle {
  return { id: Date.now() + randomNumber(1000), lane: randomNumber(3), top: 0, icon: randomNumber(2) ? '🚧' : '🍌' }
}

function LeslieFair() {
  const [selectedGame, setSelectedGame] = useState<GameId | null>(null)
  const [finished, setFinished] = useState(false)
  const [score, setScore] = useState(0)
  const [tickets, setTickets] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [message, setMessage] = useState('')
  const [targets, setTargets] = useState<Target[]>([])
  const [balloons, setBalloons] = useState<Balloon[]>([])
  const [cards, setCards] = useState<MemoryCard[]>([])
  const [moles, setMoles] = useState<Mole[]>(() => moleIcons.map((icon, id) => ({ id, icon, active: false })))
  const [playerLane, setPlayerLane] = useState(1)
  const [obstacles, setObstacles] = useState<Obstacle[]>([])

  const game = games.find(({ id }) => id === selectedGame)
  const currentScore = score
  const cardBusy = useMemo(() => cards.filter((card) => card.open && !card.matched).length >= 2, [cards])

  function finishGame() {
    if (!selectedGame) return
    setFinished(true)
    const earnedTickets = Math.floor(currentScore / 10)
    setTickets((current) => current + earnedTickets)
    setMessage(`Tiempo terminado. Ganaste ${earnedTickets} tickets.`)
    void fetch('/api/members/leslie/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ game: selectedGame, score: currentScore, tickets: earnedTickets }),
    })
  }

  useEffect(() => {
    if (!selectedGame) return
    window.setTimeout(() => {
      setTimeLeft(game?.duration ?? 30)
      setFinished(false)
      setMessage('')
      setScore(0)
      setTargets(selectedGame === 'targets' ? createTargets() : [])
      setBalloons([])
      setCards(selectedGame === 'memory' ? createMemoryCards() : [])
      setMoles(moleIcons.map((icon, id) => ({ id, icon, active: false })))
      setPlayerLane(1)
      setObstacles([])
    })
  }, [selectedGame, game?.duration])

  useEffect(() => {
    if (!selectedGame || timeLeft <= 0) return
    const timer = window.setInterval(() => setTimeLeft((current) => current - 1), 1000)
    return () => window.clearInterval(timer)
  }, [selectedGame, timeLeft])

  useEffect(() => {
    if (!selectedGame || timeLeft !== 0 || finished) return
    // The timer ending is an external event that finalizes the current round.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    finishGame()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGame, timeLeft, finished])

  useEffect(() => {
    if (selectedGame !== 'targets' || timeLeft <= 0) return
    const timer = window.setInterval(() => {
      setTargets((current) => [...current.filter((target) => target.id > Date.now() - 1300), createTarget()])
    }, 900)
    return () => window.clearInterval(timer)
  }, [selectedGame, timeLeft])

  useEffect(() => {
    if (selectedGame !== 'balloons' || timeLeft <= 0) return
    const timer = window.setInterval(() => {
      setBalloons((current) => current.map((balloon) => ({ ...balloon, bottom: balloon.bottom + 3 })).filter((balloon) => balloon.bottom < 100).concat(createBalloon()))
    }, 600)
    return () => window.clearInterval(timer)
  }, [selectedGame, timeLeft])

  useEffect(() => {
    if (selectedGame !== 'whack' || timeLeft <= 0) return
    const timer = window.setInterval(() => {
      const activeId = randomNumber(moles.length)
      setMoles((current) => current.map((mole) => ({ ...mole, active: mole.id === activeId })))
    }, 900)
    return () => window.clearInterval(timer)
  }, [selectedGame, timeLeft, moles.length])

  useEffect(() => {
    if (selectedGame !== 'racing' || timeLeft <= 0) return
    const timer = window.setInterval(() => {
      setObstacles((current) => current.map((obstacle) => ({ ...obstacle, top: obstacle.top + 8 })).filter((obstacle) => obstacle.top < 100).concat(createObstacle()))
      setScore((current) => current + 5)
    }, 500)
    return () => window.clearInterval(timer)
  }, [selectedGame, timeLeft])

  useEffect(() => {
    if (selectedGame !== 'racing') return
    const collision = obstacles.find((obstacle) => obstacle.lane === playerLane && obstacle.top > 75)
    if (collision) {
      // Collision resolution is synchronized from the animation state.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setScore((current) => Math.max(0, current - 10))
      setObstacles((current) => current.filter((obstacle) => obstacle.id !== collision.id))
    }
  }, [obstacles, playerLane, selectedGame])

  useEffect(() => {
    if (cards.filter((card) => card.matched).length !== cards.length || cards.length === 0) return
    // Completing the board ends the active round.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setScore((current) => current + 50)
    setTimeLeft(0)
  }, [cards])

  useEffect(() => {
    if (selectedGame !== 'racing') return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') setPlayerLane((lane) => Math.max(0, lane - 1))
      if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') setPlayerLane((lane) => Math.min(2, lane + 1))
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedGame])

  function chooseGame(id: GameId) {
    setSelectedGame(id)
    setMessage('')
  }

  function closeGame() {
    setSelectedGame(null)
    setFinished(false)
    setTimeLeft(0)
    setMessage('')
  }

  function clickCard(id: number) {
    if (cardBusy) return
    setCards((current) => current.map((card) => card.id === id ? { ...card, open: true } : card))
    const openCards = cards.filter((card) => card.open && !card.matched)
    if (openCards.length !== 1) return
    const first = openCards[0]
    const second = cards.find((card) => card.id === id)
    if (!second) return
    if (first.icon === second.icon) {
      setScore((current) => current + 30)
      setCards((current) => current.map((card) => card.icon === first.icon ? { ...card, matched: true } : card))
    } else {
      window.setTimeout(() => setCards((current) => current.map((card) => card.id === first.id || card.id === second.id ? { ...card, open: false } : card)), 650)
    }
  }

  return (
    <section className="leslie-fair" id="leslie-game" aria-labelledby="leslie-game-title">
      <header className="leslie-section-heading">
        <p className="leslie-kicker">Feria de juegos</p>
        <h2 id="leslie-game-title">Juega, suma puntos y gana tickets</h2>
        <p>La feria ahora vive dentro de React. Tus resultados se registran en el API de Node.js.</p>
      </header>

      <div className="leslie-fair__wallet" aria-live="polite">🎟️ Tickets acumulados: <strong>{tickets}</strong></div>

      {!selectedGame ? (
        <div className="leslie-fair__games">
          {games.map((item) => (
            <article className="leslie-fair__card" key={item.id}>
              <span className="leslie-fair__icon" aria-hidden="true">{item.icon}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <button type="button" onClick={() => chooseGame(item.id)}>Jugar</button>
            </article>
          ))}
        </div>
      ) : (
        <div className="leslie-fair__active">
          <header className="leslie-fair__hud">
            <strong>{game?.icon} {game?.title}</strong>
            <span>Tiempo: {timeLeft}s</span>
            <span>Puntos: {score}</span>
            <button type="button" onClick={closeGame}>Volver a la feria</button>
          </header>

          {selectedGame === 'targets' && <div className="leslie-fair__arena">{targets.map((target) => <button className="fair-target" style={{ left: `${target.left}%`, top: `${target.top}%` }} key={target.id} type="button" aria-label="Diana" onClick={() => { setScore((current) => current + 20); setTargets((current) => current.filter((item) => item.id !== target.id)) }}>🎯</button>)}</div>}
          {selectedGame === 'balloons' && <div className="leslie-fair__arena">{balloons.map((balloon) => <button className="fair-balloon" style={{ left: `${balloon.left}%`, bottom: `${balloon.bottom}%` }} key={balloon.id} type="button" aria-label="Globo" onClick={() => { setScore((current) => current + 15); setBalloons((current) => current.filter((item) => item.id !== balloon.id)) }}>{balloon.icon}</button>)}</div>}
          {selectedGame === 'memory' && <div className="fair-memory">{cards.map((card) => <button className={`fair-memory__card${card.open || card.matched ? ' is-open' : ''}`} key={card.id} type="button" onClick={() => clickCard(card.id)}>{card.open || card.matched ? card.icon : '❓'}</button>)}</div>}
          {selectedGame === 'whack' && <div className="fair-whack">{moles.map((mole) => <button className={`fair-whack__hole${mole.active ? ' is-active' : ''}`} key={mole.id} type="button" onClick={() => { if (mole.active) { setScore((current) => current + 25); setMoles((current) => current.map((item) => item.id === mole.id ? { ...item, active: false } : item)) } }}>{mole.active ? mole.icon : '·'}</button>)}</div>}
          {selectedGame === 'racing' && <div className="fair-racing"><div className="fair-racing__track">{obstacles.map((obstacle) => <span className="fair-racing__obstacle" style={{ left: `${obstacle.lane * 33 + 17}%`, top: `${obstacle.top}%` }} key={obstacle.id}>{obstacle.icon}</span>)}<span className="fair-racing__player" style={{ left: `${playerLane * 33 + 17}%` }}>🌸</span></div><div className="fair-racing__controls"><button type="button" onClick={() => setPlayerLane((lane) => Math.max(0, lane - 1))}>←</button><span>Usa ← → o A/D</span><button type="button" onClick={() => setPlayerLane((lane) => Math.min(2, lane + 1))}>→</button></div></div>}
          {message && <p className="leslie-fair__message" role="status">{message}</p>}
        </div>
      )}
    </section>
  )
}

export default LeslieFair
