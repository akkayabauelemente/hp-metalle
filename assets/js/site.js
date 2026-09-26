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

// Vorbelegung aus der Adresse, z. B. kontaktieren-sie-uns.html?anliegen=Demontage
const params = new URLSearchParams(window.location.search);
document.querySelectorAll("[data-param]").forEach((el) => {
  const value = params.get(el.dataset.param);
  if (value) el.value = value;
});

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
    const subject = encodeURIComponent(form.dataset.subject || "Anfrage über die Webseite");
    const body = encodeURIComponent(lines.join("\n") + "\n");
    window.location.href = `mailto:${form.dataset.mailto}?subject=${subject}&body=${body}`;
    const sent = form.querySelector("[data-sent]");
    if (sent) sent.textContent = form.dataset.sentText || "";
  });
});
