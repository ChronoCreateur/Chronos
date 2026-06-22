const STORAGE_KEY = "chronocreateur.v4";
const BIN_MAGIC = "CHRONOCREATEUR_BIN_V1\n";
const NS = "http://www.w3.org/2000/svg";

const ICONS = {
  plume: "M -6 -10 C 7 -14 12 -7 5 1 L -8 12 L -4 2 L -11 5 L -7 -2 Z",
  livre: "M -11 -9 H -2 C 1 -9 2 -7 2 -5 V 11 C 1 9 -1 8 -4 8 H -11 Z M 2 -5 C 3 -7 5 -9 8 -9 H 11 V 8 H 5 C 3 8 2 9 2 11 Z",
  etoile: "M 0 -12 L 3 -4 L 12 -4 L 5 1 L 8 10 L 0 5 L -8 10 L -5 1 L -12 -4 L -3 -4 Z",
  theatre: "M -10 -8 Q -5 -12 0 -8 Q 5 -12 10 -8 V 0 Q 10 10 0 12 Q -10 10 -10 0 Z M -5 -2 H -1 M 1 -2 H 5 M -4 5 Q 0 8 4 5",
  science: "M -7 -10 H 7 M -3 -10 V -2 L -10 10 H 10 L 3 -2 V -10",
  globe: "M 0 -12 A 12 12 0 1 0 0 12 A 12 12 0 1 0 0 -12 M -12 0 H 12 M 0 -12 C -5 -7 -5 7 0 12 M 0 -12 C 5 -7 5 7 0 12",
  eclair: "M 2 -12 L -8 2 H -1 L -3 12 L 8 -3 H 1 Z",
  coeur: "M 0 10 C -11 2 -12 -5 -7 -8 C -3 -10 0 -6 0 -6 C 0 -6 3 -10 7 -8 C 12 -5 11 2 0 10 Z",
};

const ICON_ALIASES = {
  "✒": "plume",
  "🏛": "livre",
  "⛵": "globe",
  "⚖": "livre",
  "☾": "etoile",
  "◎": "globe",
  "⚔": "eclair",
  "♛": "etoile",
  "♜": "livre",
  "✦": "etoile",
  "⚑": "etoile",
  "◆": "etoile",
  "△": "science",
  "☉": "science",
  "●": "science",
  "✚": "science",
  "∑": "science",
  "⌬": "science",
  "🧭": "globe",
  "⌁": "eclair",
  "☎": "eclair",
  "▣": "science",
  "▯": "eclair",
  "★": "etoile",
};

const STYLE_PRESETS = {
  scolaire: { label: "Scolaire PDF", bg: "#fbfbfa", axis: "#5d646b", grid: "#d6d9dd", box: "#ffffff", shadow: 0.05, radius: 1, dotted: "2 2" },
  moderne: { label: "Moderne", bg: "#f3f5f8", axis: "#172033", grid: "#d8dee8", box: "#ffffff", shadow: 0.13, radius: 8, dotted: "4 4" },
  minimal: { label: "Minimal noir et blanc", bg: "#ffffff", axis: "#222222", grid: "#e4e4e4", box: "#ffffff", shadow: 0, radius: 0, dotted: "1 3" },
  nuit: { label: "Nuit", bg: "#11151b", axis: "#eef3f7", grid: "#2d3745", box: "#171d25", shadow: 0.22, radius: 6, dotted: "4 4" },
  couleur: { label: "Couleurs vives", bg: "#fffaf3", axis: "#263238", grid: "#edd9bd", box: "#fffdf9", shadow: 0.12, radius: 5, dotted: "3 3" },
};

const $ = (selector) => document.querySelector(selector);
const svg = $("#timelineSvg");
const layers = {
  grid: $("#gridLayer"),
  axis: $("#axisLayer"),
  period: $("#periodLayer"),
  item: $("#itemLayer"),
  selection: $("#selectionLayer"),
};

const state = {
  projects: [],
  currentId: null,
  selectedId: null,
  selectedIds: new Set(),
  view: { center: 1900, scale: 1.5 },
  printSize: "a4",
  history: [],
  future: [],
  bboxes: new Map(),
  isDark: false,
  search: "",
  dragging: null,
  formSnapshotOpen: false,
};

const templates = [
  {
    id: "world",
    name: "Histoire mondiale",
    start: -3200,
    end: 2026,
    style: "scolaire",
    axisStyle: "double",
    tickStep: "500",
    minorTicks: 5,
    titleBox: true,
    axisPosition: 58,
    elements: [
      { ...period("Antiquité", -3200, 476, "#4a8f7a", -92, 30), periodStyle: "capsule" },
      { ...period("Moyen Âge", 476, 1492, "#ad7a34", -50, 30), periodStyle: "capsule" },
      { ...period("Époque moderne", 1492, 1789, "#6d74b8", -8, 30), periodStyle: "capsule" },
      { ...period("Époque contemporaine", 1789, 2026, "#c95f32", 34, 30), periodStyle: "capsule" },
      event("Premières écritures", -3200, "Naissance de l'écriture en Mésopotamie.", "✒", "#1f7a6d", -212),
      event("Chute de Rome", 476, "Fin de l'Empire romain d'Occident.", "🏛", "#7e5e42", -174),
      event("Christophe Colomb", 1492, "Voyage vers les Amériques.", "⛵", "#3f78aa", -210),
      event("Révolution française", 1789, "Déclaration des droits et bouleversement politique.", "⚖", "#c95f32", -132),
      event("Premier pas sur la Lune", 1969, "Apollo 11 marque l'histoire spatiale.", "☾", "#5762b7", -286),
      event("Web public", 1991, "Le World Wide Web devient accessible.", "◎", "#1f7a6d", 96),
    ],
  },
  {
    id: "france",
    name: "Histoire de France",
    start: -52,
    end: 2026,
    style: "scolaire",
    axisStyle: "arrow",
    tickStep: "250",
    minorTicks: 5,
    titleBox: true,
    axisPosition: 57,
    elements: [
      { ...period("Gaule romaine", -52, 486, "#4a8f7a", 54, 28), periodStyle: "soft" },
      { ...period("Royaume de France", 987, 1792, "#6d74b8", 92, 28), periodStyle: "soft" },
      { ...period("Républiques et empires", 1792, 2026, "#c95f32", 130, 28), periodStyle: "soft" },
      event("Alésia", -52, "Victoire de César sur Vercingétorix.", "⚔", "#8b5f38", -180),
      event("Clovis roi des Francs", 481, "Fondation d'un pouvoir franc durable.", "♛", "#426b98", -138),
      event("Hugues Capet", 987, "Début de la dynastie capétienne.", "♜", "#5762b7", -210),
      event("Jeanne d'Arc", 1429, "Libération d'Orléans.", "✦", "#8c3d69", -166),
      event("Prise de la Bastille", 1789, "Symbole de la Révolution française.", "⚑", "#c93f4b", -226),
      event("Cinquième République", 1958, "Nouvelle constitution française.", "◆", "#1f7a6d", 106),
    ],
  },
  {
    id: "science",
    name: "Sciences et inventions",
    start: -600,
    end: 2026,
    style: "minimal",
    axisStyle: "ruler",
    tickStep: "500",
    minorTicks: 5,
    titleBox: true,
    axisPosition: 56,
    elements: [
      { ...period("Sciences antiques", -600, 500, "#4a8f7a", 62, 26), periodStyle: "rail" },
      { ...period("Révolution scientifique", 1543, 1700, "#6d74b8", 100, 26), periodStyle: "rail" },
      { ...period("Sciences modernes", 1800, 2026, "#c95f32", 138, 26), periodStyle: "rail" },
      event("Pythagore", -530, "Mathématiques et philosophie grecque.", "△", "#386b8f", -170),
      event("Héliocentrisme", 1543, "Copernic publie De revolutionibus.", "☉", "#ad7a34", -226),
      event("Gravitation", 1687, "Newton formalise la mécanique classique.", "●", "#5762b7", -146),
      event("Vaccination", 1796, "Edward Jenner popularise la vaccination.", "✚", "#1f7a6d", 96),
      event("Relativité générale", 1915, "Einstein transforme la physique.", "∑", "#8c3d69", -286),
      event("CRISPR", 2012, "Édition génétique programmable.", "⌬", "#c95f32", -70),
    ],
  },
  {
    id: "discoveries",
    name: "Grandes découvertes",
    start: 1200,
    end: 1800,
    style: "couleur",
    axisStyle: "rounded",
    tickStep: "50",
    minorTicks: 5,
    titleBox: true,
    axisPosition: 57,
    elements: [
      { ...period("Explorations maritimes", 1400, 1600, "#3f78aa", 58, 30), periodStyle: "outline" },
      event("Marco Polo", 1271, "Voyage vers l'Asie.", "🧭", "#8b5f38", -180),
      event("Cap de Bonne-Espérance", 1488, "Bartolomeu Dias contourne l'Afrique.", "⛵", "#3f78aa", -226),
      event("Amériques", 1492, "Arrivée de Colomb aux Caraïbes.", "◆", "#c95f32", -146),
      event("Route des Indes", 1498, "Vasco de Gama atteint Calicut.", "✦", "#1f7a6d", 104),
      event("Tour du monde", 1522, "L'expédition de Magellan-Elcano boucle la circumnavigation.", "◎", "#5762b7", -286),
      arrow("Circulation des savoirs", 1450, 1650, "#c95f32", 142),
    ],
  },
  {
    id: "tech",
    name: "Évolution technologique",
    start: 1800,
    end: 2035,
    style: "moderne",
    axisStyle: "thick",
    tickStep: "25",
    minorTicks: 5,
    titleBox: true,
    axisPosition: 57,
    elements: [
      { ...period("Industrialisation", 1800, 1914, "#ad7a34", 60, 28), periodStyle: "bracket" },
      { ...period("Informatique", 1945, 2007, "#5762b7", 96, 28), periodStyle: "bracket" },
      { ...period("IA et mobilité", 2007, 2035, "#1f7a6d", 132, 28), periodStyle: "bracket" },
      event("Télégraphe", 1837, "Transmission électrique de messages.", "⌁", "#8b5f38", -170),
      event("Téléphone", 1876, "Alexander Graham Bell brevète le téléphone.", "☎", "#3f78aa", -218),
      event("Ordinateur ENIAC", 1945, "Calcul électronique programmable.", "▣", "#5762b7", -156),
      event("Internet", 1983, "TCP/IP devient la base du réseau.", "◎", "#1f7a6d", -234),
      event("Smartphone moderne", 2007, "Le mobile devient plateforme universelle.", "▯", "#c95f32", 108),
      event("IA générative", 2022, "Large diffusion des modèles génératifs.", "✦", "#8c3d69", -182),
    ],
  },
];

