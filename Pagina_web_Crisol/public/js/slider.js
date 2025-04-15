document.addEventListener('DOMContentLoaded', () => {
    const sliderTrack = document.querySelector('.slider-track');
    const prevButton = document.querySelector('.prev');
    const nextButton = document.querySelector('.next');
    const sliderItems = document.querySelectorAll('.slider-item');
    const totalItems = sliderItems.length;

    // Solo configurar el slider si hay imágenes
    if (totalItems > 0) {
        // Clonar elementos para efecto infinito
        const firstClone = sliderItems[0].cloneNode(true);
        const lastClone = sliderItems[totalItems - 1].cloneNode(true);

        sliderTrack.appendChild(firstClone);
        sliderTrack.insertBefore(lastClone, sliderItems[0]);

        let currentIndex = 1;
        let isTransitioning = false;
        let autoSlideInterval;

        // Configurar el slider inicialmente
        sliderTrack.style.transform = `translateX(${-currentIndex * 100}%)`;

        const moveSlider = (direction) => {
            if (isTransitioning || totalItems <= 1) return;
            isTransitioning = true;

            currentIndex += direction;
            sliderTrack.style.transition = 'transform 0.5s ease-in-out';
            sliderTrack.style.transform = `translateX(${-currentIndex * 100}%)`;

            // Reiniciar el intervalo de auto-desplazamiento
            resetAutoSlide();
        };

        const resetAutoSlide = () => {
            if (autoSlideInterval) {
                clearInterval(autoSlideInterval);
            }
            autoSlideInterval = setInterval(() => {
                moveSlider(1);
            }, 5000);
        };

        sliderTrack.addEventListener('transitionend', () => {
            if (currentIndex === 0) {
                sliderTrack.style.transition = 'none';
                currentIndex = totalItems;
                sliderTrack.style.transform = `translateX(${-currentIndex * 100}%)`;
            } else if (currentIndex === totalItems + 1) {
                sliderTrack.style.transition = 'none';
                currentIndex = 1;
                sliderTrack.style.transform = `translateX(${-currentIndex * 100}%)`;
            }
            isTransitioning = false;
        });

        // Event listeners
        nextButton.addEventListener('click', () => moveSlider(1));
        prevButton.addEventListener('click', () => moveSlider(-1));

        // Iniciar auto-desplazamiento
        resetAutoSlide();

        // Pausar auto-desplazamiento al hacer hover
        sliderTrack.addEventListener('mouseenter', () => {
            clearInterval(autoSlideInterval);
        });

        sliderTrack.addEventListener('mouseleave', resetAutoSlide);
    } else {
        // Ocultar controles si no hay slides
        prevButton.style.display = 'none';
        nextButton.style.display = 'none';
    }
});