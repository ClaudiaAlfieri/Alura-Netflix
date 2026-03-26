const STORAGE_KEY = "theme-preference";

function getSystemTheme() {
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function applyTheme(theme) {
    const button = document.querySelector("[data-theme-toggle]");

    document.body.setAttribute("data-theme", theme);

    if (!button) {
        return;
    }

    const isLight = theme === "light";
    button.setAttribute("aria-pressed", String(isLight));
    button.setAttribute("aria-label", isLight ? "Ativar modo escuro" : "Ativar modo claro");
}

function setupThemeToggle() {
    const button = document.querySelector("[data-theme-toggle]");
    if (!button) {
        return;
    }

    const savedTheme = localStorage.getItem(STORAGE_KEY);
    const initialTheme = savedTheme || getSystemTheme();

    applyTheme(initialTheme);

    button.addEventListener("click", () => {
        const currentTheme = document.body.getAttribute("data-theme") || "dark";
        const nextTheme = currentTheme === "dark" ? "light" : "dark";

        localStorage.setItem(STORAGE_KEY, nextTheme);
        applyTheme(nextTheme);
    });

    const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");
    mediaQuery.addEventListener("change", () => {
        if (!localStorage.getItem(STORAGE_KEY)) {
            applyTheme(getSystemTheme());
        }
    });
}

document.addEventListener("DOMContentLoaded", setupThemeToggle);
