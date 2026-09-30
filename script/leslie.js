// ==================== SISTEMA DE TICKETS GLOBALES ====================
let totalTickets = 0;
const totalTicketsCount = document.getElementById('totalTicketsCount');

function addTickets(amount) {
  totalTickets += amount;
  if (totalTicketsCount) totalTicketsCount.textContent = totalTickets;
}

// ==================== NAVEGACIÓN DE LA FERIA ====================
const fairMainMenu = document.getElementById('fairMainMenu');
const activeGameScreen = document.getElementById('activeGameScreen');
const gameViewportBox = document.getElementById('gameViewportBox');
const currentMinigameTitle = document.getElementById('currentMinigameTitle');
const gameTimer = document.getElementById('gameTimer');
const gameScore = document.getElementById('gameScore');
const btnReturnFair = document.getElementById('btnReturnToFair');

let currentActiveGame = null;
let gameInterval = null;
let gameTimeRemaining = 30;
let currentPoints = 0;

// Configurar los botones de cada puesto de la feria
document.querySelectorAll('.game-stall-card').forEach(card => {
  const gameType = card.getAttribute('data-game');
  const playBtn = card.querySelector('.btn-play-stall');
  
  // Abrir tanto al hacer clic en la tarjeta como en el botón
  card.addEventListener('click', (e) => {
    e.stopPropagation();
    launchMinigame(gameType);
  });

  if (playBtn) {
    playBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      launchMinigame(gameType);
    });
  }
});

if (btnReturnFair) {
  btnReturnFair.addEventListener('click', closeCurrentMinigame);
}

function launchMinigame(type) {
  if (!fairMainMenu || !activeGameScreen || !gameViewportBox) return;

  fairMainMenu.style.display = 'none';
  activeGameScreen.style.display = 'flex';
  gameViewportBox.innerHTML = '';
  
  currentActiveGame = type;
  currentPoints = 0;
  gameTimeRemaining = 30;
  if (gameScore) gameScore.textContent = '0';
  if (gameTimer) gameTimer.textContent = '30s';

  // Inicializar minijuego
  switch (type) {
    case 'targets':
      if (currentMinigameTitle) currentMinigameTitle.textContent = '🎯 Tiro al Blanco';
      initTargetsGame();
      break;
    case 'balloons':
      if (currentMinigameTitle) currentMinigameTitle.textContent = '🎈 Revienta Globos';
      initBalloonsGame();
      break;
    case 'memory':
      if (currentMinigameTitle) currentMinigameTitle.textContent = '🧠 Memoria';
      gameTimeRemaining = 45;
      if (gameTimer) gameTimer.textContent = '45s';
      initMemoryGame();
      break;
    case 'whack':
      if (currentMinigameTitle) currentMinigameTitle.textContent = '🐹 Atrapa al Personaje';
      initWhackGame();
      break;
    case 'racing':
      if (currentMinigameTitle) currentMinigameTitle.textContent = '🏎️ Mini Carrera';
      initMiniRacingGame();
      break;
  }

  // Contador de tiempo universal
  clearInterval(gameInterval);
  gameInterval = setInterval(() => {
    gameTimeRemaining--;
    if (gameTimer) gameTimer.textContent = `${gameTimeRemaining}s`;

    if (gameTimeRemaining <= 0) {
      endCurrentMinigame();
    }
  }, 1000);
}

function closeCurrentMinigame() {
  clearInterval(gameInterval);
  currentActiveGame = null;
  if (gameViewportBox) gameViewportBox.innerHTML = '';
  if (activeGameScreen) activeGameScreen.style.display = 'none';
  if (fairMainMenu) fairMainMenu.style.display = 'flex';
}

function endCurrentMinigame() {
  clearInterval(gameInterval);
  const earnedTickets = Math.floor(currentPoints / 10);
  addTickets(earnedTickets);

  setTimeout(() => {
    alert(`🎉 ¡Tiempo terminado!\nConseguiste ${currentPoints} puntos.\n🎟️ Ganaste ${earnedTickets} Tickets para la feria.`);
    closeCurrentMinigame();
  }, 100);
}

