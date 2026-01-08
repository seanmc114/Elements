/* Element Builder • Synge Street Learning Games
   FIX: Undo / Skip / Clear always work (no click-blocking overlay during play)
   - Quick feedback uses toast instead of overlay
   - Overlay only used for end-of-game screen
*/

const $ = (id) => document.getElementById(id);

const modeSelect   = $("modeSelect");
const levelSelect  = $("levelSelect");
const strictToggle = $("strictToggle");
const soundBtn     = $("soundBtn");
const startBtn     = $("startBtn");

const modePill   = $("modePill");
const timerPill  = $("timerPill");
const scorePill  = $("scorePill");
const bestPill   = $("bestPill");
const streakPill = $("streakPill");
const poolPill   = $("poolPill");

const promptText = $("promptText");
const promptHint = $("promptHint");

const formulaPreview = $("formulaPreview");
const tapRow   = $("tapRow");
const undoBtn  = $("undoBtn");
const clearBtn = $("clearBtn");
const skipBtn  = $("skipBtn");
const submitBtn= $("submitBtn");

const toast   = $("toast");
const overlay = $("overlay");
const overlayCard = $("overlayCard");
const ptable  = $("ptable");

let soundOn = true;
let gameState = "idle"; // idle | running | ended
let mode = "practice";
let strictness = "teach";
let levelKey = "level1";

let score = 0;
let streak = 0;
let selection = [];
let currentTarget = null;

const sprintSeconds = 60;
let timeLeft = sprintSeconds;
let timerHandle = null;

// ====== compounds (expanded) ======
const COMPOUND_SETS = {
  level1: [
    { name:"Water", formulaOrder:["H","O"], composition:{H:2,O:1}, hint:"2 hydrogen + 1 oxygen" },
    { name:"Carbon dioxide", formulaOrder:["C","O"], composition:{C:1,O:2}, hint:"CO₂" },
    { name:"Salt (Sodium chloride)", formulaOrder:["Na","Cl"], composition:{Na:1,Cl:1}, hint:"Table salt" },
    { name:"Ammonia", formulaOrder:["N","H"], composition:{N:1,H:3}, hint:"NH₃" },
    { name:"Methane", formulaOrder:["C","H"], composition:{C:1,H:4}, hint:"CH₄" },
    { name:"Hydrogen peroxide", formulaOrder:["H","O"], composition:{H:2,O:2}, hint:"H₂O₂" },
    { name:"Magnesium oxide", formulaOrder:["Mg","O"], composition:{Mg:1,O:1}, hint:"MgO" },
    { name:"Calcium chloride", formulaOrder:["Ca","Cl"], composition:{Ca:1,Cl:2}, hint:"CaCl₂" },
    { name:"Iron(III) oxide", formulaOrder:["Fe","O"], composition:{Fe:2,O:3}, hint:"Fe₂O₃ (rust)" },
  ],
  level2: [
    { name:"Oxygen", formulaOrder:["O"], composition:{O:2}, hint:"O₂" },
    { name:"Nitrogen", formulaOrder:["N"], composition:{N:2}, hint:"N₂" },
    { name:"Hydrogen", formulaOrder:["H"], composition:{H:2}, hint:"H₂" },
    { name:"Carbon monoxide", formulaOrder:["C","O"], composition:{C:1,O:1}, hint:"CO" },
    { name:"Sulfur dioxide", formulaOrder:["S","O"], composition:{S:1,O:2}, hint:"SO₂" },
    { name:"Nitrogen dioxide", formulaOrder:["N","O"], composition:{N:1,O:2}, hint:"NO₂" },
    { name:"Ozone", formulaOrder:["O"], composition:{O:3}, hint:"O₃" },
  ],
  level3: [
    { name:"Hydrochloric acid", formulaOrder:["H","Cl"], composition:{H:1,Cl:1}, hint:"HCl" },
    { name:"Nitric acid", formulaOrder:["H","N","O"], composition:{H:1,N:1,O:3}, hint:"HNO₃" },
    { name:"Sulfuric acid", formulaOrder:["H","S","O"], composition:{H:2,S:1,O:4}, hint:"H₂SO₄" },
    { name:"Sodium hydroxide", formulaOrder:["Na","O","H"], composition:{Na:1,O:1,H:1}, hint:"NaOH" },
    { name:"Calcium hydroxide", formulaOrder:["Ca","O","H"], composition:{Ca:1,O:2,H:2}, hint:"Ca(OH)₂ (tap Ca O O H H)" },
  ],
  level4: [
    { name:"Sodium oxide", formulaOrder:["Na","O"], composition:{Na:2,O:1}, hint:"Na₂O" },
    { name:"Potassium oxide", formulaOrder:["K","O"], composition:{K:2,O:1}, hint:"K₂O" },
    { name:"Aluminium oxide", formulaOrder:["Al","O"], composition:{Al:2,O:3}, hint:"Al₂O₃" },
    { name:"Silicon dioxide", formulaOrder:["Si","O"], composition:{Si:1,O:2}, hint:"SiO₂" },
    { name:"Copper(I) oxide", formulaOrder:["Cu","O"], composition:{Cu:2,O:1}, hint:"Cu₂O" },
  ],
  level5: [
    { name:"Glucose", formulaOrder:["C","H","O"], composition:{C:6,H:12,O:6}, hint:"C₆H₁₂O₆" },
    { name:"Ethanol", formulaOrder:["C","H","O"], composition:{C:2,H:6,O:1}, hint:"C₂H₆O" },
    { name:"Propane", formulaOrder:["C","H"], composition:{C:3,H:8}, hint:"C₃H₈" },
    { name:"Butane", formulaOrder:["C","H"], composition:{C:4,H:10}, hint:"C₄H₁₀" },
    { name:"Calcium carbonate", formulaOrder:["Ca","C","O"], composition:{Ca:1,C:1,O:3}, hint:"CaCO₃" },
  ],
};

