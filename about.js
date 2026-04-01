document.addEventListener('DOMContentLoaded', function() {

    const swiper = new Swiper(".mySwiper_about", {
        // Навигация
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        },
        // Скроллбар
        scrollbar: {
            el: ".swiper-scrollbar",
            draggable: true,
        },
        // Основные настройки
        slidesPerView: 'auto',
        spaceBetween: 10,
        loop: false,
        // Эффекты
        effect: "slide",
        speed: 800,
    });
});