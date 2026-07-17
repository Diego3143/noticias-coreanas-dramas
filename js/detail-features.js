// Funcionalidades extra para páginas de detalle: Compartir, Favoritos y Tracker de Episodios
(function () {
    'use strict';

    const pageId = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
    if (pageId === 'index') return;

    const FAV_KEY = 'dorama_favorites';
    const EP_KEY = 'dorama_episodes';

    function getFavorites() {
        try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; }
        catch { return []; }
    }

    function saveFavorites(list) {
        localStorage.setItem(FAV_KEY, JSON.stringify(list));
    }

    function getEpisodes() {
        try { return JSON.parse(localStorage.getItem(EP_KEY)) || {}; }
        catch { return {}; }
    }

    function saveEpisodes(obj) {
        localStorage.setItem(EP_KEY, JSON.stringify(obj));
    }

    function getTotalEpisodes() {
        const items = document.querySelectorAll('.info-item');
        for (const item of items) {
            const label = item.querySelector('.info-label');
            if (label && label.textContent.trim() === 'Episodios:') {
                const val = item.querySelector('.info-value');
                if (val) return parseInt(val.textContent.trim(), 10) || 16;
            }
        }
        return 16;
    }

    function injectToolbar() {
        const content = document.querySelector('.detail-content');
        if (!content) return;

        const title = document.querySelector('.detail-title');
        const titleText = title ? title.textContent.trim() : pageId;
        const url = window.location.href;
        const text = encodeURIComponent(`Mira "${titleText}" - ${url}`);

        const isFav = getFavorites().includes(pageId);

        const toolbar = document.createElement('div');
        toolbar.className = 'detail-toolbar';
        toolbar.innerHTML = `
            <div class="toolbar-group">
                <button class="fav-btn ${isFav ? 'active' : ''}" id="detail-fav-btn" aria-label="Añadir a favoritos">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                    <span>${isFav ? 'En favoritos' : 'Favorito'}</span>
                </button>
                <div class="share-group">
                    <span class="share-label">Compartir:</span>
                    <a href="https://api.whatsapp.com/send?text=${text}" target="_blank" rel="noopener" class="share-btn share-whatsapp" aria-label="WhatsApp">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    </a>
                    <a href="https://twitter.com/intent/tweet?text=${text}" target="_blank" rel="noopener" class="share-btn share-twitter" aria-label="Twitter/X">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    </a>
                    <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}" target="_blank" rel="noopener" class="share-btn share-facebook" aria-label="Facebook">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    </a>
                </div>
            </div>
        `;
        content.appendChild(toolbar);

        document.getElementById('detail-fav-btn').addEventListener('click', toggleFavorite);
    }

    function injectEpisodeTracker() {
        const content = document.querySelector('.detail-content');
        if (!content) return;

        const total = getTotalEpisodes();
        const saved = getEpisodes()[pageId] || [];

        const section = document.createElement('section');
        section.className = 'detail-section episode-tracker-section';
        section.innerHTML = `
            <h2>Mi Progreso</h2>
            <div class="episode-progress-bar">
                <div class="progress-fill" style="width: ${total > 0 ? (saved.length / total * 100) : 0}%"></div>
            </div>
            <p class="progress-text">${saved.length} / ${total} episodios vistos</p>
            <div class="episode-grid" id="episode-grid"></div>
        `;
        content.appendChild(section);

        const grid = document.getElementById('episode-grid');
        for (let i = 1; i <= total; i++) {
            const btn = document.createElement('button');
            btn.className = 'episode-btn' + (saved.includes(i) ? ' watched' : '');
            btn.textContent = i;
            btn.setAttribute('aria-label', `Episodio ${i}`);
            btn.addEventListener('click', () => toggleEpisode(i));
            grid.appendChild(btn);
        }
    }

    function toggleFavorite() {
        const btn = document.getElementById('detail-fav-btn');
        const favs = getFavorites();
        const idx = favs.indexOf(pageId);
        if (idx > -1) {
            favs.splice(idx, 1);
            btn.classList.remove('active');
            btn.querySelector('svg').setAttribute('fill', 'none');
            btn.querySelector('span').textContent = 'Favorito';
        } else {
            favs.push(pageId);
            btn.classList.add('active');
            btn.querySelector('svg').setAttribute('fill', 'currentColor');
            btn.querySelector('span').textContent = 'En favoritos';
        }
        saveFavorites(favs);
    }

    function toggleEpisode(num) {
        const all = getEpisodes();
        if (!all[pageId]) all[pageId] = [];
        const idx = all[pageId].indexOf(num);
        if (idx > -1) {
            all[pageId].splice(idx, 1);
        } else {
            all[pageId].push(num);
        }
        all[pageId].sort((a, b) => a - b);
        saveEpisodes(all);
        refreshEpisodeUI();
    }

    function refreshEpisodeUI() {
        const total = getTotalEpisodes();
        const saved = getEpisodes()[pageId] || [];
        const pct = total > 0 ? (saved.length / total * 100) : 0;

        const fill = document.querySelector('.progress-fill');
        const text = document.querySelector('.progress-text');
        if (fill) fill.style.width = pct + '%';
        if (text) text.textContent = `${saved.length} / ${total} episodios vistos`;

        const btns = document.querySelectorAll('.episode-btn');
        btns.forEach(btn => {
            const num = parseInt(btn.textContent, 10);
            btn.classList.toggle('watched', saved.includes(num));
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => { injectToolbar(); injectEpisodeTracker(); });
    } else {
        injectToolbar();
        injectEpisodeTracker();
    }
})();
