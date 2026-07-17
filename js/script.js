document.addEventListener('DOMContentLoaded', () => {
    console.log('Noticias de Corea - Inicializando interactividad...');

    const categoryButtons = document.querySelectorAll('.category-btn');
    const newsCards = document.querySelectorAll('.news-card');

    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Activar botón seleccionado
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Centrar botón suavemente en la barra horizontal móvil
            button.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });

            const selectedCategory = button.getAttribute('data-category');

            // Filtrar tarjetas
            newsCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');

                if (selectedCategory === 'all' || cardCategory === selectedCategory) {
                    card.style.display = 'flex';
                    // Reiniciar la animación de entrada
                    card.style.animation = 'none';
                    card.offsetHeight; // Forzar reflow
                    card.style.animation = 'fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
});
