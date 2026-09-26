/* NUSRATHUL ISLAM MADRASA - DAILY HABIT TRACKER */

const data = {
  ibadah: {
    title: "🕌 Ibadah",
    sub: "തഹജ്ജുദ് + 5 നമസ്കാരങ്ങൾ + ഖുർആൻ",
    items: ["തഹജ്ജുദ്","സുബ്ഹി","ളുഹർ","അസർ","മഗ്‌രിബ്","ഇശാ","ഖുർആൻ പാരായണം"]
  },
  study: {
    title: "📚 Study",
    sub: "മദ്റസ • സ്കൂൾ",
    items: ["മദ്റസ പാഠ പഠനം","മദ്റസ Homework പൂർത്തിയാക്കി","സ്കൂൾ പാഠ പഠനം","School Homework പൂർത്തിയാക്കി","ഇന്നത്തെ പഠനം Revision"]
  },
  character: {
    title: "🌿 Character",
    sub: "സ്വഭാവം • കുടുംബം",
    items: ["മാതാപിതാക്കളെ സഹായിച്ചു","മാതാപിതാക്കളോട് നല്ല പെരുമാറ്റം","ഉസ്താദിനോടും അധ്യാപകരോടും ആദരം","കള്ളം പറയാതിരിക്കാൻ ശ്രദ്ധിച്ചു","കോപം നിയന്ത്രിച്ചു"]
  },
  health: {
    title: "🏃 Health",
    sub: "ശരീരം • ഉറക്കം",
    items: ["20–30 മിനിറ്റ് Physical Activity","ആവശ്യത്തിന് വെള്ളം കുടിച്ചു","ആരോഗ്യകരമായ ഭക്ഷണം","സമയത്ത് ഉറങ്ങി"]
  },
  digital: {
    title: "📱 Digital Discipline",
    sub: "Mobile • Games",
    items: ["ഉറങ്ങുന്നതിന് മുമ്പ് Mobile ഒഴിവാക്കി"]
  }
};

let state = {};

function createEmptyState() {
  const s = {};
  Object.keys(data).forEach(g => s[g] = data[g].items.map(() => false));
  return s;
}
state = createEmptyState();

function getApiUrl() {
  if (typeof API_URL !== "undefined" && API_URL) return String(API_URL).trim();
  if (window.API_URL) return String(window.API_URL).trim();
  return "";
}

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function render() {
  const root = document.getElementById("habitGrid");
  if (!root) return;
  root.innerHTML = "";

  Object.entries(data).forEach(([group, value]) => {
    const box = document.createElement("div");
    box.className = "habit-card";
    const icon = value.title.split(" ")[0];
    const title = value.title.substring(value.title.indexOf(" ") + 1);

    box.innerHTML = `<div class="habit-title"><span class="ico">${icon}</span><div><h3>${title}</h3><small>${value.sub}</small></div></div>`;

    value.items.forEach((name, i) => {
      const row = document.createElement("div");
      row.className = "habit";

      if (group === "digital" && name.toLowerCase().includes("mobile")) {
        row.innerHTML = `<label>${name}</label><input class="timebox" id="mobileTime" type="number" min="0" max="1440" placeholder="മിനിറ്റ്">`;
      } else {
        row.innerHTML = `<label>${name}</label><button type="button" class="check ${state[group][i] ? "on" : ""}" onclick="toggleHabit('${group}',${i},this)">${state[group][i] ? "✓" : ""}</button>`;
      }
      box.appendChild(row);
    });

    if (group === "digital") {
      const row = document.createElement("div");
      row.className = "habit";
      row.innerHTML = `<label>🎮 Games സമയം</label><input class="timebox" id="gamesTime" type="number" min="0" max="1440" placeholder="മിനിറ്റ്">`;
      box.appendChild(row);
    }

    root.appendChild(box);
  });
}

function toggleHabit(group, index, button) {
  state[group][index] = !state[group][index];
  button.classList.toggle("on", state[group][index]);
  button.textContent = state[group][index] ? "✓" : "";
  updateProgress();
}
function toggle(group,index,button) { toggleHabit(group,index,button); }

function percentage(group) {
  const a = state[group] || [];
  return a.length ? Math.round(a.filter(Boolean).length / a.length * 100) : 0;
}