function event(title, date, description, icon, color, y) {
  return {
    id: uid(),
    type: "event",
    title,
    date,
    endDate: extractEndDate(description, date),
    description,
    icon,
    color,
    y,
    width: 150,
    height: 54,
    fontSize: 11,
    opacity: 1,
    align: "start",
    image: "",
    iconKey: ICONS[icon] ? icon : ICON_ALIASES[icon] || "plume",
    shape: "sharp",
    connector: "dotted",
    fillMode: "white",
  };
}

function period(title, start, end, color, y, height) {
  return {
    id: uid(),
    type: "period",
    title,
    start,
    end,
    color,
    y,
    height,
    fontSize: 14,
    opacity: 0.9,
    align: "center",
    periodStyle: "band",
  };
}

function arrow(title, start, end, color, y) {
  return {
    id: uid(),
    type: "arrow",
    title,
    start,
    end,
    color,
    y,
    width: 3,
    opacity: 1,
  };
}

function uid() {
  return `cc_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function currentProject() {
  return state.projects.find((project) => project.id === state.currentId) || state.projects[0];
}

function css(name) {
  return getComputedStyle(document.body).getPropertyValue(name).trim();
}

function createSvg(tag, attrs = {}, parent) {
  const node = document.createElementNS(NS, tag);
  Object.entries(attrs).forEach(([key, value]) => {
    if (value !== undefined && value !== null) node.setAttribute(key, value);
  });
  if (parent) parent.appendChild(node);
  return node;
}

function clearLayer(layer) {
  while (layer.firstChild) layer.removeChild(layer.firstChild);
}

function createProjectFromTemplate(template) {
  const copy = clone(template);
  copy.id = uid();
  copy.name = template.name;
  copy.style = copy.style || "scolaire";
  copy.tickStep = copy.tickStep || "auto";
  copy.minorTicks = copy.minorTicks ?? 5;
  copy.titleBox = copy.titleBox ?? true;
  copy.createdAt = new Date().toISOString();
  copy.updatedAt = new Date().toISOString();
  copy.elements = copy.elements.map((element) => normalizeElement({ ...element, id: uid() }));
  return copy;
}

function blankProject() {
  return {
    id: uid(),
    name: "",
    start: 1500,
    end: 2026,
    style: "scolaire",
    tickStep: "50",
    minorTicks: 5,
    titleBox: false,
    axisPosition: 56,
    axisStyle: "arrow",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    elements: [],
  };
}

function normalizeProject(project) {
  project.style = project.style || "scolaire";
  project.tickStep = project.tickStep || "auto";
  project.minorTicks = Number(project.minorTicks ?? 5);
  project.titleBox = project.titleBox ?? true;
  project.axisPosition = Number(project.axisPosition ?? 56);
  project.axisStyle = project.axisStyle || "arrow";
  project.elements = (project.elements || []).map(normalizeElement);
  return project;
}

function normalizeElement(element) {
  if (element.type === "event") {
    if (element.endDate === undefined || element.endDate === "") element.endDate = extractEndDate(element.description, element.date);
    element.iconKey = element.iconKey || "plume";
    element.shape = element.shape || "box";
    element.connector = element.connector || "dotted";
    element.width = Number(element.width || 150);
    element.height = Number(element.height || 54);
    element.fontSize = Number(element.fontSize || 11);
  }
  if (element.type === "period") {
    element.periodStyle = element.periodStyle || "band";
    element.height = Number(element.height || 24);
    element.opacity = element.opacity ?? 0.88;
  }
  return element;
}

function loadStore() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const data = JSON.parse(stored);
      state.projects = Array.isArray(data.projects) ? data.projects.map(normalizeProject) : [];
      state.currentId = data.currentId || state.projects[0]?.id;
      state.view = data.view || state.view;
      state.printSize = data.printSize || "a4";
      state.isDark = Boolean(data.isDark);
    } catch {
      state.projects = [];
    }
  }

  if (!state.projects.length) {
    state.projects = [blankProject()];
    state.currentId = state.projects[0].id;
  }

  document.body.classList.toggle("dark", state.isDark);
  const printInput = $("#printSizeInput");
  if (printInput) printInput.value = state.printSize;
}

function saveStore(label = "Sauvegardé") {
  const project = currentProject();
  if (project) project.updatedAt = new Date().toISOString();
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      projects: state.projects,
      currentId: state.currentId,
      view: state.view,
      printSize: state.printSize,
      isDark: state.isDark,
    })
  );
  $("#autosaveLabel").textContent = `${label} à ${new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
}

function pushHistory() {
  const project = currentProject();
  if (!project) return;
  state.history.push(clone(project));
  if (state.history.length > 80) state.history.shift();
  state.future = [];
  updateToolbarState();
}

function restoreProject(snapshot) {
  const index = state.projects.findIndex((project) => project.id === snapshot.id);
  if (index >= 0) state.projects[index] = clone(snapshot);
  clearSelection(false);
  renderAll();
  saveStore("Restauré");
}

function undo() {
  if (!state.history.length) return;
  const project = currentProject();
  state.future.push(clone(project));
  restoreProject(state.history.pop());
}

function redo() {
  if (!state.future.length) return;
  const project = currentProject();
  state.history.push(clone(project));
  restoreProject(state.future.pop());
}

function updateToolbarState() {
  $("#undoBtn").disabled = !state.history.length;
  $("#redoBtn").disabled = !state.future.length;
}

function getSize() {
  const rect = svg.getBoundingClientRect();
  return { width: Math.max(600, rect.width), height: Math.max(420, rect.height) };
}

function projectBounds(project = currentProject()) {
  let start = Number(project?.start ?? -100);
  let end = Number(project?.end ?? 2100);
  if (end === start) end = start + 1;
  if (end < start) [start, end] = [end, start];
  return { start, end, range: end - start };
}

function keepElementInProject(element, project = currentProject()) {
  const { start, end, range } = projectBounds(project);
  if ("date" in element) {
    element.date = Math.round(clamp(Number(element.date), start, end));
  }
  if ("endDate" in element && element.endDate !== "" && element.endDate !== null && element.endDate !== undefined && Number.isFinite(Number(element.endDate))) {
    element.endDate = Math.round(clamp(Number(element.endDate), start, end));
  }
  if ("start" in element && "end" in element) {
    let a = Number(element.start);
    let b = Number(element.end);
    if (b < a) [a, b] = [b, a];
    let duration = Math.min(Math.max(1, b - a), range);
    if (a < start) {
      a = start;
      b = start + duration;
    }
    if (b > end) {
      b = end;
      a = end - duration;
    }
    element.start = Math.round(clamp(a, start, end));
    element.end = Math.round(clamp(b, start, end));
  }
}

function minScaleForProject(width = getSize().width, project = currentProject()) {
  const { range } = projectBounds(project);
  return Math.max(0.05, (width - 96) / Math.max(1, range));
}

function fitViewToProject(width = getSize().width) {
  const project = currentProject();
  if (!project) return;
  const { start, end, range } = projectBounds(project);
  state.view.center = (start + end) / 2;
  state.view.scale = minScaleForProject(width, project);
  $("#zoomRange").min = state.view.scale;
  $("#zoomRange").max = state.view.scale;
  $("#zoomRange").value = state.view.scale;
}

function yearToX(year, width = getSize().width) {
  return width / 2 + (year - state.view.center) * state.view.scale;
}

function xToYear(x, width = getSize().width) {
  return state.view.center + (x - width / 2) / state.view.scale;
}

function formatYear(year) {
  const rounded = Math.round(year);
  if (rounded < 0) return `${Math.abs(rounded).toLocaleString("fr-FR")} av. J.-C.`;
  if (rounded === 0) return "an 0";
  return rounded.toLocaleString("fr-FR");
}

function extractEndDate(value, startDate) {
  const matches = String(value || "").match(/-?\d{1,6}/g);
  if (!matches || matches.length < 2) return "";
  const end = Number(matches[1]);
  return Number.isFinite(end) && end !== Number(startDate) ? end : "";
}

function eventDateLabel(element) {
  const start = formatYear(element.date);
  const end = element.endDate !== "" && element.endDate !== null && element.endDate !== undefined && Number.isFinite(Number(element.endDate)) ? formatYear(element.endDate) : "";
  if (end) return `${start} à ${end}`;
  const simpleRange = String(element.description || "").match(/^\s*-?\d{1,6}\s*(à|-|–)\s*-?\d{1,6}\s*$/);
  return simpleRange ? element.description : start;
}

function truncateText(value, maxWidth, fontSize) {
  const text = String(value || "");
  const maxChars = Math.max(3, Math.floor(maxWidth / (fontSize * 0.55)));
  return text.length > maxChars ? `${text.slice(0, Math.max(1, maxChars - 3))}...` : text;
}

function chooseTickStep() {
  const project = currentProject();
  if (project?.tickStep && project.tickStep !== "auto") return Number(project.tickStep);
  const targetYears = 120 / state.view.scale;
  const magnitude = 10 ** Math.floor(Math.log10(Math.max(1, targetYears)));
  const steps = [1, 2, 5, 10].map((n) => n * magnitude);
  return steps.find((step) => step >= targetYears) || steps[steps.length - 1];
}

function scaleLabel(step) {
  if (step >= 1000) return `Repères tous les ${step / 1000} millénaire${step >= 2000 ? "s" : ""}`;
  if (step >= 100) return `Repères tous les ${step / 100} siècle${step >= 200 ? "s" : ""}`;
  return `Repères tous les ${step} an${step > 1 ? "s" : ""}`;
}

function selectionIds() {
  return [...state.selectedIds].filter((id) => currentProject()?.elements.some((element) => element.id === id));
}

function clearSelection(render = true) {
  state.selectedId = null;
  state.selectedIds = new Set();
  state.formSnapshotOpen = false;
  if (render) {
    renderTimeline();
    renderProperties();
  }
}

function setSelection(ids, render = true) {
  const valid = ids.filter((id) => currentProject()?.elements.some((element) => element.id === id));
  state.selectedIds = new Set(valid);
  state.selectedId = valid.length === 1 ? valid[0] : valid[0] || null;
  state.formSnapshotOpen = false;
  if (render) {
    renderTimeline();
    renderProperties();
  }
}

function selectionTargets(fallbackToAll = false) {
  const project = currentProject();
  if (!project) return [];
  const ids = selectionIds();
  if (ids.length) return project.elements.filter((element) => ids.includes(element.id));
  return fallbackToAll ? project.elements : [];
}

function renderAll() {
  renderLists();
  renderProjectFields();
  renderTimeline();
  renderProperties();
  updateToolbarState();
}

function renderLists() {
  const templateList = $("#templateList");
  templateList.innerHTML = "";
  templates.forEach((template) => {
    const button = document.createElement("button");
    button.className = "list-item";
    button.innerHTML = `<strong>${template.name}</strong><span>${formatYear(template.start)} → ${formatYear(template.end)}</span>`;
    button.addEventListener("click", () => {
      pushHistory();
      const project = createProjectFromTemplate(template);
      state.projects.unshift(project);
      state.currentId = project.id;
      clearSelection(false);
      fitTimeline();
      saveStore("Modèle ouvert");
      renderAll();
    });
    templateList.appendChild(button);
  });

  const projectList = $("#projectList");
  projectList.innerHTML = "";
  state.projects.forEach((project) => {
    const button = document.createElement("button");
    button.className = `list-item${project.id === state.currentId ? " active" : ""}`;
    button.innerHTML = `<strong>${escapeHtml(project.name || "Projet vide")}</strong><span>${project.elements.length} élément${project.elements.length > 1 ? "s" : ""}</span>`;
    button.addEventListener("click", () => {
      state.currentId = project.id;
      clearSelection(false);
      state.history = [];
      state.future = [];
      fitTimeline(false);
      renderAll();
      saveStore("Projet chargé");
    });
    projectList.appendChild(button);
  });
}

function renderProjectFields() {
  const project = currentProject();
  if (!project) return;
  const nameInput = $("#projectNameInput");
  const startInput = $("#projectStartInput");
  const endInput = $("#projectEndInput");
  const printInput = $("#printSizeInput");
  const styleInput = $("#projectStyleInput");
  const tickInput = $("#tickStepInput");
  const minorInput = $("#minorTicksInput");
  const axisInput = $("#axisPositionInput");
  const axisStyleInput = $("#axisStyleInput");
  const titleBoxInput = $("#titleBoxInput");
  if (nameInput) nameInput.value = project.name;
  if (startInput) startInput.value = project.start;
  if (endInput) endInput.value = project.end;
  if (printInput) printInput.value = state.printSize;
  if (styleInput) styleInput.value = project.style || "scolaire";
  if (tickInput) tickInput.value = String(project.tickStep || "auto");
  if (minorInput) minorInput.value = String(project.minorTicks ?? 5);
  if (axisInput) axisInput.value = Number(project.axisPosition ?? 56);
  if (axisStyleInput) axisStyleInput.value = project.axisStyle || "arrow";
  if (titleBoxInput) titleBoxInput.value = String(project.titleBox ?? true);
  $("#zoomRange").value = state.view.scale;
}

function renderTimeline() {
  const project = currentProject();
  const { width, height } = getSize();
  fitViewToProject(width);
  const axisY = Math.round(height * clamp(Number(project.axisPosition ?? 56), 25, 75) / 100);
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  state.bboxes.clear();
  Object.values(layers).forEach(clearLayer);
  const preset = STYLE_PRESETS[project.style || "scolaire"] || STYLE_PRESETS.scolaire;

  const colors = {
    text: project.style === "nuit" ? "#eef3f7" : css("--text"),
    muted: project.style === "nuit" ? "#b7c0cc" : css("--muted"),
    line: preset.grid,
    lineStrong: preset.axis,
    surface: preset.box,
    surface2: css("--surface-2"),
    primary: css("--primary"),
    bg: preset.bg,
    axis: preset.axis,
    shadow: preset.shadow,
    radius: preset.radius,
    dotted: preset.dotted,
  };

  createSvg("rect", { x: 0, y: 0, width, height, fill: colors.bg }, layers.grid);
  const step = chooseTickStep();
  const bounds = projectBounds(project);
  $("#scaleLabel").textContent = `${formatYear(bounds.start)} → ${formatYear(bounds.end)}`;
  const startYear = Math.ceil(bounds.start / step) * step;
  const endYear = Math.floor(bounds.end / step) * step;
  const startX = yearToX(bounds.start, width);
  const endX = yearToX(bounds.end, width);
  const minorCount = Math.max(0, Number(project.minorTicks ?? 5));
  const minorStep = minorCount ? step / minorCount : 0;

  const projectTitle = String(project.name || "").trim();
  if (project.titleBox !== false && projectTitle) {
    const titleW = Math.min(520, Math.max(260, projectTitle.length * 9 + 32));
    const titleX = Math.max(28, Math.min(width - titleW - 28, width * 0.16));
    createSvg("rect", { x: titleX, y: 54, width: titleW, height: 30, fill: colors.bg, stroke: colors.axis, "stroke-width": 1.2, rx: colors.radius }, layers.axis);
    const title = createSvg("text", { x: titleX + 10, y: 75, "font-size": 16, "font-weight": 800, fill: colors.text }, layers.axis);
    title.textContent = projectTitle;
  }

  if (minorStep > 0) {
    const minorStart = Math.ceil(bounds.start / minorStep) * minorStep;
    for (let year = minorStart; year <= bounds.end; year += minorStep) {
      if (Math.abs(year / step - Math.round(year / step)) < 0.0001) continue;
      const x = yearToX(year, width);
      if (x < startX || x > endX) continue;
      createSvg("line", { x1: x, y1: axisY - 5, x2: x, y2: axisY + 5, stroke: colors.axis, "stroke-width": 0.9, opacity: 0.75 }, layers.axis);
    }
  }

  for (let year = startYear; year <= endYear; year += step) {
    const x = yearToX(year, width);
    if (x < startX || x > endX) continue;
    createSvg("line", { x1: x, y1: axisY - 9, x2: x, y2: axisY + 9, stroke: colors.axis, "stroke-width": 1.1 }, layers.axis);
    const label = createSvg("text", {
      x,
      y: axisY + 30,
      "text-anchor": "middle",
      "font-size": 11,
      fill: colors.muted,
    }, layers.axis);
    label.textContent = formatYear(year);
  }

  [bounds.start, bounds.end].forEach((year) => {
    const x = yearToX(year, width);
    createSvg("line", { x1: x, y1: axisY - 18, x2: x, y2: axisY + 18, stroke: colors.axis, "stroke-width": 1.3 }, layers.axis);
    const label = createSvg("text", {
      x: clamp(x, 44, width - 44),
      y: axisY + 52,
      "text-anchor": "middle",
      "font-size": 12,
      "font-weight": 800,
      fill: colors.axis,
    }, layers.axis);
    label.textContent = formatYear(year);
  });

  renderAxisLine(startX, endX, axisY, step, colors, project.axisStyle || "arrow");

  const visibleElements = project.elements.filter((element) => matchesSearch(element));
  visibleElements.filter((element) => element.type === "period").forEach((element) => renderPeriod(element, width, axisY, colors));
  visibleElements.filter((element) => element.type !== "period").forEach((element) => renderElement(element, width, axisY, colors));
  if (!project.elements.length) renderEmptyState(width, height, axisY, colors);
  renderSelection(colors);
}

function renderAxisLine(startX, endX, axisY, step, colors, style = "arrow") {
  const axisWidth = style === "thick" ? 5 : style === "ruler" ? 3 : 1.8;
  const baseAttrs = {
    stroke: colors.axis,
    "stroke-width": axisWidth,
    "stroke-linecap": style === "rounded" || style === "thick" ? "round" : "butt",
    "stroke-dasharray": style === "dotted" ? "8 8" : "",
  };
  if (style === "double") {
    createSvg("path", { d: `M ${startX + 16} ${axisY - 15} L ${startX} ${axisY} L ${startX + 16} ${axisY + 15}`, fill: "none", stroke: colors.axis, "stroke-width": 1.8, "stroke-linejoin": "round" }, layers.axis);
    createSvg("line", { x1: startX + 16, y1: axisY, x2: endX - 16, y2: axisY, ...baseAttrs }, layers.axis);
    createSvg("path", { d: `M ${endX - 16} ${axisY - 15} L ${endX} ${axisY} L ${endX - 16} ${axisY + 15}`, fill: "none", stroke: colors.axis, "stroke-width": 1.8, "stroke-linejoin": "round" }, layers.axis);
    return;
  }
  if (style === "line" || style === "thick" || style === "dotted" || style === "rounded" || style === "ruler") {
    createSvg("line", { x1: startX, y1: axisY, x2: endX, y2: axisY, ...baseAttrs }, layers.axis);
    if (style === "ruler") {
      const rulerStep = Math.max(18, step * state.view.scale / 2);
      for (let x = startX; x <= endX; x += rulerStep) {
        createSvg("line", { x1: x, y1: axisY - 13, x2: x, y2: axisY + 13, stroke: colors.axis, "stroke-width": 1.2, opacity: 0.85 }, layers.axis);
      }
    }
    return;
  }
  createSvg("line", {
    x1: startX,
    y1: axisY,
    x2: endX - 16,
    y2: axisY,
    ...baseAttrs,
  }, layers.axis);
  createSvg("path", { d: `M ${endX - 16} ${axisY - 15} L ${endX} ${axisY} L ${endX - 16} ${axisY + 15}`, fill: "none", stroke: colors.axis, "stroke-width": 1.8, "stroke-linejoin": "round" }, layers.axis);
}

function renderEmptyState(width, height, axisY, colors) {
  const boxW = Math.min(460, width - 80);
  const boxX = (width - boxW) / 2;
  const boxY = Math.max(92, axisY - 155);
  createSvg("rect", { x: boxX, y: boxY, width: boxW, height: 88, rx: 8, fill: colors.surface, stroke: colors.line, "stroke-width": 1.2, opacity: 0.96 }, layers.item);
  const title = createSvg("text", { x: width / 2, y: boxY + 34, "text-anchor": "middle", "font-size": 16, "font-weight": 800, fill: colors.text }, layers.item);
  title.textContent = "Frise vide";
  const copy = createSvg("text", { x: width / 2, y: boxY + 60, "text-anchor": "middle", "font-size": 12, fill: colors.muted }, layers.item);
  copy.textContent = "Ajoutez un événement avec ★, une période avec ▰, ou ouvrez un modèle à gauche.";
}

function matchesSearch(element) {
  if (!state.search) return true;
  const haystack = [element.title, element.text, element.description, element.date, element.endDate, element.start, element.end].join(" ").toLowerCase();
  return haystack.includes(state.search.toLowerCase());
}

function renderPeriod(element, width, axisY, colors) {
  const x1 = yearToX(element.start, width);
  const x2 = yearToX(element.end, width);
  const y = axisY + Number(element.y || 0);
  const rectX = Math.min(x1, x2);
  const rectW = Math.max(12, Math.abs(x2 - x1));
  const h = Number(element.height || 32);
  const group = createSvg("g", { class: "selectable", "data-id": element.id }, layers.period);
  const style = element.periodStyle || "band";
  const opacity = element.opacity ?? 0.9;
  if (style === "rail") {
    const midY = y + h / 2;
    createSvg("line", { x1: rectX, y1: midY, x2: rectX + rectW, y2: midY, stroke: element.color, "stroke-width": Math.max(4, h * 0.26), "stroke-linecap": "round", opacity }, group);
    createSvg("circle", { cx: rectX, cy: midY, r: Math.max(5, h * 0.28), fill: colors.bg, stroke: element.color, "stroke-width": 2 }, group);
    createSvg("circle", { cx: rectX + rectW, cy: midY, r: Math.max(5, h * 0.28), fill: colors.bg, stroke: element.color, "stroke-width": 2 }, group);
  } else if (style === "bracket") {
    const midY = y + h / 2;
    createSvg("line", { x1: rectX, y1: midY, x2: rectX + rectW, y2: midY, stroke: element.color, "stroke-width": 2.2, opacity }, group);
    createSvg("line", { x1: rectX, y1: y, x2: rectX, y2: y + h, stroke: element.color, "stroke-width": 2.2, opacity }, group);
    createSvg("line", { x1: rectX + rectW, y1: y, x2: rectX + rectW, y2: y + h, stroke: element.color, "stroke-width": 2.2, opacity }, group);
  } else {
    const fill = style === "outline" ? "transparent" : element.color;
    const stroke = style === "soft" || style === "outline" ? element.color : "none";
    const rx = style === "capsule" ? h / 2 : 7;
    createSvg("rect", {
      x: rectX,
      y,
      width: rectW,
      height: h,
      rx,
      fill,
      stroke,
      "stroke-width": style === "outline" ? 2.2 : 1.2,
      opacity: style === "soft" ? Math.min(0.22, opacity) : opacity,
    }, group);
  }
  const text = createSvg("text", {
    x: rectX + rectW / 2,
    y: y + h / 2 + Number(element.fontSize || 14) / 3,
    "text-anchor": "middle",
    "font-size": element.fontSize || 14,
    "font-weight": 800,
    fill: ["outline", "soft", "rail", "bracket"].includes(style) ? element.color : "#ffffff",
    "pointer-events": "none",
  }, group);
  text.textContent = element.title;
  state.bboxes.set(element.id, { x: rectX, y, width: rectW, height: h, kind: "period" });
}

function renderElement(element, width, axisY, colors) {
  if (element.type === "event") return renderEvent(element, width, axisY, colors);
  if (element.type === "text" || element.type === "annotation") return renderTextLike(element, width, axisY, colors);
  if (element.type === "image") return renderImage(element, width, axisY, colors);
  if (element.type === "line" || element.type === "arrow") return renderLine(element, width, axisY, colors);
}

function drawEventGlyph(parent, cx, cy, color, key = "plume", scale = 0.82, radius = 13) {
  const path = ICONS[key] || ICONS.plume;
  createSvg("circle", { cx, cy, r: radius, fill: color, opacity: 0.14, "pointer-events": "none" }, parent);
  createSvg("path", {
    d: path,
    transform: `translate(${cx} ${cy}) scale(${scale})`,
    fill: "none",
    stroke: color,
    "stroke-width": 2,
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    "pointer-events": "none",
  }, parent);
}

function eventRadius(shape, height, colors) {
  if (shape === "sharp") return 0;
  if (shape === "pill") return height / 2;
  if (shape === "ticket") return 10;
  if (shape === "underline") return 0;
  return colors.radius;
}

function renderEventShape(parent, element, x, y, width, height, colors) {
  const shape = element.shape || "box";
  const fill = element.fillMode === "color" ? element.color : colors.surface;
  const stroke = element.color;
  if (shape === "tag") {
    const notch = Math.min(18, width * 0.16);
    const path = `M ${x} ${y} H ${x + width - notch} L ${x + width} ${y + height / 2} L ${x + width - notch} ${y + height} H ${x} Z`;
    createSvg("path", { class: "event-card", d: path, fill, stroke, "stroke-width": 1.4, opacity: element.opacity ?? 1 }, parent);
    createSvg("circle", { cx: x + width - notch + 2, cy: y + height / 2, r: 3.2, fill: colors.bg, stroke, "stroke-width": 1 }, parent);
    return;
  }
  createSvg("rect", {
    class: "event-card",
    x,
    y,
    width,
    height,
    rx: eventRadius(shape, height, colors),
    fill: shape === "underline" ? colors.surface : fill,
    stroke,
    "stroke-width": shape === "underline" ? 0.8 : 1.4,
    opacity: element.opacity ?? 1,
  }, parent);
  if (shape === "ticket") {
    const notchR = Math.min(9, height * 0.22);
    createSvg("circle", { cx: x, cy: y + height / 2, r: notchR, fill: colors.bg, stroke, "stroke-width": 1 }, parent);
    createSvg("circle", { cx: x + width, cy: y + height / 2, r: notchR, fill: colors.bg, stroke, "stroke-width": 1 }, parent);
  }
  if (shape === "underline") {
    createSvg("line", { x1: x, y1: y + height - 3, x2: x + width, y2: y + height - 3, stroke, "stroke-width": 4, "stroke-linecap": "round", opacity: element.opacity ?? 1 }, parent);
  }
}

function renderEvent(element, width, axisY, colors) {
  const x = yearToX(element.date, width);
  const hasEndDate = element.endDate !== "" && element.endDate !== null && element.endDate !== undefined && Number.isFinite(Number(element.endDate)) && Number(element.endDate) !== Number(element.date);
  const endX = hasEndDate ? yearToX(element.endDate, width) : null;
  const y = axisY + Number(element.y || -160);
  const w = Number(element.width || 150);
  const h = Number(element.height || 54);
  const compact = h <= 50 || w <= 135;
  const group = createSvg("g", { class: "selectable", "data-id": element.id }, layers.item);
  const top = y;
  let cardX = hasEndDate ? (x + endX) / 2 - w / 2 : x - w / 2;
  cardX = clamp(cardX, 8, Math.max(8, width - w - 8));
  const connectorY = top + h < axisY ? top + h : top;
  createSvg("line", { x1: x, y1: axisY, x2: x, y2: connectorY, stroke: element.color, "stroke-width": 1.1, "stroke-dasharray": element.connector === "solid" ? "" : colors.dotted, opacity: 0.85 }, group);
  createSvg("circle", { cx: x, cy: axisY, r: 4.8, fill: colors.bg, stroke: element.color, "stroke-width": 2.4 }, group);
  if (hasEndDate) {
    createSvg("line", { x1: endX, y1: axisY, x2: endX, y2: connectorY, stroke: element.color, "stroke-width": 1.1, "stroke-dasharray": element.connector === "solid" ? "" : colors.dotted, opacity: 0.85 }, group);
    createSvg("circle", { cx: endX, cy: axisY, r: 4.8, fill: colors.bg, stroke: element.color, "stroke-width": 2.4 }, group);
  }
  renderEventShape(group, element, cardX, top, w, h, colors);
  if (element.fillMode !== "color" && !["tag", "ticket", "underline"].includes(element.shape)) {
    const stripeRx = eventRadius(element.shape, h, colors);
    createSvg("rect", { x: cardX, y: top, width: 6, height: h, rx: stripeRx, fill: element.color, opacity: 1 }, group);
    createSvg("rect", { x: cardX + w - 6, y: top, width: 6, height: h, rx: stripeRx, fill: element.color, opacity: 1 }, group);
  }
  const textColor = element.fillMode === "color" ? "#ffffff" : colors.text;
  const dateColor = element.fillMode === "color" ? "#ffffff" : colors.muted;
  if (compact) {
    const pad = element.fillMode === "color" ? 8 : 12;
    const iconColor = element.fillMode === "color" ? "#ffffff" : element.color;
    const iconX = cardX + pad + 8;
    const textX = cardX + pad + 23;
    const textWidth = w - (pad * 2 + 24);
    const titleSize = Math.max(8, Number(element.fontSize || 10));
    const dateSize = Math.max(8, titleSize - 1);
    drawEventGlyph(group, iconX, top + Math.min(23, h / 2), iconColor, element.iconKey, 0.48, 8.5);
    const title = createSvg("text", { x: textX, y: top + 15, "font-size": titleSize, "font-weight": 800, fill: textColor }, group);
    title.textContent = truncateText(element.title || "Événement", textWidth, titleSize);
    const date = createSvg("text", { x: textX, y: top + 30, "font-size": dateSize, "font-weight": 800, fill: dateColor }, group);
    date.textContent = truncateText(eventDateLabel(element), textWidth, dateSize);
  } else {
    drawEventGlyph(group, cardX + 20, top + 22, element.fillMode === "color" ? "#ffffff" : element.color, element.iconKey);
    const textWidth = w - 50;
    const date = createSvg("text", { x: cardX + 38, y: top + 18, "font-size": Math.max(9, Number(element.fontSize || 11) - 1), "font-weight": 800, fill: dateColor }, group);
    date.textContent = truncateText(eventDateLabel(element), textWidth, Math.max(9, Number(element.fontSize || 11) - 1));
    const title = createSvg("text", { x: cardX + 38, y: top + 34, "font-size": element.fontSize || 11, "font-weight": 800, fill: textColor }, group);
    title.textContent = truncateText(element.title || "Événement", textWidth, Number(element.fontSize || 11));
  }
  if (element.description && !compact) {
    drawWrappedText(group, element.description, cardX + 10, top + 49, w - 20, Math.max(9, Number(element.fontSize || 11) - 1), element.fillMode === "color" ? "#ffffff" : colors.muted, 2);
  }
  if (element.image) {
    createSvg("image", { href: element.image, x: cardX + w - 58, y: top + h - 58, width: 44, height: 44, preserveAspectRatio: "xMidYMid slice", opacity: 0.9 }, group);
  }
  state.bboxes.set(element.id, { x: cardX, y: top, width: w, height: h, kind: "box" });
}

function renderTextLike(element, width, axisY, colors) {
  const x = yearToX(element.date, width);
  const y = axisY + Number(element.y || 90);
  const w = Number(element.width || 240);
  const h = Number(element.height || 86);
  const group = createSvg("g", { class: "selectable", "data-id": element.id }, layers.item);
  const fill = element.type === "annotation" ? colors.surface : "transparent";
  const stroke = element.type === "annotation" ? colors.line : "transparent";
  createSvg("rect", { class: `${element.type}-card`, x: x - w / 2, y, width: w, height: h, rx: 8, fill, stroke, opacity: element.opacity ?? 1 }, group);
  if (element.type === "annotation") {
    createSvg("rect", { x: x - w / 2, y, width: 8, height: h, rx: 4, fill: element.color }, group);
  }
  const anchorX = element.align === "center" ? x : element.align === "end" ? x + w / 2 - 14 : x - w / 2 + 14;
  const anchor = element.align === "center" ? "middle" : element.align === "end" ? "end" : "start";
  const text = element.text || element.title || "Texte libre";
  drawWrappedText(group, text, anchorX, y + 24, w - 28, Number(element.fontSize || 16), element.color || colors.text, 5, anchor);
  state.bboxes.set(element.id, { x: x - w / 2, y, width: w, height: h, kind: "box" });
}

function renderImage(element, width, axisY, colors) {
  const x = yearToX(element.date, width);
  const y = axisY + Number(element.y || -130);
  const w = Number(element.width || 180);
  const h = Number(element.height || 120);
  const group = createSvg("g", { class: "selectable", "data-id": element.id }, layers.item);
  createSvg("rect", { class: "image-card", x: x - w / 2, y, width: w, height: h, rx: 8, fill: colors.surface, stroke: colors.line }, group);
  if (element.image) {
    createSvg("image", { href: element.image, x: x - w / 2 + 6, y: y + 6, width: w - 12, height: h - 12, preserveAspectRatio: "xMidYMid slice", opacity: element.opacity ?? 1 }, group);
  } else {
    createSvg("text", { x, y: y + h / 2 + 4, "text-anchor": "middle", "font-size": 13, fill: colors.muted }, group).textContent = "Image";
  }
  state.bboxes.set(element.id, { x: x - w / 2, y, width: w, height: h, kind: "box" });
}

function renderLine(element, width, axisY, colors) {
  const x1 = yearToX(element.start, width);
  const x2 = yearToX(element.end, width);
  const y = axisY + Number(element.y || 120);
  const group = createSvg("g", { class: "selectable", "data-id": element.id }, layers.item);
  const line = createSvg("line", {
    x1,
    y1: y,
    x2,
    y2: y,
    stroke: element.color || colors.text,
    "stroke-width": element.width || 3,
    "stroke-linecap": "round",
    opacity: element.opacity ?? 1,
  }, group);
  if (element.type === "arrow") line.setAttribute("marker-end", "url(#arrowHead)");
  if (element.title) {
    createSvg("text", { x: (x1 + x2) / 2, y: y - 10, "text-anchor": "middle", "font-size": 13, "font-weight": 800, fill: element.color || colors.text }, group).textContent = element.title;
  }
  state.bboxes.set(element.id, { x: Math.min(x1, x2), y: y - 14, width: Math.abs(x2 - x1), height: 28, kind: "line" });
}

function drawWrappedText(parent, value, x, y, maxWidth, fontSize, fill, maxLines = 3, anchor = "start") {
  const text = createSvg("text", { x, y, "font-size": fontSize, fill, "text-anchor": anchor }, parent);
  const words = String(value).split(/\s+/);
  const charsPerLine = Math.max(8, Math.floor(maxWidth / (fontSize * 0.54)));
  let line = "";
  let lines = [];
  words.forEach((word) => {
    const next = line ? `${line} ${word}` : word;
    if (next.length > charsPerLine && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  });
  if (line) lines.push(line);
  lines = lines.slice(0, maxLines);
  if (lines.length === maxLines && words.join(" ").length > lines.join(" ").length) {
    lines[lines.length - 1] = `${lines[lines.length - 1].replace(/\.*$/, "")}...`;
  }
  lines.forEach((textLine, index) => {
    const tspan = createSvg("tspan", { x, dy: index ? fontSize * 1.25 : 0 }, text);
    tspan.textContent = textLine;
  });
}

function renderSelection(colors) {
  clearLayer(layers.selection);
  const selected = selectionIds().filter((id) => state.bboxes.has(id));
  selected.forEach((id) => {
    const box = state.bboxes.get(id);
    createSvg("rect", {
      class: "selected-outline",
      x: box.x - 6,
      y: box.y - 6,
      width: box.width + 12,
      height: box.height + 12,
      rx: 9,
      stroke: colors.primary,
      fill: "none",
      "stroke-width": 2,
      "stroke-dasharray": "6 5",
    }, layers.selection);
  });

  if (selected.length === 1) {
    const id = selected[0];
    const box = state.bboxes.get(id);
    if (box.kind === "line") {
      createSvg("circle", { class: "resize-handle", "data-id": id, "data-handle": "start", cx: box.x, cy: box.y + box.height / 2, r: 7, fill: colors.surface, stroke: colors.primary, "stroke-width": 2 }, layers.selection);
      createSvg("circle", { class: "resize-handle", "data-id": id, "data-handle": "end", cx: box.x + box.width, cy: box.y + box.height / 2, r: 7, fill: colors.surface, stroke: colors.primary, "stroke-width": 2 }, layers.selection);
    } else if (box.kind !== "period") {
      createSvg("rect", { class: "resize-handle", "data-id": id, "data-handle": "resize", x: box.x + box.width - 5, y: box.y + box.height - 5, width: 10, height: 10, rx: 3, fill: colors.surface, stroke: colors.primary, "stroke-width": 2 }, layers.selection);
    }
  }

  if (state.dragging?.mode === "marquee") {
    const rect = normalizedRect(state.dragging.startPoint, state.dragging.currentPoint);
    createSvg("rect", {
      class: "marquee-rect",
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      rx: 4,
      fill: colors.primary,
      opacity: 0.12,
      stroke: colors.primary,
      "stroke-width": 1.5,
      "stroke-dasharray": "5 4",
    }, layers.selection);
  }
}

function normalizedRect(a, b) {
  return {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    width: Math.abs(a.x - b.x),
    height: Math.abs(a.y - b.y),
  };
}

function intersectsRect(a, b) {
  return a.x <= b.x + b.width && a.x + a.width >= b.x && a.y <= b.y + b.height && a.y + a.height >= b.y;
}

function isChronologicalElement(element) {
  return element?.type === "event" || element?.type === "period";
}

function renderProperties() {
  const form = $("#propertiesForm");
  const title = $("#propertiesTitle");
  const actions = document.querySelector(".property-actions");
  const project = currentProject();
  const selected = selectionTargets(false);
  const element = selected.length === 1 ? selected[0] : null;
  state.formSnapshotOpen = false;
  form.innerHTML = "";
  $("#duplicateBtn").disabled = !selected.length;
  $("#deleteBtn").disabled = !selected.length;
  document.body.classList.toggle("has-selection", Boolean(selected.length === 1));
  actions?.classList.toggle("is-hidden", !selected.length);
  updateSelectionUi();

  if (selected.length > 1) {
    if (title) title.textContent = "Sélection multiple";
    form.innerHTML = `<p class="edit-hint">${selected.length} éléments sélectionnés. Utilisez Supprimer, Dupliquer ou l’éditeur avancé pour modifier le groupe.</p>`;
    return;
  }

  if (!element) {
    if (title) title.textContent = "Édition";
    form.innerHTML = `<p class="edit-hint">Aucun élément sélectionné. Réglez la frise ci-dessous ou cliquez un événement pour le modifier.</p>`;
    return;
  }

  if (title) title.textContent = element.type === "event" ? "Événement" : element.type === "period" ? "Période" : "Élément";
  const fields = fieldsFor(element);
  fields.forEach((field) => {
    const label = document.createElement("label");
    label.textContent = field.label;
    let input;
    if (field.type === "textarea") {
      input = document.createElement("textarea");
      input.value = element[field.key] || "";
    } else if (field.type === "select") {
      input = document.createElement("select");
      field.options.forEach((option) => {
        const opt = document.createElement("option");
        opt.value = option.value;
        opt.textContent = option.label;
        input.appendChild(opt);
      });
      input.value = element[field.key] || field.options[0].value;
    } else {
      input = document.createElement("input");
      input.type = field.type;
      if (field.step) input.step = field.step;
      if (field.min !== undefined) input.min = field.min;
      if (field.max !== undefined) input.max = field.max;
      input.value = element[field.key] ?? field.default ?? "";
    }
    input.dataset.key = field.key;
    input.addEventListener("input", () => updateElementField(element.id, field, input));
    input.addEventListener("change", () => {
      state.formSnapshotOpen = false;
      saveStore("Sauvegarde auto");
    });
    label.appendChild(input);
    form.appendChild(label);
  });

  if (["event", "image"].includes(element.type)) {
    const fileLabel = document.createElement("label");
    fileLabel.textContent = "Image depuis votre ordinateur";
    const file = document.createElement("input");
    file.type = "file";
    file.accept = "image/*";
    file.addEventListener("change", () => {
      const imageFile = file.files?.[0];
      if (imageFile) loadImageFile(imageFile, (dataUrl) => {
        pushHistory();
        element.image = dataUrl;
        renderAll();
        saveStore("Image ajoutée");
      });
    });
    fileLabel.appendChild(file);
    form.appendChild(fileLabel);
  }
}

function fieldsFor(element) {
  const common = [
    { key: "color", label: "Couleur", type: "color" },
    { key: "opacity", label: "Transparence", type: "range", min: 0.15, max: 1, step: 0.05, default: 1 },
  ];
  const typography = [
    { key: "fontSize", label: "Taille de police", type: "number", min: 8, max: 48, default: 14 },
    { key: "align", label: "Alignement", type: "select", options: [
      { value: "start", label: "Gauche" },
      { value: "center", label: "Centre" },
      { value: "end", label: "Droite" },
    ] },
  ];
  if (element.type === "event") {
    return [
      { key: "title", label: "Titre", type: "text" },
      { key: "date", label: "Date", type: "number" },
      { key: "endDate", label: "Date de fin", type: "number" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "image", label: "URL de l'image", type: "url" },
      { key: "iconKey", label: "Icône", type: "select", options: [
        { value: "plume", label: "Plume" },
        { value: "livre", label: "Livre" },
        { value: "etoile", label: "Étoile" },
        { value: "theatre", label: "Théâtre" },
        { value: "science", label: "Science" },
        { value: "globe", label: "Globe" },
        { value: "eclair", label: "Éclair" },
        { value: "coeur", label: "Cœur" },
      ] },
      { key: "shape", label: "Forme", type: "select", options: [
        { value: "box", label: "Boîte douce" },
        { value: "sharp", label: "Rectangle PDF" },
        { value: "pill", label: "Pilule arrondie" },
        { value: "tag", label: "Étiquette" },
        { value: "ticket", label: "Ticket" },
        { value: "underline", label: "Souligné" },
      ] },
      { key: "connector", label: "Connecteur", type: "select", options: [
        { value: "dotted", label: "Pointillé" },
        { value: "solid", label: "Trait plein" },
      ] },
      { key: "fillMode", label: "Remplissage", type: "select", options: [
        { value: "white", label: "Fond clair" },
        { value: "color", label: "Bloc couleur" },
      ] },
      ...common,
      ...typography,
      { key: "width", label: "Largeur", type: "number", min: 90, max: 520 },
      { key: "height", label: "Hauteur", type: "number", min: 42, max: 320 },
      { key: "y", label: "Position verticale", type: "number" },
    ];
  }
  if (element.type === "period") {
    return [
      { key: "title", label: "Texte", type: "text" },
      { key: "start", label: "Début", type: "number" },
      { key: "end", label: "Fin", type: "number" },
      { key: "periodStyle", label: "Style de période", type: "select", options: [
        { value: "band", label: "Bande pleine" },
        { value: "capsule", label: "Capsule" },
        { value: "outline", label: "Contour" },
        { value: "soft", label: "Pastel" },
        { value: "rail", label: "Rail avec bornes" },
        { value: "bracket", label: "Accolade" },
      ] },
      ...common,
      ...typography,
      { key: "height", label: "Hauteur", type: "number", min: 16, max: 120 },
      { key: "y", label: "Position verticale", type: "number" },
    ];
  }
  if (element.type === "line" || element.type === "arrow") {
    return [
      { key: "title", label: "Libellé", type: "text" },
      { key: "start", label: "Début", type: "number" },
      { key: "end", label: "Fin", type: "number" },
      ...common,
      { key: "width", label: "Épaisseur", type: "number", min: 1, max: 16 },
      { key: "y", label: "Position verticale", type: "number" },
    ];
  }
  if (element.type === "image") {
    return [
      { key: "title", label: "Nom", type: "text" },
      { key: "date", label: "Date", type: "number" },
      { key: "image", label: "URL de l'image", type: "url" },
      ...common,
      { key: "width", label: "Largeur", type: "number", min: 40, max: 900 },
      { key: "height", label: "Hauteur", type: "number", min: 40, max: 600 },
      { key: "y", label: "Position verticale", type: "number" },
    ];
  }
  return [
    { key: "text", label: "Texte", type: "textarea" },
    { key: "date", label: "Date", type: "number" },
    ...common,
    ...typography,
    { key: "width", label: "Largeur", type: "number", min: 60, max: 900 },
    { key: "height", label: "Hauteur", type: "number", min: 30, max: 400 },
    { key: "y", label: "Position verticale", type: "number" },
  ];
}

function updateElementField(id, field, input) {
  const element = currentProject().elements.find((item) => item.id === id);
  if (!element) return;
  if (!state.formSnapshotOpen) {
    pushHistory();
    state.formSnapshotOpen = true;
  }
  let value = input.value;
  if (field.key === "endDate" && value.trim() === "") value = "";
  else if (["number", "range"].includes(field.type)) value = Number(value);
  element[field.key] = value;
  keepElementInProject(element);
  if (element.type === "period" || element.type === "line" || element.type === "arrow") {
    if (Number(element.end) < Number(element.start)) [element.start, element.end] = [element.end, element.start];
  }
  renderTimeline();
  renderProjectFields();
  scheduleSave();
}

let saveTimer = null;
function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => saveStore("Sauvegarde auto"), 250);
}

