// MAPEO DE PERSONAJES Y COLORES
const CHARACTERS = {
    yellow: { name: 'Tasha', image: '../images/tasha.png', color: '#FFDF00', stroke: '#E6C200' },
    blue:   { name: 'Pablo', image: '../images/pablo.png', color: '#2196F3', stroke: '#1976D2' },
    purple: { name: 'Austin', image: '../images/Austin.png', color: '#9C27B0', stroke: '#7B1FA2' },
    orange: { name: 'Tyrone', image: '../images/Tyrone.jpg', color: '#FF9800', stroke: '#F57C00' },
    pink:   { name: 'Uniqua', image: '../images/Uniqua.png', color: '#E91E63', stroke: '#C2185B' }
};

// ¡Todos los colores incluidos de nuevo!
const INITIAL_COLORS = ['yellow', 'blue', 'purple', 'orange', 'pink'];

// Cargar imagen de Victoria
const winImage = new Image();
winImage.src = '../images/backyardigans.jpg';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const RADIUS = 18;
const ROWS = 8;
const COLS = 10;
let grid = [];
let score = 0;
let particles = [];
let confetti = [];
let gameWon = false;
let winAnimProgress = 0;

const shooterX = canvas.width / 2;
const shooterY = canvas.height - 35;
let mouseX = shooterX;
let mouseY = 0;

let currentBall = null;
let bulletMoving = null;

// Inicializar matriz del tablero
function initGrid() {
    grid = [];
    gameWon = false;
    winAnimProgress = 0;
    confetti = [];

    for (let r = 0; r < ROWS; r++) {
        grid[r] = [];
        for (let c = 0; c < COLS; c++) {
            const offset = (r % 2 === 1) ? RADIUS : 0;
            const x = c * (RADIUS * 2) + RADIUS + offset;
            const y = r * (RADIUS * 1.73) + RADIUS + 10;

            // 3 filas iniciales para partidas rápidas pero con todos los colores
            if (r < 3 && x + RADIUS <= canvas.width + 5) {
                const randomKey = INITIAL_COLORS[Math.floor(Math.random() * INITIAL_COLORS.length)];
                grid[r][c] = { x, y, key: randomKey, row: r, col: c };
            } else {
                grid[r][c] = null;
            }
        }
    }
}

// Obtener solo los colores que existen en el tablero
function getExistingColors() {
    const existing = new Set();
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (grid[r][c]) {
                existing.add(grid[r][c].key);
            }
        }
    }
    return Array.from(existing);
}

function getRandomBall() {
    const availableColors = getExistingColors();
    if (availableColors.length === 0) {
        triggerWin();
        return null;
    }
    const key = availableColors[Math.floor(Math.random() * availableColors.length)];
    return { key, x: shooterX, y: shooterY };
}

// Activar Victoria y Confeti
function triggerWin() {
    gameWon = true;
    winAnimProgress = 0;

    const colors = ['#FFDF00', '#2196F3', '#9C27B0', '#FF9800', '#E91E63', '#FFFFFF'];
    for (let i = 0; i < 60; i++) {
        confetti.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            vx: (Math.random() - 0.5) * 4,
            vy: Math.random() * 3 + 2,
            size: Math.random() * 6 + 4,
            color: colors[Math.floor(Math.random() * colors.length)]
        });
    }
}

// Dibujar una burbuja con brillo 3D
function drawBubble(x, y, key, radius = RADIUS) {
    const conf = CHARACTERS[key];
    if (!conf) return;

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = conf.color;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = conf.stroke;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x - radius / 3, y - radius / 3, radius / 3.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.fill();
}

// Explosión de burbujas
function createExplosion(x, y, colorKey) {
    const color = CHARACTERS[colorKey].color;
    for (let i = 0; i < 12; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 2;
        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: Math.random() * 5 + 3,
            color: color,
            alpha: 1,
            life: 0.91
        });
    }
}

function updateAndDrawParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha *= p.life;
        p.radius *= 0.95;

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(p.radius, 0.5), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.restore();

        if (p.alpha < 0.05 || p.radius < 0.5) {
            particles.splice(i, 1);
        }
    }
}

// Trayectoria
function drawTrajectory() {
    if (bulletMoving || gameWon) return;

    const angle = Math.atan2(mouseY - shooterY, mouseX - shooterX);

    if (angle < -0.15 && angle > -Math.PI + 0.15) {
        ctx.beginPath();
        ctx.setLineDash([6, 8]);
        ctx.lineWidth = 3;
        ctx.strokeStyle = CHARACTERS[currentBall.key].color;

        const lineLength = 250;
        const targetX = shooterX + Math.cos(angle) * lineLength;
        const targetY = shooterY + Math.sin(angle) * lineLength;

        ctx.moveTo(shooterX, shooterY);
        ctx.lineTo(targetX, targetY);
        ctx.stroke();
        ctx.setLineDash([]);
    }
}

// Pantalla Animada de Victoria
function drawWinScreen() {
    if (winAnimProgress < 1) {
        winAnimProgress += 0.08;
    }

    ctx.fillStyle = `rgba(255, 246, 221, ${Math.min(winAnimProgress * 0.95, 0.95)})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    confetti.forEach(c => {
        c.x += c.vx;
        c.y += c.vy;
        if (c.y > canvas.height) c.y = -10;

        ctx.fillStyle = c.color;
        ctx.fillRect(c.x, c.y, c.size, c.size);
    });

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(winAnimProgress, winAnimProgress);

    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#4A2A1F';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(-170, -210, 340, 420, 20);
    ctx.fill();
    ctx.stroke();

    if (winImage.complete && winImage.naturalWidth !== 0) {
        ctx.drawImage(winImage, -150, -195, 300, 185);
        ctx.strokeStyle = '#FFCC00';
        ctx.lineWidth = 3;
        ctx.strokeRect(-150, -195, 300, 185);
    }

    ctx.font = 'bold 24px Fredoka, sans-serif';
    ctx.fillStyle = '#D62828';
    ctx.textAlign = 'center';
    ctx.fillText('¡FELICITACIONES!', 0, 30);

    ctx.font = 'bold 16px Fredoka, sans-serif';
    ctx.fillStyle = '#4A2A1F';
    ctx.fillText('¡Has completado el juego!', 0, 60);

    ctx.fillStyle = '#FFCC00';
    ctx.beginPath();
    ctx.roundRect(-120, 85, 240, 50, 15);
    ctx.fill();
    ctx.strokeStyle = '#4A2A1F';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = 'bold 18px Fredoka, sans-serif';
    ctx.fillStyle = '#4A2A1F';
    ctx.fillText(`Puntos Totales: ${score}`, 0, 117);

    ctx.restore();
}

// Render loop
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const b = grid[r][c];
            if (b) {
                drawBubble(b.x, b.y, b.key);
            }
        }
    }

    drawTrajectory();
    updateAndDrawParticles();

    if (bulletMoving) {
        drawBubble(bulletMoving.x, bulletMoving.y, bulletMoving.key);
        bulletMoving.x += bulletMoving.vx;
        bulletMoving.y += bulletMoving.vy;

        if (bulletMoving.x - RADIUS <= 2 || bulletMoving.x + RADIUS >= canvas.width - 2) {
            bulletMoving.vx *= -1;
        }

        checkCollision();
    } else if (currentBall && !gameWon) {
        drawBubble(currentBall.x, currentBall.y, currentBall.key, RADIUS + 2);
    }

    if (gameWon) {
        drawWinScreen();
    }

    requestAnimationFrame(draw);
}

// Eventos
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
});

canvas.addEventListener('click', () => {
    if (bulletMoving || gameWon) return;

    const angle = Math.atan2(mouseY - shooterY, mouseX - shooterX);
    if (angle < -0.15 && angle > -Math.PI + 0.15) {
        // Disparo veloz
        const speed = 22;
        bulletMoving = {
            x: shooterX,
            y: shooterY,
            key: currentBall.key,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed
        };
    }
});

function checkCollision() {
    if (bulletMoving.y - RADIUS <= 10) {
        snapToGrid();
        return;
    }

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const b = grid[r][c];
            if (b) {
                const dist = Math.hypot(bulletMoving.x - b.x, bulletMoving.y - b.y);
                if (dist < RADIUS * 1.75) {
                    snapToGrid();
                    return;
                }
            }
        }
    }
}

function snapToGrid() {
    let bestDist = Infinity;
    let targetRow = 0;
    let targetCol = 0;

    for (let r = 0; r < ROWS; r++) {
        const offset = (r % 2 === 1) ? RADIUS : 0;
        for (let c = 0; c < COLS; c++) {
            if (!grid[r][c]) {
                const cellX = c * (RADIUS * 2) + RADIUS + offset;
                const cellY = r * (RADIUS * 1.73) + RADIUS + 10;

                if (cellX + RADIUS <= canvas.width + 5) {
                    const dist = Math.hypot(bulletMoving.x - cellX, bulletMoving.y - cellY);
                    if (dist < bestDist) {
                        bestDist = dist;
                        targetRow = r;
                        targetCol = c;
                    }
                }
            }
        }
    }

    const finalOffset = (targetRow % 2 === 1) ? RADIUS : 0;
    const finalX = targetCol * (RADIUS * 2) + RADIUS + finalOffset;
    const finalY = targetRow * (RADIUS * 1.73) + RADIUS + 10;

    grid[targetRow][targetCol] = {
        x: finalX,
        y: finalY,
        key: bulletMoving.key,
        row: targetRow,
        col: targetCol
    };

    const matches = getMatches(targetRow, targetCol, bulletMoving.key);
    if (matches.length >= 3) {
        matches.forEach(m => {
            const bubble = grid[m.row][m.col];
            if (bubble) {
                createExplosion(bubble.x, bubble.y, bubble.key);
                grid[m.row][m.col] = null;
            }
        });
        score += matches.length * 15;
        document.getElementById('contador-puntos').textContent = score;
    }

    bulletMoving = null;
    updateNextBall();
}

function getMatches(startRow, startCol, targetKey) {
    let matches = [];
    let visited = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
    let queue = [{ r: startRow, c: startCol }];

    visited[startRow][startCol] = true;

    while (queue.length > 0) {
        const { r, c } = queue.shift();
        matches.push({ row: r, col: c });

        const isOdd = (r % 2 === 1);
        const neighbors = [
            { r: r, c: c - 1 }, { r: r, c: c + 1 },
            { r: r - 1, c: c }, { r: r + 1, c: c },
            { r: r - 1, c: c + (isOdd ? 1 : -1) },
            { r: r + 1, c: c + (isOdd ? 1 : -1) }
        ];

        neighbors.forEach(n => {
            if (n.r >= 0 && n.r < ROWS && n.c >= 0 && n.c < COLS) {
                const neighbor = grid[n.r][n.c];
                if (neighbor && neighbor.key === targetKey && !visited[n.r][n.c]) {
                    visited[n.r][n.c] = true;
                    queue.push({ r: n.r, c: n.c });
                }
            }
        });
    }

    return matches;
}

function updateNextBall() {
    currentBall = getRandomBall();
    if (!currentBall) return;

    const activeChar = CHARACTERS[currentBall.key];
    document.getElementById('nombre-personaje').textContent = activeChar.name;
    document.getElementById('avatar-personaje').src = activeChar.image;
    document.getElementById('avatar-personaje').alt = activeChar.name;
}

document.getElementById('reiniciar').addEventListener('click', () => {
    score = 0;
    particles = [];
    document.getElementById('contador-puntos').textContent = score;
    initGrid();
    updateNextBall();
});

// Inicio
initGrid();
updateNextBall();
draw();