// ==================== 1. TIRO AL BLANCO ====================
function initTargetsGame() {
  const area = document.createElement('div');
  area.className = 'target-area';
  gameViewportBox.appendChild(area);

  function spawnTarget() {
    if (currentActiveGame !== 'targets' || gameTimeRemaining <= 0) return;
    
    const target = document.createElement('div');
    target.className = 'fair-target';
    target.style.left = `${Math.random() * 80 + 10}%`;
    target.style.top = `${Math.random() * 70 + 15}%`;

    target.addEventListener('click', () => {
      currentPoints += 20;
      if (gameScore) gameScore.textContent = currentPoints;
      target.remove();
      spawnTarget();
    });

    area.appendChild(target);

    setTimeout(() => {
      if (target.parentElement) {
        target.remove();
        spawnTarget();
      }
    }, 1400);
  }

  spawnTarget();
  spawnTarget();
}

// ==================== 2. REVIENTA LOS GLOBOS ====================
function initBalloonsGame() {
  const area = document.createElement('div');
  area.className = 'balloon-area';
  gameViewportBox.appendChild(area);

  const balloonIcons = ['🎈', '🎈', '💖', '⭐', '🎈'];

  function spawnBalloon() {
    if (currentActiveGame !== 'balloons' || gameTimeRemaining <= 0) return;

    const balloon = document.createElement('div');
    balloon.className = 'fair-balloon';
    balloon.textContent = balloonIcons[Math.floor(Math.random() * balloonIcons.length)];
    
    let posX = Math.random() * 80 + 10;
    let posY = 440;
    balloon.style.left = `${posX}%`;
    balloon.style.top = `${posY}px`;

    balloon.addEventListener('click', () => {
      currentPoints += 15;
      if (gameScore) gameScore.textContent = currentPoints;
      balloon.remove();
    });

    area.appendChild(balloon);

    const floatInterval = setInterval(() => {
      posY -= 4;
      balloon.style.top = `${posY}px`;

      if (posY < -50) {
        clearInterval(floatInterval);
        if (balloon.parentElement) balloon.remove();
      }
    }, 30);
  }

  const spawnInterval = setInterval(() => {
    if (currentActiveGame !== 'balloons' || gameTimeRemaining <= 0) {
      clearInterval(spawnInterval);
      return;
    }
    spawnBalloon();
  }, 600);
}

// ==================== 3. MEMORIA BACKYARDIGANS ====================
function initMemoryGame() {
  const board = document.createElement('div');
  board.className = 'memory-grid-board';
  gameViewportBox.appendChild(board);

  const emojis = ['🌸', '🐧', '🦌', '🦛', '🦘', '⭐'];
  const deck = [...emojis.slice(0, 4), ...emojis.slice(0, 4)].sort(() => Math.random() - 0.5);

  let flippedCards = [];
  let matchedCount = 0;

  deck.forEach((icon) => {
    const card = document.createElement('div');
    card.className = 'memory-card';
    card.dataset.icon = icon;
    card.textContent = '❓';

    card.addEventListener('click', () => {
      if (card.classList.contains('revealed') || flippedCards.length >= 2) return;

      card.classList.add('revealed');
      card.textContent = icon;
      flippedCards.push(card);

      if (flippedCards.length === 2) {
        const [c1, c2] = flippedCards;
        if (c1.dataset.icon === c2.dataset.icon) {
          currentPoints += 30;
          if (gameScore) gameScore.textContent = currentPoints;
          matchedCount += 2;
          flippedCards = [];

          if (matchedCount === deck.length) {
            currentPoints += 50;
            if (gameScore) gameScore.textContent = currentPoints;
            setTimeout(endCurrentMinigame, 500);
          }
        } else {
          setTimeout(() => {
            c1.classList.remove('revealed');
            c2.classList.remove('revealed');
            c1.textContent = '❓';
            c2.textContent = '❓';
            flippedCards = [];
          }, 700);
        }
      }
    });

    board.appendChild(card);
  });
}

