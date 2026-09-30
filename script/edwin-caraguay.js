document.addEventListener('DOMContentLoaded', initChess);

const PIECE_SYMBOLS = {
  wK: '♔', wQ: '♕', wR: '♖', wB: '♗', wN: '♘', wP: '♙',
  bK: '♚', bQ: '♛', bR: '♜', bB: '♝', bN: '♞', bP: '♟',
};

const PIECE_NAMES = {
  k: 'rey', q: 'dama', r: 'torre', b: 'alfil', n: 'caballo', p: 'peón',
};

function initChess() {
  const boardEl = document.getElementById('chessBoard');
  const statusEl = document.getElementById('gameStatus');
  const resetButton = document.getElementById('resetButton');
  const promotionPicker = document.getElementById('promotionPicker');
  if (!boardEl || !statusEl || !resetButton || !promotionPicker) return;

  if (typeof Chess !== 'function') {
    statusEl.textContent = 'No se pudo cargar el motor de ajedrez. Revisa tu conexión a internet.';
    resetButton.disabled = true;
    return;
  }

  let game = new Chess();
  let selectedSquare = null;
  let legalTargets = [];
  let lastMove = null;
  let pendingPromotion = null;

  buildSquares();
  render();

  resetButton.addEventListener('click', () => {
    game = new Chess();
    selectedSquare = null;
    legalTargets = [];
    lastMove = null;
    pendingPromotion = null;
    promotionPicker.hidden = true;
    render();
  });

  promotionPicker.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-piece]');
    if (!button || !pendingPromotion) return;
    makeMove({ ...pendingPromotion, promotion: button.dataset.piece });
  });

  function buildSquares() {
    boardEl.innerHTML = '';
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const squareName = `${String.fromCharCode(97 + col)}${8 - row}`;
        const square = document.createElement('div');
        square.className = 'square ' + ((row + col) % 2 === 0 ? 'square--light' : 'square--dark');
        square.dataset.square = squareName;
        square.setAttribute('role', 'gridcell');
        square.addEventListener('click', () => onSquareClick(squareName));
        boardEl.appendChild(square);
      }
    }
  }

  function onSquareClick(squareName) {
    if (game.game_over() || pendingPromotion) return;

    const targetMoves = legalTargets.filter((move) => move.to === squareName);
    if (targetMoves.length > 0) {
      if (targetMoves.some((move) => move.promotion)) {
        pendingPromotion = { from: selectedSquare, to: squareName };
        promotionPicker.hidden = false;
        statusEl.textContent = 'Elige la pieza para coronar';
        return;
      }
      makeMove({ from: selectedSquare, to: squareName });
      return;
    }

    const piece = game.get(squareName);
    if (piece && piece.color === game.turn()) {
      selectedSquare = squareName;
      legalTargets = game.moves({ square: squareName, verbose: true });
    } else {
      selectedSquare = null;
      legalTargets = [];
    }
    render();
  }

  function makeMove(move) {
    const playedMove = game.move(move);
    if (!playedMove) return;

    lastMove = { from: playedMove.from, to: playedMove.to };
    selectedSquare = null;
    legalTargets = [];
    pendingPromotion = null;
    promotionPicker.hidden = true;
    render();
  }

  function render() {
    const squares = boardEl.children;

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const squareName = `${String.fromCharCode(97 + col)}${8 - row}`;
        const square = squares[row * 8 + col];
        const piece = game.get(squareName);
        const isSelected = squareName === selectedSquare;
        const matchingTargets = legalTargets.filter((move) => move.to === squareName);
        const isLastMove = lastMove && (lastMove.from === squareName || lastMove.to === squareName);

        square.textContent = piece ? PIECE_SYMBOLS[`${piece.color}${piece.type.toUpperCase()}`] : '';
        square.setAttribute('aria-label', piece
          ? `${PIECE_NAMES[piece.type]} ${piece.color === 'w' ? 'blancas' : 'negras'}, ${squareName}`
          : squareName);
        square.classList.toggle('square--white-piece', !!piece && piece.color === 'w');
        square.classList.toggle('square--black-piece', !!piece && piece.color === 'b');
        square.classList.toggle('square--selected', isSelected);
        square.classList.toggle('square--legal', matchingTargets.length > 0);
        square.classList.toggle('square--capture', matchingTargets.some((move) => move.captured || move.flags.includes('e')));
        square.classList.toggle('square--last', !!isLastMove);
      }
    }

    updateStatus();
  }

  function updateStatus() {
    const sideToMove = game.turn() === 'w' ? 'blancas' : 'negras';

    if (game.in_checkmate()) {
      statusEl.textContent = `Jaque mate. Ganan ${game.turn() === 'w' ? 'negras' : 'blancas'}.`;
    } else if (game.in_stalemate()) {
      statusEl.textContent = 'Tablas por ahogado.';
    } else if (game.insufficient_material()) {
      statusEl.textContent = 'Tablas por material insuficiente.';
    } else if (game.in_threefold_repetition()) {
      statusEl.textContent = 'Tablas por triple repetición.';
    } else if (game.in_draw()) {
      statusEl.textContent = 'Tablas por la regla de los 50 movimientos.';
    } else {
      statusEl.textContent = `Turno: ${sideToMove}${game.in_check() ? ' · Jaque' : ''}`;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.reveal').forEach((element, index) => {
    setTimeout(() => element.classList.add('visible'), 60 + index * 80);
  });
});