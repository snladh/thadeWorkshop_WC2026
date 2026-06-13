/* ═══════════════════════════════════════════════════════════
   Dribble Rush — WC 2026 Family Challenge
   ═══════════════════════════════════════════════════════════ */

/* roundRect polyfill for older Safari */
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
    this.beginPath();
    this.moveTo(x + r, y);
    this.lineTo(x + w - r, y);
    this.quadraticCurveTo(x + w, y, x + w, y + r);
    this.lineTo(x + w, y + h - r);
    this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    this.lineTo(x + r, y + h);
    this.quadraticCurveTo(x, y + h, x, y + h - r);
    this.lineTo(x, y + r);
    this.quadraticCurveTo(x, y, x + r, y);
    this.closePath();
  };
}

/* ── Constants ── */
const PLAYER_X      = 110;
const GROUND_Y      = 155;
const OBS_W         = 20;
const OBS_H         = 42;
const JUMP_VEL      = -10.5;
const GRAVITY       = 0.6;
const INIT_SPEED    = 4.5;
const INIT_INTERVAL = 120;   // frames between obstacles
const LB_KEY        = 'dribble-rush-lb-v1';

/* ── State ── */
let character  = null;
let playerName = '';
let gameState  = 'idle'; // idle | playing | over

let playerY, playerVY, onGround;
let ballAngle, legAngle;
let obstacles, score, speed, obsInterval, frameCount, nextObs;
let animId = null;

/* ── DOM refs ── */
const modal        = document.getElementById('game-modal');
const gameClose    = document.getElementById('game-close');
const phaseChar    = document.getElementById('phase-character');
const phaseName    = document.getElementById('phase-name');
const phaseGame    = document.getElementById('phase-game');
const nameInput    = document.getElementById('player-name-input');
const startBtn     = document.getElementById('start-game-btn');
const goOverlay    = document.getElementById('gameover-overlay');
const goScoreText  = document.getElementById('go-score-text');
const goRecord     = document.getElementById('go-record');
const restartBtn   = document.getElementById('restart-btn');
const scoreDisplay = document.getElementById('game-score-display');
const lbList       = document.getElementById('game-lb-list');
const canvas       = document.getElementById('game-canvas');
const ctx          = canvas.getContext('2d');

/* ── Open game ── */
document.getElementById('play-dribble-rush').addEventListener('click', () => {
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  showPhase('character');
});

/* ── Close game ── */
gameClose.addEventListener('click', closeGame);
modal.addEventListener('click', e => { if (e.target === modal) closeGame(); });

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeGame(); return; }
  if ((e.code === 'Space' || e.key === ' ') && gameState === 'playing') {
    e.preventDefault();
    jump();
  }
});

canvas.addEventListener('click', () => { if (gameState === 'playing') jump(); });
canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  if (gameState === 'playing') jump();
}, { passive: false });

/* ── Character select ── */
document.querySelectorAll('.char-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    character = btn.dataset.char;
    showPhase('name');
    nameInput.value = '';
    nameInput.focus();
  });
});

/* ── Name entry ── */
nameInput.addEventListener('keydown', e => { if (e.key === 'Enter') startBtn.click(); });

startBtn.addEventListener('click', () => {
  const raw = nameInput.value.trim();
  if (!raw) { nameInput.focus(); return; }
  playerName = raw.slice(0, 10);
  showPhase('game');
  initGame();
});

/* ── Restart ── */
restartBtn.addEventListener('click', () => {
  goOverlay.classList.add('hidden');
  initGame();
});

/* ── Phase switcher ── */
function showPhase(phase) {
  phaseChar.classList.add('hidden');
  phaseName.classList.add('hidden');
  phaseGame.classList.add('hidden');
  if (phase === 'character') phaseChar.classList.remove('hidden');
  if (phase === 'name')      phaseName.classList.remove('hidden');
  if (phase === 'game')      phaseGame.classList.remove('hidden');
}

