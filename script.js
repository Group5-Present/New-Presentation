const sectionLinks = Array.from(
    document.querySelectorAll('.nav-links a[href^="#"]')
);
const sections = sectionLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);
const progressBar = document.querySelector(".reading-progress-bar");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const themeToggle = document.querySelector("#theme-toggle");
const themeToggleLabel = themeToggle.querySelector(".theme-toggle-label");
const themeToggleIcon = themeToggle.querySelector(".theme-toggle-icon");

function applyTheme(theme) {
    const isDark = theme === "dark";
    document.documentElement.dataset.theme = isDark ? "dark" : "light";
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggleLabel.textContent = isDark ? "Light theme" : "Dark theme";
    themeToggleIcon.textContent = isDark ? "☀" : "☾";
}

let savedTheme = "light";
try {
    savedTheme = localStorage.getItem("g5-presentation-theme") || "light";
} catch {
    savedTheme = "light";
}
applyTheme(savedTheme);

themeToggle.addEventListener("click", () => {
    const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    try {
        localStorage.setItem("g5-presentation-theme", nextTheme);
    } catch {
        // Theme remains usable for this visit when storage is unavailable.
    }
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
        const target = document.querySelector(link.getAttribute("href"));

        if (!target) return;

        event.preventDefault();
        history.pushState(null, "", link.getAttribute("href"));
        setCurrentSection(target.id);
        target.scrollIntoView({
            behavior: reduceMotion.matches ? "auto" : "smooth",
            block: "start"
        });
    });
});

window.addEventListener("popstate", () => {
    const target = document.querySelector(location.hash || "#home");
    if (!target) return;

    setCurrentSection(target.id);
    target.scrollIntoView({
        behavior: reduceMotion.matches ? "auto" : "smooth",
        block: "start"
    });
});

function setCurrentSection(sectionId) {
    sectionLinks.forEach((link) => {
        const isCurrent = link.getAttribute("href") === `#${sectionId}`;
        if (isCurrent) {
            link.setAttribute("aria-current", "location");
            link.scrollIntoView({ block: "nearest", inline: "nearest" });
        } else {
            link.removeAttribute("aria-current");
        }
    });
}

function updateCurrentSection() {
    const activationLine = window.innerHeight * 0.32;
    let currentSection = sections[0];

    sections.forEach((section) => {
        if (section.getBoundingClientRect().top <= activationLine) {
            currentSection = section;
        }
    });

    if (currentSection) setCurrentSection(currentSection.id);
}

function updateReadingProgress() {
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
    progressBar.style.transform = `scaleX(${Math.min(progress, 1)})`;
}

window.addEventListener("scroll", updateReadingProgress, { passive: true });
window.addEventListener("scroll", updateCurrentSection, { passive: true });
window.addEventListener("resize", () => {
    updateReadingProgress();
    updateCurrentSection();
});
setCurrentSection(location.hash.slice(1) || "home");
updateReadingProgress();
updateCurrentSection();
