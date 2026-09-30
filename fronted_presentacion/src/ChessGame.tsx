import { useState } from 'react'
import { Chess, type Color, type Move, type PieceSymbol, type Square } from 'chess.js'
import './ChessGame.css'

const pieceGlyphs: Record<Color, Record<PieceSymbol, string>> = {
  w: { k: '♔', q: '♕', r: '♖', b: '♗', n: '♘', p: '♙' },
  b: { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' },
}

const pieceNames: Record<PieceSymbol, string> = {
  k: 'rey', q: 'dama', r: 'torre', b: 'alfil', n: 'caballo', p: 'peón',
}

const promotionPieces: PieceSymbol[] = ['q', 'r', 'b', 'n']

type PlayedMove = { from: Square; to: Square; promotion?: PieceSymbol }

function ChessGame() {
  const [playedMoves, setPlayedMoves] = useState<PlayedMove[]>([])
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null)
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null)
  const game = new Chess()
  playedMoves.forEach((move) => game.move(move))
  const board = game.board()
  const legalMoves = selectedSquare ? game.moves({ square: selectedSquare, verbose: true }) : []
  const lastMove: Move | null = game.history({ verbose: true }).at(-1) ?? null

  function playMove(from: Square, to: Square, promotion?: PieceSymbol) {
    try {
      const move = { from, to, ...(promotion ? { promotion } : {}) }
      game.move(move)
      setPlayedMoves((currentMoves) => [...currentMoves, move])
      setSelectedSquare(null)
      setPendingPromotion(null)
    } catch {
      setSelectedSquare(null)
    }
  }

  function selectSquare(square: Square) {
    if (game.isGameOver() || pendingPromotion) return

    const targetMoves = legalMoves.filter((move) => move.to === square)
    if (selectedSquare && targetMoves.length > 0) {
      if (targetMoves.some((move) => move.isPromotion())) {
        setPendingPromotion({ from: selectedSquare, to: square })
      } else {
        playMove(selectedSquare, square)
      }
      return
    }

    const piece = game.get(square)
    if (piece?.color === game.turn()) {
      setSelectedSquare(square)
    } else {
      setSelectedSquare(null)
    }
  }

  function resetGame() {
    setPlayedMoves([])
    setSelectedSquare(null)
    setPendingPromotion(null)
  }

  function getStatus() {
    if (game.isCheckmate()) return `Jaque mate. Ganan ${game.turn() === 'w' ? 'negras' : 'blancas'}.`
    if (game.isStalemate()) return 'Tablas por ahogado.'
    if (game.isInsufficientMaterial()) return 'Tablas por material insuficiente.'
    if (game.isThreefoldRepetition()) return 'Tablas por triple repetición.'
    if (game.isDrawByFiftyMoves()) return 'Tablas por la regla de los 50 movimientos.'
    if (game.isCheck()) return `Turno: ${game.turn() === 'w' ? 'blancas' : 'negras'} · Jaque`
    return `Turno: ${game.turn() === 'w' ? 'blancas' : 'negras'}`
  }

  return (
    <div className="chess-layout">
      <div className="chessgame-board" role="grid" aria-label="Tablero de ajedrez">
        {board.map((rank, row) => rank.map((piece, col) => {
          const square = (piece?.square ?? `${String.fromCharCode(97 + col)}${8 - row}`) as Square
          const destinations = legalMoves.filter((move) => move.to === square)
          const isSelected = selectedSquare === square
          const isLastMove = lastMove?.from === square || lastMove?.to === square
          const squareColor = game.squareColor(square)
          const classNames = [
            'chess-square',
            `chess-square--${squareColor}`,
            isSelected && 'chess-square--selected',
            destinations.length > 0 && 'chess-square--legal',
            destinations.some((move) => move.isCapture() || move.isEnPassant()) && 'chess-square--capture',
            isLastMove && 'chess-square--last',
          ].filter(Boolean).join(' ')

          return (
            <button
              aria-label={piece ? `${piece.color === 'w' ? 'Blancas' : 'Negras'}, ${pieceNames[piece.type]}, ${square}` : `Casilla ${square}`}
              aria-pressed={isSelected}
              className={classNames}
              key={square}
              onClick={() => selectSquare(square)}
              role="gridcell"
              type="button"
            >
              {piece && <span className={`chess-piece chess-piece--${piece.color}`}>{pieceGlyphs[piece.color][piece.type]}</span>}
            </button>
          )
        }))}
      </div>

      <aside className="chess-controls">
        <p className="chess-status" aria-live="polite">{pendingPromotion ? 'Elige la pieza para coronar' : getStatus()}</p>
        {pendingPromotion && (
          <div className="chess-promotion" role="group" aria-label="Pieza de coronación">
            {promotionPieces.map((piece) => (
              <button key={piece} onClick={() => playMove(pendingPromotion.from, pendingPromotion.to, piece)} type="button" aria-label={`Promover a ${pieceNames[piece]}`}>
                {pieceGlyphs[game.turn()][piece]}
              </button>
            ))}
          </div>
        )}
        <button className="chess-reset" onClick={resetGame} type="button">Reiniciar partida</button>
      </aside>
    </div>
  )
}

export default ChessGame