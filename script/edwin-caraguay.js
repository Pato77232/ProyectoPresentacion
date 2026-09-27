// =========================================================
// Edwin Caraguay — mini-juego: ajedrez básico
//
// Alcance actual (a propósito, para mantenerlo simple):
//   - Movimiento legal por tipo de pieza (peón, torre, caballo,
//     alfil, reina, rey), respetando bloqueos y capturas.
//   - Turnos alternos blancas/negras.
//   - La partida termina cuando se captura un rey.
// Pendiente para una siguiente vuelta (no implementado aún):
//   - Jaque / jaque mate (no se impide mover "hacia el jaque").
//   - Enroque, captura al paso, coronación de peón.
//   - Un segundo minijuego en pestañas junto a este.
// =========================================================

document.addEventListener('DOMContentLoaded', initChess);

const BOARD_SIZE = 8;

const PIECE_SYMBOLS = {
  wK: '♔', wQ: '♕', wR: '♖', wB: '♗', wN: '♘', wP: '♙',
  bK: '♚', bQ: '♛', bR: '♜', bB: '♝', bN: '♞', bP: '♟',
};

function initialBoard() {
  return [
    ['bR', 'bN', 'bB', 'bQ', 'bK', 'bB', 'bN', 'bR'],
    ['bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP'],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ['wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP'],
    ['wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR'],
  ];
}

function initChess() {
  const boardEl = document.getElementById('chessBoard');
  const statusEl = document.getElementById('gameStatus');
  const resetButton = document.getElementById('resetButton');
  if (!boardEl || !statusEl || !resetButton) return;

  let board = initialBoard();
  let turn = 'w'; // 'w' | 'b'
  let selected = null; // { row, col } | null
  let legalTargets = []; // [{row, col, capture}]
  let lastMove = null; // {fromRow, fromCol, toRow, toCol} for UI highlight
  let gameOver = false;

  buildSquares();
  render();

  resetButton.addEventListener('click', () => {
    board = initialBoard();
    turn = 'w';
    selected = null;
    legalTargets = [];
    gameOver = false;
    render();
  });

  function buildSquares() {
    boardEl.innerHTML = '';
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const square = document.createElement('div');
        square.className = 'square ' + ((row + col) % 2 === 0 ? 'square--light' : 'square--dark');
        square.dataset.row = row;
        square.dataset.col = col;
        square.addEventListener('click', () => onSquareClick(row, col));
        boardEl.appendChild(square);
      }
    }
  }

  function onSquareClick(row, col) {
    if (gameOver) return;

    const piece = board[row][col];
    const target = legalTargets.find((m) => m.row === row && m.col === col);

    if (target) {
      movePiece(selected.row, selected.col, row, col);
      selected = null;
      legalTargets = [];
      render();
      return;
    }

    if (piece && piece[0] === turn) {
      selected = { row, col };
      legalTargets = getLegalMoves(piece, row, col, board);
    } else {
      selected = null;
      legalTargets = [];
    }
    render();
  }

  function movePiece(fromRow, fromCol, toRow, toCol) {
    const piece = board[fromRow][fromCol];
    const captured = board[toRow][toCol];

    board[toRow][toCol] = piece;
    board[fromRow][fromCol] = null;

    // Registrar último movimiento (para resaltado visual)
    lastMove = { fromRow, fromCol, toRow, toCol };

    // Coronación simple: si un peón llega a la última fila, se convierte en reina
    if (piece && piece[1] === 'P' && (toRow === 0 || toRow === BOARD_SIZE - 1)) {
      board[toRow][toCol] = piece[0] + 'Q';
    }

    if (captured && captured[1] === 'K') {
      gameOver = true;
      const winner = turn === 'w' ? 'Blancas' : 'Negras';
      statusEl.textContent = `¡${winner} ganan! (rey capturado)`;
      return;
    }

    turn = turn === 'w' ? 'b' : 'w';
    statusEl.textContent = turn === 'w' ? 'Turno: blancas' : 'Turno: negras';
  }

  function render() {
    const squares = boardEl.children;
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const square = squares[row * BOARD_SIZE + col];
        const piece = board[row][col];

        square.textContent = piece ? PIECE_SYMBOLS[piece] : '';
        square.classList.toggle('square--white-piece', !!piece && piece[0] === 'w');
        square.classList.toggle('square--black-piece', !!piece && piece[0] === 'b');

        const isSelected = selected && selected.row === row && selected.col === col;
        square.classList.toggle('square--selected', !!isSelected);

        const legal = legalTargets.find((m) => m.row === row && m.col === col);
        square.classList.toggle('square--legal', !!legal);
        square.classList.toggle('square--capture', !!(legal && legal.capture));
        const isLast = lastMove && ((lastMove.fromRow === row && lastMove.fromCol === col) || (lastMove.toRow === row && lastMove.toCol === col));
        square.classList.toggle('square--last', !!isLast);
      }
    }

    if (!gameOver) {
      statusEl.textContent = turn === 'w' ? 'Turno: blancas' : 'Turno: negras';
    }
  }
}

