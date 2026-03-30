// Controle da tela de carregamento
const loadingVideo = document.getElementById('loading-video');
const loadingScreen = document.getElementById('loading-screen');
const mainContent = document.querySelector('main');
const body = document.body;
const loadingSource = loadingVideo ? loadingVideo.querySelector('source') : null;
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

function mostrarMenuSemIntro() {
	menuMostrado = true;
	loadingScreen.style.display = 'none';
	mainContent.classList.remove('hidden');
	body.style.overflow = 'auto';
}

function habilitarSomNoPrimeiroGesto() {
	if (!loadingVideo) return;

	const ativarSom = () => {
		if (menuMostrado) {
			removerListeners();
			return;
		}

		loadingVideo.muted = false;
		loadingVideo.defaultMuted = false;
		loadingVideo.volume = 1;

		const playPromise = loadingVideo.play();
		if (playPromise && typeof playPromise.catch === 'function') {
			playPromise.catch(() => {
				// Ignora falha pontual; o video segue com as politicas do navegador.
			});
		}

		removerListeners();
	};

	const removerListeners = () => {
		document.removeEventListener('pointerdown', ativarSom);
		document.removeEventListener('touchstart', ativarSom);
		document.removeEventListener('keydown', ativarSom);
	};

	document.addEventListener('pointerdown', ativarSom);
	document.addEventListener('touchstart', ativarSom, { passive: true });
	document.addEventListener('keydown', ativarSom);
}

function isReloadNavigation() {
	const navigationEntries = performance.getEntriesByType('navigation');
	if (navigationEntries.length > 0) {
		return navigationEntries[0].type === 'reload';
	}

	// Fallback para navegadores antigos
	if (performance.navigation) {
		return performance.navigation.type === 1;
	}

	return false;
}

function devePularIntroPorParametro() {
	const params = new URLSearchParams(window.location.search);
	const isReload = isReloadNavigation();

	if (isReload) {
		if (params.has('skipIntro')) {
			params.delete('skipIntro');
			const novaQueryReload = params.toString();
			const novaUrlReload = `${window.location.pathname}${novaQueryReload ? `?${novaQueryReload}` : ''}${window.location.hash}`;
			window.history.replaceState({}, document.title, novaUrlReload);
		}
		return false;
	}

	const devePular = params.get('skipIntro') === '1';

	if (devePular) {
		params.delete('skipIntro');
		const novaQuery = params.toString();
		const novaUrl = `${window.location.pathname}${novaQuery ? `?${novaQuery}` : ''}${window.location.hash}`;
		window.history.replaceState({}, document.title, novaUrl);
	}

	return devePular;
}

// Evento do vídeo
if (loadingVideo) {
	const introDeveSerPulada = devePularIntroPorParametro();

	if (introDeveSerPulada) {
		console.log('Pulando intro por parametro de navegacao');
		mostrarMenuSemIntro();
	} else {
		console.log('Iniciando intro...');

		if (loadingSource && !loadingSource.getAttribute('src')) {
			const videoSrc = loadingSource.getAttribute('data-src');
			if (videoSrc) {
				loadingSource.setAttribute('src', videoSrc);
				loadingVideo.load();
			}
		}

		loadingVideo.addEventListener('ended', () => {
			console.log('Vídeo terminou');
			mostrarMenu();
		});

		loadingVideo.addEventListener('error', () => {
			console.log('Erro no vídeo');
			setTimeout(mostrarMenu, 1000);
		});

		setTimeout(() => {
			console.log('Timeout - mostrando menu');
			mostrarMenu();
		}, 15000);

		habilitarSomNoPrimeiroGesto();

		// Tenta iniciar com som; se o navegador bloquear, faz fallback mudo.
		loadingVideo.muted = false;
		loadingVideo.defaultMuted = false;
		loadingVideo.volume = 1;

		const playPromise = loadingVideo.play();
		if (playPromise && typeof playPromise.catch === 'function') {
			playPromise.catch(() => {
				console.log('Autoplay com som bloqueado; iniciando mudo ate interacao do usuario');
				loadingVideo.muted = true;
				loadingVideo.defaultMuted = true;
				loadingVideo.volume = 0;

				const mutedPlayPromise = loadingVideo.play();
				if (mutedPlayPromise && typeof mutedPlayPromise.catch === 'function') {
					mutedPlayPromise.catch(() => {
						setTimeout(mostrarMenu, 1000);
					});
				}
			});
		}
	}
} else {
	console.log('Vídeo não encontrado');
	mostrarMenu();
}

// Controle dos perfis
document.addEventListener('DOMContentLoaded', () => {
	const perfilLinks = document.querySelectorAll('.perfil');

	perfilLinks.forEach(link => {
		link.addEventListener('click', (event) => {
			// Encontrar o elemento de nome e a imagem dentro do perfil clicado
			const item = link.closest('.item-perfil');
			if (!item) return;

			const nomeEl = item.querySelector('.nome-perfil');
			const imgEl = item.querySelector('img');

			const nome = nomeEl ? nomeEl.textContent.trim() : '';
			let imgSrc = imgEl ? imgEl.getAttribute('src') : '';

			// Ajusta caminho relativo para que funcione a partir de catalogo/catalogo.html
			// Se for um caminho relativo como "assets/1.webp", prefixa "../" para apontar ao root
			if (imgSrc && !imgSrc.startsWith('http') && !imgSrc.startsWith('/') && !imgSrc.startsWith('..')) {
				imgSrc = '../' + imgSrc;
			}

			try {
				localStorage.setItem('perfilAtivoNome', nome);
				localStorage.setItem('perfilAtivoImagem', imgSrc);
			} catch (e) {
				// Silenciar erros de localStorage (ex: modo privado)
				console.warn('Não foi possível salvar o perfil ativo no localStorage', e);
			}

			// Deixar o link navegar normalmente para catalogo.html
		});
	});
});

const STORAGE_KEY = 'theme-preference';

function getSystemTheme() {
	return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function applyTheme(theme) {
	const button = document.querySelector('[data-theme-toggle]');

	document.body.setAttribute('data-theme', theme);

	if (!button) {
		return;
	}

	const isLight = theme === 'light';
	button.setAttribute('aria-pressed', String(isLight));
	button.setAttribute('aria-label', isLight ? 'Ativar modo escuro' : 'Ativar modo claro');
	button.textContent = isLight ? '☀' : '🌙';
}

function setupThemeToggle() {
	const button = document.querySelector('[data-theme-toggle]');
	if (!button) {
		return;
	}

	const savedTheme = localStorage.getItem(STORAGE_KEY);
	const initialTheme = savedTheme || getSystemTheme();

	applyTheme(initialTheme);

	button.addEventListener('click', () => {
		const currentTheme = document.body.getAttribute('data-theme') || 'dark';
		const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';

		localStorage.setItem(STORAGE_KEY, nextTheme);
		applyTheme(nextTheme);
	});

	const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
	mediaQuery.addEventListener('change', () => {
		if (!localStorage.getItem(STORAGE_KEY)) {
			applyTheme(getSystemTheme());
		}
	});
}

document.addEventListener('DOMContentLoaded', setupThemeToggle);
