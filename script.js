const images = [];
for (let i = 1; i <= 197; i++) {
  images.push(`images/image${i}.jpeg`);
}

const FINAL_MESSAGE = `You see, after all the joy and sorrow, we made it to 187 days of meeting each other. I’ve been falling in love with you for 294 days, and we’ve met each other every single day for 187 days straight. That’s such an incredible thing, and honestly, I never thought we would make it this far so naturally. We never set it as a goal, but somehow, day by day, we did it together.

Every day with you feels like a gift to me. We’ve shared so much happiness and so many unforgettable memories, from fine dining dates to simple casual walks, from study sessions to all the little things we ended up doing together. No matter what it was, as long as it was with you, it became special.

Sometimes, we made each other sad. Sometimes we got hurt, sometimes we cried. But even then, we stayed. We sat down, talked calmly, held each other, forgave each other, and kept choosing one another.

A long time ago, I learned a quote from Bob Ross, and I saw it again yesterday: “There are no mistakes, only happy accidents.” And I think that’s beautiful. We may not forget every sad moment, but we forgive, let go, and keep moving forward together.

To keep this short, I just want to say that I love you more than I could ever fully put into words. And I risk it all for you, my darling.

Happy streak, and to many more to come! ❤️`;

const IMAGE_SHOW_MS = 500; // longer time on screen
const MOVE_GAP_MS = 300; // slower transition
const PAUSE_BEFORE_FIREWORK_MS = 900;
const PAUSE_AFTER_FIREWORK_MS = 1800;
const TYPING_SPEED_MS = 32;

const intro = document.getElementById("intro");
const experience = document.getElementById("experience");
const finalScreen = document.getElementById("final");

const startBtn = document.getElementById("startBtn");
const timelineImage = document.getElementById("timelineImage");
const imageCounter = document.getElementById("imageCounter");
const mosaicContainer = document.getElementById("mosaicContainer");
const previewFrame = document.getElementById("previewFrame");
const stage = document.getElementById("stage");
const finalMessage = document.getElementById("finalMessage");
const bgMusic = document.getElementById("bgMusic");

let targetPoints = [];
let tileSize = 56;

function showScreen(screenToShow) {
  [intro, experience, finalScreen].forEach((screen) => {
    screen.classList.remove("active");
    screen.classList.add("hidden");
  });

  screenToShow.classList.remove("hidden");
  screenToShow.classList.add("active");
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function startMusic() {
  if (!bgMusic) return;

  bgMusic.volume = 0.35;
  bgMusic.loop = true;

  try {
    await bgMusic.play();
  } catch (error) {
    console.log("Music could not start:", error);
  }
}

async function typeMessage(text) {
  finalMessage.textContent = "";

  for (let i = 0; i < text.length; i++) {
    finalMessage.textContent += text[i];
    await wait(TYPING_SPEED_MS);
  }
}

function getResponsiveTileSize() {
  if (window.innerWidth <= 768) return 18;
  if (window.innerWidth <= 900) return 24;
  return 30;
}

function setupMosaicGuide() {
  mosaicContainer.innerHTML = "";
  const guide = document.createElement("div");
  guide.className = "mosaic-guide";
  guide.textContent = "187";
  mosaicContainer.appendChild(guide);
}

function generate187Points(count) {
  const box = mosaicContainer.getBoundingClientRect();
  const width = Math.max(320, Math.floor(box.width));
  const height = Math.max(180, Math.floor(box.height));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "black";

  const fontSize = Math.min(width * 0.5, height * 0.88);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `700 ${fontSize}px "Cormorant Garamond", serif`;
  ctx.fillText("187", width / 2, height / 2);

  const data = ctx.getImageData(0, 0, width, height).data;
  const candidates = [];

  const minDistance = tileSize * 0.92;
  const step = Math.max(2, Math.floor(tileSize * 0.35));

  for (let y = step; y < height - step; y += step) {
    for (let x = step; x < width - step; x += step) {
      const idx = (y * width + x) * 4;
      if (data[idx + 3] > 20) {
        candidates.push({ x, y });
      }
    }
  }

  const selected = [];

  for (const point of candidates) {
    let tooClose = false;

    for (const chosen of selected) {
      const dx = point.x - chosen.x;
      const dy = point.y - chosen.y;
      if (Math.sqrt(dx * dx + dy * dy) < minDistance) {
        tooClose = true;
        break;
      }
    }

    if (!tooClose) {
      selected.push(point);
    }

    if (selected.length >= count) break;
  }

  if (selected.length < count) {
    for (const point of candidates) {
      if (selected.length >= count) break;

      const exists = selected.some((p) => p.x === point.x && p.y === point.y);
      if (!exists) selected.push(point);
    }
  }

  const actual = selected.slice(0, count);

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const p of actual) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }

  const shapeWidth = maxX - minX;
  const shapeHeight = maxY - minY;

  const offsetX = (width - shapeWidth) / 2 - minX;
  const offsetY = (height - shapeHeight) / 2 - minY;

  return actual.map((p) => ({
    x: p.x + offsetX,
    y: p.y + offsetY
  }));
}

function buildTargets() {
  tileSize = getResponsiveTileSize();
  setupMosaicGuide();

  const stageRect = stage.getBoundingClientRect();
  const mosaicRect = mosaicContainer.getBoundingClientRect();
  const points = generate187Points(images.length);

  targetPoints = points.map((point) => ({
    left: mosaicRect.left - stageRect.left + point.x - tileSize / 2,
    top: mosaicRect.top - stageRect.top + point.y - tileSize / 2
  }));
}