/**
 * Devuelve la lista de movimientos legales (básicos) para una pieza dada.
 * No evalúa si el movimiento deja al propio rey en jaque (fuera de alcance
 * de esta primera versión).
 */
function getLegalMoves(piece, row, col, board) {
  const color = piece[0];
  const type = piece[1];

  switch (type) {
    case 'P': return pawnMoves(color, row, col, board);
    case 'N': return knightMoves(color, row, col, board);
    case 'B': return slidingMoves(color, row, col, board, [[-1, -1], [-1, 1], [1, -1], [1, 1]]);
    case 'R': return slidingMoves(color, row, col, board, [[-1, 0], [1, 0], [0, -1], [0, 1]]);
    case 'Q': return slidingMoves(color, row, col, board, [
      [-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1],
    ]);
    case 'K': return kingMoves(color, row, col, board);
    default: return [];
  }
}

function inBounds(row, col) {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

function pawnMoves(color, row, col, board) {
  const moves = [];
  const dir = color === 'w' ? -1 : 1;
  const startRow = color === 'w' ? 6 : 1;

  const oneStep = row + dir;
  if (inBounds(oneStep, col) && !board[oneStep][col]) {
    moves.push({ row: oneStep, col, capture: false });

    const twoStep = row + dir * 2;
    if (row === startRow && !board[twoStep][col]) {
      moves.push({ row: twoStep, col, capture: false });
    }
  }

  for (const dc of [-1, 1]) {
    const r = row + dir;
    const c = col + dc;
    if (inBounds(r, c) && board[r][c] && board[r][c][0] !== color) {
      moves.push({ row: r, col: c, capture: true });
    }
  }

  return moves;
}

function knightMoves(color, row, col, board) {
  const deltas = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1],
  ];
  const moves = [];
  for (const [dr, dc] of deltas) {
    const r = row + dr;
    const c = col + dc;
    if (!inBounds(r, c)) continue;
    const occupant = board[r][c];
    if (!occupant) {
      moves.push({ row: r, col: c, capture: false });
    } else if (occupant[0] !== color) {
      moves.push({ row: r, col: c, capture: true });
    }
  }
  return moves;
}

function kingMoves(color, row, col, board) {
  const deltas = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1], [0, 1],
    [1, -1], [1, 0], [1, 1],
  ];
  const moves = [];
  for (const [dr, dc] of deltas) {
    const r = row + dr;
    const c = col + dc;
    if (!inBounds(r, c)) continue;
    const occupant = board[r][c];
    if (!occupant) {
      moves.push({ row: r, col: c, capture: false });
    } else if (occupant[0] !== color) {
      moves.push({ row: r, col: c, capture: true });
    }
  }
  return moves;
}

function slidingMoves(color, row, col, board, directions) {
  const moves = [];
  for (const [dr, dc] of directions) {
    let r = row + dr;
    let c = col + dc;
    while (inBounds(r, c)) {
      const occupant = board[r][c];
      if (!occupant) {
        moves.push({ row: r, col: c, capture: false });
      } else {
        if (occupant[0] !== color) {
          moves.push({ row: r, col: c, capture: true });
        }
        break;
      }
      r += dr;
      c += dc;
    }
  }
  return moves;
}

// ---------------------------------------------------------
// Reveal helper: añade la clase `visible` a los elementos
// con la clase `reveal` al cargar la página para que sean
// visibles (algunos elementos usan la clase 'reveal' por CSS).
// ---------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  const reveals = Array.from(document.querySelectorAll('.reveal'));
  reveals.forEach((el, idx) => {
    setTimeout(() => el.classList.add('visible'), 60 + idx * 80);
  });
});