function closeGame() {
  cancelAnimationFrame(animId);
  gameState = 'idle';
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

/* ═══════════════════════════════════════════
   GAME ENGINE
   ═══════════════════════════════════════════ */

function initGame() {
  cancelAnimationFrame(animId);
  playerY      = GROUND_Y;
  playerVY     = 0;
  onGround     = true;
  ballAngle    = 0;
  legAngle     = 0;
  obstacles    = [];
  score        = 0;
  speed        = INIT_SPEED;
  obsInterval  = INIT_INTERVAL;
  frameCount   = 0;
  nextObs      = INIT_INTERVAL;
  gameState    = 'playing';
  scoreDisplay.textContent = 'Score: 0';
  renderLeaderboard();
  gameLoop();
}

function jump() {
  if (onGround) {
    playerVY = JUMP_VEL;
    onGround = false;
  }
}

function gameLoop() {
  update();
  draw();
  if (gameState === 'playing') {
    animId = requestAnimationFrame(gameLoop);
  }
}

/* ── Update ── */
function update() {
  frameCount++;
  legAngle  += 0.22;
  ballAngle += 0.18;

  /* Speed ramp every 250 frames */
  if (frameCount > 0 && frameCount % 250 === 0) {
    speed       = Math.min(speed + 0.6, 16);
    obsInterval = Math.max(obsInterval - 6, 60);
  }

  /* Player physics */
  if (!onGround) {
    playerVY += GRAVITY;
    playerY  += playerVY;
    if (playerY >= GROUND_Y) {
      playerY  = GROUND_Y;
      playerVY = 0;
      onGround = true;
    }
  }

  /* Spawn obstacle */
  nextObs--;
  if (nextObs <= 0) {
    const wide = Math.random() < 0.1;
    obstacles.push({ x: canvas.width + 20, scored: false, w: wide ? OBS_W * 2 : OBS_W });

    /* Trimodal gap: 20% close, 35% normal, 45% long */
    const roll = Math.random();
    if (roll < 0.20) {
      nextObs = Math.floor(obsInterval * 0.45 + Math.random() * 20);
    } else if (roll < 0.55) {
      nextObs = Math.floor(obsInterval * 0.8  + Math.random() * obsInterval * 0.45);
    } else {
      nextObs = Math.floor(obsInterval * 1.1  + Math.random() * obsInterval * 1.1);
    }
    nextObs = Math.max(nextObs, 45);
  }

  /* Move obstacles + score */
  for (const o of obstacles) {
    o.x -= speed;
    if (!o.scored && o.x + o.w < PLAYER_X) {
      o.scored = true;
      score++;
      scoreDisplay.textContent = `Score: ${score}`;
    }
  }

  /* Cull off-screen */
  obstacles = obstacles.filter(o => o.x > -80);

  /* Collision: AABB (slightly forgiving hitbox) */
  for (const o of obstacles) {
    const hit =
      PLAYER_X + 8  > o.x + 2 &&
      PLAYER_X - 8  < o.x + o.w - 2 &&
      playerY       > GROUND_Y - OBS_H + 4;
    if (hit) { endGame(); return; }
  }
}

function endGame() {
  gameState = 'over';
  cancelAnimationFrame(animId);
  const isRecord = saveScore();
  goScoreText.textContent = `Score: ${score}`;
  goRecord.classList.toggle('hidden', !isRecord);
  goOverlay.classList.remove('hidden');
  renderLeaderboard();
}

/* ═══════════════════════════════════════════
   DRAWING
   ═══════════════════════════════════════════ */

function draw() {
  const W = canvas.width;
  const H = canvas.height;

  /* Background */
  ctx.fillStyle = '#080f20';
  ctx.fillRect(0, 0, W, H);

  /* Scrolling pitch lines (decorative) */
  drawPitch(W, H);

  /* Obstacles */
  obstacles.forEach(drawObstacle);

  /* Player + ball */
  drawPlayer();
  drawBall();
}

/* Repeating vertical pitch lines that scroll with the game */
let pitchOffset = 0;
function drawPitch(W, H) {
  pitchOffset = (pitchOffset + speed * 0.5) % 80;

  ctx.strokeStyle = 'rgba(255,255,255,0.025)';
  ctx.lineWidth = 1;
  for (let x = -pitchOffset; x < W; x += 80) {
    ctx.beginPath();
    ctx.moveTo(x, GROUND_Y + 8);
    ctx.lineTo(x, H);
    ctx.stroke();
  }

  /* Ground line */
  ctx.strokeStyle = '#2a3a5e';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y + 6);
  ctx.lineTo(W, GROUND_Y + 6);
  ctx.stroke();

  /* Ground glow */
  const grad = ctx.createLinearGradient(0, GROUND_Y + 6, 0, H);
  grad.addColorStop(0, character === 'ronaldo' ? 'rgba(230,57,70,0.07)' : 'rgba(67,97,238,0.07)');
  grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.fillRect(0, GROUND_Y + 6, W, H - GROUND_Y - 6);
}