// ====== elements (covering what we need; you can swap back to full 118 later) ======
const ELEMENTS = [
  { z:1, s:"H", n:"Hydrogen", p:1, g:1, c:"nonmetal" },
  { z:2, s:"He", n:"Helium", p:1, g:18, c:"noble" },
  { z:6, s:"C", n:"Carbon", p:2, g:14, c:"nonmetal" },
  { z:7, s:"N", n:"Nitrogen", p:2, g:15, c:"nonmetal" },
  { z:8, s:"O", n:"Oxygen", p:2, g:16, c:"nonmetal" },
  { z:9, s:"F", n:"Fluorine", p:2, g:17, c:"halogen" },
  { z:11, s:"Na", n:"Sodium", p:3, g:1, c:"alkali" },
  { z:12, s:"Mg", n:"Magnesium", p:3, g:2, c:"alkaline" },
  { z:13, s:"Al", n:"Aluminium", p:3, g:13, c:"post" },
  { z:14, s:"Si", n:"Silicon", p:3, g:14, c:"metalloid" },
  { z:16, s:"S", n:"Sulfur", p:3, g:16, c:"nonmetal" },
  { z:17, s:"Cl", n:"Chlorine", p:3, g:17, c:"halogen" },
  { z:19, s:"K", n:"Potassium", p:4, g:1, c:"alkali" },
  { z:20, s:"Ca", n:"Calcium", p:4, g:2, c:"alkaline" },
  { z:26, s:"Fe", n:"Iron", p:4, g:8, c:"transition" },
  { z:29, s:"Cu", n:"Copper", p:4, g:11, c:"transition" },
];

// ====== helpers ======
function showToast(msg){
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), 950);
}

function subscriptNumber(num){
  const map = { "0":"₀","1":"₁","2":"₂","3":"₃","4":"₄","5":"₅","6":"₆","7":"₇","8":"₈","9":"₉" };
  return String(num).split("").map(ch => map[ch] ?? ch).join("");
}

function selectionCounts(sel){
  const counts = {};
  for(const sym of sel) counts[sym] = (counts[sym] || 0) + 1;
  return counts;
}

function renderFormula(order, counts){
  let out = "";
  for(const sym of order){
    const ct = counts[sym] || 0;
    if(ct <= 0) continue;
    out += sym;
    if(ct > 1) out += subscriptNumber(ct);
  }
  return out || "—";
}

function sameCounts(a, b){
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for(const k of keys){
    if((a[k] || 0) !== (b[k] || 0)) return false;
  }
  return true;
}

function canonicalTapSequence(target){
  const seq = [];
  for(const sym of target.formulaOrder){
    const ct = target.composition[sym] || 0;
    for(let i=0;i<ct;i++) seq.push(sym);
  }
  return seq;
}

function arraysEqual(a,b){
  if(a.length !== b.length) return false;
  for(let i=0;i<a.length;i++) if(a[i] !== b[i]) return false;
  return true;
}