function addElement(type, image = "") {
  const project = currentProject();
  pushHistory();
  let element;
  const bounds = projectBounds(project);
  const center = Math.round((bounds.start + bounds.end) / 2);
  const span = Math.max(1, Math.round(bounds.range * 0.12));
  if (type === "event") element = event("Nouvel événement", center, "Ajoutez une description.", "★", "#c95f32", -176);
  if (type === "period") element = period("Nouvelle période", center - span, center + span, "#1f7a6d", 52, 32);
  if (type === "text") element = { id: uid(), type: "text", text: "Texte libre", date: center, y: -118, width: 220, height: 70, color: "#172033", fontSize: 22, opacity: 1, align: "center" };
  if (type === "image") element = { id: uid(), type: "image", title: "Image", date: center, y: -150, width: 190, height: 126, color: "#1f7a6d", image, opacity: 1 };
  if (type === "arrow") element = arrow("Flèche", center - span, center + span, "#c95f32", 122);
  if (type === "line") element = { id: uid(), type: "line", title: "Ligne", start: center - span, end: center + span, color: "#5762b7", width: 3, y: 126, opacity: 1 };
  if (type === "annotation") element = { id: uid(), type: "annotation", title: "Annotation", text: "Annotation", date: center, y: 116, width: 220, height: 78, color: "#5762b7", fontSize: 15, opacity: 0.95, align: "start" };
  keepElementInProject(element);
  project.elements.push(element);
  setSelection([element.id], false);
  renderAll();
  saveStore("Élément ajouté");
}

