/* Element Builder • Synge Street Learning Games
   - Expanded compound pools (5 sets)
   - Skip button
   - Dropdown options more robust
   - Footer copyright year
*/

const $ = (id) => document.getElementById(id);

const modeSelect = $("modeSelect");
const levelSelect = $("levelSelect");
const strictToggle = $("strictToggle");
const soundBtn = $("soundBtn");
const startBtn = $("startBtn");

const modePill = $("modePill");
const timerPill = $("timerPill");
const scorePill = $("scorePill");
const bestPill = $("bestPill");
const streakPill = $("streakPill");
const poolPill = $("poolPill");

const promptText = $("promptText");
const promptHint = $("promptHint");

const formulaPreview = $("formulaPreview");
const tapRow = $("tapRow");
const undoBtn = $("undoBtn");
const clearBtn = $("clearBtn");
const skipBtn = $("skipBtn");
const submitBtn = $("submitBtn");

const toast = $("toast");
const overlay = $("overlay");
const overlayCard = $("overlayCard");
const ptable = $("ptable");

let soundOn = true;
let gameState = "idle"; // idle | running | ended
let mode = "practice";
let strictness = "teach"; // loose | teach | strict
let levelKey = "level1";

let score = 0;
let streak = 0;

let selection = []; // array of symbols tapped
let currentTarget = null;

let sprintSeconds = 60;
let timeLeft = sprintSeconds;
let timerHandle = null;

