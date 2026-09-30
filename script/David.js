const lifecycleController = new AbortController();
let animationFrameId = 0;
let revealObserver = null;

window.addEventListener(
  "david-profile-cleanup",
  () => {
    lifecycleController.abort();
    revealObserver?.disconnect();
    cancelAnimationFrame(animationFrameId);
  },
  { once: true },
);

(function () {
  "use strict";

  /* ================================================================
     1. SUBTÍTULO DINÁMICO (máquina de escribir)
     ✏️ EDITA: cambia estas frases por las que te describan a ti.
  ================================================================ */
  const roles = [
    "Estudiante de Ingeniería de Software",
    "Apasionado por la Informática",
    "Desarrollador de videojuegos 2D",
    "Fan de los Backyardigans",
    "Siempre aprendiendo algo nuevo",
  ];
  const typedEl = document.getElementById("typed");
  let roleIdx = 0,
    charIdx = 0,
    deleting = false;

  function typeEffect() {
    if (!typedEl || lifecycleController.signal.aborted) return;
    const current = roles[roleIdx];
    if (!deleting) {
      typedEl.textContent = current.slice(0, ++charIdx);
      if (charIdx === current.length) {
        deleting = true;
        setTimeout(typeEffect, 2000);
        return;
      }
      setTimeout(typeEffect, 65);
    } else {
      typedEl.textContent = current.slice(0, --charIdx);
      if (charIdx === 0) {
        deleting = false;
        roleIdx = (roleIdx + 1) % roles.length;
      }
      setTimeout(typeEffect, 30);
    }
  }
  typeEffect();

  /* ================================================================
     2. REVEAL AL HACER SCROLL
  ================================================================ */
  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );

  document.querySelectorAll(".reveal").forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 0.12}s`;
    revealObserver.observe(el);
  });

  /* ================================================================
     3. ORBES CON PARALAJE SEGÚN EL MOUSE
  ================================================================ */
  const orbField = document.getElementById("orbField");
  window.addEventListener(
    "mousemove",
    (e) => {
      if (!orbField) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 30;
      orbField.style.transform = `translate(${x}px, ${y}px)`;
    },
    { signal: lifecycleController.signal },
  );
})();

/* =====================================================================
   PARTE 2 — MOTOR DEL MINIJUEGO: MOTO EXTREME 2D
   Generación procedural de nivel, física de saltos y giros (corregida),
   partículas, cámara con sacudida, vidas, puntuación y récord.
   ===================================================================== */

// ============================================================
// MOTO EXTREME 2D — MOTOR DEL JUEGO
// Generación procedural de nivel, física de saltos, partículas,
// cámara con sacudida, sistema de vidas y puntuación.
// ============================================================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

const GROUND_Y = 500;
const KILL_Y = HEIGHT + 120;
const PLAYER_SCREEN_X = 250;

// ==========================================
// UTILIDADES
// ==========================================

function rand(min, max) {
  return min + Math.random() * (max - min);
}
function randInt(min, max) {
  return Math.floor(rand(min, max + 1));
}
function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}
function easeOutQuad(t) {
  return t * (2 - t);
}
function easeInQuad(t) {
  return t * t;
}
function normalizeAngle(a) {
  a = a % (Math.PI * 2);
  if (a > Math.PI) a -= Math.PI * 2;
  if (a < -Math.PI) a += Math.PI * 2;
  return a;
}
function pickWeighted(options) {
  // options: [{ value, weight }]
  const total = options.reduce((sum, o) => sum + o.weight, 0);
  let r = Math.random() * total;
  for (const o of options) {
    if (r < o.weight) return o.value;
    r -= o.weight;
  }
  return options[options.length - 1].value;
}

// ==========================================
// ALMACENAMIENTO DE RÉCORD
// ==========================================

function loadBest() {
  try {
    return Number(localStorage.getItem("motoExtreme2D_best")) || 0;
  } catch (e) {
    return 0;
  }
}
function saveBest(value) {
  try {
    localStorage.setItem("motoExtreme2D_best", String(value));
  } catch (e) {
    /* ignorar */
  }
}

// ==========================================
// ESTADO DEL JUEGO
// ==========================================

let gameState = "menu";
let lastTime = 0;

const keys = {};
const KEY_MAP = {
  ArrowLeft: "ArrowLeft",
  ArrowRight: "ArrowRight",
  ArrowUp: "ArrowUp",
  ArrowDown: "ArrowDown",
  Space: " ",
};

const game = {
  score: 0,
  distance: 0,
  level: 1,
  lives: 3,

  cameraX: 0,
  shake: { time: 0, mag: 0 },

  gravity: 1400,
  maxSpeedBase: 520,
  maxSpeed: 520,

  best: loadBest(),
};

// ==========================================
// MOTO
// ==========================================

const motorcycle = {
  x: 250,
  y: GROUND_Y - 60,

  width: 100,
  height: 55,

  velocityX: 0,
  velocityY: 0,

  acceleration: 520,
  brakeForce: 720,

  angle: 0,
  angularVelocity: 0,
  airborneRotation: 0,

  grounded: false,
  invulnerable: 0,
  wheelSpin: 0,
};

// ==========================================
// MUNDO (TERRENO PROCEDURAL, POZOS, OBSTÁCULOS)
// ==========================================

const world = {
  terrainPoints: [],
  pitZones: [],
  obstacles: [],
  segments: [],

  generatedUntil: 0,
  cursorY: GROUND_Y,

  lastSafeX: 250,
  lastSafeY: GROUND_Y,

  lastType: null,
  lastObstacleX: -Infinity,

  particles: [],
  toasts: [],
};

// ---------- Constructores de segmentos ----------

function addWavePoints(startX, endX, fn, step) {
  step = step || 22;
  for (let x = startX; x < endX; x += step) {
    world.terrainPoints.push({ x: x, y: fn(x) });
  }
  world.terrainPoints.push({ x: endX, y: fn(endX) });
}

function buildFlat(startX, startY) {
  const length = rand(220, 420);
  const endX = startX + length;
  addWavePoints(startX, endX, () => startY, 60);
  world.segments.push({ type: "flat", start: startX, end: endX });
  return { endX: endX, endY: startY };
}

function buildWave(startX, startY, difficulty) {
  const length = rand(360, 650);
  const amp = rand(20, 42) * (0.6 + difficulty * 0.7);
  const freq = rand(0.006, 0.011);
  const endX = startX + length;
  const fn = (x) => startY + amp * Math.sin((x - startX) * freq);
  addWavePoints(startX, endX, fn);
  world.segments.push({ type: "wave", start: startX, end: endX });
  return { endX: endX, endY: fn(endX) };
}

function buildRumble(startX, startY) {
  const length = rand(180, 320);
  const amp = rand(6, 13);
  const freq = rand(0.05, 0.09);
  const endX = startX + length;
  const fn = (x) => startY + amp * Math.sin((x - startX) * freq);
  addWavePoints(startX, endX, fn, 16);
  world.segments.push({ type: "rumble", start: startX, end: endX });
  return { endX: endX, endY: fn(endX) };
}

function buildRampJump(startX, startY, difficulty) {
  const rampUpLen = rand(140, 190);
  const rampHeight = clamp(rand(70, 120) * (0.7 + difficulty * 0.6), 60, 170);
  const peakX = startX + rampUpLen;
  const peakY = startY - rampHeight;

  addWavePoints(
    startX,
    peakX,
    (x) => startY - rampHeight * easeOutQuad((x - startX) / rampUpLen),
    18,
  );

  const pitLen = clamp(140 + difficulty * 90 + rand(-20, 20), 140, 260);
  const landStartX = peakX + pitLen;
  const landDownLen = rand(150, 210);
  const landEndX = landStartX + landDownLen;
  const landEndY = startY + rand(-15, 35);

  addWavePoints(
    landStartX,
    landEndX,
    (x) =>
      peakY + (landEndY - peakY) * easeInQuad((x - landStartX) / landDownLen),
    18,
  );

  world.pitZones.push({
    start: peakX,
    end: landStartX,
    liftY: peakY,
    landY: peakY + (landEndY - peakY) * easeInQuad(0),
  });

  world.segments.push({ type: "ramp_jump", start: startX, end: landEndX });

  return { endX: landEndX, endY: landEndY };
}

function maybePlaceObstacles(segment, difficulty) {
  if (segment.type !== "flat" && segment.type !== "wave") return;
  const length = segment.end - segment.start;
  if (length < 220) return;

  const chance = 0.63 + difficulty * 0.27;
  if (Math.random() > chance) return;

  const minGap = clamp(310 - difficulty * 70, 240, 310);
  const usableStart = segment.start + 90;
  const usableEnd = segment.end - 90;
  const usableLen = usableEnd - usableStart;
  if (usableLen < 60) return;

  const maxCount = clamp(Math.floor(usableLen / minGap) + 1, 1, 3);
  let cursor = usableStart + rand(0, 60);

  for (let i = 0; i < maxCount; i++) {
    if (cursor > usableEnd) break;
    if (cursor - world.lastObstacleX < minGap) {
      cursor += minGap;
      continue;
    }

    const type = pickWeighted([
      { value: "rock", weight: 3 },
      { value: "barrel", weight: 3 },
      { value: "crate", weight: 3 },
    ]);

    const tall = difficulty > 0.45 && Math.random() < 0.22;

    world.obstacles.push({
      x: cursor,
      type: type,
      width: 50,
      height: tall ? 82 : 50,
      hit: false,
    });

    world.lastObstacleX = cursor;
    cursor += minGap + rand(0, 120);
  }
}

function buildSegmentByType(type, startX, startY, difficulty) {
  let result;
  if (type === "flat") result = buildFlat(startX, startY);
  else if (type === "wave") result = buildWave(startX, startY, difficulty);
  else if (type === "rumble") result = buildRumble(startX, startY);
  else result = buildRampJump(startX, startY, difficulty);

  const seg = world.segments[world.segments.length - 1];
  maybePlaceObstacles(seg, difficulty);
  return result;
}

function pickNextType(difficulty, startX) {
  if (startX < 650) return "flat";

  if (world.lastType === "ramp_jump") {
    // siempre dejar un tramo de recuperación tras un salto
    return pickWeighted([
      { value: "flat", weight: 55 },
      { value: "wave", weight: 30 },
      { value: "rumble", weight: 15 },
    ]);
  }

  const weights = [
    { value: "flat", weight: 45 - difficulty * 22 },
    { value: "wave", weight: 28 + difficulty * 4 },
    { value: "rumble", weight: 12 },
    { value: "ramp_jump", weight: 12 + difficulty * 34 },
  ];
  return pickWeighted(weights);
}

function extendWorld(targetX) {
  while (world.generatedUntil < targetX) {
    const startX = world.generatedUntil;
    const startY = world.cursorY;
    const difficulty = clamp(Math.max(0, startX) / 9000, 0, 1);

    const type = pickNextType(difficulty, startX);
    const result = buildSegmentByType(type, startX, startY, difficulty);

    world.lastType = type;
    world.cursorY = result.endY;
    world.generatedUntil = result.endX;
  }
}

function pruneWorld(minX) {
  while (world.terrainPoints.length > 2 && world.terrainPoints[1].x < minX) {
    world.terrainPoints.shift();
  }
  world.pitZones = world.pitZones.filter((p) => p.end > minX);
  world.obstacles = world.obstacles.filter((o) => o.x > minX - 120);
  world.segments = world.segments.filter((s) => s.end > minX);
}

function resetWorld() {
  world.terrainPoints = [{ x: -700, y: GROUND_Y }];
  world.pitZones = [];
  world.obstacles = [];
  world.segments = [];
  world.generatedUntil = -700;
  world.cursorY = GROUND_Y;
  world.lastSafeX = 250;
  world.lastSafeY = GROUND_Y;
  world.lastType = null;
  world.lastObstacleX = -Infinity;
  world.particles = [];
  world.toasts = [];

  extendWorld(3600);
}

// ==========================================
// ALTURA DEL TERRENO (null = hueco/pozo)
// ==========================================

function getTerrainHeight(x) {
  for (let i = 0; i < world.pitZones.length; i++) {
    const p = world.pitZones[i];
    if (x >= p.start && x <= p.end) return null;
  }

  const pts = world.terrainPoints;
  for (let i = 0; i < pts.length - 1; i++) {
    const current = pts[i];
    const next = pts[i + 1];
    if (x >= current.x && x <= next.x) {
      const pct = (x - current.x) / (next.x - current.x || 1);
      return current.y + (next.y - current.y) * pct;
    }
  }
  return GROUND_Y;
}

// ==========================================
// PARTÍCULAS Y AVISOS FLOTANTES
// ==========================================

function spawnParticles(x, y, count, color, spread) {
  for (let i = 0; i < count; i++) {
    world.particles.push({
      x: x + rand(-6, 6),
      y: y + rand(-6, 6),
      vx: rand(-spread, spread),
      vy: rand(-spread * 1.2, -spread * 0.2),
      life: rand(0.35, 0.75),
      maxLife: 0.75,
      size: rand(2, 5),
      color: color,
    });
  }
}

function spawnDust() {
  if (Math.random() > 0.55) return;
  spawnParticles(
    motorcycle.x - 35,
    motorcycle.y + 22,
    1,
    "rgba(200,190,170,0.55)",
    40,
  );
}

function spawnToast(x, y, text, color) {
  world.toasts.push({
    x: x,
    y: y,
    text: text,
    color: color || "#ffb300",
    life: 1.1,
    maxLife: 1.1,
  });
}

function triggerShake(mag, time) {
  game.shake.mag = Math.max(game.shake.mag, mag);
  game.shake.time = Math.max(game.shake.time, time);
}

function updateEffects(deltaTime) {
  for (let i = world.particles.length - 1; i >= 0; i--) {
    const p = world.particles[i];
    p.vy += 900 * deltaTime;
    p.x += p.vx * deltaTime;
    p.y += p.vy * deltaTime;
    p.life -= deltaTime;
    if (p.life <= 0) world.particles.splice(i, 1);
  }

  for (let i = world.toasts.length - 1; i >= 0; i--) {
    const t = world.toasts[i];
    t.y -= 35 * deltaTime;
    t.life -= deltaTime;
    if (t.life <= 0) world.toasts.splice(i, 1);
  }

  if (game.shake.time > 0) {
    game.shake.time -= deltaTime;
    if (game.shake.time <= 0) game.shake.mag = 0;
  }
}

// ==========================================
// INICIAR JUEGO
// ==========================================

function startGame() {
  gameState = "playing";

  game.score = 0;
  game.distance = 0;
  game.level = 1;
  game.lives = 3;
  game.cameraX = 0;
  game.maxSpeed = game.maxSpeedBase;
  game.shake = { time: 0, mag: 0 };

  motorcycle.x = 250;
  motorcycle.y = GROUND_Y - 90;
  motorcycle.velocityX = 0;
  motorcycle.velocityY = 0;
  motorcycle.angle = 0;
  motorcycle.angularVelocity = 0;
  motorcycle.airborneRotation = 0;
  motorcycle.invulnerable = 0.6;
  motorcycle.wheelSpin = 0;

  resetWorld();

  document.getElementById("startScreen").classList.add("hidden");
  document.getElementById("pauseScreen").classList.add("hidden");
  document.getElementById("gameOverScreen").classList.add("hidden");
  document.getElementById("newRecordBadge").classList.add("hidden");

  updateHUD();
}

// ==========================================
// PAUSA
// ==========================================

function pauseGame() {
  if (gameState !== "playing") return;
  gameState = "paused";
  document.getElementById("pauseScreen").classList.remove("hidden");
}

function resumeGame() {
  if (gameState !== "paused") return;
  gameState = "playing";
  document.getElementById("pauseScreen").classList.add("hidden");
}

function togglePause() {
  if (gameState === "playing") pauseGame();
  else if (gameState === "paused") resumeGame();
}

// ==========================================
// CONTROLES DE TECLADO
// ==========================================

window.addEventListener(
  "keydown",
  function (event) {
    keys[event.key] = true;

    if (
      event.key === "ArrowUp" ||
      event.key === "ArrowDown" ||
      event.key === "ArrowLeft" ||
      event.key === "ArrowRight" ||
      event.key === " "
    ) {
      event.preventDefault();
    }

    if (event.key === "Escape") {
      togglePause();
    }
  },
  { signal: lifecycleController.signal },
);

window.addEventListener(
  "keyup",
  function (event) {
    keys[event.key] = false;
  },
  { signal: lifecycleController.signal },
);

window.addEventListener(
  "blur",
  function () {
    if (gameState === "playing") pauseGame();
  },
  { signal: lifecycleController.signal },
);

// ==========================================
// CONTROLES TÁCTILES
// ==========================================

document.querySelectorAll(".mobile-controls button").forEach((btn) => {
  const mapped = KEY_MAP[btn.dataset.key];
  if (!mapped) return;

  const press = (e) => {
    e.preventDefault();
    keys[mapped] = true;
  };
  const release = (e) => {
    e.preventDefault();
    keys[mapped] = false;
  };

  btn.addEventListener("touchstart", press, {
    passive: false,
    signal: lifecycleController.signal,
  });
  btn.addEventListener("touchend", release, {
    passive: false,
    signal: lifecycleController.signal,
  });
  btn.addEventListener("touchcancel", release, {
    passive: false,
    signal: lifecycleController.signal,
  });
  btn.addEventListener("mousedown", press, {
    signal: lifecycleController.signal,
  });
  btn.addEventListener("mouseup", release, {
    signal: lifecycleController.signal,
  });
  btn.addEventListener("mouseleave", release, {
    signal: lifecycleController.signal,
  });
});

// ==========================================
// CRASH / RESPAWN
// ==========================================

function crash(reason, teleport, atX, atY) {
  if (motorcycle.invulnerable > 0 || gameState !== "playing") return;

  game.lives--;
  motorcycle.invulnerable = 1.6;

  const px = atX !== undefined ? atX : motorcycle.x;
  const py = atY !== undefined ? atY : motorcycle.y;

  spawnParticles(px, py, 14, "rgba(255,120,80,0.85)", 220);
  triggerShake(16, 0.45);

  let message = "¡CHOQUE! -1 VIDA";
  if (reason === "fell") message = "¡CAÍDA! -1 VIDA";
  if (reason === "badLanding") message = "MALA CAÍDA -1 VIDA";
  spawnToast(px, py - 60, message, "#ff4d5a");

  if (teleport) {
    motorcycle.x = world.lastSafeX;
    motorcycle.y = world.lastSafeY - motorcycle.height / 2;
    motorcycle.velocityX = Math.min(motorcycle.velocityX, 120);
    motorcycle.velocityY = 0;
    motorcycle.angle = 0;
    motorcycle.angularVelocity = 0;
    motorcycle.airborneRotation = 0;
    motorcycle.grounded = true;
  } else {
    motorcycle.velocityX *= 0.25;
    motorcycle.velocityY = Math.min(motorcycle.velocityY, -180);
  }

  if (game.lives <= 0) {
    endGame(reason);
  }
}

// ==========================================
// ACTUALIZAR JUEGO
// ==========================================

function update(deltaTime) {
  if (gameState !== "playing") {
    return;
  }

  // ======================================
  // ACELERACIÓN / FRENADO
  // ======================================

  if (keys["ArrowRight"]) {
    motorcycle.velocityX += motorcycle.acceleration * deltaTime;
  }
  if (keys["ArrowLeft"]) {
    motorcycle.velocityX -= motorcycle.brakeForce * deltaTime;
  }

  motorcycle.velocityX = clamp(motorcycle.velocityX, 0, game.maxSpeed);

  // ======================================
  // SALTO
  // ======================================

  if (keys[" "] && motorcycle.grounded) {
    motorcycle.velocityY = -650;
    motorcycle.grounded = false;
  }

  // ======================================
  // FÍSICA
  // ======================================

  motorcycle.velocityY += game.gravity * deltaTime;
  motorcycle.x += motorcycle.velocityX * deltaTime;
  motorcycle.y += motorcycle.velocityY * deltaTime;
  motorcycle.wheelSpin += motorcycle.velocityX * deltaTime * 0.09;

  // ======================================
  // TERRENO / ATERRIZAJE
  // ======================================

  const ground = getTerrainHeight(motorcycle.x);
  const wasGrounded = motorcycle.grounded;

  if (ground !== null) {
    const bottom = motorcycle.y + motorcycle.height / 2;

    if (bottom >= ground) {
      const aheadY = getTerrainHeight(motorcycle.x + 30);
      const behindY = getTerrainHeight(motorcycle.x - 30);
      const groundAngle =
        aheadY !== null && behindY !== null
          ? Math.atan2(aheadY - behindY, 60)
          : 0;

      if (!wasGrounded) {
        const diff = Math.abs(normalizeAngle(motorcycle.angle - groundAngle));

        if (diff > 2.05) {
          crash("badLanding", false, motorcycle.x, motorcycle.y);
        } else {
          const rot = Math.abs(motorcycle.airborneRotation);
          if (rot >= Math.PI * 1.9) {
            const flips = Math.floor(rot / (Math.PI * 2)) + 1;
            game.score += flips * 300;
            spawnToast(
              motorcycle.x,
              motorcycle.y - 70,
              "¡FLIP! +" + flips * 300,
              "#ffb300",
            );
          }
          spawnParticles(motorcycle.x, ground, 8, "rgba(200,190,170,0.6)", 130);
        }
      }

      motorcycle.y = ground - motorcycle.height / 2;
      motorcycle.velocityY = 0;
      motorcycle.grounded = true;
      motorcycle.angle = groundAngle;
      motorcycle.angularVelocity *= 0.3;
      motorcycle.airborneRotation = 0;

      world.lastSafeX = motorcycle.x;
      world.lastSafeY = ground;
    } else {
      motorcycle.grounded = false;
    }
  } else {
    motorcycle.grounded = false;
  }

  // ======================================
  // ROTACIÓN EN EL AIRE
  // ======================================

  if (!motorcycle.grounded) {
    const ROTATION_ACCEL = 7.5; // rad/s^2 mientras se mantiene la tecla
    const MAX_SPIN = 5.2; // rad/s máximo (~1 vuelta completa cada ~1.2s)

    if (keys["ArrowUp"]) {
      motorcycle.angularVelocity -= ROTATION_ACCEL * deltaTime;
    } else if (keys["ArrowDown"]) {
      motorcycle.angularVelocity += ROTATION_ACCEL * deltaTime;
    } else {
      // sin input: la moto se estabiliza suavemente en vez de seguir girando
      motorcycle.angularVelocity *= 0.965;
    }

    motorcycle.angularVelocity = clamp(
      motorcycle.angularVelocity,
      -MAX_SPIN,
      MAX_SPIN,
    );

    // ¡CLAVE! la velocidad angular se integra multiplicada por deltaTime,
    // igual que cualquier velocidad física (antes se sumaba directo y
    // provocaba giros descontrolados de varias vueltas por segundo).
    const rotationStep = motorcycle.angularVelocity * deltaTime;
    motorcycle.angle += rotationStep;
    motorcycle.airborneRotation += rotationStep;
  }

  // ======================================
  // CAÍDA FUERA DEL MUNDO (POZO)
  // ======================================

  if (motorcycle.y > KILL_Y) {
    crash("fell", true, motorcycle.x, GROUND_Y - 140);
  }

  // ======================================
  // POLVO DE RUEDAS
  // ======================================

  if (motorcycle.grounded && motorcycle.velocityX > 80) {
    spawnDust();
  }

  // ======================================
  // CÁMARA
  // ======================================

  const targetCamera = motorcycle.x - PLAYER_SCREEN_X;
  game.cameraX += (targetCamera - game.cameraX) * deltaTime * 5;

  // ======================================
  // DISTANCIA / PUNTUACIÓN / NIVEL
  // ======================================

  game.distance = Math.max(0, Math.floor((motorcycle.x - 250) / 10));
  game.score += motorcycle.velocityX * deltaTime * 0.12;

  const previousLevel = game.level;
  game.level = 1 + Math.floor(game.distance / 1000);
  game.maxSpeed = clamp(
    game.maxSpeedBase + (game.level - 1) * 18,
    game.maxSpeedBase,
    920,
  );

  if (game.level > previousLevel) {
    spawnToast(
      motorcycle.x,
      motorcycle.y - 90,
      "NIVEL " + game.level,
      "#7be0a0",
    );
  }

  // ======================================
  // INVULNERABILIDAD
  // ======================================

  if (motorcycle.invulnerable > 0) {
    motorcycle.invulnerable -= deltaTime;
  }

  // ======================================
  // MUNDO / COLISIONES / EFECTOS
  // ======================================

  checkCollisions();
  extendWorld(game.cameraX + WIDTH + 2600);
  pruneWorld(game.cameraX - 1300);
  updateEffects(deltaTime);
  updateHUD();
}

// ==========================================
// COLISIONES CON OBSTÁCULOS
// ==========================================

function checkCollisions() {
  if (motorcycle.invulnerable > 0) {
    return;
  }

  for (const obstacle of world.obstacles) {
    if (obstacle.hit) continue;

    const groundAtObstacle = getTerrainHeight(obstacle.x);
    if (groundAtObstacle === null) continue;

    const obstacleY = groundAtObstacle - obstacle.height / 2;
    const distanceX = Math.abs(motorcycle.x - obstacle.x);
    const distanceY = Math.abs(motorcycle.y - obstacleY);

    if (distanceX < 60 && distanceY < obstacle.height / 2 + 32) {
      obstacle.hit = true;
      crash("hit", false, obstacle.x, obstacleY);
      break;
    }
  }
}

// ==========================================
// GAME OVER
// ==========================================

function endGame(reason) {
  gameState = "gameover";

  const isNewRecord = game.distance > game.best;
  if (isNewRecord) {
    game.best = game.distance;
    saveBest(game.best);
  }

  const titles = {
    fell: "¡TE CAÍSTE EN UN POZO!",
    hit: "¡CHOCASTE!",
    badLanding: "¡MALA CAÍDA!",
  };

  document.getElementById("gameOverTitle").textContent =
    titles[reason] || "GAME OVER";
  document.getElementById("gameOverScreen").classList.remove("hidden");
  document.getElementById("finalScore").textContent = Math.floor(game.score);
  document.getElementById("finalDistance").textContent =
    Math.floor(game.distance) + " m";
  document.getElementById("finalLevel").textContent = game.level;

  document
    .getElementById("newRecordBadge")
    .classList.toggle("hidden", !isNewRecord);
}

// ==========================================
// HUD
// ==========================================

function updateHUD() {
  document.getElementById("levelValue").textContent = game.level;
  document.getElementById("distanceValue").textContent =
    Math.floor(game.distance) + " m";
  document.getElementById("scoreValue").textContent = Math.floor(game.score);
  document.getElementById("livesValue").textContent = "♥ ".repeat(
    Math.max(0, game.lives),
  );
  document.getElementById("recordValue").textContent =
    Math.max(game.best, game.distance) + " m";
}

// ==========================================
// DIBUJAR FONDO
// ==========================================

function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  gradient.addColorStop(0, "#17243b");
  gradient.addColorStop(0.55, "#60758a");
  gradient.addColorStop(1, "#d7a764");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // SOL
  ctx.fillStyle = "rgba(255,210,100,.8)";
  ctx.beginPath();
  ctx.arc(1020, 130, 55, 0, Math.PI * 2);
  ctx.fill();

  drawClouds();
  drawMountainLayer(0.06, 380, 110, "#223047");
  drawMountainLayer(0.15, 420, 150, "#293749");
}

function drawClouds() {
  ctx.fillStyle = "rgba(255,255,255,.18)";
  for (let i = 0; i < 5; i++) {
    const worldX = i * 420;
    const x = ((worldX - game.cameraX * 0.04) % (WIDTH + 300)) - 150;
    const y = 90 + (i % 3) * 45;
    ctx.beginPath();
    ctx.ellipse(x, y, 55, 18, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 40, y + 6, 38, 14, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawMountainLayer(parallax, baseY, amplitude, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, HEIGHT);
  for (let x = 0; x <= WIDTH; x += 80) {
    const y =
      baseY -
      Math.abs(Math.sin((x + game.cameraX * parallax) * 0.01)) * amplitude;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(WIDTH, HEIGHT);
  ctx.closePath();
  ctx.fill();
}

// ==========================================
// DIBUJAR POZOS (HUECOS DE SALTO)
// ==========================================

function drawPits() {
  for (const pit of world.pitZones) {
    const sx = pit.start - game.cameraX;
    const ex = pit.end - game.cameraX;
    if (ex < -50 || sx > WIDTH + 50) continue;

    const topY = Math.min(pit.liftY, pit.landY);

    // Fondo del cañón con degradado de profundidad (más oscuro hacia abajo)
    const depthGradient = ctx.createLinearGradient(0, topY, 0, HEIGHT);
    depthGradient.addColorStop(0, "#2a2118");
    depthGradient.addColorStop(0.18, "#171310");
    depthGradient.addColorStop(1, "#050506");

    ctx.fillStyle = depthGradient;
    ctx.beginPath();
    ctx.moveTo(sx, pit.liftY);
    ctx.lineTo(sx, HEIGHT);
    ctx.lineTo(ex, HEIGHT);
    ctx.lineTo(ex, pit.landY);
    ctx.closePath();
    ctx.fill();

    // Líneas verticales sutiles para dar textura rocosa al cañón
    ctx.save();
    ctx.clip();
    ctx.strokeStyle = "rgba(0,0,0,.35)";
    ctx.lineWidth = 3;
    for (let lx = sx + 14; lx < ex; lx += 26) {
      const t = (lx - sx) / Math.max(1, ex - sx);
      const edgeY = pit.liftY + (pit.landY - pit.liftY) * t;
      ctx.beginPath();
      ctx.moveTo(lx, edgeY + rand(4, 10));
      ctx.lineTo(lx + rand(-4, 4), HEIGHT);
      ctx.stroke();
    }
    ctx.restore();

    // franjas de peligro (cinta de advertencia) en cada borde del salto
    drawHazardEdge(sx, pit.liftY);
    drawHazardEdge(ex, pit.landY);
  }
}

function drawHazardEdge(x, y) {
  const stripeW = 11;
  const stripeH = 10;

  ctx.save();
  ctx.beginPath();
  ctx.rect(x - stripeW, y - stripeH / 2, stripeW * 2, stripeH);
  ctx.clip();

  ctx.fillStyle = "#1a1d22";
  ctx.fillRect(x - stripeW, y - stripeH / 2, stripeW * 2, stripeH);

  ctx.fillStyle = "#ffb300";
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.PI / 5);
  for (let i = -3; i <= 3; i++) {
    ctx.fillRect(i * 7 - 2, -18, 4, 36);
  }
  ctx.restore();

  ctx.restore();

  // pequeño poste indicador para reforzar la lectura visual del borde
  ctx.strokeStyle = "#ffb300";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y - stripeH / 2 - 2);
  ctx.lineTo(x, y - stripeH / 2 - 16);
  ctx.stroke();
}

// ==========================================
// DIBUJAR TERRENO
// ==========================================

function drawTerrain() {
  ctx.fillStyle = "#26372d";
  ctx.beginPath();

  // Cada tramo de suelo (separado por pozos) se dibuja como su propia
  // figura cerrada e independiente. Antes se usaba un único trazo
  // continuo que "parcheaba" el agujero con una línea diagonal de
  // relleno, tapando visualmente el pozo con el color de la tierra.
  let segmentOpen = false;
  let lastX = 0;

  for (let screenX = 0; screenX <= WIDTH; screenX += 16) {
    const worldX = screenX + game.cameraX;
    const y = getTerrainHeight(worldX);

    if (y === null) {
      if (segmentOpen) {
        ctx.lineTo(lastX, HEIGHT);
        segmentOpen = false;
      }
      continue;
    }

    if (!segmentOpen) {
      ctx.moveTo(screenX, HEIGHT);
      segmentOpen = true;
    }
    ctx.lineTo(screenX, y);
    lastX = screenX;
  }

  if (segmentOpen) {
    ctx.lineTo(lastX, HEIGHT);
  }

  ctx.fill();

  // BORDE DEL TERRENO
  ctx.strokeStyle = "#d2ad5b";
  ctx.lineWidth = 6;
  ctx.beginPath();
  let penDown = false;
  for (let screenX = 0; screenX <= WIDTH; screenX += 16) {
    const worldX = screenX + game.cameraX;
    const y = getTerrainHeight(worldX);
    if (y === null) {
      penDown = false;
      continue;
    }
    if (!penDown) {
      ctx.moveTo(screenX, y);
      penDown = true;
    } else {
      ctx.lineTo(screenX, y);
    }
  }
  ctx.stroke();
}

// ==========================================
// DIBUJAR OBSTÁCULOS
// ==========================================

function drawObstacles() {
  for (const obstacle of world.obstacles) {
    const screenX = obstacle.x - game.cameraX;
    if (screenX < -100 || screenX > WIDTH + 100) continue;

    const ground = getTerrainHeight(obstacle.x);
    if (ground === null) continue;

    const y = ground - obstacle.height;

    if (obstacle.type === "rock") drawRock(screenX, y, obstacle.height);
    else if (obstacle.type === "barrel")
      drawBarrel(screenX, y, obstacle.height);
    else drawCrate(screenX, y, obstacle.height);
  }
}

function drawRock(x, y, h) {
  const s = h / 50;
  ctx.fillStyle = "#626871";
  ctx.beginPath();
  ctx.moveTo(x - 28 * s, y + h);
  ctx.lineTo(x - 20 * s, y + h - 30 * s);
  ctx.lineTo(x, y);
  ctx.lineTo(x + 25 * s, y + h - 35 * s);
  ctx.lineTo(x + 30 * s, y + h);
  ctx.closePath();
  ctx.fill();
}

function drawBarrel(x, y, h) {
  ctx.fillStyle = "#9e4030";
  ctx.fillRect(x - 25, y, 50, h);
  ctx.strokeStyle = "#d9a45a";
  ctx.lineWidth = 5;
  ctx.strokeRect(x - 25, y, 50, h);
  ctx.fillStyle = "#e0d6c0";
  ctx.fillRect(x - 20, y + h * 0.4, 40, 5);
  if (h > 60) ctx.fillRect(x - 20, y + h * 0.7, 40, 5);
}

function drawCrate(x, y, h) {
  ctx.fillStyle = "#86572f";
  ctx.fillRect(x - 25, y, 50, h);
  ctx.strokeStyle = "#c28b50";
  ctx.lineWidth = 5;
  ctx.strokeRect(x - 25, y, 50, h);
  ctx.beginPath();
  ctx.moveTo(x - 20, y + 5);
  ctx.lineTo(x + 20, y + h - 5);
  ctx.moveTo(x + 20, y + 5);
  ctx.lineTo(x - 20, y + h - 5);
  ctx.stroke();
  if (h > 60) {
    ctx.strokeRect(x - 25, y, 50, 50);
  }
}

// ==========================================
// PARTÍCULAS Y AVISOS
// ==========================================

function drawParticles() {
  for (const p of world.particles) {
    const alpha = clamp(p.life / p.maxLife, 0, 1);
    ctx.fillStyle = p.color.replace(
      /[\d.]+\)$/,
      (alpha * 0.9).toFixed(2) + ")",
    );
    ctx.fillRect(
      p.x - game.cameraX - p.size / 2,
      p.y - p.size / 2,
      p.size,
      p.size,
    );
  }
}

function drawToasts() {
  ctx.textAlign = "center";
  for (const t of world.toasts) {
    const alpha = clamp(t.life / t.maxLife, 0, 1);
    ctx.font = "bold 26px 'Barlow Condensed', sans-serif";
    ctx.fillStyle = t.color;
    ctx.globalAlpha = alpha;
    ctx.fillText(t.text, t.x - game.cameraX, t.y);
    ctx.globalAlpha = 1;
  }
  ctx.textAlign = "left";
}

// ==========================================
// LÍNEAS DE VELOCIDAD
// ==========================================

function drawSpeedLines() {
  if (motorcycle.velocityX < game.maxSpeed * 0.8 || !motorcycle.grounded) {
    return;
  }
  const intensity = clamp(
    (motorcycle.velocityX - game.maxSpeed * 0.8) / (game.maxSpeed * 0.2),
    0,
    1,
  );
  ctx.strokeStyle = `rgba(255,255,255,${0.12 * intensity})`;
  ctx.lineWidth = 2;
  for (let i = 0; i < 6; i++) {
    const y = 100 + i * 90 + ((Date.now() / 4 + i * 60) % 90);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(60 + i * 8, y);
    ctx.stroke();
  }
}

// ==========================================
// DIBUJAR MOTO
// ==========================================

function drawMotorcycle() {
  const screenX = motorcycle.x - game.cameraX;
  const screenY = motorcycle.y;

  if (
    motorcycle.invulnerable > 0 &&
    Math.floor(motorcycle.invulnerable * 10) % 2 === 0
  ) {
    return;
  }

  ctx.save();
  ctx.translate(screenX, screenY);
  ctx.rotate(motorcycle.angle);

  // SOMBRA
  ctx.fillStyle = "rgba(0,0,0,.25)";
  ctx.beginPath();
  ctx.ellipse(0, 35, 55, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // RUEDAS
  drawWheel(-35, 15, motorcycle.wheelSpin);
  drawWheel(35, 15, motorcycle.wheelSpin);

  // CHASIS
  ctx.strokeStyle = "#ffb300";
  ctx.lineWidth = 7;
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(-35, 15);
  ctx.lineTo(-5, -15);
  ctx.lineTo(35, 15);
  ctx.lineTo(-35, 15);
  ctx.stroke();

  // CUERPO
  ctx.fillStyle = "#e74b32";
  ctx.beginPath();
  ctx.moveTo(-18, -18);
  ctx.lineTo(5, -30);
  ctx.lineTo(27, -14);
  ctx.lineTo(8, 0);
  ctx.lineTo(-12, -2);
  ctx.closePath();
  ctx.fill();

  // PILOTO
  ctx.fillStyle = "#15191f";
  ctx.fillRect(-7, -47, 18, 32);

  // CABEZA
  ctx.beginPath();
  ctx.arc(2, -55, 12, 0, Math.PI * 2);
  ctx.fill();

  // CASCO
  ctx.fillStyle = "#ffb300";
  ctx.beginPath();
  ctx.arc(2, -56, 12, Math.PI, Math.PI * 2);
  ctx.fill();

  // MANUBRIO
  ctx.strokeStyle = "#d0d5da";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(14, -23);
  ctx.lineTo(30, -31);
  ctx.stroke();

  ctx.restore();
}

function drawWheel(x, y, spin) {
  ctx.fillStyle = "#0b0d11";
  ctx.beginPath();
  ctx.arc(x, y, 20, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#737c87";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(x, y, 10, 0, Math.PI * 2);
  ctx.stroke();

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(spin);
  ctx.strokeStyle = "#9aa2ab";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-16, 0);
  ctx.lineTo(16, 0);
  ctx.moveTo(0, -16);
  ctx.lineTo(0, 16);
  ctx.stroke();
  ctx.restore();
}

// ==========================================
// RENDER
// ==========================================

function render() {
  ctx.save();

  if (game.shake.time > 0) {
    const m =
      game.shake.mag * (game.shake.time > 0.4 ? 1 : game.shake.time / 0.4);
    ctx.translate(rand(-m, m), rand(-m, m));
  }

  ctx.clearRect(-20, -20, WIDTH + 40, HEIGHT + 40);

  drawBackground();
  drawPits();
  drawTerrain();
  drawSpeedLines();
  drawObstacles();
  drawParticles();
  drawMotorcycle();
  drawToasts();

  ctx.restore();
}

// ==========================================
// GAME LOOP
// ==========================================

function gameLoop(time) {
  if (lifecycleController.signal.aborted) return;
  const deltaTime = Math.min((time - lastTime) / 1000, 0.033);
  lastTime = time;

  update(deltaTime);
  render();

  animationFrameId = requestAnimationFrame(gameLoop);
}

// ==========================================
// BOTONES
// ==========================================

document
  .getElementById("startBtn")
  .addEventListener("click", startGame, { signal: lifecycleController.signal });
document
  .getElementById("retryBtn")
  .addEventListener("click", startGame, { signal: lifecycleController.signal });
document
  .getElementById("pauseBtn")
  .addEventListener("click", togglePause, {
    signal: lifecycleController.signal,
  });
document
  .getElementById("resumeBtn")
  .addEventListener("click", resumeGame, {
    signal: lifecycleController.signal,
  });
document
  .getElementById("restartBtn")
  .addEventListener("click", startGame, { signal: lifecycleController.signal });

// ==========================================
// INICIO
// ==========================================

resetWorld();
updateHUD();
animationFrameId = requestAnimationFrame(gameLoop);