function duplicateSelected() {
  const project = currentProject();
  const targets = selectionTargets(false);
  if (!targets.length) return;
  pushHistory();
  const shift = Math.max(1, Math.round(40 / state.view.scale));
  const copies = targets.map((element) => {
    const copy = clone(element);
    copy.id = uid();
    if ("date" in copy && !isChronologicalElement(copy)) copy.date = Number(copy.date) + shift;
    if ("start" in copy && !isChronologicalElement(copy)) {
      copy.start = Number(copy.start) + shift;
      copy.end = Number(copy.end) + shift;
    }
    copy.y = Number(copy.y || 0) + 28;
    keepElementInProject(copy);
    return copy;
  });
  project.elements.push(...copies);
  setSelection(copies.map((copy) => copy.id), false);
  renderAll();
  saveStore(copies.length > 1 ? "Sélection dupliquée" : "Dupliqué");
}

function updateProjectSetting(key, value, label = "Frise modifiée") {
  const project = currentProject();
  if (!project) return;
  pushHistory();
  project[key] = value;
  normalizeProject(project);
  renderAll();
  saveStore(label);
}

function deleteSelected() {
  const project = currentProject();
  const ids = selectionIds();
  if (!ids.length) return;
  pushHistory();
  project.elements = project.elements.filter((item) => !ids.includes(item.id));
  clearSelection(false);
  renderAll();
  saveStore(ids.length > 1 ? "Sélection supprimée" : "Supprimé");
}

