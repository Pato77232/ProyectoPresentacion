document.addEventListener('DOMContentLoaded', initTetris);

const TETRIS_COLUMNS = 10;
const TETRIS_ROWS = 20;
const CELL_SIZE = 30;
const DROP_INTERVAL = 800;

const TETRIS_PIECES = {
	I: { color: '#22d3ee', shape: [[1, 1, 1, 1]] },
	J: { color: '#3b82f6', shape: [[1, 0, 0], [1, 1, 1]] },
	L: { color: '#fb923c', shape: [[0, 0, 1], [1, 1, 1]] },
	O: { color: '#facc15', shape: [[1, 1], [1, 1]] },
	S: { color: '#4ade80', shape: [[0, 1, 1], [1, 1, 0]] },
	T: { color: '#a78bfa', shape: [[0, 1, 0], [1, 1, 1]] },
	Z: { color: '#ec4899', shape: [[1, 1, 0], [0, 1, 1]] },
};

function initTetris() {
	const boardCanvas = document.getElementById('tetrisCanvas');
	const nextCanvas = document.getElementById('nextCanvas');
	const overlay = document.getElementById('tetrisOverlay');
	const overlayTitle = document.getElementById('overlayTitle');
	const overlaySub = document.getElementById('overlaySub');
	const startButton = document.getElementById('startBtn');
	const pauseButton = document.getElementById('pauseBtn');
	const restartButton = document.getElementById('restartBtn');
	const scoreElement = document.getElementById('score');
	const linesElement = document.getElementById('lines');
	const levelElement = document.getElementById('level');

	if (!boardCanvas || !nextCanvas || !overlay || !startButton || !pauseButton || !restartButton) return;

	const boardContext = boardCanvas.getContext('2d');
	const nextContext = nextCanvas.getContext('2d');
	if (!boardContext || !nextContext) return;

	let board;
	let currentPiece;
	let nextType;
	let pieceBag = [];
	let score = 0;
	let lines = 0;
	let level = 1;
	let gameState = 'ready';
	let lastFrame = 0;
	let dropElapsed = 0;
	let animationFrame = 0;

	resetGame(false);
	startButton.addEventListener('click', startOrContinue);
	pauseButton.addEventListener('click', togglePause);
	restartButton.addEventListener('click', () => resetGame(true));
	document.querySelectorAll('.dpad-btn[data-action]').forEach((button) => {
		button.addEventListener('click', () => performAction(button.dataset.action));
	});
	document.addEventListener('keydown', onKeyDown);
	document.addEventListener('visibilitychange', onVisibilityChange);
	draw();

	function resetGame(startImmediately) {
		cancelAnimationFrame(animationFrame);
		board = Array.from({ length: TETRIS_ROWS }, () => Array(TETRIS_COLUMNS).fill(null));
		pieceBag = [];
		score = 0;
		lines = 0;
		level = 1;
		nextType = takePieceType();
		gameState = startImmediately ? 'running' : 'ready';
		dropElapsed = 0;
		lastFrame = 0;
		spawnPiece();
		updateStats();
		updateOverlay();
		draw();
		if (gameState === 'running') animationFrame = requestAnimationFrame(gameLoop);
	}

	function takePieceType() {
		if (!pieceBag.length) {
			pieceBag = Object.keys(TETRIS_PIECES);
			for (let index = pieceBag.length - 1; index > 0; index -= 1) {
				const swapIndex = Math.floor(Math.random() * (index + 1));
				[pieceBag[index], pieceBag[swapIndex]] = [pieceBag[swapIndex], pieceBag[index]];
			}
		}
		return pieceBag.pop();
	}

	function spawnPiece() {
		const definition = TETRIS_PIECES[nextType];
		currentPiece = {
			type: nextType,
			color: definition.color,
			shape: definition.shape.map((row) => row.slice()),
			x: Math.floor((TETRIS_COLUMNS - definition.shape[0].length) / 2),
			y: 0,
		};
		nextType = takePieceType();
		if (collides(currentPiece.shape, currentPiece.x, currentPiece.y)) finishGame();
	}

	function startOrContinue() {
		if (gameState === 'gameover') {
			resetGame(true);
			return;
		}
		if (gameState === 'running') return;
		gameState = 'running';
		lastFrame = 0;
		updateOverlay();
		animationFrame = requestAnimationFrame(gameLoop);
	}

	function togglePause() {
		if (gameState === 'running') {
			gameState = 'paused';
			cancelAnimationFrame(animationFrame);
			updateOverlay();
			draw();
		} else if (gameState === 'paused') {
			startOrContinue();
		}
	}

	function onVisibilityChange() {
		if (document.hidden && gameState === 'running') togglePause();
	}

	function onKeyDown(event) {
		if (event.target instanceof HTMLElement && event.target.closest('button, input, textarea, select, [contenteditable="true"]')) return;

		const keyActions = {
			ArrowLeft: 'left',
			ArrowRight: 'right',
			ArrowUp: 'rotate',
			ArrowDown: 'down',
			' ': 'drop',
		};

		if (event.key.toLowerCase() === 'p' || event.key === 'Escape') {
			event.preventDefault();
			togglePause();
			return;
		}

		const action = keyActions[event.key];
		if (!action) return;
		event.preventDefault();
		performAction(action);
	}

	function performAction(action) {
		if (gameState !== 'running') return;
		if (action === 'left') movePiece(-1, 0);
		if (action === 'right') movePiece(1, 0);
		if (action === 'down' && movePiece(0, 1)) score += 1;
		if (action === 'rotate') rotatePiece();
		if (action === 'drop') hardDrop();
		updateStats();
		draw();
	}

	function movePiece(offsetX, offsetY) {
		if (collides(currentPiece.shape, currentPiece.x + offsetX, currentPiece.y + offsetY)) {
			if (offsetY > 0) lockPiece();
			return false;
		}
		currentPiece.x += offsetX;
		currentPiece.y += offsetY;
		return true;
	}

	function rotatePiece() {
		const rotated = currentPiece.shape[0].map((_, column) =>
			currentPiece.shape.map((row) => row[column]).reverse()
		);
		for (const offset of [0, -1, 1, -2, 2]) {
			if (!collides(rotated, currentPiece.x + offset, currentPiece.y)) {
				currentPiece.shape = rotated;
				currentPiece.x += offset;
				return;
			}
		}
	}

	function collides(shape, offsetX, offsetY) {
		return shape.some((row, rowIndex) => row.some((cell, columnIndex) => {
			if (!cell) return false;
			const x = offsetX + columnIndex;
			const y = offsetY + rowIndex;
			return x < 0 || x >= TETRIS_COLUMNS || y >= TETRIS_ROWS || (y >= 0 && board[y][x]);
		}));
	}

	function hardDrop() {
		let distance = 0;
		while (!collides(currentPiece.shape, currentPiece.x, currentPiece.y + 1)) {
			currentPiece.y += 1;
			distance += 1;
		}
		score += distance * 2;
		lockPiece();
	}

	function lockPiece() {
		currentPiece.shape.forEach((row, rowIndex) => row.forEach((cell, columnIndex) => {
			if (cell) board[currentPiece.y + rowIndex][currentPiece.x + columnIndex] = currentPiece.color;
		}));
		clearLines();
		spawnPiece();
		updateStats();
		updateOverlay();
	}

	function clearLines() {
		let cleared = 0;
		for (let row = TETRIS_ROWS - 1; row >= 0; row -= 1) {
			if (board[row].every(Boolean)) {
				board.splice(row, 1);
				board.unshift(Array(TETRIS_COLUMNS).fill(null));
				cleared += 1;
				row += 1;
			}
		}
		if (!cleared) return;
		score += [0, 100, 300, 500, 800][cleared] * level;
		lines += cleared;
		level = Math.floor(lines / 10) + 1;
	}

	function finishGame() {
		gameState = 'gameover';
		cancelAnimationFrame(animationFrame);
		updateOverlay();
	}

	function gameLoop(timestamp) {
		if (gameState !== 'running') return;
		if (!lastFrame) lastFrame = timestamp;
		dropElapsed += timestamp - lastFrame;
		lastFrame = timestamp;

		const interval = Math.max(100, DROP_INTERVAL - (level - 1) * 65);
		while (dropElapsed >= interval && gameState === 'running') {
			dropElapsed -= interval;
			movePiece(0, 1);
		}
		updateStats();
		draw();
		if (gameState === 'running') animationFrame = requestAnimationFrame(gameLoop);
	}

	function updateStats() {
		scoreElement.textContent = String(score);
		linesElement.textContent = String(lines);
		levelElement.textContent = String(level);
	}

	function updateOverlay() {
		overlay.classList.toggle('hidden', gameState === 'running');
		pauseButton.textContent = gameState === 'paused' ? '▶ Continuar' : '⏸ Pausa';
		if (gameState === 'paused') {
			overlayTitle.textContent = 'PAUSA';
			overlaySub.textContent = 'La partida está en pausa';
			startButton.textContent = '▶ Continuar';
		} else if (gameState === 'gameover') {
			overlayTitle.textContent = 'FIN DEL JUEGO';
			overlaySub.textContent = `Puntuación final: ${score}`;
			startButton.textContent = '↻ Jugar de nuevo';
		} else {
			overlayTitle.textContent = 'TETRIS';
			overlaySub.textContent = gameState === 'ready' ? 'Pulsa comenzar para jugar' : '¡A jugar!';
			startButton.textContent = '▶ Comenzar';
		}
	}

	function draw() {
		boardContext.clearRect(0, 0, boardCanvas.width, boardCanvas.height);
		boardContext.fillStyle = 'rgba(2, 6, 23, 0.72)';
		boardContext.fillRect(0, 0, boardCanvas.width, boardCanvas.height);

		board.forEach((row, y) => row.forEach((color, x) => {
			if (color) drawCell(boardContext, x, y, color);
		}));

		if (currentPiece) {
			let ghostY = currentPiece.y;
			while (!collides(currentPiece.shape, currentPiece.x, ghostY + 1)) ghostY += 1;
			drawShape(boardContext, currentPiece, ghostY, true);
			drawShape(boardContext, currentPiece, currentPiece.y, false);
		}

		drawGrid();
		drawNextPiece();
	}

	function drawShape(context, piece, yPosition, ghost) {
		piece.shape.forEach((row, rowIndex) => row.forEach((cell, columnIndex) => {
			if (cell) drawCell(context, piece.x + columnIndex, yPosition + rowIndex, piece.color, ghost);
		}));
	}

	function drawCell(context, x, y, color, ghost = false) {
		const inset = ghost ? 3 : 1;
		context.globalAlpha = ghost ? 0.28 : 1;
		context.fillStyle = color;
		context.fillRect(x * CELL_SIZE + inset, y * CELL_SIZE + inset, CELL_SIZE - inset * 2, CELL_SIZE - inset * 2);
		if (!ghost) {
			context.fillStyle = 'rgba(255,255,255,0.22)';
			context.fillRect(x * CELL_SIZE + 3, y * CELL_SIZE + 3, CELL_SIZE - 6, 3);
			context.strokeStyle = 'rgba(2,6,23,0.3)';
			context.strokeRect(x * CELL_SIZE + 1, y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
		}
		context.globalAlpha = 1;
	}

	function drawGrid() {
		boardContext.strokeStyle = 'rgba(147,197,253,0.08)';
		boardContext.lineWidth = 1;
		for (let column = 0; column <= TETRIS_COLUMNS; column += 1) {
			boardContext.beginPath();
			boardContext.moveTo(column * CELL_SIZE + 0.5, 0);
			boardContext.lineTo(column * CELL_SIZE + 0.5, boardCanvas.height);
			boardContext.stroke();
		}
		for (let row = 0; row <= TETRIS_ROWS; row += 1) {
			boardContext.beginPath();
			boardContext.moveTo(0, row * CELL_SIZE + 0.5);
			boardContext.lineTo(boardCanvas.width, row * CELL_SIZE + 0.5);
			boardContext.stroke();
		}
	}

	function drawNextPiece() {
		nextContext.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
		const shape = TETRIS_PIECES[nextType].shape;
		const previewCell = 22;
		const offsetX = (nextCanvas.width - shape[0].length * previewCell) / 2;
		const offsetY = (nextCanvas.height - shape.length * previewCell) / 2;

		shape.forEach((row, rowIndex) => row.forEach((cell, columnIndex) => {
			if (!cell) return;
			nextContext.fillStyle = TETRIS_PIECES[nextType].color;
			nextContext.fillRect(offsetX + columnIndex * previewCell + 1, offsetY + rowIndex * previewCell + 1, previewCell - 2, previewCell - 2);
		}));
	}
}