// ==================== 4. ATRAPA AL PERSONAJE ====================
function initWhackGame() {
  const board = document.createElement('div');
  board.className = 'whack-board';
  gameViewportBox.appendChild(board);

  const characterIcons = ['🌸', '🐧', '🦌', '🦛', '🦘'];
  const holes = [];

  for (let i = 0; i < 6; i++) {
    const hole = document.createElement('div');
    hole.className = 'whack-hole';

    const mole = document.createElement('div');
    mole.className = 'whack-mole';
    mole.textContent = characterIcons[i % characterIcons.length];
    mole.style.fontSize = '3rem';

    mole.addEventListener('click', () => {
      if (hole.classList.contains('active')) {
        currentPoints += 25;
        if (gameScore) gameScore.textContent = currentPoints;
        hole.classList.remove('active');
      }
    });

    hole.appendChild(mole);
    board.appendChild(hole);
    holes.push(hole);
  }

  const moleInterval = setInterval(() => {
    if (currentActiveGame !== 'whack' || gameTimeRemaining <= 0) {
      clearInterval(moleInterval);
      return;
    }
    const randomHole = holes[Math.floor(Math.random() * holes.length)];
    randomHole.classList.add('active');

    setTimeout(() => {
      randomHole.classList.remove('active');
    }, 850);
  }, 1050);
}

// ==================== 5. MINI CARRERA ====================
function initMiniRacingGame() {
  const canvas = document.createElement('canvas');
  canvas.id = 'miniRaceCanvas';
  canvas.width = 800;
  canvas.height = 480;
  gameViewportBox.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let playerX = 400;
  let obstacles = [];
  let animId = null;

  function moveLeft() { playerX = Math.max(160, playerX - 40); }
  function moveRight() { playerX = Math.min(640, playerX + 40); }

  const handleKey = (e) => {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') moveLeft();
    if (e.code === 'ArrowRight' || e.code === 'KeyD') moveRight();
  };
  window.addEventListener('keydown', handleKey);

  function loop() {
    if (currentActiveGame !== 'racing' || gameTimeRemaining <= 0) {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', handleKey);
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fondo pasto y pista
    ctx.fillStyle = '#a8e6cf';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#533c56';
    ctx.fillRect(120, 0, 560, canvas.height);

    // Línea central punteada
    ctx.setLineDash([20, 20]);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#ffd1e8';
    ctx.beginPath();
    ctx.moveTo(400, 0);
    ctx.lineTo(400, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Generar obstáculos
    if (Math.random() < 0.04) {
      obstacles.push({ x: 160 + Math.random() * 460, y: -40, type: Math.random() > 0.5 ? '🚧' : '🍌' });
    }

    // Mover obstáculos
    for (let i = obstacles.length - 1; i >= 0; i--) {
      const obs = obstacles[i];
      obs.y += 5.5;

      ctx.font = '28px sans-serif';
      ctx.fillText(obs.type, obs.x - 14, obs.y + 10);

      // Colisión con el jugador
      if (Math.hypot(obs.x - playerX, obs.y - 390) < 32) {
        currentPoints = Math.max(0, currentPoints - 10);
        if (gameScore) gameScore.textContent = currentPoints;
        obstacles.splice(i, 1);
      } else if (obs.y > 500) {
        currentPoints += 5;
        if (gameScore) gameScore.textContent = currentPoints;
        obstacles.splice(i, 1);
      }
    }

    // Dibujar Kart de Uniqua
    ctx.fillStyle = '#ff4da6';
    ctx.beginPath();
    ctx.roundRect(playerX - 22, 375, 44, 48, 10);
    ctx.fill();

    ctx.font = '22px sans-serif';
    ctx.fillText('🌸', playerX - 11, 405);

    animId = requestAnimationFrame(loop);
  }

  loop();
}