function updateProgress() {
  const scores = {
    ibadah: percentage("ibadah"),
    study: percentage("study"),
    character: percentage("character"),
    health: percentage("health")
  };

  Object.entries(scores).forEach(([g,v]) => {
    const pct = document.getElementById(g+"Pct");
    const bar = document.getElementById(g+"Bar");
    if (pct) pct.textContent = v+"%";
    if (bar) bar.style.width = v+"%";
  });

  const digital = state.digital[0] ? 100 : 0;
  const overall = Math.round((scores.ibadah+scores.study+scores.character+scores.health+digital)/5);
  const el = document.getElementById("overall");
  if (el) el.textContent = overall+"%";
  return {scores,digital,overall};
}

function createPayload() {
  const studentEl = document.getElementById("studentId");
  const mobileEl = document.getElementById("mobileTime");
  const gamesEl = document.getElementById("gamesTime");
  const p = updateProgress();

  return {
    action:"save",
    studentId: studentEl && studentEl.value.trim() ? studentEl.value.trim() : "STU001",
    date:today(),
    ibadah:state.ibadah,
    study:state.study,
    character:state.character,
    health:state.health,
    digital:state.digital,
    madrasaHomework:Boolean(state.study[1]),
    schoolHomework:Boolean(state.study[3]),
    mobileMinutes:mobileEl ? Number(mobileEl.value || 0) : 0,
    gamesMinutes:gamesEl ? Number(gamesEl.value || 0) : 0,
    overall:p.overall
  };
}

async function api(body) {
  const url = getApiUrl();
  if (!url || url.includes("PASTE_") || url.includes("YOUR_")) {
    throw new Error("config.js-ൽ ശരിയായ Google Apps Script URL നൽകുക.");
  }

  let response;
  try {
    response = await fetch(url,{
      method:"POST",
      headers:{"Content-Type":"text/plain;charset=utf-8"},
      body:JSON.stringify(body)
    });
  } catch(e) {
    throw new Error("Google Sheet-ലേക്ക് connect ചെയ്യാൻ കഴിഞ്ഞില്ല.");
  }

  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch(e) {
    console.error("Google response:",text);
    throw new Error("Google Apps Script ശരിയായ JSON response നൽകിയില്ല.");
  }
}

async function save() {
  const status = document.getElementById("saveStatus");
  if (status) status.textContent = "⏳ Saving...";
  try {
    const result = await api(createPayload());
    if (!result || !result.ok) throw new Error(result && result.error ? result.error : "Save failed");
    if (status) status.textContent = "✅ Google Sheet-ൽ save ചെയ്തു!";
  } catch(e) {
    console.error("SAVE ERROR:",e);
    if (status) status.textContent = "⚠️ "+e.message;
  }
}

async function parentLoad() {
  const input = document.getElementById("parentStudentId");
  const box = document.getElementById("parentCards");
  if (!input || !box) return;

  const id = input.value.trim();
  if (!id) {
    box.innerHTML = `<div class="card">⚠️ Student ID നൽകുക.</div>`;
    return;
  }

  box.innerHTML = `<div class="card">⏳ Loading...</div>`;

  try {
    const result = await api({action:"student",studentId:id});
    if (!result.ok) throw new Error(result.error || "Student data ലഭിച്ചില്ല.");
    const rows = result.data || [];
    if (!rows.length) {
      box.innerHTML = `<div class="card">No data found.</div>`;
      return;
    }

    const latest = rows[rows.length-1];
    const overall = Number(latest.overall || 0);
    const ibadah = Number(latest.ibadahScore || latest.salahScore || 0);
    const study = Number(latest.studyScore || 0);

    box.innerHTML = `
      <div class="metriccard"><span class="small">Overall</span><b>${overall}%</b></div>
      <div class="metriccard"><span class="small">🕌 Ibadah</span><b>${ibadah}%</b></div>
      <div class="metriccard"><span class="small">📚 Study</span><b>${study}%</b></div>`;
    drawChart(rows.slice(-7));
  } catch(e) {
    box.innerHTML = `<div class="card">⚠️ ${e.message}</div>`;
  }
}

