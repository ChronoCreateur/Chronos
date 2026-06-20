const STORAGE_KEY = "chronocreateur.v1";
const BIN_MAGIC = "CHRONOCREATEUR_BIN_V1\n";
const NS = "http://www.w3.org/2000/svg";

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
    elements: [
      period("Antiquité", -3200, 476, "#4a8f7a", -88, 34),
      period("Moyen Âge", 476, 1492, "#ad7a34", -48, 34),
      period("Époque moderne", 1492, 1789, "#6d74b8", -8, 34),
      period("Époque contemporaine", 1789, 2026, "#c95f32", 32, 34),
      event("Premières écritures", -3200, "Naissance de l'écriture en Mésopotamie.", "✒", "#1f7a6d", -212),
      event("Chute de Rome", 476, "Fin de l'Empire romain d'Occident.", "🏛", "#7e5e42", -174),
      event("Christophe Colomb", 1492, "Voyage vers les Amériques.", "⛵", "#3f78aa", -210),
      event("Révolution française", 1789, "Déclaration des droits et bouleversement politique.", "⚖", "#c95f32", -166),
      event("Premier pas sur la Lune", 1969, "Apollo 11 marque l'histoire spatiale.", "☾", "#5762b7", -238),
      event("Web public", 1991, "Le World Wide Web devient accessible.", "◎", "#1f7a6d", 96),
    ],
  },
  {
    id: "france",
    name: "Histoire de France",
    start: -52,
    end: 2026,
    elements: [
      period("Gaule romaine", -52, 486, "#4a8f7a", 44, 32),
      period("Royaume de France", 987, 1792, "#6d74b8", 44, 32),
      period("Républiques et empires", 1792, 2026, "#c95f32", 44, 32),
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
    elements: [
      period("Sciences antiques", -600, 500, "#4a8f7a", 54, 30),
      period("Révolution scientifique", 1543, 1700, "#6d74b8", 54, 30),
      period("Sciences modernes", 1800, 2026, "#c95f32", 54, 30),
      event("Pythagore", -530, "Mathématiques et philosophie grecque.", "△", "#386b8f", -170),
      event("Héliocentrisme", 1543, "Copernic publie De revolutionibus.", "☉", "#ad7a34", -226),
      event("Gravitation", 1687, "Newton formalise la mécanique classique.", "●", "#5762b7", -146),
      event("Vaccination", 1796, "Edward Jenner popularise la vaccination.", "✚", "#1f7a6d", 96),
      event("Relativité générale", 1915, "Einstein transforme la physique.", "∑", "#8c3d69", -200),
      event("CRISPR", 2012, "Édition génétique programmable.", "⌬", "#c95f32", -118),
    ],
  },
  {
    id: "discoveries",
    name: "Grandes découvertes",
    start: 1200,
    end: 1800,
    elements: [
      period("Explorations maritimes", 1400, 1600, "#3f78aa", 58, 32),
      event("Marco Polo", 1271, "Voyage vers l'Asie.", "🧭", "#8b5f38", -180),
      event("Cap de Bonne-Espérance", 1488, "Bartolomeu Dias contourne l'Afrique.", "⛵", "#3f78aa", -226),
      event("Amériques", 1492, "Arrivée de Colomb aux Caraïbes.", "◆", "#c95f32", -146),
      event("Route des Indes", 1498, "Vasco de Gama atteint Calicut.", "✦", "#1f7a6d", 104),
      event("Tour du monde", 1522, "L'expédition de Magellan-Elcano boucle la circumnavigation.", "◎", "#5762b7", -204),
      arrow("Circulation des savoirs", 1450, 1650, "#c95f32", 142),
    ],
  },
  {
    id: "tech",
    name: "Évolution technologique",
    start: 1800,
    end: 2035,
    elements: [
      period("Industrialisation", 1800, 1914, "#ad7a34", 60, 30),
      period("Informatique", 1945, 2007, "#5762b7", 60, 30),
      period("IA et mobilité", 2007, 2035, "#1f7a6d", 60, 30),
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
    description,
    icon,
    color,
    y,
    width: 210,
    height: 112,
    fontSize: 14,
    opacity: 1,
    align: "start",
    image: "",
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
  copy.createdAt = new Date().toISOString();
  copy.updatedAt = new Date().toISOString();
  copy.elements = copy.elements.map((element) => ({ ...element, id: uid() }));
  return copy;
}

function blankProject() {
  return {
    id: uid(),
    name: "Nouvelle frise",
    start: -500,
    end: 2050,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    elements: [], // La frise est désormais totalement vierge
  };
}

function loadStore() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const data = JSON.parse(stored);
      state.projects = Array.isArray(data.projects) ? data.projects : [];
      state.currentId = data.currentId || state.projects[0]?.id;
      state.view = data.view || state.view;
      state.printSize = data.printSize || "a4";
      state.isDark = Boolean(data.isDark);
    } catch {
      state.projects = [];
    }
  }

  // Si aucun projet n'existe, on crée un projet complètement vide au lieu de charger un modèle
  if (!state.projects.length) {
    state.projects = [blankProject()];
    state.currentId = state.projects[0].id;
  }

  document.body.classList.toggle("dark", state.isDark);
  $("#printSizeInput").value = state.printSize;
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
  state.selectedId = null;
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

