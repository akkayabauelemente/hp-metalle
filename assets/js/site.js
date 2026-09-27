// Handy-Menü und Anfrageformulare (öffnen eine vorbefüllte E-Mail, kein Server nötig).
const header = document.querySelector("[data-header]");
const menuBtn = header && header.querySelector(".menu-btn");

function setMenu(open) {
  if (open) header.style.setProperty("--nav-top", `${header.getBoundingClientRect().bottom}px`);
  header.classList.toggle("is-open", open);
  document.body.classList.toggle("menu-open", open);
  menuBtn.setAttribute("aria-expanded", String(open));
}
if (menuBtn) {
  menuBtn.addEventListener("click", () => setMenu(!header.classList.contains("is-open")));
  header.querySelectorAll(".nav a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  header.addEventListener("focusout", (e) => {
    if (!header.contains(e.relatedTarget)) setMenu(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && header.classList.contains("is-open")) { setMenu(false); menuBtn.focus(); }
  });
}

// Handy-Leiste mit Anruf/Route erst zeigen, wenn die Knöpfe im Hero nicht mehr sichtbar sind
const heroCtas = document.querySelector(".hero .hero__ctas, .page-hero .hero__ctas");
if (heroCtas && "IntersectionObserver" in window) {
  new IntersectionObserver(([entry]) => {
    document.body.classList.toggle("hero-in-view", entry.isIntersecting);
  }).observe(heroCtas);
}

// ...und ausblenden, solange ein Formularfeld die Bildschirmtastatur offen hält
const isField = (el) => el instanceof Element && el.matches("input, select, textarea");
document.addEventListener("focusin", (e) => { if (isField(e.target)) document.body.classList.add("typing"); });
document.addEventListener("focusout", (e) => { if (!isField(e.relatedTarget)) document.body.classList.remove("typing"); });

// Vorbelegung aus der Adresse, z. B. kontaktieren-sie-uns.html?anliegen=Demontage
const params = new URLSearchParams(window.location.search);
document.querySelectorAll("[data-param]").forEach((el) => {
  const value = params.get(el.dataset.param);
  if (value) el.value = value;
});

// Größen-Kacheln wählen den Behälter im Anfrageformular vor
document.querySelectorAll("[data-pick]").forEach((link) => link.addEventListener("click", () => {
  const radio = [...document.querySelectorAll('input[type="radio"]')].find((r) => r.value === link.dataset.pick);
  if (radio) radio.checked = true;
}));

// Wunschtermin frühestens heute (Ortszeit)
const now = new Date();
const today = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
document.querySelectorAll('input[type="date"]').forEach((el) => { el.min = today; });

document.querySelectorAll("form[data-mailto]").forEach((form) => {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const lines = [];
    for (const el of form.elements) {
      if (!el.name || (el.type === "radio" && !el.checked)) continue;
      let value = el.value.trim();
      if (!value) continue;
      if (el.type === "date" && el.valueAsDate) value = new Intl.DateTimeFormat("de-DE", { dateStyle: "medium", timeZone: "UTC" }).format(el.valueAsDate);
      const label = el.dataset.label || (el.id && form.querySelector(`label[for="${el.id}"]`)?.textContent.trim()) || el.name;
      lines.push(`${label}: ${value}`);
    }
    const subject = form.dataset.subject || "Anfrage über die Webseite";
    const text = lines.join("\n");
    window.location.href = `mailto:${form.dataset.mailto}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text + "\n")}`;
    // Ob sich ein E-Mail-Programm öffnet, kann die Seite nicht wissen: Text zum Kopieren daneben legen
    const box = form.querySelector("[data-sent-box]");
    if (box) {
      box.querySelector("textarea").value = `An: ${form.dataset.mailto}\nBetreff: ${subject}\n\n${text}`;
      box.hidden = false;
    }
    const status = form.querySelector("[data-sent]");
    if (status) status.textContent = `Ihr E-Mail-Programm öffnet sich mit der fertigen Anfrage, bitte dort absenden. Öffnet sich nichts, kopieren Sie den Text unten und schicken ihn an ${form.dataset.mailto}, oder rufen Sie uns an.`;
  });
});

document.querySelectorAll("[data-copy]").forEach((btn) => btn.addEventListener("click", async () => {
  const area = btn.closest("[data-sent-box]").querySelector("textarea");
  try {
    await navigator.clipboard.writeText(area.value);
    btn.textContent = "Kopiert";
  } catch {
    area.focus();
    area.select();
  }
}));