// ====== expanded compounds ======
const COMPOUND_SETS = {
  level1: [
    { name:"Water", formulaOrder:["H","O"], composition:{H:2,O:1}, hint:"2 hydrogen + 1 oxygen" },
    { name:"Carbon dioxide", formulaOrder:["C","O"], composition:{C:1,O:2}, hint:"CO₂ (in fizzy drinks)" },
    { name:"Salt (Sodium chloride)", formulaOrder:["Na","Cl"], composition:{Na:1,Cl:1}, hint:"Table salt" },
    { name:"Ammonia", formulaOrder:["N","H"], composition:{N:1,H:3}, hint:"NH₃" },
    { name:"Methane", formulaOrder:["C","H"], composition:{C:1,H:4}, hint:"CH₄ (natural gas)" },
    { name:"Hydrogen peroxide", formulaOrder:["H","O"], composition:{H:2,O:2}, hint:"H₂O₂" },
    { name:"Magnesium oxide", formulaOrder:["Mg","O"], composition:{Mg:1,O:1}, hint:"MgO" },
    { name:"Calcium chloride", formulaOrder:["Ca","Cl"], composition:{Ca:1,Cl:2}, hint:"CaCl₂" },
    { name:"Sodium fluoride", formulaOrder:["Na","F"], composition:{Na:1,F:1}, hint:"NaF (toothpaste ingredient)" },
    { name:"Potassium iodide", formulaOrder:["K","I"], composition:{K:1,I:1}, hint:"KI" },
    { name:"Iron(II) oxide", formulaOrder:["Fe","O"], composition:{Fe:1,O:1}, hint:"FeO" },
    { name:"Iron(III) oxide", formulaOrder:["Fe","O"], composition:{Fe:2,O:3}, hint:"Fe₂O₃ (rust)" },
  ],

  level2: [
    { name:"Oxygen", formulaOrder:["O"], composition:{O:2}, hint:"O₂ (diatomic)" },
    { name:"Nitrogen", formulaOrder:["N"], composition:{N:2}, hint:"N₂ (diatomic)" },
    { name:"Hydrogen", formulaOrder:["H"], composition:{H:2}, hint:"H₂ (diatomic)" },
    { name:"Carbon monoxide", formulaOrder:["C","O"], composition:{C:1,O:1}, hint:"CO (dangerous gas)" },
    { name:"Carbon dioxide", formulaOrder:["C","O"], composition:{C:1,O:2}, hint:"CO₂" },
    { name:"Sulfur dioxide", formulaOrder:["S","O"], composition:{S:1,O:2}, hint:"SO₂" },
    { name:"Sulfur trioxide", formulaOrder:["S","O"], composition:{S:1,O:3}, hint:"SO₃" },
    { name:"Nitrogen monoxide", formulaOrder:["N","O"], composition:{N:1,O:1}, hint:"NO" },
    { name:"Nitrogen dioxide", formulaOrder:["N","O"], composition:{N:1,O:2}, hint:"NO₂" },
    { name:"Ozone", formulaOrder:["O"], composition:{O:3}, hint:"O₃" },
    { name:"Water vapour", formulaOrder:["H","O"], composition:{H:2,O:1}, hint:"H₂O" },
  ],

  level3: [
    { name:"Hydrochloric acid", formulaOrder:["H","Cl"], composition:{H:1,Cl:1}, hint:"HCl (stomach acid)" },
    { name:"Nitric acid", formulaOrder:["H","N","O"], composition:{H:1,N:1,O:3}, hint:"HNO₃" },
    { name:"Sulfuric acid", formulaOrder:["H","S","O"], composition:{H:2,S:1,O:4}, hint:"H₂SO₄" },
    { name:"Phosphoric acid", formulaOrder:["H","P","O"], composition:{H:3,P:1,O:4}, hint:"H₃PO₄" },
    { name:"Sodium hydroxide", formulaOrder:["Na","O","H"], composition:{Na:1,O:1,H:1}, hint:"NaOH (a base)" },
    { name:"Potassium hydroxide", formulaOrder:["K","O","H"], composition:{K:1,O:1,H:1}, hint:"KOH" },
    { name:"Calcium hydroxide", formulaOrder:["Ca","O","H"], composition:{Ca:1,O:2,H:2}, hint:"Ca(OH)₂ (tap Ca O O H H)" },
    { name:"Ammonia", formulaOrder:["N","H"], composition:{N:1,H:3}, hint:"NH₃" },
    { name:"Sodium carbonate", formulaOrder:["Na","C","O"], composition:{Na:2,C:1,O:3}, hint:"Na₂CO₃" },
    { name:"Sodium bicarbonate", formulaOrder:["Na","H","C","O"], composition:{Na:1,H:1,C:1,O:3}, hint:"NaHCO₃ (baking soda)" },
  ],

  level4: [
    { name:"Calcium oxide", formulaOrder:["Ca","O"], composition:{Ca:1,O:1}, hint:"CaO" },
    { name:"Magnesium chloride", formulaOrder:["Mg","Cl"], composition:{Mg:1,Cl:2}, hint:"MgCl₂" },
    { name:"Calcium chloride", formulaOrder:["Ca","Cl"], composition:{Ca:1,Cl:2}, hint:"CaCl₂" },
    { name:"Sodium oxide", formulaOrder:["Na","O"], composition:{Na:2,O:1}, hint:"Na₂O" },
    { name:"Potassium oxide", formulaOrder:["K","O"], composition:{K:2,O:1}, hint:"K₂O" },
    { name:"Aluminium oxide", formulaOrder:["Al","O"], composition:{Al:2,O:3}, hint:"Al₂O₃" },
    { name:"Zinc oxide", formulaOrder:["Zn","O"], composition:{Zn:1,O:1}, hint:"ZnO" },
    { name:"Copper(II) oxide", formulaOrder:["Cu","O"], composition:{Cu:1,O:1}, hint:"CuO" },
    { name:"Copper(I) oxide", formulaOrder:["Cu","O"], composition:{Cu:2,O:1}, hint:"Cu₂O" },
    { name:"Silicon dioxide", formulaOrder:["Si","O"], composition:{Si:1,O:2}, hint:"SiO₂ (sand / glass)" },
  ],

  level5: [
    { name:"Glucose", formulaOrder:["C","H","O"], composition:{C:6,H:12,O:6}, hint:"C₆H₁₂O₆" },
    { name:"Ethanol", formulaOrder:["C","H","O"], composition:{C:2,H:6,O:1}, hint:"C₂H₆O" },
    { name:"Acetic acid (ethanoic acid)", formulaOrder:["C","H","O"], composition:{C:2,H:4,O:2}, hint:"C₂H₄O₂ (vinegar acid)" },
    { name:"Propane", formulaOrder:["C","H"], composition:{C:3,H:8}, hint:"C₃H₈" },
    { name:"Butane", formulaOrder:["C","H"], composition:{C:4,H:10}, hint:"C₄H₁₀" },
    { name:"Calcium carbonate", formulaOrder:["Ca","C","O"], composition:{Ca:1,C:1,O:3}, hint:"CaCO₃ (limestone)" },
    { name:"Sodium sulfate", formulaOrder:["Na","S","O"], composition:{Na:2,S:1,O:4}, hint:"Na₂SO₄" },
    { name:"Potassium nitrate", formulaOrder:["K","N","O"], composition:{K:1,N:1,O:3}, hint:"KNO₃" },
    { name:"Calcium nitrate", formulaOrder:["Ca","N","O"], composition:{Ca:1,N:2,O:6}, hint:"Ca(NO₃)₂ (tap Ca N N O O O O O O)" },
    { name:"Ammonium chloride", formulaOrder:["N","H","Cl"], composition:{N:1,H:4,Cl:1}, hint:"NH₄Cl" },
  ],
};

