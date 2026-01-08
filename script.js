/* Element Builder • Synge Street Learning Games
   FINAL:
   - No answer displayed under compound name
   - Build display shows what the student actually built (e.g., HO2 / H2O)
   - Earned hints + hint bar + streak bonus charge
   - Undo/Clear/Skip never disabled
   - Full periodic table (118) + lanth/act rows
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

const hintEnergyPill = $("hintEnergyPill");
const hintChargeFill = $("hintChargeFill");
const hintChargeText = $("hintChargeText");

const promptText = $("promptText");
const promptHint = $("promptHint");

const formulaPreview = $("formulaPreview");
const tapRow   = $("tapRow");
const undoBtn  = $("undoBtn");
const clearBtn = $("clearBtn");
const skipBtn  = $("skipBtn");
const hintBtn  = $("hintBtn");
const submitBtn= $("submitBtn");

const toast   = $("toast");
const overlay = $("overlay");
const overlayCard = $("overlayCard");
const ptable  = $("ptable");

// Always keep these active (prevents dulled/disabled look)
const actionButtons = [undoBtn, clearBtn, skipBtn, hintBtn, submitBtn].filter(Boolean);
function enableActionButtons(){
  actionButtons.forEach(b => {
    b.disabled = false;
    b.removeAttribute("disabled");
    b.style.pointerEvents = "auto";
  });
}

// ===== Hint Energy system =====
const HINT_COST = 3;
const STREAK_BONUS_EVERY = 3;

let hintEnergy = 0;
let hintStage = 0; // per target: 0 none, 1 elements, 2 counts

function updateHintUI(){
  const ready = Math.floor(hintEnergy / HINT_COST);
  const rem = hintEnergy % HINT_COST;
  const pct = Math.min(1, rem / HINT_COST);

  if(hintEnergyPill) hintEnergyPill.textContent = `Hints: ${hintEnergy} (${ready} ready)`;
  if(hintChargeFill) hintChargeFill.style.width = `${Math.round(pct * 100)}%`;
  if(hintChargeText) hintChargeText.textContent = ready > 0 ? `${ready} ready` : `${rem}/${HINT_COST}`;
}

// ===== Game state =====
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

// ===== Data (expanded sets) =====
const COMPOUND_SETS = {
  level1: [
    { name:"Water", formulaOrder:["H","O"], composition:{H:2,O:1} },
    { name:"Carbon dioxide", formulaOrder:["C","O"], composition:{C:1,O:2} },
    { name:"Salt (Sodium chloride)", formulaOrder:["Na","Cl"], composition:{Na:1,Cl:1} },
    { name:"Ammonia", formulaOrder:["N","H"], composition:{N:1,H:3} },
    { name:"Methane", formulaOrder:["C","H"], composition:{C:1,H:4} },
    { name:"Hydrogen peroxide", formulaOrder:["H","O"], composition:{H:2,O:2} },
    { name:"Magnesium oxide", formulaOrder:["Mg","O"], composition:{Mg:1,O:1} },
    { name:"Calcium chloride", formulaOrder:["Ca","Cl"], composition:{Ca:1,Cl:2} },
    { name:"Iron(III) oxide", formulaOrder:["Fe","O"], composition:{Fe:2,O:3} },
    { name:"Silicon dioxide", formulaOrder:["Si","O"], composition:{Si:1,O:2} },
  ],
  level2: [
    { name:"Oxygen", formulaOrder:["O"], composition:{O:2} },
    { name:"Nitrogen", formulaOrder:["N"], composition:{N:2} },
    { name:"Hydrogen", formulaOrder:["H"], composition:{H:2} },
    { name:"Chlorine", formulaOrder:["Cl"], composition:{Cl:2} },
    { name:"Carbon monoxide", formulaOrder:["C","O"], composition:{C:1,O:1} },
    { name:"Sulfur dioxide", formulaOrder:["S","O"], composition:{S:1,O:2} },
    { name:"Sulfur trioxide", formulaOrder:["S","O"], composition:{S:1,O:3} },
    { name:"Nitrogen dioxide", formulaOrder:["N","O"], composition:{N:1,O:2} },
    { name:"Ozone", formulaOrder:["O"], composition:{O:3} },
  ],
  level3: [
    { name:"Hydrochloric acid", formulaOrder:["H","Cl"], composition:{H:1,Cl:1} },
    { name:"Nitric acid", formulaOrder:["H","N","O"], composition:{H:1,N:1,O:3} },
    { name:"Sulfuric acid", formulaOrder:["H","S","O"], composition:{H:2,S:1,O:4} },
    { name:"Phosphoric acid", formulaOrder:["H","P","O"], composition:{H:3,P:1,O:4} },
    { name:"Sodium hydroxide", formulaOrder:["Na","O","H"], composition:{Na:1,O:1,H:1} },
    { name:"Calcium hydroxide", formulaOrder:["Ca","O","H"], composition:{Ca:1,O:2,H:2} },
    { name:"Sodium carbonate", formulaOrder:["Na","C","O"], composition:{Na:2,C:1,O:3} },
    { name:"Sodium bicarbonate", formulaOrder:["Na","H","C","O"], composition:{Na:1,H:1,C:1,O:3} },
  ],
  level4: [
    { name:"Sodium oxide", formulaOrder:["Na","O"], composition:{Na:2,O:1} },
    { name:"Potassium oxide", formulaOrder:["K","O"], composition:{K:2,O:1} },
    { name:"Aluminium oxide", formulaOrder:["Al","O"], composition:{Al:2,O:3} },
    { name:"Copper(I) oxide", formulaOrder:["Cu","O"], composition:{Cu:2,O:1} },
    { name:"Copper(II) oxide", formulaOrder:["Cu","O"], composition:{Cu:1,O:1} },
    { name:"Magnesium chloride", formulaOrder:["Mg","Cl"], composition:{Mg:1,Cl:2} },
    { name:"Calcium oxide", formulaOrder:["Ca","O"], composition:{Ca:1,O:1} },
    { name:"Zinc oxide", formulaOrder:["Zn","O"], composition:{Zn:1,O:1} },
  ],
  level5: [
    { name:"Glucose", formulaOrder:["C","H","O"], composition:{C:6,H:12,O:6} },
    { name:"Ethanol", formulaOrder:["C","H","O"], composition:{C:2,H:6,O:1} },
    { name:"Propane", formulaOrder:["C","H"], composition:{C:3,H:8} },
    { name:"Butane", formulaOrder:["C","H"], composition:{C:4,H:10} },
    { name:"Calcium carbonate", formulaOrder:["Ca","C","O"], composition:{Ca:1,C:1,O:3} },
    { name:"Sodium sulfate", formulaOrder:["Na","S","O"], composition:{Na:2,S:1,O:4} },
    { name:"Ammonium chloride", formulaOrder:["N","H","Cl"], composition:{N:1,H:4,Cl:1} },
  ],
};

// ===== Periodic table (118 + lanth/act rows) =====
const ELEMENTS = [
  {z:1,s:"H",n:"Hydrogen",p:1,g:1,c:"nonmetal"},
  {z:2,s:"He",n:"Helium",p:1,g:18,c:"noble"},

  {z:3,s:"Li",n:"Lithium",p:2,g:1,c:"alkali"},
  {z:4,s:"Be",n:"Beryllium",p:2,g:2,c:"alkaline"},
  {z:5,s:"B",n:"Boron",p:2,g:13,c:"metalloid"},
  {z:6,s:"C",n:"Carbon",p:2,g:14,c:"nonmetal"},
  {z:7,s:"N",n:"Nitrogen",p:2,g:15,c:"nonmetal"},
  {z:8,s:"O",n:"Oxygen",p:2,g:16,c:"nonmetal"},
  {z:9,s:"F",n:"Fluorine",p:2,g:17,c:"halogen"},
  {z:10,s:"Ne",n:"Neon",p:2,g:18,c:"noble"},

  {z:11,s:"Na",n:"Sodium",p:3,g:1,c:"alkali"},
  {z:12,s:"Mg",n:"Magnesium",p:3,g:2,c:"alkaline"},
  {z:13,s:"Al",n:"Aluminium",p:3,g:13,c:"post"},
  {z:14,s:"Si",n:"Silicon",p:3,g:14,c:"metalloid"},
  {z:15,s:"P",n:"Phosphorus",p:3,g:15,c:"nonmetal"},
  {z:16,s:"S",n:"Sulfur",p:3,g:16,c:"nonmetal"},
  {z:17,s:"Cl",n:"Chlorine",p:3,g:17,c:"halogen"},
  {z:18,s:"Ar",n:"Argon",p:3,g:18,c:"noble"},

  {z:19,s:"K",n:"Potassium",p:4,g:1,c:"alkali"},
  {z:20,s:"Ca",n:"Calcium",p:4,g:2,c:"alkaline"},
  {z:21,s:"Sc",n:"Scandium",p:4,g:3,c:"transition"},
  {z:22,s:"Ti",n:"Titanium",p:4,g:4,c:"transition"},
  {z:23,s:"V",n:"Vanadium",p:4,g:5,c:"transition"},
  {z:24,s:"Cr",n:"Chromium",p:4,g:6,c:"transition"},
  {z:25,s:"Mn",n:"Manganese",p:4,g:7,c:"transition"},
  {z:26,s:"Fe",n:"Iron",p:4,g:8,c:"transition"},
  {z:27,s:"Co",n:"Cobalt",p:4,g:9,c:"transition"},
  {z:28,s:"Ni",n:"Nickel",p:4,g:10,c:"transition"},
  {z:29,s:"Cu",n:"Copper",p:4,g:11,c:"transition"},
  {z:30,s:"Zn",n:"Zinc",p:4,g:12,c:"transition"},
  {z:31,s:"Ga",n:"Gallium",p:4,g:13,c:"post"},
  {z:32,s:"Ge",n:"Germanium",p:4,g:14,c:"metalloid"},
  {z:33,s:"As",n:"Arsenic",p:4,g:15,c:"metalloid"},
  {z:34,s:"Se",n:"Selenium",p:4,g:16,c:"nonmetal"},
  {z:35,s:"Br",n:"Bromine",p:4,g:17,c:"halogen"},
  {z:36,s:"Kr",n:"Krypton",p:4,g:18,c:"noble"},

  {z:37,s:"Rb",n:"Rubidium",p:5,g:1,c:"alkali"},
  {z:38,s:"Sr",n:"Strontium",p:5,g:2,c:"alkaline"},
  {z:39,s:"Y",n:"Yttrium",p:5,g:3,c:"transition"},
  {z:40,s:"Zr",n:"Zirconium",p:5,g:4,c:"transition"},
  {z:41,s:"Nb",n:"Niobium",p:5,g:5,c:"transition"},
  {z:42,s:"Mo",n:"Molybdenum",p:5,g:6,c:"transition"},
  {z:43,s:"Tc",n:"Technetium",p:5,g:7,c:"transition"},
  {z:44,s:"Ru",n:"Ruthenium",p:5,g:8,c:"transition"},
  {z:45,s:"Rh",n:"Rhodium",p:5,g:9,c:"transition"},
  {z:46,s:"Pd",n:"Palladium",p:5,g:10,c:"transition"},
  {z:47,s:"Ag",n:"Silver",p:5,g:11,c:"transition"},
  {z:48,s:"Cd",n:"Cadmium",p:5,g:12,c:"transition"},
  {z:49,s:"In",n:"Indium",p:5,g:13,c:"post"},
  {z:50,s:"Sn",n:"Tin",p:5,g:14,c:"post"},
  {z:51,s:"Sb",n:"Antimony",p:5,g:15,c:"metalloid"},
  {z:52,s:"Te",n:"Tellurium",p:5,g:16,c:"metalloid"},
  {z:53,s:"I",n:"Iodine",p:5,g:17,c:"halogen"},
  {z:54,s:"Xe",n:"Xenon",p:5,g:18,c:"noble"},

  {z:55,s:"Cs",n:"Caesium",p:6,g:1,c:"alkali"},
  {z:56,s:"Ba",n:"Barium",p:6,g:2,c:"alkaline"},
  {z:57,s:"La",n:"Lanthanum",p:6,g:3,c:"lanth"},
  {z:72,s:"Hf",n:"Hafnium",p:6,g:4,c:"transition"},
  {z:73,s:"Ta",n:"Tantalum",p:6,g:5,c:"transition"},
  {z:74,s:"W",n:"Tungsten",p:6,g:6,c:"transition"},
  {z:75,s:"Re",n:"Rhenium",p:6,g:7,c:"transition"},
  {z:76,s:"Os",n:"Osmium",p:6,g:8,c:"transition"},
  {z:77,s:"Ir",n:"Iridium",p:6,g:9,c:"transition"},
  {z:78,s:"Pt",n:"Platinum",p:6,g:10,c:"transition"},
  {z:79,s:"Au",n:"Gold",p:6,g:11,c:"transition"},
  {z:80,s:"Hg",n:"Mercury",p:6,g:12,c:"transition"},
  {z:81,s:"Tl",n:"Thallium",p:6,g:13,c:"post"},
  {z:82,s:"Pb",n:"Lead",p:6,g:14,c:"post"},
  {z:83,s:"Bi",n:"Bismuth",p:6,g:15,c:"post"},
  {z:84,s:"Po",n:"Polonium",p:6,g:16,c:"post"},
  {z:85,s:"At",n:"Astatine",p:6,g:17,c:"halogen"},
  {z:86,s:"Rn",n:"Radon",p:6,g:18,c:"noble"},

  {z:87,s:"Fr",n:"Francium",p:7,g:1,c:"alkali"},
  {z:88,s:"Ra",n:"Radium",p:7,g:2,c:"alkaline"},
  {z:89,s:"Ac",n:"Actinium",p:7,g:3,c:"act"},
  {z:104,s:"Rf",n:"Rutherfordium",p:7,g:4,c:"transition"},
  {z:105,s:"Db",n:"Dubnium",p:7,g:5,c:"transition"},
  {z:106,s:"Sg",n:"Seaborgium",p:7,g:6,c:"transition"},
  {z:107,s:"Bh",n:"Bohrium",p:7,g:7,c:"transition"},
  {z:108,s:"Hs",n:"Hassium",p:7,g:8,c:"transition"},
  {z:109,s:"Mt",n:"Meitnerium",p:7,g:9,c:"transition"},
  {z:110,s:"Ds",n:"Darmstadtium",p:7,g:10,c:"transition"},
  {z:111,s:"Rg",n:"Roentgenium",p:7,g:11,c:"transition"},
  {z:112,s:"Cn",n:"Copernicium",p:7,g:12,c:"transition"},
  {z:113,s:"Nh",n:"Nihonium",p:7,g:13,c:"post"},
  {z:114,s:"Fl",n:"Flerovium",p:7,g:14,c:"post"},
  {z:115,s:"Mc",n:"Moscovium",p:7,g:15,c:"post"},
  {z:116,s:"Lv",n:"Livermorium",p:7,g:16,c:"post"},
  {z:117,s:"Ts",n:"Tennessine",p:7,g:17,c:"halogen"},
  {z:118,s:"Og",n:"Oganesson",p:7,g:18,c:"noble"},

  // Lanthanides row (p=8, groups 4–17)
  {z:58,s:"Ce",n:"Cerium",p:8,g:4,c:"lanth"},
  {z:59,s:"Pr",n:"Praseodymium",p:8,g:5,c:"lanth"},
  {z:60,s:"Nd",n:"Neodymium",p:8,g:6,c:"lanth"},
  {z:61,s:"Pm",n:"Promethium",p:8,g:7,c:"lanth"},
  {z:62,s:"Sm",n:"Samarium",p:8,g:8,c:"lanth"},
  {z:63,s:"Eu",n:"Europium",p:8,g:9,c:"lanth"},
  {z:64,s:"Gd",n:"Gadolinium",p:8,g:10,c:"lanth"},
  {z:65,s:"Tb",n:"Terbium",p:8,g:11,c:"lanth"},
  {z:66,s:"Dy",n:"Dysprosium",p:8,g:12,c:"lanth"},
  {z:67,s:"Ho",n:"Holmium",p:8,g:13,c:"lanth"},
  {z:68,s:"Er",n:"Erbium",p:8,g:14,c:"lanth"},
  {z:69,s:"Tm",n:"Thulium",p:8,g:15,c:"lanth"},
  {z:70,s:"Yb",n:"Ytterbium",p:8,g:16,c:"lanth"},
  {z:71,s:"Lu",n:"Lutetium",p:8,g:17,c:"lanth"},

  // Actinides row (p=9, groups 4–17)
  {z:90,s:"Th",n:"Thorium",p:9,g:4,c:"act"},
  {z:91,s:"Pa",n:"Protactinium",p:9,g:5,c:"act"},
  {z:92,s:"U",n:"Uranium",p:9,g:6,c:"act"},
  {z:93,s:"Np",n:"Neptunium",p:9,g:7,c:"act"},
  {z:94,s:"Pu",n:"Plutonium",p:9,g:8,c:"act"},
  {z:95,s:"Am",n:"Americium",p:9,g:9,c:"act"},
  {z:96,s:"Cm",n:"Curium",p:9,g:10,c:"act"},
  {z:97,s:"Bk",n:"Berkelium",p:9,g:11,c:"act"},
  {z:98,s:"Cf",n:"Californium",p:9,g:12,c:"act"},
  {z:99,s:"Es",n:"Einsteinium",p:9,g:13,c:"act"},
  {z:100,s:"Fm",n:"Fermium",p:9,g:14,c:"act"},
  {z:101,s:"Md",n:"Mendelevium",p:9,g:15,c:"act"},
  {z:102,s:"No",n:"Nobelium",p:9,g:16,c:"act"},
  {z:103,s:"Lr",n:"Lawrencium",p:9,g:17,c:"act"},
];

// ===== Helpers =====
function showToast(msg){
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), 1100);
}

const subMap = { "0":"₀","1":"₁","2":"₂","3":"₃","4":"₄","5":"₅","6":"₆","7":"₇","8":"₈","9":"₉" };
function subscript(n){
  return String(n).split("").map(ch => subMap[ch] || ch).join("");
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

// Render what the STUDENT built, not the answer.
// Uses order of first appearance in selection, with subscripts.
function builtFormulaFromSelection(sel){
  if(sel.length === 0) return "—";
  const counts = selectionCounts(sel);
  const order = [];
  const seen = new Set();
  for(const sym of sel){
    if(!seen.has(sym)){
      seen.add(sym);
      order.push(sym);
    }
  }
  let out = "";
  for(const sym of order){
    const ct = counts[sym] || 0;
    if(ct <= 0) continue;
    out += sym + (ct > 1 ? subscript(ct) : "");
  }
  return out || "—";
}

// Tiered hints (never full formula)
function hintElementsOnly(target){
  const elems = Object.keys(target.composition).sort();
  if(elems.length === 1) return `Element: ${elems[0]}`;
  if(elems.length === 2) return `Elements: ${elems[0]} and ${elems[1]}`;
  return `Elements: ${elems.slice(0,-1).join(", ")} and ${elems[elems.length-1]}`;
}

function hintCounts(target){
  const elems = Object.keys(target.composition).sort();
  const parts = elems.map(sym => `${target.composition[sym]}×${sym}`);
  return `Counts: ${parts.join("  ")}`;
}

// ===== Audio =====
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

// ===== Best score storage =====
function bestKey(){ return `element-builder::best::${mode}::${levelKey}::${strictness}`; }
function getBest(){ return Number(localStorage.getItem(bestKey()) || "0"); }
function setBest(val){ localStorage.setItem(bestKey(), String(val)); }

// ===== UI =====
function setPills(){
  modePill.textContent = mode === "practice" ? "Practice" : mode === "sprint" ? "Sprint" : "Streak";
  scorePill.textContent = `Score: ${score}`;
  bestPill.textContent = `Best: ${getBest()}`;
  streakPill.textContent = `Streak: ${streak}`;
  timerPill.textContent = (mode === "sprint") ? `${timeLeft}s` : "∞";
  poolPill.textContent = `Pool: ${(COMPOUND_SETS[levelKey] || []).length}`;
  updateHintUI();
}

function refreshBuildUI(){
  formulaPreview.textContent = builtFormulaFromSelection(selection);

  tapRow.innerHTML = "";
  for(const sym of selection){
    const tok = document.createElement("div");
    tok.className = "tapToken";
    tok.textContent = sym;
    tapRow.appendChild(tok);
  }
}

// ===== Table render =====
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

// ===== Game flow =====
function pickTarget(){
  const set = COMPOUND_SETS[levelKey] || COMPOUND_SETS.level1;
  currentTarget = set[Math.floor(Math.random() * set.length)];

  promptText.textContent = currentTarget.name;

  // IMPORTANT: no automatic hint/answer here
  promptHint.textContent = "";
  hintStage = 0;

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
      <span class="tag">Hint energy: ${hintEnergy}</span>
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

function scoreWrong(kind){
  const penalty = (mode === "practice") ? 0 : (kind === "count" ? 3 : 2);
  score = Math.max(0, score - penalty);
  streak = 0;
  setPills();
}

function scoreCorrect(isPerfect){
  let pts = 10;
  streak += 1;
  pts += Math.min(10, Math.max(0, streak - 1));

  // teach mode: correct counts but wrong order = reduced points
  if(strictness === "teach" && !isPerfect){
    pts = Math.max(6, Math.floor(pts * 0.6));
  }

  // earned hints
  hintEnergy += 1;

  // streak bonus charge
  if(streak > 0 && (streak % STREAK_BONUS_EVERY === 0)){
    hintEnergy += 1;
    showToast(`🔥 Streak bonus! +1 hint charge (streak ${streak})`);
  }

  score += pts;
  if(score > getBest()) bestPill.textContent = `Best: ${score}`;
  setPills();
  return pts;
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
    showToast("❌ Not quite — try again (earn hints if stuck)");
    if(mode === "streak"){ endGame("Wrong answer — streak ended."); return; }
    pickTarget();
    return;
  }

  if(strictness === "loose"){
    beep("good");
    const pts = scoreCorrect(true);
    showToast(`✅ Correct! +${pts}  (+1 hint)`);
    pickTarget();
    return;
  }

  if(strictness === "strict"){
    if(orderOk){
      beep("good");
      const pts = scoreCorrect(true);
      showToast(`✅ Perfect! +${pts}  (+1 hint)`);
      pickTarget();
    } else {
      beep("bad");
      scoreWrong("order");
      showToast("❌ Order matters — try again");
      if(mode === "streak"){ endGame("Wrong order — streak ended."); return; }
      pickTarget();
    }
    return;
  }

  // teach
  if(orderOk){
    beep("good");
    const pts = scoreCorrect(true);
    showToast(`✅ Perfect! +${pts}  (+1 hint)`);
  } else {
    beep("warn");
    const pts = scoreCorrect(false);
    showToast(`⚠️ Correct atoms! +${pts}  (+1 hint)`);
    // counts are already right, so order tip is safe here:
    promptHint.textContent = `Tip: common order is ${currentTarget.formulaOrder.join(" then ")}`;
  }
  pickTarget();
}

function startGame(){
  enableActionButtons();

  mode = modeSelect.value;
  strictness = strictToggle.value;
  levelKey = levelSelect.value;

  score = 0;
  streak = 0;
  hintEnergy = 0;
  hintStage = 0;

  timeLeft = sprintSeconds;
  gameState = "running";

  overlay.classList.remove("show");
  overlay.setAttribute("aria-hidden","true");

  pickTarget();
  setPills();

  if(mode === "sprint") startTimer();
  else stopTimer();
}

// ===== Hint button (earned, tiered) =====
hintBtn.addEventListener("click", () => {
  enableActionButtons();
  if(gameState !== "running"){ showToast("Press Start"); return; }
  if(!currentTarget) return;

  // if already at max hint stage, don't charge again
  if(hintStage >= 2){
    showToast("No more hints for this one");
    return;
  }

  if(hintEnergy < HINT_COST){
    const need = HINT_COST - hintEnergy;
    showToast(`Need ${need} more correct to use Hint`);
    promptHint.textContent = `Hint charge: ${hintEnergy}/${HINT_COST} (earned by correct answers)`;
    return;
  }

  hintEnergy -= HINT_COST;
  hintStage += 1;
  updateHintUI();

  if(hintStage === 1){
    promptHint.textContent = `Hint: ${hintElementsOnly(currentTarget)}`;
    showToast("Hint used: elements");
  } else {
    promptHint.textContent = `Hint: ${hintCounts(currentTarget)}`;
    showToast("Hint used: counts");
  }
});

// ===== Buttons =====
startBtn.addEventListener("click", startGame);

undoBtn.addEventListener("click", () => {
  enableActionButtons();
  if(gameState !== "running"){ showToast("Press Start"); return; }
  if(selection.length === 0){ showToast("Nothing to undo"); return; }
  selection.pop();
  refreshBuildUI();
  beep("tap");
});

clearBtn.addEventListener("click", () => {
  enableActionButtons();
  if(gameState !== "running"){ showToast("Press Start"); return; }
  selection = [];
  refreshBuildUI();
  showToast("Cleared");
});

skipBtn.addEventListener("click", () => {
  enableActionButtons();
  if(gameState !== "running"){ showToast("Press Start"); return; }
  if(mode !== "practice") score = Math.max(0, score - 1);
  streak = 0;
  hintStage = 0;
  promptHint.textContent = "";
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

// keyboard shortcuts
window.addEventListener("keydown", (e) => {
  if(gameState !== "running") return;

  if(e.key === "Enter") submit();
  if(e.key === "Backspace"){
    e.preventDefault();
    if(selection.length){ selection.pop(); refreshBuildUI(); beep("tap"); }
  }
  if(e.key === "Delete"){
    selection = [];
    refreshBuildUI();
    showToast("Cleared");
  }
  if(e.key === "Escape"){
    overlay.classList.remove("show");
    overlay.setAttribute("aria-hidden","true");
  }
});

// footer year
(() => {
  const y = new Date().getFullYear();
  const el = document.getElementById("copyrightText");
  if(el) el.textContent = `© ${y} Synge Street Learning Games`;
})();

// init
enableActionButtons();
renderTable();
setPills();
refreshBuildUI();
showToast("Ready");