function drawChart(rows) {
  const chart = document.getElementById("weeklyChart");
  if (!chart) return;
  if (!rows || !rows.length) {
    chart.innerHTML = `<span class="small">No weekly data yet.</span>`;
    return;
  }

  chart.innerHTML = rows.map(row => {
    const value = Number(row.overall || 0);
    const height = Math.max(8,value*1.45);
    const date = String(row.date || "").slice(5);
    return `<div class="daybar"><i style="height:${height}px"></i>${date}</div>`;
  }).join("");
}

async function adminLoad() {
  const table = document.getElementById("studentTable");
  const stats = document.getElementById("adminStats");
  if (!table) return;

  table.innerHTML = "⏳ Loading...";

  try {
    const result = await api({action:"all"});
    if (!result.ok) throw new Error(result.error || "Data load failed");

    const rows = result.data || [];
    const students = [...new Set(rows.map(r => r.studentId))];

    let total = 0;
    students.forEach(id => {
      const a = rows.filter(r => r.studentId === id);
      total += Number((a[a.length-1] || {}).overall || 0);
    });
    const average = students.length ? Math.round(total/students.length) : 0;

    if (stats) {
      stats.innerHTML = `
        <div class="stat"><span>Students</span><b>${students.length}</b></div>
        <div class="stat"><span>Records</span><b>${rows.length}</b></div>
        <div class="stat"><span>Class Growth</span><b>${average}%</b></div>
        <div class="stat"><span>Today</span><b>${rows.filter(r => r.date === today()).length}</b></div>`;
    }

    if (!students.length) {
      table.innerHTML = `<div class="card">No student data yet.</div>`;
      return;
    }

    let html = `<div class="student-row head"><span>Student</span><span>Growth</span><span>Study</span><span>Status</span></div>`;

    students.forEach(id => {
      const a = rows.filter(r => r.studentId === id);
      const latest = a[a.length-1] || {};
      const growth = Number(latest.overall || 0);
      const study = Number(latest.studyScore || 0);
      const status = growth >= 80 ? "On track" : growth >= 60 ? "Improve" : "Needs attention";
      const cls = growth >= 80 ? "green" : growth >= 60 ? "orange" : "red";

      html += `<div class="student-row"><span>${id}</span><span>${growth}%</span><span>${study}%</span><span class="status ${cls}">${status}</span></div>`;
    });

    table.innerHTML = html;
  } catch(e) {
    table.innerHTML = `<div class="card">⚠️ ${e.message}</div>`;
  }
}

function setupTabs() {
  document.querySelectorAll(".tab").forEach(button => {
    button.addEventListener("click",() => {
      document.querySelectorAll(".tab").forEach(x => x.classList.remove("active"));
      button.classList.add("active");
      document.querySelectorAll(".view").forEach(v => v.classList.add("hidden"));
      const target = document.getElementById(button.dataset.tab);
      if (target) target.classList.remove("hidden");
    });
  });
}

function toggleTheme() {
  document.body.classList.toggle("dark");
}

function resetTracker() {
  state = createEmptyState();
  render();
  updateProgress();

  const mobile = document.getElementById("mobileTime");
  const games = document.getElementById("gamesTime");
  const status = document.getElementById("saveStatus");

  if (mobile) mobile.value = "";
  if (games) games.value = "";
  if (status) status.textContent = "";
}

function initApp() {
  const todayEl = document.getElementById("today");
  if (todayEl) {
    todayEl.textContent = new Date().toLocaleDateString("en-IN",{
      day:"2-digit",month:"short",year:"numeric"
    });
  }

  render();
  updateProgress();
  setupTabs();

  const saveBtn = document.getElementById("saveBtn");
  const parentBtn = document.getElementById("parentLoad");
  const adminBtn = document.getElementById("adminLoad");
  const resetBtn = document.getElementById("loadBtn");

  if (saveBtn) saveBtn.addEventListener("click",save);
  if (parentBtn) parentBtn.addEventListener("click",parentLoad);
  if (adminBtn) adminBtn.addEventListener("click",adminLoad);
  if (resetBtn) resetBtn.addEventListener("click",resetTracker);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded",initApp);
} else {
  initApp();
}