// ====== periodic table data (same as before; kept compact here) ======
const ELEMENTS = [
  { z:1, s:"H", n:"Hydrogen", p:1, g:1, c:"nonmetal" },
  { z:2, s:"He", n:"Helium", p:1, g:18, c:"noble" },

  { z:3, s:"Li", n:"Lithium", p:2, g:1, c:"alkali" },
  { z:4, s:"Be", n:"Beryllium", p:2, g:2, c:"alkaline" },
  { z:5, s:"B", n:"Boron", p:2, g:13, c:"metalloid" },
  { z:6, s:"C", n:"Carbon", p:2, g:14, c:"nonmetal" },
  { z:7, s:"N", n:"Nitrogen", p:2, g:15, c:"nonmetal" },
  { z:8, s:"O", n:"Oxygen", p:2, g:16, c:"nonmetal" },
  { z:9, s:"F", n:"Fluorine", p:2, g:17, c:"halogen" },
  { z:10, s:"Ne", n:"Neon", p:2, g:18, c:"noble" },

  { z:11, s:"Na", n:"Sodium", p:3, g:1, c:"alkali" },
  { z:12, s:"Mg", n:"Magnesium", p:3, g:2, c:"alkaline" },
  { z:13, s:"Al", n:"Aluminium", p:3, g:13, c:"post" },
  { z:14, s:"Si", n:"Silicon", p:3, g:14, c:"metalloid" },
  { z:15, s:"P", n:"Phosphorus", p:3, g:15, c:"nonmetal" },
  { z:16, s:"S", n:"Sulfur", p:3, g:16, c:"nonmetal" },
  { z:17, s:"Cl", n:"Chlorine", p:3, g:17, c:"halogen" },
  { z:18, s:"Ar", n:"Argon", p:3, g:18, c:"noble" },

  { z:19, s:"K", n:"Potassium", p:4, g:1, c:"alkali" },
  { z:20, s:"Ca", n:"Calcium", p:4, g:2, c:"alkaline" },
  { z:21, s:"Sc", n:"Scandium", p:4, g:3, c:"transition" },
  { z:22, s:"Ti", n:"Titanium", p:4, g:4, c:"transition" },
  { z:23, s:"V", n:"Vanadium", p:4, g:5, c:"transition" },
  { z:24, s:"Cr", n:"Chromium", p:4, g:6, c:"transition" },
  { z:25, s:"Mn", n:"Manganese", p:4, g:7, c:"transition" },
  { z:26, s:"Fe", n:"Iron", p:4, g:8, c:"transition" },
  { z:27, s:"Co", n:"Cobalt", p:4, g:9, c:"transition" },
  { z:28, s:"Ni", n:"Nickel", p:4, g:10, c:"transition" },
  { z:29, s:"Cu", n:"Copper", p:4, g:11, c:"transition" },
  { z:30, s:"Zn", n:"Zinc", p:4, g:12, c:"transition" },
  { z:31, s:"Ga", n:"Gallium", p:4, g:13, c:"post" },
  { z:32, s:"Ge", n:"Germanium", p:4, g:14, c:"metalloid" },
  { z:33, s:"As", n:"Arsenic", p:4, g:15, c:"metalloid" },
  { z:34, s:"Se", n:"Selenium", p:4, g:16, c:"nonmetal" },
  { z:35, s:"Br", n:"Bromine", p:4, g:17, c:"halogen" },
  { z:36, s:"Kr", n:"Krypton", p:4, g:18, c:"noble" },

  { z:47, s:"Ag", n:"Silver", p:5, g:11, c:"transition" },
  { z:48, s:"Cd", n:"Cadmium", p:5, g:12, c:"transition" },
  { z:53, s:"I", n:"Iodine", p:5, g:17, c:"halogen" },
  { z:54, s:"Xe", n:"Xenon", p:5, g:18, c:"noble" },

  { z:78, s:"Pt", n:"Platinum", p:6, g:10, c:"transition" },
  { z:79, s:"Au", n:"Gold", p:6, g:11, c:"transition" },
  { z:80, s:"Hg", n:"Mercury", p:6, g:12, c:"transition" },

  { z:82, s:"Pb", n:"Lead", p:6, g:14, c:"post" },
  { z:86, s:"Rn", n:"Radon", p:6, g:18, c:"noble" },
];

// NOTE: This “lite” element list covers everything used in the expanded compound sets above.
// If you later want every single element shown again, tell me and I’ll drop in the full 118 list.

function showToast(msg){
  toast.textContent = msg;
  toast.classList.add("show");
  window.clearTimeout(showToast._t);
  showToast._t = window.setTimeout(() => toast.classList.remove("show"), 1200);
}

