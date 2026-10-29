const STORAGE_KEY = "fiche-monitoring-quotidien-v3";

// Point d'entrée du backend qui consomme la fiche et envoie l'e-mail (SMTP : Brevo / Hostinger).
// Modifiez ici si le service d'envoi est exposé ailleurs.
const MAIL_ENDPOINT = "https://api.cpi-chues.com/api/v1/fiches/monitoring/envoyer";

let state = {
  date: "",
  directionService: "",
  nom: "",
  prenom: "",
  evaluation: {
    realises: "",
    nonAchev: "",
    difficultes: "",
    besoins: "",
    actions: "",
  },
  email: {
    destinataire: "",
    sujet: "Fiche de monitoring quotidien – CPI",
    corps: "",
  },
};

function todayStr() {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getFullYear()}`;
}

function defautCorps(s = state) {
  const e = s.evaluation;
  return [
    "Fiche de monitoring quotidien – CPI",
    `Date : ${s.date || todayStr()}`,
    `Direction / Service : ${s.directionService || ""}`,
    `Nom : ${s.nom || ""} ${s.prenom || ""}`.trim(),
    "",
    "Principales réalisations du service : " + (e.realimes || "…"),
    "Tâches non achevées et motifs : " + (e.nonAchev || "…"),
    "Difficultés ayant affecté le travail : " + (e.difficultes || "…"),
    "Besoins d'accompagnement ou de moyens : " + (e.besoins || "…"),
    "Actions prioritaires à poursuivre le lendemain : " + (e.actions || "…"),
  ].join("\n");
}

function defaultState() {
  const base = {
    date: todayStr(),
    directionService: "",
    nom: "",
    prenom: "",
    evaluation: { realises: "", nonAchev: "", difficultes: "", besoins: "", actions: "" },
    email: { destinataire: "", sujet: "Fiche de monitoring quotidien – CPI", corps: "" },
  };
  base.email.corps = defautCorps(base);
  return base;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    const base = defaultState();
    const email = { ...base.email, ...(parsed.email || {}) };
    email.corps = parsed.email?.corps || defautCorps(base);
    return {
      ...base,
      ...parsed,
      email,
    };
  } catch {
    return defaultState();
  }
}

state = loadState();

function setSaveState(label) {
  const el = document.getElementById("save-state");
  if (el) el.textContent = label;
}

function setSendStatus(label) {
  const el = document.getElementById("send-status");
  if (el) el.textContent = label;
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    setSaveState("sauvegardé");
  } catch {
    setSaveState("erreur de sauvegarde");
  }
}

let saveTimer = null;
function queueSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(persist, 300);
}

function bind() {
  const map = {
    "f-date": () => { state.date = document.getElementById("f-date").value; },
    "f-direction": () => { state.directionService = document.getElementById("f-direction").value; },
    "f-nom": () => { state.nom = document.getElementById("f-nom").value; },
    "f-prenom": () => { state.prenom = document.getElementById("f-prenom").value; },
    "ev-realises": () => { state.evaluation.realimes = document.getElementById("ev-realises").value; },
    "ev-non-achev": () => { state.evaluation.nonAchev = document.getElementById("ev-non-achev").value; },
    "ev-difficultes": () => { state.evaluation.difficultes = document.getElementById("ev-difficultes").value; },
    "ev-besoins": () => { state.evaluation.besoins = document.getElementById("ev-besoins").value; },
    "ev-actions": () => { state.evaluation.actions = document.getElementById("ev-actions").value; },
    "mail-destinataire": () => { state.email.destinataire = document.getElementById("mail-destinataire").value; },
    "mail-sujet": () => { state.email.sujet = document.getElementById("mail-sujet").value; },
    "mail-corps": () => { state.email.corps = document.getElementById("mail-corps").value; },
  };
  document.addEventListener("input", (e) => {
    const handler = map[e.target.id];
    if (handler) handler();
    queueSave();
  });

  document.getElementById("btn-send")?.addEventListener("click", envoyer);
}

async function envoyer() {
  const destinataire = state.email.destinataire.trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(destinataire)) {
    setSendStatus("Veuillez renseigner une adresse e-mail valide.");
    return;
  }
  const corps = state.email.corps.trim();
  const sujet = state.email.sujet.trim() || "Fiche de monitoring quotidien – CPI";
  setSendStatus("Envoi en cours…");
  try {
    const res = await fetch(MAIL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...state, email: { ...state.email } }),
    });
    if (!res.ok) throw new Error(`Réponse serveur : ${res.status}`);
    await res.json().catch(() => ({}));
    setSendStatus("E-mail envoyé.");
  } catch (err) {
    setSendStatus(`Échec de l'envoi : ${err.message}`);
  }
}

function render() {
  document.getElementById("f-date").value = state.date;
  document.getElementById("f-direction").value = state.directionService;
  document.getElementById("f-nom").value = state.nom;
  document.getElementById("f-prenom").value = state.prenom;
  document.getElementById("ev-realises").value = state.evaluation.realimes;
  document.getElementById("ev-non-achev").value = state.evaluation.nonAchev;
  document.getElementById("ev-difficultes").value = state.evaluation.difficultes;
  document.getElementById("ev-besoins").value = state.evaluation.besoins;
  document.getElementById("ev-actions").value = state.evaluation.actions;
  document.getElementById("mail-destinataire").value = state.email.destinataire;
  document.getElementById("mail-sujet").value = state.email.sujet;
  document.getElementById("mail-corps").value = state.email.corps;
}

document.addEventListener("DOMContentLoaded", () => {
  bind();
  render();
});
