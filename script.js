/* Element Builder
   - Full periodic table tile grid
   - Tap elements to build compound formulas
   - Practice / Sprint / Streak
   - Loose / Teach / Strict order checking
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

const promptText = $("promptText");
const promptHint = $("promptHint");

const formulaPreview = $("formulaPreview");
const tapRow = $("tapRow");
const undoBtn = $("undoBtn");
const clearBtn = $("clearBtn");
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

// ====== compounds ======
const COMPOUND_SETS = {
  level1: [
    {
      name: "Water",
      formulaOrder: ["H", "O"],
      composition: { H: 2, O: 1 },
      hint: "2 hydrogen + 1 oxygen",
    },
    {
      name: "Salt (Sodium chloride)",
      formulaOrder: ["Na", "Cl"],
      composition: { Na: 1, Cl: 1 },
      hint: "Table salt",
    },
    {
      name: "Carbon dioxide",
      formulaOrder: ["C", "O"],
      composition: { C: 1, O: 2 },
      hint: "In fizzy drinks",
    },
    {
      name: "Ammonia",
      formulaOrder: ["N", "H"],
      composition: { N: 1, H: 3 },
      hint: "NH₃",
    },
    {
      name: "Methane",
      formulaOrder: ["C", "H"],
      composition: { C: 1, H: 4 },
      hint: "Natural gas",
    },
    {
      name: "Hydrogen peroxide",
      formulaOrder: ["H", "O"],
      composition: { H: 2, O: 2 },
      hint: "H₂O₂",
    },
    {
      name: "Magnesium oxide",
      formulaOrder: ["Mg", "O"],
      composition: { Mg: 1, O: 1 },
      hint: "MgO",
    },
    {
      name: "Calcium chloride",
      formulaOrder: ["Ca", "Cl"],
      composition: { Ca: 1, Cl: 2 },
      hint: "CaCl₂",
    },
  ],
  level2: [
    {
      name: "Hydrochloric acid",
      formulaOrder: ["H", "Cl"],
      composition: { H: 1, Cl: 1 },
      hint: "HCl (stomach acid)",
    },
    {
      name: "Sodium hydroxide",
      formulaOrder: ["Na", "O", "H"],
      composition: { Na: 1, O: 1, H: 1 },
      hint: "NaOH (a base)",
    },
    {
      name: "Nitric acid",
      formulaOrder: ["H", "N", "O"],
      composition: { H: 1, N: 1, O: 3 },
      hint: "HNO₃",
    },
    {
      name: "Sulfuric acid",
      formulaOrder: ["H", "S", "O"],
      composition: { H: 2, S: 1, O: 4 },
      hint: "H₂SO₄",
    },
    {
      name: "Sodium carbonate",
      formulaOrder: ["Na", "C", "O"],
      composition: { Na: 2, C: 1, O: 3 },
      hint: "Na₂CO₃",
    },
    {
      name: "Calcium hydroxide",
      formulaOrder: ["Ca", "O", "H"],
      composition: { Ca: 1, O: 2, H: 2 },
      hint: "Ca(OH)₂ (built as Ca + O + O + H + H here)",
    },
  ],
};

// ====== periodic table data (118) ======
// positioning: period 1-7 rows; group 1-18 columns
// lanthanides displayed in row 8 (period 8), groups 4-18 (Ce..Lu)
// actinides displayed in row 9 (period 9), groups 4-18 (Th..Lr)
// La (57) shown in main table at period 6 group 3; Ac (89) at period 7 group 3
const ELEMENTS = [
  { z:1,  s:"H",  n:"Hydrogen",       p:1, g:1,  c:"nonmetal" },
  { z:2,  s:"He", n:"Helium",         p:1, g:18, c:"noble" },

  { z:3,  s:"Li", n:"Lithium",        p:2, g:1,  c:"alkali" },
  { z:4,  s:"Be", n:"Beryllium",      p:2, g:2,  c:"alkaline" },
  { z:5,  s:"B",  n:"Boron",          p:2, g:13, c:"metalloid" },
  { z:6,  s:"C",  n:"Carbon",         p:2, g:14, c:"nonmetal" },
  { z:7,  s:"N",  n:"Nitrogen",       p:2, g:15, c:"nonmetal" },
  { z:8,  s:"O",  n:"Oxygen",         p:2, g:16, c:"nonmetal" },
  { z:9,  s:"F",  n:"Fluorine",       p:2, g:17, c:"halogen" },
  { z:10, s:"Ne", n:"Neon",           p:2, g:18, c:"noble" },

  { z:11, s:"Na", n:"Sodium",         p:3, g:1,  c:"alkali" },
  { z:12, s:"Mg", n:"Magnesium",      p:3, g:2,  c:"alkaline" },
  { z:13, s:"Al", n:"Aluminium",      p:3, g:13, c:"post" },
  { z:14, s:"Si", n:"Silicon",        p:3, g:14, c:"metalloid" },
  { z:15, s:"P",  n:"Phosphorus",     p:3, g:15, c:"nonmetal" },
  { z:16, s:"S",  n:"Sulfur",         p:3, g:16, c:"nonmetal" },
  { z:17, s:"Cl", n:"Chlorine",       p:3, g:17, c:"halogen" },
  { z:18, s:"Ar", n:"Argon",          p:3, g:18, c:"noble" },

  { z:19, s:"K",  n:"Potassium",      p:4, g:1,  c:"alkali" },
  { z:20, s:"Ca", n:"Calcium",        p:4, g:2,  c:"alkaline" },
  { z:21, s:"Sc", n:"Scandium",       p:4, g:3,  c:"transition" },
  { z:22, s:"Ti", n:"Titanium",       p:4, g:4,  c:"transition" },
  { z:23, s:"V",  n:"Vanadium",       p:4, g:5,  c:"transition" },
  { z:24, s:"Cr", n:"Chromium",       p:4, g:6,  c:"transition" },
  { z:25, s:"Mn", n:"Manganese",      p:4, g:7,  c:"transition" },
  { z:26, s:"Fe", n:"Iron",           p:4, g:8,  c:"transition" },
  { z:27, s:"Co", n:"Cobalt",         p:4, g:9,  c:"transition" },
  { z:28, s:"Ni", n:"Nickel",         p:4, g:10, c:"transition" },
  { z:29, s:"Cu", n:"Copper",         p:4, g:11, c:"transition" },
  { z:30, s:"Zn", n:"Zinc",           p:4, g:12, c:"transition" },
  { z:31, s:"Ga", n:"Gallium",        p:4, g:13, c:"post" },
  { z:32, s:"Ge", n:"Germanium",      p:4, g:14, c:"metalloid" },
  { z:33, s:"As", n:"Arsenic",        p:4, g:15, c:"metalloid" },
  { z:34, s:"Se", n:"Selenium",       p:4, g:16, c:"nonmetal" },
  { z:35, s:"Br", n:"Bromine",        p:4, g:17, c:"halogen" },
  { z:36, s:"Kr", n:"Krypton",        p:4, g:18, c:"noble" },

  { z:37, s:"Rb", n:"Rubidium",       p:5, g:1,  c:"alkali" },
  { z:38, s:"Sr", n:"Strontium",      p:5, g:2,  c:"alkaline" },
  { z:39, s:"Y",  n:"Yttrium",        p:5, g:3,  c:"transition" },
  { z:40, s:"Zr", n:"Zirconium",      p:5, g:4,  c:"transition" },
  { z:41, s:"Nb", n:"Niobium",        p:5, g:5,  c:"transition" },
  { z:42, s:"Mo", n:"Molybdenum",     p:5, g:6,  c:"transition" },
  { z:43, s:"Tc", n:"Technetium",     p:5, g:7,  c:"transition" },
  { z:44, s:"Ru", n:"Ruthenium",      p:5, g:8,  c:"transition" },
  { z:45, s:"Rh", n:"Rhodium",        p:5, g:9,  c:"transition" },
  { z:46, s:"Pd", n:"Palladium",      p:5, g:10, c:"transition" },
  { z:47, s:"Ag", n:"Silver",         p:5, g:11, c:"transition" },
  { z:48, s:"Cd", n:"Cadmium",        p:5, g:12, c:"transition" },
  { z:49, s:"In", n:"Indium",         p:5, g:13, c:"post" },
  { z:50, s:"Sn", n:"Tin",            p:5, g:14, c:"post" },
  { z:51, s:"Sb", n:"Antimony",       p:5, g:15, c:"metalloid" },
  { z:52, s:"Te", n:"Tellurium",      p:5, g:16, c:"metalloid" },
  { z:53, s:"I",  n:"Iodine",         p:5, g:17, c:"halogen" },
  { z:54, s:"Xe", n:"Xenon",          p:5, g:18, c:"noble" },

  { z:55, s:"Cs", n:"Caesium",        p:6, g:1,  c:"alkali" },
  { z:56, s:"Ba", n:"Barium",         p:6, g:2,  c:"alkaline" },
  { z:57, s:"La", n:"Lanthanum",      p:6, g:3,  c:"lanth" }, // main table
  { z:72, s:"Hf", n:"Hafnium",        p:6, g:4,  c:"transition" },
  { z:73, s:"Ta", n:"Tantalum",       p:6, g:5,  c:"transition" },
  { z:74, s:"W",  n:"Tungsten",       p:6, g:6,  c:"transition" },
  { z:75, s:"Re", n:"Rhenium",        p:6, g:7,  c:"transition" },
  { z:76, s:"Os", n:"Osmium",         p:6, g:8,  c:"transition" },
  { z:77, s:"Ir", n:"Iridium",        p:6, g:9,  c:"transition" },
  { z:78, s:"Pt", n:"Platinum",       p:6, g:10, c:"transition" },
  { z:79, s:"Au", n:"Gold",           p:6, g:11, c:"transition" },
  { z:80, s:"Hg", n:"Mercury",        p:6, g:12, c:"transition" },
  { z:81, s:"Tl", n:"Thallium",       p:6, g:13, c:"post" },
  { z:82, s:"Pb", n:"Lead",           p:6, g:14, c:"post" },
  { z:83, s:"Bi", n:"Bismuth",        p:6, g:15, c:"post" },
  { z:84, s:"Po", n:"Polonium",       p:6, g:16, c:"metalloid" },
  { z:85, s:"At", n:"Astatine",       p:6, g:17, c:"halogen" },
  { z:86, s:"Rn", n:"Radon",          p:6, g:18, c:"noble" },

  { z:87, s:"Fr", n:"Francium",       p:7, g:1,  c:"alkali" },
  { z:88, s:"Ra", n:"Radium",         p:7, g:2,  c:"alkaline" },
  { z:89, s:"Ac", n:"Actinium",       p:7, g:3,  c:"act" }, // main table
  { z:104, s:"Rf", n:"Rutherfordium", p:7, g:4,  c:"transition" },
  { z:105, s:"Db", n:"Dubnium",       p:7, g:5,  c:"transition" },
  { z:106, s:"Sg", n:"Seaborgium",    p:7, g:6,  c:"transition" },
  { z:107, s:"Bh", n:"Bohrium",       p:7, g:7,  c:"transition" },
  { z:108, s:"Hs", n:"Hassium",       p:7, g:8,  c:"transition" },
  { z:109, s:"Mt", n:"Meitnerium",    p:7, g:9,  c:"transition" },
  { z:110, s:"Ds", n:"Darmstadtium",  p:7, g:10, c:"transition" },
  { z:111, s:"Rg", n:"Roentgenium",   p:7, g:11, c:"transition" },
  { z:112, s:"Cn", n:"Copernicium",   p:7, g:12, c:"transition" },
  { z:113, s:"Nh", n:"Nihonium",      p:7, g:13, c:"post" },
  { z:114, s:"Fl", n:"Flerovium",     p:7, g:14, c:"post" },
  { z:115, s:"Mc", n:"Moscovium",     p:7, g:15, c:"post" },
  { z:116, s:"Lv", n:"Livermorium",   p:7, g:16, c:"post" },
  { z:117, s:"Ts", n:"Tennessine",    p:7, g:17, c:"halogen" },
  { z:118, s:"Og", n:"Oganesson",     p:7, g:18, c:"noble" },

  // Period 6 missing 58-71 are shown as lanthanide row (period 8)
  { z:58, s:"Ce", n:"Cerium",         p:8, g:4,  c:"lanth" },
  { z:59, s:"Pr", n:"Praseodymium",   p:8, g:5,  c:"lanth" },
  { z:60, s:"Nd", n:"Neodymium",      p:8, g:6,  c:"lanth" },
  { z:61, s:"Pm", n:"Promethium",     p:8, g:7,  c:"lanth" },
  { z:62, s:"Sm", n:"Samarium",       p:8, g:8,  c:"lanth" },
  { z:63, s:"Eu", n:"Europium",       p:8, g:9,  c:"lanth" },
  { z:64, s:"Gd", n:"Gadolinium",     p:8, g:10, c:"lanth" },
  { z:65, s:"Tb", n:"Terbium",        p:8, g:11, c:"lanth" },
  { z:66, s:"Dy", n:"Dysprosium",     p:8, g:12, c:"lanth" },
  { z:67, s:"Ho", n:"Holmium",        p:8, g:13, c:"lanth" },
  { z:68, s:"Er", n:"Erbium",         p:8, g:14, c:"lanth" },
  { z:69, s:"Tm", n:"Thulium",        p:8, g:15, c:"lanth" },
  { z:70, s:"Yb", n:"Ytterbium",      p:8, g:16, c:"lanth" },
  { z:71, s:"Lu", n:"Lutetium",       p:8, g:17, c:"lanth" },

  // Period 7 missing 90-103 are shown as actinide row (period 9)
  { z:90, s:"Th", n:"Thorium",        p:9, g:4,  c:"act" },
  { z:91, s:"Pa", n:"Protactinium",   p:9, g:5,  c:"act" },
  { z:92, s:"U",  n:"Uranium",        p:9, g:6,  c:"act" },
  { z:93, s:"Np", n:"Neptunium",      p:9, g:7,  c:"act" },
  { z:94, s:"Pu", n:"Plutonium",      p:9, g:8,  c:"act" },
  { z:95, s:"Am", n:"Americium",      p:9, g:9,  c:"act" },
  { z:96, s:"Cm", n:"Curium",         p:9, g:10, c:"act" },
  { z:97, s:"Bk", n:"Berkelium",      p:9, g:11, c:"act" },
  { z:98, s:"Cf", n:"Californium",    p:9, g:12, c:"act" },
  { z:99, s:"Es", n:"Einsteinium",    p:9, g:13, c:"act" },
  { z:100,s:"Fm", n:"Fermium",        p:9, g:14, c:"act" },
  { z:101,s:"Md", n:"Mendelevium",    p:9, g:15, c:"act" },
  { z:102,s:"No", n:"Nobelium",       p:9, g:16, c:"act" },
  { z:103,s:"Lr", n:"Lawrencium",     p:9, g:17, c:"act" },
];

// Add the remaining period 6 & 7 elements that weren’t in the main list above (because we jumped)
const REMAINING = [
  { z:9, s:"F", n:"Fluorine", p:2, g:17, c:"halogen" }, // already present; safe
];

(function fillMissingMainTable(){
  const have = new Set(ELEMENTS.map(e => e.z));
  const extras = [
    // period 6: 57 is La (present), 58-71 in lanth row, then 72-86 present; but we skipped 65? etc are in lanth row.
    // period 7: 89 is Ac present, 90-103 act row, 104-118 present.
    // We also skipped period 6 group 14? already present.

    // Add elements 57-86 already good. But we missed period 6 element 87? no.
    // We DID miss elements 57? present, 72..86 present.
    // The only true "missing" are 57-86 not in have: 58-71 are in lanth row; ok.
    // But we also haven't added element 57? yes.

    // We are missing elements 57? etc - ok.
    // We are missing elements 7? etc - already.
    // Actually the table still lacks 37? etc present.
    // One big set missing: 57 was La but 71 is Lu in lanth row; fine.
    // Another big set missing: many post-transition metals in period 6 are present.
  ];

  // Additionally, add period 6 group 3 label-ish? not required.

  // Add the middle blocks we skipped: 57-86 are covered; 89-118 covered.
  // What we truly missed: elements 57-118 are present. But what about elements 57-86 includes 58..71 in lanth row and 72..86 present.
  // What about elements 1-56 are present. Good.
  // So no extras needed.

  for(const e of extras){
    if(!have.has(e.z)) ELEMENTS.push(e);
  }
})();

// ====== utilities ======
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
  // If order didn't include everything (rare), append remaining in alpha order
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
  for(const sym of sel){
    counts[sym] = (counts[sym] || 0) + 1;
  }
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
  // If target order omitted something, include any extras
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

// ====== audio (simple oscillator) ======
let audioCtx = null;
function beep(type){
  if(!soundOn) return;
  if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  const now = audioCtx.currentTime;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();

  // basic tones
  let freq = 440;
  let dur = 0.12;
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

  // create empty slots so grid keeps shape? not needed; we place tiles with CSS grid positioning
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

  // Add small row labels for lanth/act rows (visual hint)
  // We'll place tiny “*” markers at columns 1-3 via invisible divs, optional. Skip for simplicity.
}

// ====== game flow ======
function setPills(){
  modePill.textContent = modeSelect.value === "practice" ? "Practice" :
                        modeSelect.value === "sprint" ? "Sprint" : "Streak";
  scorePill.textContent = `Score: ${score}`;
  bestPill.textContent = `Best: ${getBest()}`;
  streakPill.textContent = `Streak: ${streak}`;

  if(mode === "sprint") timerPill.textContent = `${timeLeft}s`;
  else timerPill.textContent = "∞";
}

function refreshBuildUI(){
  const counts = selectionCounts(selection);

  // render preview using target order if available; else alpha
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

function pickTarget(){
  const set = COMPOUND_SETS[levelKey] || COMPOUND_SETS.level1;
  const idx = Math.floor(Math.random() * set.length);
  currentTarget = set[idx];

  promptText.textContent = currentTarget.name;
  promptHint.textContent = currentTarget.hint || "";
  selection = [];
  refreshBuildUI();
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

  if(mode === "sprint"){
    startTimer();
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
function stopTimer(){
  if(timerHandle){
    window.clearInterval(timerHandle);
    timerHandle = null;
  }
}

function scoreCorrect(isPerfect){
  // perfect = correct atoms AND correct order (strict), or strictness=loose/teach but they matched canonical taps
  let pts = 10;

  // streak bonus
  streak += 1;
  pts += Math.min(10, Math.max(0, streak - 1)); // +0, +1, +2 ... cap +10

  if(strictness === "teach" && !isPerfect){
    pts = Math.max(6, Math.floor(pts * 0.6)); // still rewarding
  }

  score += pts;
  setPills();

  const best = getBest();
  if(score > best) bestPill.textContent = `Best: ${score}`;

  return pts;
}

function scoreWrong(kind){
  // gentle penalties (feel free to tweak)
  let penalty = 0;
  if(mode === "practice") penalty = 0;
  else penalty = (kind === "count") ? 3 : 2;

  score = Math.max(0, score - penalty);
  streak = 0;
  setPills();
  return penalty;
}

function submit(){
  if(gameState !== "running"){
    showToast("Press Start");
    return;
  }
  if(!currentTarget){
    showToast("No target");
    return;
  }

  const wantCounts = currentTarget.composition;
  const gotCounts = selectionCounts(selection);

  const countsOk = sameCounts(gotCounts, wantCounts);

  const canonical = canonicalTapSequence(currentTarget);
  const orderOk = arraysEqual(selection, canonical);

  if(!countsOk){
    beep("bad");
    scoreWrong("count");
    flashOverlay(false, `Not quite`, `You need: ${renderFormula(currentTarget.formulaOrder, wantCounts)}`, "bad");
    if(mode === "streak"){
      endGame("Wrong answer — streak ended.");
      return;
    }
    pickTarget();
    return;
  }

  // counts correct:
  if(strictness === "loose"){
    beep("good");
    const pts = scoreCorrect(true);
    flashOverlay(true, `Correct! +${pts}`, `${renderFormula(currentTarget.formulaOrder, wantCounts)}`, "good");
    pickTarget();
    return;
  }

  if(strictness === "strict"){
    if(orderOk){
      beep("good");
      const pts = scoreCorrect(true);
      flashOverlay(true, `Perfect! +${pts}`, `${renderFormula(currentTarget.formulaOrder, wantCounts)}`, "good");
      pickTarget();
    } else {
      beep("bad");
      scoreWrong("order");
      flashOverlay(false, `Order matters`, `Try tapping in this order: ${canonical.join(" ")}`, "bad");
      if(mode === "streak"){
        endGame("Wrong order — streak ended.");
        return;
      }
      pickTarget();
    }
    return;
  }

  // teach mode:
  if(orderOk){
    beep("good");
    const pts = scoreCorrect(true);
    flashOverlay(true, `Perfect! +${pts}`, `${renderFormula(currentTarget.formulaOrder, wantCounts)}`, "good");
  } else {
    beep("warn");
    const pts = scoreCorrect(false);
    flashOverlay(true, `Almost! +${pts}`, `Right atoms — usually written as ${renderFormula(currentTarget.formulaOrder, wantCounts)}`, "warn");
  }
  pickTarget();
}

function flashOverlay(ok, title, bigText, kind){
  // quick card pop, not full-screen
  const cls = kind === "good" ? "flashGood" : "flashBad";
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

  // style
  if(kind === "good") overlayCard.classList.add("flashGood");
  else if(kind === "warn") overlayCard.classList.add("flashGood");
  else overlayCard.classList.add("flashBad");

  window.clearTimeout(flashOverlay._t);
  flashOverlay._t = window.setTimeout(() => {
    overlay.classList.remove("show");
    overlay.setAttribute("aria-hidden", "true");
  }, 650);
}

// ====== events ======
startBtn.addEventListener("click", () => {
  startGame();
});

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
submitBtn.addEventListener("click", submit);

soundBtn.addEventListener("click", () => {
  soundOn = !soundOn;
  soundBtn.textContent = soundOn ? "🔊 Sound" : "🔈 Sound";
  soundBtn.setAttribute("aria-pressed", soundOn ? "true" : "false");
});

modeSelect.addEventListener("change", () => {
  mode = modeSelect.value;
  setPills();
});
levelSelect.addEventListener("change", () => {
  levelKey = levelSelect.value;
  setPills();
});
strictToggle.addEventListener("change", () => {
  strictness = strictToggle.value;
  setPills();
});

// Escape closes overlay
window.addEventListener("keydown", (e) => {
  if(e.key === "Enter"){
    if(gameState === "running") submit();
  }
  if(e.key === "Escape"){
    overlay.classList.remove("show");
    overlay.setAttribute("aria-hidden", "true");
  }
});

// ====== init ======
renderTable();
setPills();
refreshBuildUI();
showToast("Ready");