function subscriptNumber(num){
  const map = { "0":"₀","1":"₁","2":"₂","3":"₃","4":"₄","5":"₅","6":"₆","7":"₇","8":"₈","9":"₉" };
  return String(num).split("").map(ch => map[ch] ?? ch).join("");
}

function renderFormula(order, counts){
  let out = "";
  for(const sym of order){
    const ct = counts[sym] || 0;
    if(ct <= 0) continue;
    out += sym;
    if(ct > 1) out += subscriptNumber(ct);
  }
  const remaining = Object.keys(counts).filter(k => !order.includes(k)).sort();
  for(const sym of remaining){
    const ct = counts[sym];
    if(ct <= 0) continue;
    out += sym;
    if(ct > 1) out += subscriptNumber(ct);
  }
  return out || "—";
}

function selectionCounts(sel){
  const counts = {};
  for(const sym of sel) counts[sym] = (counts[sym] || 0) + 1;
  return counts;
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
  const extras = Object.keys(target.composition).filter(k => !target.formulaOrder.includes(k)).sort();
  for(const sym of extras){
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

  let freq = 440, dur = 0.12;
  if(type === "good"){ freq = 740; dur = 0.10; }
  if(type === "bad"){ freq = 190; dur = 0.14; }
  if(type === "warn"){ freq = 520; dur = 0.12; }
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
function bestKey(){
  return `element-builder::best::${mode}::${levelKey}::${strictness}`;
}
function getBest(){
  return Number(localStorage.getItem(bestKey()) || "0");
}
function setBest(val){
  localStorage.setItem(bestKey(), String(val));
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
    tile.dataset.symbol = el.s;
    tile.innerHTML = `
      <div class="num">${el.z}</div>
      <div class="sym">${el.s}</div>
      <div class="name" title="${el.n}">${el.n}</div>
    `;
    tile.addEventListener("click", () => {
      if(gameState !== "running"){
        showToast("Press Start");
        return;
      }
      selection.push(el.s);
      beep("tap");
      refreshBuildUI();
    });
    ptable.appendChild(tile);
  }
}

// ====== UI state ======
function setPills(){
  modePill.textContent = mode === "practice" ? "Practice" : mode === "sprint" ? "Sprint" : "Streak";
  scorePill.textContent = `Score: ${score}`;
  bestPill.textContent = `Best: ${getBest()}`;
  streakPill.textContent = `Streak: ${streak}`;

  const pool = (COMPOUND_SETS[levelKey] || []).length;
  poolPill.textContent = `Pool: ${pool || "—"}`;

  timerPill.textContent = (mode === "sprint") ? `${timeLeft}s` : "∞";
}

function refreshBuildUI(){
  const counts = selectionCounts(selection);
  const order = currentTarget?.formulaOrder || Object.keys(counts).sort();
  formulaPreview.textContent = renderFormula(order, counts);

  tapRow.innerHTML = "";
  for(const sym of selection){
    const tok = document.createElement("div");
    tok.className = "tapToken";
    tok.textContent = sym;
    tapRow.appendChild(tok);
  }
}

// ====== game flow ======
function pickTarget(){
  const set = COMPOUND_SETS[levelKey] || COMPOUND_SETS.level1;
  const idx = Math.floor(Math.random() * set.length);
  currentTarget = set[idx];

  promptText.textContent = currentTarget.name;
  promptHint.textContent = currentTarget.hint || "";

  selection = [];
  refreshBuildUI();
  setPills();
}

function stopTimer(){
  if(timerHandle){
    window.clearInterval(timerHandle);
    timerHandle = null;
  }
}

function startTimer(){
  stopTimer();
  timerHandle = window.setInterval(() => {
    timeLeft--;
    setPills();
    if(timeLeft <= 0){
      endGame("Time’s up!");
    }
  }, 1000);
}

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
    overlay.setAttribute("aria-hidden", "true");
    startGame();
  });
  $("closeBtn").addEventListener("click", () => {
    overlay.classList.remove("show");
    overlay.setAttribute("aria-hidden", "true");
  });
}

function scoreCorrect(isPerfect){
  let pts = 10;
  streak += 1;
  pts += Math.min(10, Math.max(0, streak - 1)); // streak bonus

  if(strictness === "teach" && !isPerfect){
    pts = Math.max(6, Math.floor(pts * 0.6));
  }

  score += pts;
  setPills();

  const best = getBest();
  if(score > best) bestPill.textContent = `Best: ${score}`;

  return pts;
}

