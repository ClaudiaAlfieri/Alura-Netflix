// Controle da tela de carregamento
document.addEventListener('DOMContentLoaded', () => {
    const loadingVideo = document.getElementById('loading-video');
    const loadingScreen = document.getElementById('loading-screen');
    const mainContent = document.querySelector('main');
    const body = document.body;
    let menuMostrado = false;

    function mostrarMenu() {
        if (menuMostrado) return;
        menuMostrado = true;
        
        console.log('Mostrando menu...');
        loadingScreen.style.opacity = '0';
        loadingScreen.style.pointerEvents = 'none';
        
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            mainContent.classList.remove('hidden');
            body.style.overflow = 'auto';
            console.log('Menu exibido');
        }, 500);
    }

    if (loadingVideo) {
        console.log('Vídeo encontrado, aguardando...');
        
        // Mostrar menu quando vídeo terminar
        loadingVideo.addEventListener('ended', () => {
            console.log('Vídeo terminou');
            mostrarMenu();
        });

        // Fallback: se vídeo der erro, mostrar após 2s
        loadingVideo.addEventListener('error', () => {
            console.log('Erro no vídeo');
            setTimeout(mostrarMenu, 2000);
        });

        // Fallback: se vídeo não terminar em 15s, mostrar menu mesmo assim
        setTimeout(() => {
            console.log('Timeout - mostrando menu');
            mostrarMenu();
        }, 15000);
    } else {
        console.log('Vídeo não encontrado');
        // Se vídeo não existe, mostrar menu imediatamente
        mostrarMenu();
    }
});


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