function selectAllElements() {
  const project = currentProject();
  setSelection(project?.elements.map((element) => element.id) || []);
}

function invertSelection() {
  const project = currentProject();
  if (!project) return;
  const selected = new Set(selectionIds());
  setSelection(project.elements.filter((element) => !selected.has(element.id)).map((element) => element.id));
}

function applyBulkColor() {
  const targets = selectionTargets(false);
  if (!targets.length) return;
  const color = $("#bulkColorInput")?.value || "#1f7a6d";
  pushHistory();
  targets.forEach((element) => {
    element.color = color;
  });
  renderAll();
  saveStore("Couleur appliquée");
}

function spreadSelectedVertically() {
  const targets = selectionTargets(true);
  if (!targets.length) return;
  const sorted = targets.slice().sort((a, b) => Number(a.date ?? a.start ?? 0) - Number(b.date ?? b.start ?? 0));
  const top = -210;
  const bottom = 168;
  const step = sorted.length > 1 ? (bottom - top) / (sorted.length - 1) : 0;
  pushHistory();
  sorted.forEach((element, index) => {
    element.y = Math.round(top + step * index);
  });
  renderAll();
  saveStore("Réparti verticalement");
}

function alternateSelectedLanes() {
  const targets = selectionTargets(true);
  if (!targets.length) return;
  const lanes = [-166, 76, -96, 138, -224, 196];
  pushHistory();
  targets
    .slice()
    .sort((a, b) => Number(a.date ?? a.start ?? 0) - Number(b.date ?? b.start ?? 0))
    .forEach((element, index) => {
      element.y = lanes[index % lanes.length];
    });
  renderAll();
  saveStore("Lignes alternées");
}