function drawPlayer() {
  const x    = PLAYER_X;
  const y    = playerY;
  const col  = character === 'ronaldo' ? '#e63946' : '#4361ee';
  const dark = character === 'ronaldo' ? '#a01822' : '#2a38a0';
  const skin = '#f0c090';

  ctx.save();

  /* Shadow on ground */
  const shadowScale = Math.max(0.3, 1 - (GROUND_Y - y) / (GROUND_Y * 0.7));
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.beginPath();
  ctx.ellipse(x, GROUND_Y + 5, 14 * shadowScale, 4 * shadowScale, 0, 0, Math.PI * 2);
  ctx.fill();

  /* Running leg animation */
  const swing = onGround ? Math.sin(legAngle) * 7 : 0;

  /* Left leg */
  ctx.fillStyle = skin;
  ctx.fillRect(x - 10, y - 16, 8, 17 + swing);
  /* Right leg */
  ctx.fillStyle = skin;
  ctx.fillRect(x + 2,  y - 16, 8, 17 - swing);

  /* Shoes */
  ctx.fillStyle = '#111';
  ctx.fillRect(x - 11, y + swing,      11, 5);
  ctx.fillRect(x + 1,  y - swing,      11, 5);

  /* Shorts */
  ctx.fillStyle = dark;
  ctx.fillRect(x - 11, y - 22, 22, 10);

  /* Jersey */
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.roundRect(x - 12, y - 50, 24, 31, 4);
  ctx.fill();

  /* Jersey number */
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.font = 'bold 11px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(character === 'ronaldo' ? '7' : '10', x, y - 35);

  /* Head */
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.arc(x, y - 62, 12, 0, Math.PI * 2);
  ctx.fill();

  /* Hair */
  ctx.fillStyle = character === 'ronaldo' ? '#111' : '#7B3F00';
  ctx.beginPath();
  ctx.arc(x, y - 68, 10.5, Math.PI, 0);
  ctx.fill();

  ctx.restore();
}

function drawBall() {
  /* Ball bounces near the player's right foot */
  const bx = PLAYER_X + 20;
  const by = playerY - 3 + Math.abs(Math.sin(ballAngle)) * 11;

  /* Shadow */
  const shadowSize = 0.4 + 0.6 * (1 - Math.abs(Math.sin(ballAngle)));
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath();
  ctx.ellipse(bx, GROUND_Y + 5, 8 * shadowSize, 2.5 * shadowSize, 0, 0, Math.PI * 2);
  ctx.fill();

  /* Ball body */
  ctx.fillStyle = '#eee';
  ctx.beginPath();
  ctx.arc(bx, by, 7, 0, Math.PI * 2);
  ctx.fill();

  /* Seams */
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.arc(bx, by, 7, 0, Math.PI * 2);
  ctx.stroke();
  /* Simple cross seams */
  ctx.beginPath();
  ctx.moveTo(bx - 4, by - 3);
  ctx.lineTo(bx + 1, by + 5);
  ctx.moveTo(bx + 4, by - 3);
  ctx.lineTo(bx - 1, by + 5);
  ctx.stroke();
}

function drawObstacle(obs) {
  const x  = obs.x;
  const w  = obs.w;
  const yt = GROUND_Y - OBS_H;

  /* Posts */
  ctx.fillStyle = '#16a34a';
  ctx.fillRect(x,         yt, 6, OBS_H);
  ctx.fillRect(x + w - 6, yt, 6, OBS_H);

  /* Crossbar */
  ctx.fillStyle = '#22c55e';
  ctx.fillRect(x, yt, w, 6);

  /* Crossbar shine */
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.fillRect(x + 1, yt + 1, w - 2, 2);
}

/* ═══════════════════════════════════════════
   LEADERBOARD (localStorage)
   ═══════════════════════════════════════════ */

function getScores() {
  try { return JSON.parse(localStorage.getItem(LB_KEY)) || []; }
  catch { return []; }
}

function saveScore() {
  const scores    = getScores();
  const qualifies = scores.length < 3 || score > scores[scores.length - 1].score;
  if (qualifies) {
    scores.push({ name: playerName, character, score });
    scores.sort((a, b) => b.score - a.score);
    scores.splice(3);
    localStorage.setItem(LB_KEY, JSON.stringify(scores));
  }
  return qualifies;
}

function renderLeaderboard() {
  const scores = getScores();
  if (!scores.length) {
    lbList.innerHTML = '<p class="game-lb-empty">No scores yet</p>';
    return;
  }
  const medals = ['🥇', '🥈', '🥉'];
  lbList.innerHTML = scores.map((s, i) => `
    <div class="game-lb-row">
      <span class="game-lb-rank">${medals[i]}</span>
      <span class="game-lb-name">
        ${s.character === 'ronaldo' ? 'Ronaldo' : 'Messi'}
        <small>(${s.name})</small>
      </span>
      <span class="game-lb-pts">${s.score}</span>
    </div>
  `).join('');
}
