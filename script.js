const SUBMISSION_URL = "https://script.google.com/macros/s/AKfycbwIQBtuuPCsBAr27TyXdYEAzrwkidqYWGtaOjFZRydbr0gQ6txnSiXtQCK2FkZM33iG/exec";

const form = document.getElementById("complaint-form");
const statusEl = document.getElementById("status");
const submitBtn = form.querySelector(".submit-btn");
const achievement = document.getElementById("achievement");
const canvas = document.getElementById("confetti-canvas");
const ctx = canvas.getContext("2d");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!form.checkValidity()) {
    setStatus("Please fill out every field before submitting.", "error");
    form.reportValidity();
    return;
  }

  const payload = {
    segment: form.segment.value,
    category: form.category.value,
    details: form.details.value.trim(),
    website: form.website.value,
    userAgent: navigator.userAgent,
  };

  if (!SUBMISSION_URL) {
    console.log("Complaint (no endpoint configured yet):", payload);
    setStatus("Submission endpoint not configured yet — logged to console.", "error");
    return;
  }

  submitBtn.disabled = true;
  setStatus("Submitting…");

  try {
    const res = await fetch(SUBMISSION_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok || result.ok === false) {
      throw new Error(result.error || `HTTP ${res.status}`);
    }
    setStatus("Thanks — your complaint was submitted.", "success");
    form.reset();
    celebrate();
  } catch (err) {
    console.error(err);
    setStatus("Something went wrong. Please try again in a moment.", "error");
  } finally {
    submitBtn.disabled = false;
  }
});

function setStatus(message, kind = "") {
  statusEl.textContent = message;
  statusEl.className = kind ? `status ${kind}` : "status";
}

/* ---------- Celebration ---------- */

function celebrate() {
  showAchievement();
  burstConfetti();
}

function showAchievement() {
  achievement.classList.remove("show");
  // force reflow so the animation can restart on rapid resubmits
  void achievement.offsetWidth;
  achievement.classList.add("show");
}

const BASES = [
  { ch: "A", color: "#e64545" },
  { ch: "T", color: "#4a8cef" },
  { ch: "G", color: "#22a06b" },
  { ch: "C", color: "#f5b423" },
];

let confettiActive = false;
let logicalWidth = window.innerWidth;
let logicalHeight = window.innerHeight;

function burstConfetti() {
  resizeCanvas();
  if (confettiActive) return;
  const particles = createParticles(120);
  confettiActive = true;
  const start = performance.now();
  const duration = 3800;

  function frame(now) {
    const elapsed = now - start;
    ctx.clearRect(0, 0, logicalWidth, logicalHeight);
    let alive = false;
    for (const p of particles) {
      step(p);
      if (p.y < logicalHeight + 40 && p.opacity > 0.02) alive = true;
      draw(p);
    }
    if (alive && elapsed < duration) {
      requestAnimationFrame(frame);
    } else {
      ctx.clearRect(0, 0, logicalWidth, logicalHeight);
      confettiActive = false;
    }
  }
  requestAnimationFrame(frame);
}

function createParticles(n) {
  const cx = logicalWidth / 2;
  const cy = logicalHeight * 0.55;
  const arr = [];
  for (let i = 0; i < n; i++) {
    const base = BASES[i % BASES.length];
    const angle = (-Math.PI / 2) + (Math.random() - 0.5) * Math.PI * 0.9;
    const speed = 9 + Math.random() * 9;
    arr.push({
      x: cx + (Math.random() - 0.5) * 30,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.3,
      size: 16 + Math.random() * 12,
      ch: base.ch,
      color: base.color,
      opacity: 1,
      gravity: 0.32 + Math.random() * 0.1,
      drag: 0.992,
    });
  }
  return arr;
}

function step(p) {
  p.vx *= p.drag;
  p.vy = p.vy * p.drag + p.gravity;
  p.x += p.vx;
  p.y += p.vy;
  p.rot += p.vr;
  if (p.y > logicalHeight * 0.85) {
    p.opacity = Math.max(0, p.opacity - 0.02);
  }
}

function draw(p) {
  ctx.save();
  ctx.globalAlpha = p.opacity;
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rot);
  ctx.fillStyle = p.color;
  ctx.font = `bold ${p.size}px -apple-system, "Segoe UI", system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = p.color;
  ctx.shadowBlur = 6;
  ctx.fillText(p.ch, 0, 0);
  ctx.restore();
}

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  logicalWidth = window.innerWidth;
  logicalHeight = window.innerHeight;
  canvas.width = logicalWidth * dpr;
  canvas.height = logicalHeight * dpr;
  canvas.style.width = logicalWidth + "px";
  canvas.style.height = logicalHeight + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener("resize", () => {
  if (confettiActive) resizeCanvas();
});