function applyCompactPdfStyle() {
  const targets = selectionTargets(true);
  if (!targets.length) return;
  pushHistory();
  targets.forEach((element) => {
    if (element.type === "event") {
      element.width = 128;
      element.height = 44;
      element.fontSize = 9;
      element.shape = "sharp";
      element.connector = "dotted";
      element.fillMode = element.fillMode || "white";
    }
    if (element.type === "period") {
      element.height = 24;
      element.opacity = 0.88;
      element.fontSize = 12;
    }
    if (element.type === "text" || element.type === "annotation") {
      element.fontSize = Math.min(Number(element.fontSize || 14), 13);
    }
  });
  renderAll();
  saveStore("Style PDF appliqué");
}

function declutterSelected() {
  const targets = selectionTargets(true).filter((element) => element.type !== "line" && element.type !== "arrow");
  if (!targets.length) return;
  const lanes = [-188, -126, -64, 52, 108, 166];
  const sorted = targets.slice().sort((a, b) => Number(a.date ?? a.start ?? 0) - Number(b.date ?? b.start ?? 0));
  let laneIndex = 0;
  pushHistory();
  sorted.forEach((element, index) => {
    if (index > 0) {
      const prev = sorted[index - 1];
      const prevDate = Number(prev.date ?? prev.start ?? 0);
      const currentDate = Number(element.date ?? element.start ?? 0);
      if (Math.abs(currentDate - prevDate) < Math.max(1, projectBounds().range * 0.04)) laneIndex += 1;
    }
    element.y = lanes[laneIndex % lanes.length];
  });
  renderAll();
  saveStore("Chevauchements réduits");
}

