// Sistema de anuncios en páginas de detalle
// En el index, los enlaces "Ver más" apuntan directo a los anuncios (definidos en el HTML)
// Para agregar más enlaces: agregar objetos al array ADS y usarlos en el HTML
(function () {
    'use strict';

    const ADS = [
        {
            id: 'ad-1',
            url: 'https://www.effectivecpmnetwork.com/ygd9cvhvm6?key=0ff3cff18391c0af70e39222d51a1c3a',
            label: 'Publicidad'
        },
        {
            id: 'ad-2',
            url: 'https://www.effectivecpmnetwork.com/nvbf20zwi?key=d865ba581655ace4fea9ee9780fc7b0d',
            label: 'Publicidad'
        },
    ];

    const pageId = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
    if (pageId === 'index') return;

    function createAdElement(ad) {
        const wrapper = document.createElement('div');
        wrapper.className = 'ad-wrapper';
        wrapper.setAttribute('data-ad-id', ad.id);

        const link = document.createElement('a');
        link.href = ad.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer sponsored';
        link.className = 'ad-link';

        const label = document.createElement('span');
        label.className = 'ad-label';
        label.textContent = ad.label;

        const content = document.createElement('div');
        content.className = 'ad-content';
        content.innerHTML = `
            <svg class="ad-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
            <span class="ad-cta">Descubre más</span>
            <svg class="ad-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
        `;

        link.appendChild(label);
        link.appendChild(content);
        wrapper.appendChild(link);
        return wrapper;
    }

    function injectDetailAds() {
        const detailContent = document.querySelector('.detail-content');
        if (!detailContent) return;

        const castSection = detailContent.querySelector('.detail-section:last-of-type');
        if (castSection && ADS[0]) {
            const ad1 = createAdElement(ADS[0]);
            castSection.parentNode.insertBefore(ad1, castSection.nextSibling);
        }

        const toolbar = detailContent.querySelector('.detail-toolbar');
        if (toolbar && ADS[1]) {
            const ad2 = createAdElement(ADS[1]);
            toolbar.parentNode.insertBefore(ad2, toolbar.nextSibling);
        }
    }

    function scheduleAds() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(injectDetailAds, 0);
            });
        } else {
            setTimeout(injectDetailAds, 0);
        }
    }

    scheduleAds();
})();