function createFlyingTile(src, target) {
  const stageRect = stage.getBoundingClientRect();
  const previewRect = previewFrame.getBoundingClientRect();

  const startWidth = previewRect.width * 0.42;
  const startHeight = previewRect.height * 0.42;
  const startLeft = previewRect.left - stageRect.left + (previewRect.width - startWidth) / 2;
  const startTop = previewRect.top - stageRect.top + (previewRect.height - startHeight) / 2;

  const tile = document.createElement("div");
  tile.className = "flying-tile";
  tile.style.backgroundImage = `url("${src}")`;
  tile.style.left = `${startLeft}px`;
  tile.style.top = `${startTop}px`;
  tile.style.width = `${startWidth}px`;
  tile.style.height = `${startHeight}px`;
  tile.style.borderRadius = "18px";
  tile.style.opacity = "1";
  tile.style.transform = "scale(1)";

  stage.appendChild(tile);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      tile.style.left = `${target.left}px`;
      tile.style.top = `${target.top}px`;
      tile.style.width = `${tileSize}px`;
      tile.style.height = `${tileSize}px`;
      tile.style.borderRadius = "8px";
      tile.style.transform = "scale(1)";
      tile.classList.add("placed");
    });
  });

  return tile;
}

async function playExperience() {
  showScreen(experience);
  buildTargets();

  for (let i = 0; i < images.length; i++) {
    const src = images[i];

    timelineImage.classList.remove("hide");
    timelineImage.classList.remove("show");

    imageCounter.textContent = `memory ${i + 1} / ${images.length}`;

    const loaded = await new Promise((resolve) => {
      timelineImage.onload = () => resolve(true);
      timelineImage.onerror = () => {
        console.error("Failed to load:", src);
        resolve(false);
      };
      timelineImage.src = src;
    });

    if (loaded) {
      timelineImage.classList.add("show");
      await wait(IMAGE_SHOW_MS);

      timelineImage.classList.add("hide");

      const target = targetPoints[i];
      createFlyingTile(src, target);
    }

    await wait(MOVE_GAP_MS);
  }

  imageCounter.textContent = "";
  timelineImage.classList.remove("show");
  timelineImage.classList.remove("hide");

  await wait(PAUSE_BEFORE_FIREWORK_MS);
  await launchHeartFireworks();

  showScreen(finalScreen);
  await typeMessage(FINAL_MESSAGE);
}

startBtn.addEventListener("click", async () => {
  startBtn.disabled = true;
  await startMusic();
  await playExperience();
});

window.addEventListener("resize", () => {
  if (experience.classList.contains("active")) {
    buildTargets();
  }
});

const canvas = document.getElementById("fireworks");
const ctx = canvas.getContext("2d");
let cw = 0;
let ch = 0;
let particles = [];
let animationRunning = false;

function resizeCanvas() {
  cw = canvas.width = window.innerWidth;
  ch = canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

class Particle {
  constructor(x, y, tx, ty, life = 100, size = 2) {
    this.x = x;
    this.y = y;
    this.tx = tx;
    this.ty = ty;
    this.life = life;
    this.maxLife = life;
    this.size = size;
    this.vx = (tx - x) / 25;
    this.vy = (ty - y) / 25;
    this.alpha = 1;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life--;
    this.alpha = this.life / this.maxLife;
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 210, 220, 0.95)";
    ctx.shadowBlur = 18;
    ctx.shadowColor = "rgba(255, 170, 190, 0.9)";
    ctx.fill();
    ctx.restore();
  }
}

function heartPoints(centerX, centerY, scale, count = 160) {
  const points = [];
  for (let i = 0; i < count; i++) {
    const t = (Math.PI * 2 * i) / count;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y =
      13 * Math.cos(t) -
      5 * Math.cos(2 * t) -
      2 * Math.cos(3 * t) -
      Math.cos(4 * t);

    points.push({
      x: centerX + x * scale,
      y: centerY - y * scale
    });
  }
  return points;
}

function burstHeart(centerX, centerY, scale) {
  const points = heartPoints(centerX, centerY, scale, 180);
  points.forEach((p, index) => {
    if (index % 2 === 0) {
      particles.push(
        new Particle(
          centerX,
          centerY,
          p.x,
          p.y,
          90 + Math.random() * 20,
          2 + Math.random() * 1.2
        )
      );
    }
  });
}

function animateFireworks() {
  if (!animationRunning) return;

  ctx.fillStyle = "rgba(10, 2, 4, 0.16)";
  ctx.fillRect(0, 0, cw, ch);

  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].draw();
    if (particles[i].life <= 0) {
      particles.splice(i, 1);
    }
  }

  if (particles.length > 0) {
    requestAnimationFrame(animateFireworks);
  } else {
    animationRunning = false;
    ctx.clearRect(0, 0, cw, ch);
  }
}

async function launchHeartFireworks() {
  animationRunning = true;
  particles = [];
  ctx.clearRect(0, 0, cw, ch);

  const cx = cw / 2;
  const cy = ch / 2;
  const baseScale = Math.min(cw, ch) * 0.013;

  burstHeart(cx, cy, baseScale);
  animateFireworks();

  await wait(700);
  burstHeart(cx, cy, baseScale * 1.25);

  await wait(850);
  burstHeart(cx, cy, baseScale * 1.55);

  await wait(PAUSE_AFTER_FIREWORK_MS);
}