function updateSelectionUi() {
  const count = selectionIds().length;
  const label = $("#selectionCount");
  if (label) label.textContent = `${count} sélection${count > 1 ? "s" : ""}`;
}

function toggleAdvancedEditor() {
  const panel = $("#advancedEditorPanel");
  const button = $("#advancedToggleBtn");
  if (!panel || !button) return;
  const collapsed = panel.classList.toggle("is-collapsed");
  button.textContent = collapsed ? "Ouvrir éditeur avancé" : "Fermer éditeur avancé";
}

function applySurprisePalette() {
  const project = currentProject();
  const palette = ["#1f7a6d", "#c95f32", "#5762b7", "#ad7a34", "#8c3d69", "#3f78aa"];
  pushHistory();
  project.elements.forEach((element, index) => {
    if (element.color) element.color = palette[index % palette.length];
  });
  renderAll();
  saveStore("Palette surprise");
}

function tidyElements() {
  const project = currentProject();
  const lanes = [-220, -150, -80, 56, 122, 188];
  pushHistory();
  project.elements
    .slice()
    .sort((a, b) => Number(a.date ?? a.start ?? 0) - Number(b.date ?? b.start ?? 0))
    .forEach((element, index) => {
      element.y = lanes[index % lanes.length];
    });
  renderAll();
  saveStore("Frise rangée");
}

function addMicroStory() {
  const project = currentProject();
  const { start, end } = projectBounds(project);
  const stories = [
    ["Minute importante", "Quelqu'un a enfin renommé le fichier final_vraiment_final."],
    ["Conseil du conseil", "Après deux heures de débat, la décision est de refaire une réunion."],
    ["Découverte majeure", "La flèche pointait dans le mauvais sens, mais avec beaucoup d'assurance."],
    ["Progrès technique", "On invente le bouton Annuler, puis on l'utilise immédiatement."],
    ["Moment héroïque", "Un élève demande si la date négative veut dire que l'événement n'a pas eu lieu."],
    ["Crise de précision", "La frise dit 1492 ; quelqu'un demande l'heure exacte."],
    ["Grande réforme", "Les couleurs sont officiellement classées en joli, très joli et urgence rouge."],
    ["Événement discret", "Personne n'a compris pourquoi il est là, mais il équilibre bien la page."],
    ["Révolution du rangement", "Les annotations arrêtent de se marcher dessus. La paix revient."],
    ["Invention audacieuse", "Une période commence avant son début. Les historiens transpirent."],
    ["Coup de théâtre", "Le titre était trop long, il devient une période à lui tout seul."],
    ["Méthode scientifique", "On clique au hasard, puis on appelle ça exploration."],
    ["Traité de chronologie", "Avant J.-C. et après J.-C. signent enfin un accord de voisinage."],
    ["Grand doute", "La date est correcte, mais elle a l'air suspecte en Arial."],
    ["Accident diplomatique", "Deux événements se superposent et refusent de négocier."],
    ["Décision graphique", "Le bleu est choisi parce que le rouge avait déjà pris beaucoup de place."],
    ["Archivage glorieux", "Le projet est sauvegardé localement. Un petit fichier respire mieux."],
    ["Éclair de génie", "On ajoute une ligne pour expliquer la ligne qui expliquait déjà tout."],
    ["Rigueur absolue", "La frise est précise à l'année près, sauf quand elle préfère être poétique."],
    ["Incident de zoom", "Tout rentre dans la page. La page demande des vacances."],
    ["Notation officielle", "Le professeur écrit 'intéressant', ce qui veut dire mystère."],
    ["Petit miracle", "Le PDF sort du premier coup. Personne n'ose toucher à rien."],
    ["Chronologie sociale", "L'événement arrive en retard, mais prétend que c'était prévu."],
    ["Optimisation", "On supprime trois détails, puis on ajoute une annotation pour les regretter."],
    ["Détail crucial", "Cette micro-histoire ne change rien, mais elle améliore l'ambiance."],
    ["Plan B", "Si la date ne rentre pas, on agrandit l'Histoire."],
    ["Contrôle qualité", "Quelqu'un dit 'c'est bon comme ça' et tout le monde sauvegarde vite."],
    ["Tension dramatique", "La ligne pointillée sait quelque chose que les autres ignorent."],
    ["Légende locale", "On raconte qu'une frise parfaitement alignée aurait existé un mardi."],
    ["Fin provisoire", "L'histoire continue, mais le bouton Export PDF attend poliment."],
  ];
  const palette = ["#c95f32", "#5762b7", "#1f7a6d", "#8c3d69", "#ad7a34", "#3f78aa"];
  const lanes = [-205, -138, -72, 82, 148, 208];
  const story = stories[Math.floor(Math.random() * stories.length)];
  const date = Math.round(start + Math.random() * (end - start));
  pushHistory();
  const element = {
    id: uid(),
    type: "annotation",
    title: story[0],
    text: story[1],
    date,
    y: lanes[Math.floor(Math.random() * lanes.length)],
    width: 250 + Math.floor(Math.random() * 70),
    height: 70 + Math.floor(Math.random() * 24),
    color: palette[Math.floor(Math.random() * palette.length)],
    fontSize: 14,
    opacity: 0.95,
    align: "start",
  };
  keepElementInProject(element);
  project.elements.push(element);
  setSelection([element.id], false);
  renderAll();
  saveStore("Micro-histoire ajoutée");
}

function addSurpriseEvent() {
  const project = currentProject();
  const { start, end } = projectBounds(project);
  const ideas = [
    ["Réunion évitée", "Une décision claire, trois cafés économisés."],
    ["Idée lumineuse", "La frise gagne soudain un sens dramatique."],
    ["Pause stratégique", "Le projet respire, tout le monde aussi."],
  ];
  const idea = ideas[Math.floor(Math.random() * ideas.length)];
  pushHistory();
  const element = event(idea[0], Math.round(start + Math.random() * (end - start)), idea[1], "★", "#8c3d69", -190);
  keepElementInProject(element);
  project.elements.push(element);
  setSelection([element.id], false);
  renderAll();
  saveStore("Surprise ajoutée");
}

function fitTimeline(save = true) {
  const project = currentProject();
  const { width } = getSize();
  fitViewToProject(width);
  renderTimeline();
  if (save) saveStore("Vue ajustée");
}

function selectElement(id) {
  setSelection([id]);
}

function svgPoint(event) {
  const rect = svg.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}

function beginPointer(event) {
  const handle = event.target.closest("[data-handle]");
  const selectable = event.target.closest("[data-id]");
  const point = svgPoint(event);
  if (handle) {
    const id = handle.dataset.id;
    const element = currentProject().elements.find((item) => item.id === id);
    if (!element) return;
    pushHistory();
    state.dragging = { mode: handle.dataset.handle, id, startPoint: point, original: clone(element), moved: false };
    svg.setPointerCapture(event.pointerId);
    event.preventDefault();
    return;
  }
  if (selectable) {
    const id = selectable.dataset.id;
    const element = currentProject().elements.find((item) => item.id === id);
    selectElement(id);
    pushHistory();
    state.dragging = { mode: "move", id, startPoint: point, original: clone(element), moved: false };
    svg.setPointerCapture(event.pointerId);
    event.preventDefault();
    return;
  }
  clearSelection(false);
  state.dragging = { mode: "marquee", startPoint: point, currentPoint: point, moved: false };
  renderProperties();
  renderTimeline();
  svg.setPointerCapture(event.pointerId);
}

function movePointer(event) {
  if (!state.dragging) return;
  const point = svgPoint(event);
  const dx = point.x - state.dragging.startPoint.x;
  const dy = point.y - state.dragging.startPoint.y;
  const project = currentProject();
  const { width } = getSize();

  if (state.dragging.mode === "marquee") {
    state.dragging.currentPoint = point;
    state.dragging.moved = Math.abs(dx) > 4 || Math.abs(dy) > 4;
    renderTimeline();
    return;
  }

  const element = project.elements.find((item) => item.id === state.dragging.id);
  if (!element) return;
  state.dragging.moved = true;
  const original = state.dragging.original;
  const yearDelta = dx / state.view.scale;

  if (state.dragging.mode === "move") {
    if (!isChronologicalElement(element)) {
      if ("date" in element) element.date = Math.round(Number(original.date) + yearDelta);
      if ("start" in element) {
        const duration = Number(original.end) - Number(original.start);
        element.start = Math.round(Number(original.start) + yearDelta);
        element.end = Math.round(element.start + duration);
      }
    }
    element.y = Math.round(Number(original.y || 0) + dy);
  }

  if (state.dragging.mode === "start") {
    if ("start" in element) element.start = Math.round(xToYear(point.x, width));
  }
  if (state.dragging.mode === "end") {
    if ("end" in element) element.end = Math.round(xToYear(point.x, width));
  }
  if (state.dragging.mode === "resize") {
    element.width = Math.max(40, Math.round(Number(original.width || 160) + dx));
    element.height = Math.max(28, Math.round(Number(original.height || 80) + dy));
  }
  if ("start" in element && Number(element.end) < Number(element.start)) {
    [element.start, element.end] = [element.end, element.start];
  }
  keepElementInProject(element);
  renderTimeline();
  renderProperties();
}

function endPointer(event) {
  if (!state.dragging) return;
  if (state.dragging.mode === "marquee") {
    const drag = state.dragging;
    const rect = normalizedRect(drag.startPoint, drag.currentPoint || drag.startPoint);
    const ids = drag.moved
      ? [...state.bboxes.entries()].filter(([, box]) => intersectsRect(rect, box)).map(([id]) => id)
      : [];
    state.dragging = null;
    setSelection(ids, false);
    try {
      svg.releasePointerCapture(event.pointerId);
    } catch {
      /* ignore released pointers */
    }
    renderTimeline();
    renderProperties();
    return;
  }
  if (!state.dragging.moved) {
    state.history.pop();
    updateToolbarState();
  }
  state.dragging = null;
  try {
    svg.releasePointerCapture(event.pointerId);
  } catch {
    /* ignore released pointers */
  }
  saveStore("Sauvegarde auto");
}