// ====== audio ======
let audioCtx = null;
function beep(type){
  if(!soundOn) return;
  if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const now = audioCtx.currentTime;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();

  let freq = 440, dur = 0.10;
  if(type === "good"){ freq = 760; dur = 0.09; }
  if(type === "bad"){ freq = 180; dur = 0.13; }
  if(type === "warn"){ freq = 520; dur = 0.11; }
  if(type === "tap"){ freq = 420; dur = 0.05; }

  o.frequency.value = freq;
  o.type = "sine";
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(0.12, now + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, now + dur);

  o.connect(g);
  g.connect(audioCtx.destination);
  o.start(now);
  o.stop(now + dur + 0.02);
}

// ====== storage ======
function bestKey(){ return `element-builder::best::${mode}::${levelKey}::${strictness}`; }
function getBest(){ return Number(localStorage.getItem(bestKey()) || "0"); }
function setBest(val){ localStorage.setItem(bestKey(), String(val)); }

// ====== UI ======
function setPills(){
  modePill.textContent = mode === "practice" ? "Practice" : mode === "sprint" ? "Sprint" : "Streak";
  scorePill.textContent = `Score: ${score}`;
  bestPill.textContent = `Best: ${getBest()}`;
  streakPill.textContent = `Streak: ${streak}`;
  timerPill.textContent = (mode === "sprint") ? `${timeLeft}s` : "∞";
  poolPill.textContent = `Pool: ${(COMPOUND_SETS[levelKey] || []).length}`;
}

function refreshBuildUI(){
  const counts = selectionCounts(selection);
  const order = currentTarget?.formulaOrder || Object.keys(counts);
  formulaPreview.textContent = currentTarget ? renderFormula(order, counts) : "—";

  tapRow.innerHTML = "";
  for(const sym of selection){
    const tok = document.createElement("div");
    tok.className = "tapToken";
    tok.textContent = sym;
    tapRow.appendChild(tok);
  }
}

function pickTarget(){
  const set = COMPOUND_SETS[levelKey] || COMPOUND_SETS.level1;
  currentTarget = set[Math.floor(Math.random() * set.length)];
  promptText.textContent = currentTarget.name;
  promptHint.textContent = currentTarget.hint || "";
  selection = [];
  refreshBuildUI();
  setPills();
}

function stopTimer(){
  if(timerHandle){
    clearInterval(timerHandle);
    timerHandle = null;
  }
}

function startTimer(){
  stopTimer();
  timerHandle = setInterval(() => {
    timeLeft--;
    setPills();
    if(timeLeft <= 0) endGame("Time’s up!");
  }, 1000);
}

// ====== end screen ======
function endGame(reason){
  gameState = "ended";
  stopTimer();
  setPills();

  const best = getBest();
  if(score > best) setBest(score);

  overlay.classList.add("show");
  overlay.setAttribute("aria-hidden", "false");

  overlayCard.innerHTML = `
    <h2>Game Over</h2>
    <div class="big">${score} pts</div>
    <p>${reason}</p>
    <div class="row">
      <span class="tag">Mode: ${mode}</span>
      <span class="tag">Set: ${levelKey}</span>
      <span class="tag">Order: ${strictness}</span>
      <span class="tag">Best: ${Math.max(score, best)} pts</span>
    </div>
    <div class="row" style="margin-top:14px">
      <button class="btn primary" id="playAgainBtn" type="button">Play again</button>
      <button class="btn" id="closeBtn" type="button">Close</button>
    </div>
  `;

  $("playAgainBtn").addEventListener("click", () => {
    overlay.classList.remove("show");
    overlay.setAttribute("aria-hidden","true");
    startGame();
  });

  $("closeBtn").addEventListener("click", () => {
    overlay.classList.remove("show");
    overlay.setAttribute("aria-hidden","true");
  });
}

// ====== scoring + submit ======
function scoreCorrect(isPerfect){
  let pts = 10;
  streak += 1;
  pts += Math.min(10, Math.max(0, streak - 1)); // streak bonus
  if(strictness === "teach" && !isPerfect) pts = Math.max(6, Math.floor(pts * 0.6));
  score += pts;
  if(score > getBest()) bestPill.textContent = `Best: ${score}`;
  setPills();
  return pts;
}

function scoreWrong(kind){
  let penalty = (mode === "practice") ? 0 : (kind === "count" ? 3 : 2);
  score = Math.max(0, score - penalty);
  streak = 0;
  setPills();
}

