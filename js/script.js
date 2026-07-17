document.addEventListener('DOMContentLoaded', () => {
    console.log('Noticias de Corea - Inicializando interactividad...');

    const categoryButtons = document.querySelectorAll('.category-btn');
    const newsCards = document.querySelectorAll('.news-card');

    // --- FILTRADO POR CATEGORÍA ---
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            button.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });

            const selectedCategory = button.getAttribute('data-category');

            newsCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                if (selectedCategory === 'all' || cardCategory === selectedCategory) {
                    card.style.display = 'flex';
                    card.style.animation = 'none';
                    card.offsetHeight;
                    card.style.animation = 'fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // --- SISTEMA DE ANUNCIOS: 1er clic = anuncio, 2do clic = página real ---
    const AD_KEY = 'dorama_ad_viewed';

    function getAdViewed() {
        try { return JSON.parse(localStorage.getItem(AD_KEY)) || []; }
        catch { return []; }
    }

    function setAdViewed(list) {
        localStorage.setItem(AD_KEY, JSON.stringify(list));
    }

    const readMoreBtns = document.querySelectorAll('.read-more-btn[data-detail]');

    readMoreBtns.forEach(btn => {
        const card = btn.closest('.news-card');
        const cardId = card ? card.id : '';
        const detailUrl = btn.getAttribute('data-detail');
        const adUrl = btn.getAttribute('href');

        btn.addEventListener('click', (e) => {
            e.preventDefault();

            const viewed = getAdViewed();

            if (!viewed.includes(cardId)) {
                // Primer clic: marcar como visto y abrir anuncio
                viewed.push(cardId);
                setAdViewed(viewed);
                window.open(adUrl, '_blank');
            } else {
                // Segundo clic: ir a la página real
                window.location.href = detailUrl;
            }
        });
    });
});