function zoomAt(clientX, factor) {
  fitViewToProject();
  renderTimeline();
  scheduleSave();
}

function loadImageFile(file, callback) {
  const reader = new FileReader();
  reader.onload = () => callback(reader.result);
  reader.readAsDataURL(file);
}

function exportBin() {
  const project = currentProject();
  const payload = JSON.stringify({ project, exportedAt: new Date().toISOString() });
  const bytes = new TextEncoder().encode(`${BIN_MAGIC}${payload}`);
  downloadBlob(`${slug(project.name)}.bin`, new Blob([bytes], { type: "application/octet-stream" }), "application/octet-stream");
}

function importProjectData(data) {
  const project = data.projects ? data.projects[0] : data;
  const importedProject = data.project || project;
  if (!importedProject || !Array.isArray(importedProject.elements)) throw new Error("Format de frise non reconnu");
  const imported = {
    ...importedProject,
    id: uid(),
    name: `${importedProject.name || "Projet importé"} (import)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    elements: importedProject.elements.map((element) => ({ ...element, id: uid() })),
  };
  state.projects.unshift(imported);
  state.currentId = imported.id;
  clearSelection(false);
  state.history = [];
  state.future = [];
  fitTimeline(false);
  renderAll();
  saveStore("Importé");
}

function importBinFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const text = new TextDecoder().decode(reader.result);
      const payload = text.startsWith(BIN_MAGIC) ? text.slice(BIN_MAGIC.length) : text;
      importProjectData(JSON.parse(payload));
    } catch (error) {
      alert(`Import impossible : ${error.message}`);
    }
  };
  reader.readAsArrayBuffer(file);
}

function exportPng() {
  const project = currentProject();
  const { width, height } = getSize();
  const cloneSvg = svg.cloneNode(true);
  cloneSvg.setAttribute("width", width);
  cloneSvg.setAttribute("height", height);
  cloneSvg.querySelector("#selectionLayer")?.remove();
  const data = new XMLSerializer().serializeToString(cloneSvg);
  const blob = new Blob([data], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const image = new Image();
  image.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(width * 2);
    canvas.height = Math.round(height * 2);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = css("--bg") || "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.scale(2, 2);
    ctx.drawImage(image, 0, 0);
    URL.revokeObjectURL(url);
    canvas.toBlob((png) => {
      downloadBlob(`${slug(project.name)}.png`, png, "image/png");
    });
  };
  image.src = url;
}

function printPdf() {
  const size = state.printSize === "a3" ? "A3" : "A4";
  const style = document.createElement("style");
  style.textContent = `@page { size: ${size} landscape; margin: 10mm; }`;
  document.head.appendChild(style);
  window.addEventListener("afterprint", () => style.remove(), { once: true });
  window.print();
}

function downloadBlob(filename, content, type) {
  const blob = content instanceof Blob ? content : new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function slug(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase() || "chronocreateur";
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[char]);
}

function bindEvents() {
  $("#openEditorBtn").addEventListener("click", () => showEditor());
  $("#openEditorNavBtn").addEventListener("click", () => showEditor());
  $("#openTemplateBtn").addEventListener("click", () => showEditor());

  svg.addEventListener("pointerdown", beginPointer);
  svg.addEventListener("pointermove", movePointer);
  svg.addEventListener("pointerup", endPointer);
  svg.addEventListener("pointercancel", endPointer);
  svg.addEventListener("wheel", (event) => {
    event.preventDefault();
    zoomAt(event.clientX, event.deltaY > 0 ? 0.86 : 1.16);
  }, { passive: false });

  document.querySelectorAll("[data-add]").forEach((button) => {
    button.addEventListener("click", () => addElement(button.dataset.add));
  });

  $("#newProjectBtn").addEventListener("click", () => {
    const project = blankProject();
    state.projects.unshift(project);
    state.currentId = project.id;
    clearSelection(false);
    state.history = [];
    state.future = [];
    fitTimeline(false);
    renderAll();
    saveStore("Projet créé");
  });

  $("#saveBtn").addEventListener("click", () => saveStore("Sauvegardé"));
  $("#undoBtn").addEventListener("click", undo);
  $("#redoBtn").addEventListener("click", redo);
  $("#zoomInBtn").addEventListener("click", () => zoomAt(svg.getBoundingClientRect().left + svg.getBoundingClientRect().width / 2, 1.18));
  $("#zoomOutBtn").addEventListener("click", () => zoomAt(svg.getBoundingClientRect().left + svg.getBoundingClientRect().width / 2, 0.84));
  $("#zoomRange").addEventListener("input", (event) => {
    state.view.scale = Number(event.target.value);
    renderTimeline();
    scheduleSave();
  });
  $("#fitBtn").addEventListener("click", () => fitTimeline());
  $("#duplicateBtn").addEventListener("click", duplicateSelected);
  $("#deleteBtn").addEventListener("click", deleteSelected);
  $("#surpriseBtn").addEventListener("click", addSurpriseEvent);
  $("#colorPartyBtn").addEventListener("click", applySurprisePalette);
  $("#tidyBtn").addEventListener("click", tidyElements);
  $("#microStoryBtn").addEventListener("click", addMicroStory);
  $("#advancedToggleBtn").addEventListener("click", toggleAdvancedEditor);
  $("#selectAllBtn").addEventListener("click", selectAllElements);
  $("#deleteSelectionBtn").addEventListener("click", deleteSelected);
  $("#duplicateSelectionBtn").addEventListener("click", duplicateSelected);
  $("#spreadVerticalBtn").addEventListener("click", spreadSelectedVertically);
  $("#alternateLanesBtn").addEventListener("click", alternateSelectedLanes);
  $("#compactPdfBtn").addEventListener("click", applyCompactPdfStyle);
  $("#declutterBtn").addEventListener("click", declutterSelected);
  $("#invertSelectionBtn").addEventListener("click", invertSelection);
  $("#bulkColorBtn").addEventListener("click", applyBulkColor);
  $("#exportBinBtn").addEventListener("click", exportBin);
  $("#exportPngBtn").addEventListener("click", exportPng);
  $("#printBtn").addEventListener("click", printPdf);
  $("#themeBtn").addEventListener("click", () => {
    state.isDark = !state.isDark;
    document.body.classList.toggle("dark", state.isDark);
    renderTimeline();
    saveStore("Thème changé");
  });

  $("#importBinBtn").addEventListener("click", () => {
    $("#binFileInput").value = "";
    $("#binFileInput").click();
  });
  $("#binFileInput").addEventListener("change", (event) => {
    importBinFile(event.target.files?.[0]);
  });

  $("#searchInput").addEventListener("input", (event) => {
    state.search = event.target.value;
    renderTimeline();
  });

  $("#projectNameInput").addEventListener("input", (event) => {
    const project = currentProject();
    project.name = event.target.value;
    renderLists();
    renderTimeline();
    scheduleSave();
  });
  $("#projectStartInput").addEventListener("change", (event) => {
    const project = currentProject();
    pushHistory();
    project.start = Number(event.target.value);
    normalizeProject(project);
    project.elements.forEach((element) => keepElementInProject(element, project));
    renderAll();
    saveStore("Bornes modifiées");
  });
  $("#projectEndInput").addEventListener("change", (event) => {
    const project = currentProject();
    pushHistory();
    project.end = Number(event.target.value);
    normalizeProject(project);
    project.elements.forEach((element) => keepElementInProject(element, project));
    renderAll();
    saveStore("Bornes modifiées");
  });
  $("#printSizeInput").addEventListener("change", (event) => {
    state.printSize = event.target.value;
    saveStore("Format choisi");
  });
  $("#projectStyleInput").addEventListener("change", (event) => updateProjectSetting("style", event.target.value, "Style changé"));
  $("#tickStepInput").addEventListener("change", (event) => updateProjectSetting("tickStep", event.target.value, "Graduation changée"));
  $("#minorTicksInput").addEventListener("change", (event) => updateProjectSetting("minorTicks", Number(event.target.value), "Détails changés"));
  $("#axisPositionInput").addEventListener("change", (event) => updateProjectSetting("axisPosition", Number(event.target.value), "Axe déplacé"));
  $("#axisStyleInput").addEventListener("change", (event) => updateProjectSetting("axisStyle", event.target.value, "Style d’axe changé"));
  $("#titleBoxInput").addEventListener("change", (event) => updateProjectSetting("titleBox", event.target.value === "true", "Titre modifié"));

  const workspace = $("#workspace");
  workspace.addEventListener("dragover", (event) => {
    event.preventDefault();
    workspace.classList.add("drag-over");
  });
  workspace.addEventListener("dragleave", () => workspace.classList.remove("drag-over"));
  workspace.addEventListener("drop", (event) => {
    event.preventDefault();
    workspace.classList.remove("drag-over");
    const file = [...event.dataTransfer.files].find((item) => item.type.startsWith("image/"));
    if (!file) return;
    loadImageFile(file, (dataUrl) => addElement("image", dataUrl));
  });

  window.addEventListener("resize", renderTimeline);
  document.addEventListener("keydown", handleShortcuts);
}

function showEditor() {
  document.body.classList.remove("landing-mode");
  document.body.classList.add("editor-mode");
  requestAnimationFrame(() => {
    fitTimeline(false);
    renderAll();
  });
}

function handleShortcuts(event) {
  const activeTag = document.activeElement?.tagName;
  const editingText = ["INPUT", "TEXTAREA", "SELECT"].includes(activeTag);
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
    event.preventDefault();
    saveStore("Sauvegardé");
  }
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
    event.preventDefault();
    undo();
  }
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "y") {
    event.preventDefault();
    redo();
  }
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "d") {
    event.preventDefault();
    duplicateSelected();
  }
  if (!editingText && (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "a") {
    event.preventDefault();
    selectAllElements();
  }
  if (!editingText && (event.key === "Delete" || event.key === "Backspace")) {
    deleteSelected();
  }
  if (!editingText && (event.key === "+" || event.key === "=")) {
    zoomAt(svg.getBoundingClientRect().left + svg.getBoundingClientRect().width / 2, 1.16);
  }
  if (!editingText && event.key === "-") {
    zoomAt(svg.getBoundingClientRect().left + svg.getBoundingClientRect().width / 2, 0.86);
  }
}

loadStore();
bindEvents();
fitTimeline(false);
renderAll();
saveStore("Sauvegarde prête");
