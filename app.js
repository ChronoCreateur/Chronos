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