function submit(){
  if(gameState !== "running"){ showToast("Press Start"); return; }
  if(!currentTarget){ showToast("No target"); return; }

  const want = currentTarget.composition;
  const got = selectionCounts(selection);

  const countsOk = sameCounts(got, want);
  const canonical = canonicalTapSequence(currentTarget);
  const orderOk = arraysEqual(selection, canonical);

  if(!countsOk){
    beep("bad");
    scoreWrong("count");
    showToast(`❌ Not quite. Need ${renderFormula(currentTarget.formulaOrder, want)}`);
    if(mode === "streak"){ endGame("Wrong answer — streak ended."); return; }
    pickTarget();
    return;
  }

  if(strictness === "loose"){
    beep("good");
    const pts = scoreCorrect(true);
    showToast(`✅ Correct! +${pts}  (${renderFormula(currentTarget.formulaOrder, want)})`);
    pickTarget();
    return;
  }

  if(strictness === "strict"){
    if(orderOk){
      beep("good");
      const pts = scoreCorrect(true);
      showToast(`✅ Perfect! +${pts}  (${renderFormula(currentTarget.formulaOrder, want)})`);
      pickTarget();
    } else {
      beep("bad");
      scoreWrong("order");
      showToast(`❌ Order matters. Try: ${canonical.join(" ")}`);
      if(mode === "streak"){ endGame("Wrong order — streak ended."); return; }
      pickTarget();
    }
    return;
  }

  // teach mode
  if(orderOk){
    beep("good");
    const pts = scoreCorrect(true);
    showToast(`✅ Perfect! +${pts}`);
  } else {
    beep("warn");
    const pts = scoreCorrect(false);
    showToast(`⚠️ Almost! +${pts} — usually ${renderFormula(currentTarget.formulaOrder, want)}`);
  }
  pickTarget();
}

// ====== game start ======
function startGame(){
  mode = modeSelect.value;
  strictness = strictToggle.value;
  levelKey = levelSelect.value;

  score = 0;
  streak = 0;
  timeLeft = sprintSeconds;
  gameState = "running";

  overlay.classList.remove("show");
  overlay.setAttribute("aria-hidden","true");

  pickTarget();
  setPills();

  if(mode === "sprint") startTimer();
  else stopTimer();
}

// ====== periodic table render ======
function renderTable(){
  ptable.innerHTML = "";
  for(const el of ELEMENTS){
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = `tile ${el.c}`;
    tile.style.gridColumn = String(el.g);
    tile.style.gridRow = String(el.p);
    tile.innerHTML = `
      <div class="num">${el.z}</div>
      <div class="sym">${el.s}</div>
      <div class="name" title="${el.n}">${el.n}</div>
    `;
    tile.addEventListener("click", () => {
      if(gameState !== "running"){ showToast("Press Start"); return; }
      selection.push(el.s);
      beep("tap");
      refreshBuildUI();
    });
    ptable.appendChild(tile);
  }
}

// ====== events (NO guards that block clicks silently) ======
startBtn.addEventListener("click", startGame);

undoBtn.addEventListener("click", () => {
  if(gameState !== "running"){ showToast("Press Start"); return; }
  if(selection.length === 0){ showToast("Nothing to undo"); return; }
  selection.pop();
  refreshBuildUI();
  beep("tap");
});

clearBtn.addEventListener("click", () => {
  if(gameState !== "running"){ showToast("Press Start"); return; }
  selection = [];
  refreshBuildUI();
  showToast("Cleared");
});

skipBtn.addEventListener("click", () => {
  if(gameState !== "running"){ showToast("Press Start"); return; }
  // tiny penalty (except practice)
  if(mode !== "practice") score = Math.max(0, score - 1);
  streak = 0;
  showToast("Skipped");
  pickTarget();
});

submitBtn.addEventListener("click", submit);

soundBtn.addEventListener("click", () => {
  soundOn = !soundOn;
  soundBtn.textContent = soundOn ? "🔊 Sound" : "🔈 Sound";
  soundBtn.setAttribute("aria-pressed", soundOn ? "true" : "false");
});

modeSelect.addEventListener("change", () => { mode = modeSelect.value; setPills(); });
levelSelect.addEventListener("change", () => { levelKey = levelSelect.value; setPills(); });
strictToggle.addEventListener("change", () => { strictness = strictToggle.value; setPills(); });

window.addEventListener("keydown", (e) => {
  if(e.key === "Enter" && gameState === "running") submit();
  if(e.key === "Escape"){
    overlay.classList.remove("show");
    overlay.setAttribute("aria-hidden","true");
  }
});

// ====== footer year ======
(() => {
  const y = new Date().getFullYear();
  const el = document.getElementById("copyrightText");
  if(el) el.textContent = `© ${y} Synge Street Learning Games`;
})();

// ====== init ======
renderTable();
setPills();
refreshBuildUI();
showToast("Ready");