function chooseTickStep() {
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
      state.selectedId = null;
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
    button.innerHTML = `<strong>${escapeHtml(project.name)}</strong><span>${project.elements.length} élément${project.elements.length > 1 ? "s" : ""}</span>`;
    button.addEventListener("click", () => {
      state.currentId = project.id;
      state.selectedId = null;
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
  $("#projectNameInput").value = project.name;
  $("#projectStartInput").value = project.start;
  $("#projectEndInput").value = project.end;
  $("#zoomRange").value = state.view.scale;
}

function renderTimeline() {
  const project = currentProject();
  const { width, height } = getSize();
  const axisY = Math.round(height * 0.56);
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  state.bboxes.clear();
  Object.values(layers).forEach(clearLayer);

  const colors = {
    text: css("--text"),
    muted: css("--muted"),
    line: css("--line"),
    lineStrong: css("--line-strong"),
    surface: css("--surface"),
    surface2: css("--surface-2"),
    primary: css("--primary"),
    bg: css("--bg"),
  };

  createSvg("rect", { x: 0, y: 0, width, height, fill: colors.bg }, layers.grid);
  const step = chooseTickStep();
  $("#scaleLabel").textContent = scaleLabel(step);
  const startYear = Math.floor(xToYear(0, width) / step) * step;
  const endYear = Math.ceil(xToYear(width, width) / step) * step;

  for (let year = startYear; year <= endYear; year += step) {
    const x = yearToX(year, width);
    createSvg("line", { x1: x, y1: 0, x2: x, y2: height, stroke: colors.line, "stroke-width": 1, opacity: 0.65 }, layers.grid);
    createSvg("line", { x1: x, y1: axisY - 16, x2: x, y2: axisY + 16, stroke: colors.lineStrong, "stroke-width": 1 }, layers.axis);
    const label = createSvg("text", {
      x,
      y: axisY + 36,
      "text-anchor": "middle",
      "font-size": 12,
      fill: colors.muted,
    }, layers.axis);
    label.textContent = formatYear(year);
  }

  createSvg("line", { x1: 0, y1: axisY, x2: width, y2: axisY, stroke: colors.text, "stroke-width": 2.5 }, layers.axis);

  const visibleElements = project.elements.filter((element) => matchesSearch(element));
  visibleElements.filter((element) => element.type === "period").forEach((element) => renderPeriod(element, width, axisY, colors));
  visibleElements.filter((element) => element.type !== "period").forEach((element) => renderElement(element, width, axisY, colors));
  renderSelection(colors);
}

function matchesSearch(element) {
  if (!state.search) return true;
  const haystack = [element.title, element.text, element.description, element.date, element.start, element.end].join(" ").toLowerCase();
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
  createSvg("rect", {
    x: rectX,
    y,
    width: rectW,
    height: h,
    rx: 7,
    fill: element.color,
    opacity: element.opacity ?? 0.9,
  }, group);
  const text = createSvg("text", {
    x: rectX + rectW / 2,
    y: y + h / 2 + Number(element.fontSize || 14) / 3,
    "text-anchor": "middle",
    "font-size": element.fontSize || 14,
    "font-weight": 800,
    fill: "#ffffff",
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

function renderEvent(element, width, axisY, colors) {
  const x = yearToX(element.date, width);
  const y = axisY + Number(element.y || -160);
  const w = Number(element.width || 210);
  const h = Number(element.height || 112);
  const group = createSvg("g", { class: "selectable", "data-id": element.id }, layers.item);
  const top = y;
  const cardX = x - w / 2;
  const connectorY = top + h + 2 < axisY ? top + h : top;
  createSvg("line", { x1: x, y1: axisY, x2: x, y2: connectorY, stroke: element.color, "stroke-width": 2, opacity: 0.72 }, group);
  createSvg("circle", { cx: x, cy: axisY, r: 6, fill: colors.surface, stroke: element.color, "stroke-width": 3 }, group);
  createSvg("rect", { class: "event-card", x: cardX, y: top, width: w, height: h, rx: 8, fill: colors.surface, stroke: colors.line }, group);
  createSvg("rect", { x: cardX, y: top, width: 8, height: h, rx: 4, fill: element.color, opacity: element.opacity ?? 1 }, group);
  createSvg("circle", { cx: cardX + 31, cy: top + 31, r: 18, fill: element.color, opacity: 0.16 }, group);
  const icon = createSvg("text", { x: cardX + 31, y: top + 37, "text-anchor": "middle", "font-size": 20, fill: element.color }, group);
  icon.textContent = element.icon || "★";
  const date = createSvg("text", { x: cardX + 58, y: top + 25, "font-size": 11, "font-weight": 800, fill: colors.muted }, group);
  date.textContent = formatYear(element.date);
  const title = createSvg("text", { x: cardX + 58, y: top + 46, "font-size": element.fontSize || 14, "font-weight": 800, fill: colors.text }, group);
  title.textContent = element.title || "Événement";
  if (element.description) {
    drawWrappedText(group, element.description, cardX + 14, top + 72, w - 28, element.fontSize || 13, colors.muted, 2);
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
  if (!state.selectedId || !state.bboxes.has(state.selectedId)) return;
  const box = state.bboxes.get(state.selectedId);
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

  if (box.kind === "period" || box.kind === "line") {
    createSvg("circle", { class: "resize-handle", "data-id": state.selectedId, "data-handle": "start", cx: box.x, cy: box.y + box.height / 2, r: 7, fill: colors.surface, stroke: colors.primary, "stroke-width": 2 }, layers.selection);
    createSvg("circle", { class: "resize-handle", "data-id": state.selectedId, "data-handle": "end", cx: box.x + box.width, cy: box.y + box.height / 2, r: 7, fill: colors.surface, stroke: colors.primary, "stroke-width": 2 }, layers.selection);
  } else {
    createSvg("rect", { class: "resize-handle", "data-id": state.selectedId, "data-handle": "resize", x: box.x + box.width - 5, y: box.y + box.height - 5, width: 10, height: 10, rx: 3, fill: colors.surface, stroke: colors.primary, "stroke-width": 2 }, layers.selection);
  }
}

function renderProperties() {
  const form = $("#propertiesForm");
  const project = currentProject();
  const element = project?.elements.find((item) => item.id === state.selectedId);
  state.formSnapshotOpen = false;
  form.innerHTML = "";
  $("#duplicateBtn").disabled = !element;
  $("#deleteBtn").disabled = !element;

  if (!element) {
    form.innerHTML = `<p class="tips">Sélectionnez un élément de la frise pour modifier sa couleur, sa taille, sa police, son alignement ou son opacité.</p>`;
    return;
  }

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
      { key: "description", label: "Description", type: "textarea" },
      { key: "icon", label: "Icône", type: "text" },
      { key: "image", label: "URL de l'image", type: "url" },
      ...common,
      ...typography,
      { key: "width", label: "Largeur", type: "number", min: 120, max: 520 },
      { key: "height", label: "Hauteur", type: "number", min: 72, max: 320 },
      { key: "y", label: "Position verticale", type: "number" },
    ];
  }
  if (element.type === "period") {
    return [
      { key: "title", label: "Texte", type: "text" },
      { key: "start", label: "Début", type: "number" },
      { key: "end", label: "Fin", type: "number" },
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
  if (["number", "range"].includes(field.type)) value = Number(value);
  element[field.key] = value;
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
  const center = Math.round(state.view.center);
  if (type === "event") element = event("Nouvel événement", center, "Ajoutez une description.", "★", "#c95f32", -176);
  if (type === "period") element = period("Nouvelle période", center - 50, center + 50, "#1f7a6d", 52, 32);
  if (type === "text") element = { id: uid(), type: "text", text: "Texte libre", date: center, y: -118, width: 220, height: 70, color: "#172033", fontSize: 22, opacity: 1, align: "center" };
  if (type === "image") element = { id: uid(), type: "image", title: "Image", date: center, y: -150, width: 190, height: 126, color: "#1f7a6d", image, opacity: 1 };
  if (type === "arrow") element = arrow("Flèche", center - 80, center + 80, "#c95f32", 122);
  if (type === "line") element = { id: uid(), type: "line", title: "Ligne", start: center - 80, end: center + 80, color: "#5762b7", width: 3, y: 126, opacity: 1 };
  if (type === "annotation") element = { id: uid(), type: "annotation", title: "Annotation", text: "Annotation", date: center, y: 116, width: 220, height: 78, color: "#5762b7", fontSize: 15, opacity: 0.95, align: "start" };
  project.elements.push(element);
  state.selectedId = element.id;
  renderAll();
  saveStore("Élément ajouté");
}

function duplicateSelected() {
  const project = currentProject();
  const element = project.elements.find((item) => item.id === state.selectedId);
  if (!element) return;
  pushHistory();
  const copy = clone(element);
  copy.id = uid();
  if ("date" in copy) copy.date = Number(copy.date) + Math.round(40 / state.view.scale);
  if ("start" in copy) {
    copy.start = Number(copy.start) + Math.round(40 / state.view.scale);
    copy.end = Number(copy.end) + Math.round(40 / state.view.scale);
  }
  copy.y = Number(copy.y || 0) + 28;
  project.elements.push(copy);
  state.selectedId = copy.id;
  renderAll();
  saveStore("Dupliqué");
}

function deleteSelected() {
  const project = currentProject();
  if (!state.selectedId) return;
  pushHistory();
  project.elements = project.elements.filter((item) => item.id !== state.selectedId);
  state.selectedId = null;
  renderAll();
  saveStore("Supprimé");
}

function fitTimeline(save = true) {
  const project = currentProject();
  const { width } = getSize();
  const values = [project.start, project.end];
  project.elements.forEach((element) => {
    if ("date" in element) values.push(Number(element.date));
    if ("start" in element) values.push(Number(element.start), Number(element.end));
  });
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(1, max - min);
  state.view.center = (min + max) / 2;
  state.view.scale = clamp(width / (range * 1.22), 0.15, 12);
  $("#zoomRange").value = state.view.scale;
  renderTimeline();
  if (save) saveStore("Vue ajustée");
}

function selectElement(id) {
  state.selectedId = id;
  state.formSnapshotOpen = false;
  renderTimeline();
  renderProperties();
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
  state.selectedId = null;
  renderProperties();
  renderTimeline();
  state.dragging = { mode: "pan", startPoint: point, center: state.view.center };
  svg.setPointerCapture(event.pointerId);
}

function movePointer(event) {
  if (!state.dragging) return;
  const point = svgPoint(event);
  const dx = point.x - state.dragging.startPoint.x;
  const dy = point.y - state.dragging.startPoint.y;
  const project = currentProject();
  const { width } = getSize();

  if (state.dragging.mode === "pan") {
    state.view.center = state.dragging.center - dx / state.view.scale;
    renderTimeline();
    scheduleSave();
    return;
  }

  const element = project.elements.find((item) => item.id === state.dragging.id);
  if (!element) return;
  state.dragging.moved = true;
  const original = state.dragging.original;
  const yearDelta = dx / state.view.scale;

  if (state.dragging.mode === "move") {
    if ("date" in element) element.date = Math.round(Number(original.date) + yearDelta);
    if ("start" in element) {
      const duration = Number(original.end) - Number(original.start);
      element.start = Math.round(Number(original.start) + yearDelta);
      element.end = Math.round(element.start + duration);
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
  renderTimeline();
  renderProperties();
}

function endPointer(event) {
  if (!state.dragging) return;
  if (state.dragging.mode !== "pan" && !state.dragging.moved) {
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
  const rect = svg.getBoundingClientRect();
  const x = clientX - rect.left;
  const before = xToYear(x, rect.width);
  state.view.scale = clamp(state.view.scale * factor, 0.15, 12);
  const after = xToYear(x, rect.width);
  state.view.center += before - after;
  $("#zoomRange").value = state.view.scale;
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
  state.selectedId = null;
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
    state.selectedId = null;
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
    project.name = event.target.value || "Frise sans titre";
    renderLists();
    scheduleSave();
  });
  $("#projectStartInput").addEventListener("change", (event) => {
    const project = currentProject();
    pushHistory();
    project.start = Number(event.target.value);
    renderTimeline();
    saveStore("Bornes modifiées");
  });
  $("#projectEndInput").addEventListener("change", (event) => {
    const project = currentProject();
    pushHistory();
    project.end = Number(event.target.value);
    renderTimeline();
    saveStore("Bornes modifiées");
  });
  $("#printSizeInput").addEventListener("change", (event) => {
    state.printSize = event.target.value;
    saveStore("Format choisi");
  });

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
