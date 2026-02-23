let grData = null;
let esData = {};

let currentChapter = 1;
let mode = "parallel";

const content = document.getElementById("content");
const chapterSelect = document.getElementById("chapterSelect");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const modeBtn = document.getElementById("modeBtn");
const themeBtn = document.getElementById("themeBtn");

/* ===============================
   INIT
=============================== */

async function init() {
  initTheme();

  try {
    const grResponse = await fetch("data/gr.json");
    if (!grResponse.ok) throw new Error("No se pudo cargar gr.json");
    grData = await grResponse.json();

    try {
      const esResponse = await fetch("data/es.json");
      if (esResponse.ok) esData = await esResponse.json();
    } catch {
      esData = {};
    }

    currentChapter = grData.chapters[0].id;

    buildSelector();
    renderChapter();

  } catch (error) {
    content.innerHTML = "<p>Error cargando datos.</p>";
    console.error(error);
  }
}

/* ===============================
   THEME
=============================== */

function initTheme() {
  const saved = localStorage.getItem("theme");

  if (saved) {
    document.body.classList.toggle("dark", saved === "dark");
  } else {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.body.classList.toggle("dark", prefersDark);
  }

  updateThemeButton();
}

function toggleTheme() {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
  updateThemeButton();
}

function updateThemeButton() {
  const isDark = document.body.classList.contains("dark");
  themeBtn.textContent = isDark ? "Light" : "Dark";
}

themeBtn.addEventListener("click", toggleTheme);

/* ===============================
   NAVIGATION
=============================== */

function buildSelector() {
  chapterSelect.innerHTML = "";

  grData.chapters.forEach(ch => {
    const option = document.createElement("option");
    option.value = ch.id;
    option.textContent = `Capítulo ${ch.id}`;
    chapterSelect.appendChild(option);
  });

  chapterSelect.value = currentChapter;

  chapterSelect.addEventListener("change", () => {
    currentChapter = parseInt(chapterSelect.value);
    renderChapter();
  });
}

prevBtn.addEventListener("click", () => {
  const index = grData.chapters.findIndex(c => c.id === currentChapter);
  if (index > 0) {
    currentChapter = grData.chapters[index - 1].id;
    renderChapter();
  }
});

nextBtn.addEventListener("click", () => {
  const index = grData.chapters.findIndex(c => c.id === currentChapter);
  if (index < grData.chapters.length - 1) {
    currentChapter = grData.chapters[index + 1].id;
    renderChapter();
  }
});

modeBtn.addEventListener("click", () => {
  mode = mode === "parallel" ? "interlinear" : "parallel";
  modeBtn.textContent = mode === "parallel" ? "Interlineal" : "Paralelo";
  renderChapter();
});

document.addEventListener("keydown", e => {
  const index = grData.chapters.findIndex(c => c.id === currentChapter);

  if (e.key === "ArrowLeft" && index > 0) {
    currentChapter = grData.chapters[index - 1].id;
    renderChapter();
  }

  if (e.key === "ArrowRight" && index < grData.chapters.length - 1) {
    currentChapter = grData.chapters[index + 1].id;
    renderChapter();
  }
});

/* ===============================
   RENDER
=============================== */

function renderChapter() {
  const chapter = grData.chapters.find(c => c.id === currentChapter);
  if (!chapter) return;

  content.className = "";
  content.classList.add(mode);
  content.innerHTML = "";

  let lastSpeaker = null;

  if (mode === "parallel") {

    const container = document.createElement("div");
    container.className = "parallel";

    chapter.units.forEach(unit => {

      const speaker = unit.speaker !== null ? unit.speaker : lastSpeaker;

      if (speaker && speaker !== lastSpeaker) {
        const speakerRow = document.createElement("div");
        speakerRow.className = "row speaker-row";

        const spLeft = document.createElement("div");
        spLeft.className = "speaker";
        spLeft.textContent = speaker;

        const spRight = document.createElement("div");
        spRight.className = "speaker";
        spRight.textContent = speaker;

        speakerRow.appendChild(spLeft);
        speakerRow.appendChild(spRight);
        container.appendChild(speakerRow);
      }

      const row = document.createElement("div");
      row.className = "row";

      const greekDiv = document.createElement("div");
      greekDiv.className = "greek";
      greekDiv.textContent = unit.text;

      const spanishDiv = document.createElement("div");
      spanishDiv.className = "spanish";
      spanishDiv.textContent = esData[unit.id] || "";

      row.appendChild(greekDiv);
      row.appendChild(spanishDiv);

      container.appendChild(row);

      lastSpeaker = speaker;
    });

    content.appendChild(container);

  } else {

    const container = document.createElement("div");
    container.className = "interlinear";

    chapter.units.forEach(unit => {

      const speaker = unit.speaker !== null ? unit.speaker : lastSpeaker;

      const block = document.createElement("div");

      if (speaker && speaker !== lastSpeaker) {
        const sp = document.createElement("div");
        sp.className = "speaker";
        sp.textContent = speaker;
        block.appendChild(sp);
      }

      const greekDiv = document.createElement("div");
      greekDiv.className = "greek";
      greekDiv.textContent = unit.text;

      const spanishDiv = document.createElement("div");
      spanishDiv.className = "spanish";
      spanishDiv.textContent = esData[unit.id] || "";

      block.appendChild(greekDiv);
      block.appendChild(spanishDiv);

      container.appendChild(block);

      lastSpeaker = speaker;
    });

    content.appendChild(container);
  }

  chapterSelect.value = currentChapter;
  window.scrollTo(0, 0);
}

init();