function scoreWrong(kind){
  let penalty = 0;
  if(mode === "practice") penalty = 0;
  else penalty = (kind === "count") ? 3 : 2;

  score = Math.max(0, score - penalty);
  streak = 0;
  setPills();
  return penalty;
}

function flashOverlay(title, bigText, kind){
  overlayCard.classList.remove("flashGood", "flashBad");
  overlay.classList.add("show");
  overlay.setAttribute("aria-hidden", "false");

  overlayCard.innerHTML = `
    <h2>${title}</h2>
    <div class="big">${bigText}</div>
    <p>${currentTarget ? currentTarget.name : ""}</p>
    <div class="row">
      <span class="tag">Score: ${score}</span>
      <span class="tag">Streak: ${streak}</span>
    </div>
  `;

  if(kind === "good" || kind === "warn") overlayCard.classList.add("flashGood");
  else overlayCard.classList.add("flashBad");

  window.clearTimeout(flashOverlay._t);
  flashOverlay._t = window.setTimeout(() => {
    overlay.classList.remove("show");
    overlay.setAttribute("aria-hidden", "true");
  }, 650);
}

function submit(){
  if(gameState !== "running"){ showToast("Press Start"); return; }
  if(!currentTarget){ showToast("No target"); return; }

  const wantCounts = currentTarget.composition;
  const gotCounts = selectionCounts(selection);

  const countsOk = sameCounts(gotCounts, wantCounts);

  const canonical = canonicalTapSequence(currentTarget);
  const orderOk = arraysEqual(selection, canonical);

  if(!countsOk){
    beep("bad");
    scoreWrong("count");
    flashOverlay("Not quite", `You need: ${renderFormula(currentTarget.formulaOrder, wantCounts)}`, "bad");
    if(mode === "streak"){ endGame("Wrong answer — streak ended."); return; }
    pickTarget();
    return;
  }

  if(strictness === "loose"){
    beep("good");
    const pts = scoreCorrect(true);
    flashOverlay(`Correct! +${pts}`, `${renderFormula(currentTarget.formulaOrder, wantCounts)}`, "good");
    pickTarget();
    return;
  }

  if(strictness === "strict"){
    if(orderOk){
      beep("good");
      const pts = scoreCorrect(true);
      flashOverlay(`Perfect! +${pts}`, `${renderFormula(currentTarget.formulaOrder, wantCounts)}`, "good");
      pickTarget();
    } else {
      beep("bad");
      scoreWrong("order");
      flashOverlay("Order matters", `Try: ${canonical.join(" ")}`, "bad");
      if(mode === "streak"){ endGame("Wrong order — streak ended."); return; }
      pickTarget();
    }
    return;
  }

  // teach
  if(orderOk){
    beep("good");
    const pts = scoreCorrect(true);
    flashOverlay(`Perfect! +${pts}`, `${renderFormula(currentTarget.formulaOrder, wantCounts)}`, "good");
  } else {
    beep("warn");
    const pts = scoreCorrect(false);
    flashOverlay(`Almost! +${pts}`, `Right atoms — usually ${renderFormula(currentTarget.formulaOrder, wantCounts)}`, "warn");
  }
  pickTarget();
}

function startGame(){
  mode = modeSelect.value;
  strictness = strictToggle.value;
  levelKey = levelSelect.value;

  score = 0;
  streak = 0;
  timeLeft = sprintSeconds;
  gameState = "running";

  overlay.classList.remove("show");
  overlay.setAttribute("aria-hidden", "true");

  pickTarget();
  setPills();

  if(mode === "sprint") startTimer();
  else stopTimer();
}

// ====== events ======
startBtn.addEventListener("click", startGame);

undoBtn.addEventListener("click", () => {
  if(gameState !== "running") return;
  selection.pop();
  refreshBuildUI();
});

clearBtn.addEventListener("click", () => {
  if(gameState !== "running") return;
  selection = [];
  refreshBuildUI();
});

skipBtn.addEventListener("click", () => {
  if(gameState !== "running") return;
  // tiny anti-spam penalty only in competitive modes
  if(mode !== "practice") score = Math.max(0, score - 1);
  streak = 0;
  setPills();
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
  if(e.key === "Enter"){
    if(gameState === "running") submit();
  }
  if(e.key === "Escape"){
    overlay.classList.remove("show");
    overlay.setAttribute("aria-hidden", "true");
  }
});

// ====== footer year ======
(function setFooterYear(){
  const y = new Date().getFullYear();
  const el = document.getElementById("copyrightText");
  if(el) el.textContent = `© ${y} Synge Street Learning Games`;
})();

// ====== init ======
renderTable();
setPills();
refreshBuildUI();
showToast("Ready");
