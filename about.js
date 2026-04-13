document.addEventListener('DOMContentLoaded', function() {

    const swiper = new Swiper(".mySwiper_menu", {
        lazy: true,
        preloadImages: false,
        pagination: {
          el: '.swiper-pagination',
          clickable: true, 
          dynamicBullets: true,
        },

        // Основные настройки
        slidesPerView: 'auto',
        spaceBetween: 30,
        loop: false,

        // Эффекты
        effect: "slide",
        speed: 800,
    });


    // --- Логика Lightbox ---
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.close-lightbox');
    const prevBtn = document.querySelector('.lightbox-prev');
    const nextBtn = document.querySelector('.lightbox-next');

    let slides = [];          // массив всех слайдов (изображений)
    let currentIndex = 0;    // индекс текущего открытого слайда

    // Получаем все изображения из слайдера Swiper
    function updateSlidesList() {
        slides = [];
        const swiperWrapper = document.querySelector('.mySwiper_main-menu .swiper-wrapper');
        if (!swiperWrapper) return;
        
        const slideElements = swiperWrapper.querySelectorAll('.swiper-slide');
        slideElements.forEach(slide => {
            const img = slide.querySelector('img');
            if (img) {
                // Получаем реальный src (даже если используется lazy)
                const imgSrc = img.getAttribute('src') || img.getAttribute('data-src');
                if (imgSrc) slides.push(imgSrc);
            }
        });
    }

    // Открыть lightbox с картинкой по индексу
    function openLightbox(index) {
        if (!slides.length || index < 0 || index >= slides.length) return;
        currentIndex = index;
        lightboxImg.src = slides[currentIndex];
        lightbox.style.display = 'block';
        document.body.style.overflow = 'hidden'; // блокируем прокрутку страницы
        resetTransform(); // Сбрасываем зум при открытии
    }

    // Закрыть lightbox
    function closeLightbox() {
        lightbox.style.display = 'none';
        document.body.style.overflow = '';
        resetTransform(); // Сбрасываем зум при закрытии
    }

    // Показать следующее/предыдущее изображение
    function showPrev() {
        let newIndex = currentIndex - 1;
        if (newIndex < 0) newIndex = slides.length - 1; // зацикливание
        openLightbox(newIndex);
    }

    function showNext() {
        let newIndex = currentIndex + 1;
        if (newIndex >= slides.length) newIndex = 0;
        openLightbox(newIndex);
    }

    // --- Навешиваем обработчики кликов на слайды Swiper ---
    function bindClickOnSlides() {
        const swiperWrapper = document.querySelector('.mySwiper_main-menu .swiper-wrapper');
        if (!swiperWrapper) return;

        const slideElements = swiperWrapper.querySelectorAll('.swiper-slide');
        slideElements.forEach((slide, idx) => {
            slide.style.cursor = 'pointer';
            slide.removeEventListener('click', slideClickHandler);
            slide.addEventListener('click', slideClickHandler.bind(null, idx));
        });
    }

    function slideClickHandler(idx, event) {
        event.stopPropagation();
        // Обновляем список изображений перед открытием (на случай динамической подгрузки)
        updateSlidesList();
        openLightbox(idx);
    }

    // Инициализация: обновляем список, вешаем клики
    function initLightbox() {
        updateSlidesList();
        bindClickOnSlides();

        // Если Swiper динамически добавляет слайды, используем MutationObserver
        const observer = new MutationObserver(() => {
            updateSlidesList();
            bindClickOnSlides();
        });
        const swiperContainer = document.querySelector('.mySwiper_main-menu');
        if (swiperContainer) {
            observer.observe(swiperContainer, { childList: true, subtree: true });
        }
    }

    // --- События кнопок lightbox ---
    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (prevBtn) prevBtn.addEventListener('click', showPrev);
    if (nextBtn) nextBtn.addEventListener('click', showNext);

    // Закрытие по клику на фон (вокруг картинки)
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox || e.target === lightbox.querySelector('.lightbox-content')) {
            closeLightbox();
        }
    });

    // Клавиатура: Esc закрывает, стрелки листают
    document.addEventListener('keydown', function(e) {
        if (lightbox.style.display !== 'block') return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') showPrev();
        if (e.key === 'ArrowRight') showNext();
    });

    // --- Продвинутый зум с панорамированием ---
    // ОПРЕДЕЛЯЕМ ПЕРЕМЕННЫЕ
    let scale = 1;
    let isPanning = false;
    let startX = 0;
    let startY = 0;
    let translateX = 0;
    let translateY = 0;
    const zoomStep = 0.3;    // Шаг увеличения
    const minScale = 1;       // Минимальный масштаб
    const maxScale = 3;       // Максимальный масштаб

    lightboxImg.style.transition = 'transform 0.2s ease';
    lightboxImg.style.cursor = 'zoom-in';

    function resetTransform() {
        scale = 1;
        translateX = 0;
        translateY = 0;
        updateTransform();
        lightboxImg.style.cursor = 'zoom-in';
        isPanning = false;
    }

    function updateTransform() {
        lightboxImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    }

    function zoomAtPoint(delta, mouseX, mouseY) {
        const oldScale = scale;
        let newScale = scale + delta;

        if (newScale < minScale) newScale = minScale;
        if (newScale > maxScale) newScale = maxScale;

        if (newScale !== oldScale) {
            // Получаем позицию мыши относительно изображения
            const rect = lightboxImg.getBoundingClientRect();
            const mouseXRel = mouseX - rect.left;
            const mouseYRel = mouseY - rect.top;

            // Вычисляем новое смещение для зума относительно точки курсора
            const scaleDiff = newScale / oldScale;
            translateX = mouseXRel - (mouseXRel - translateX) * scaleDiff;
            translateY = mouseYRel - (mouseYRel - translateY) * scaleDiff;

            scale = newScale;
            updateTransform();

            // Меняем курсор
            if (scale > 1) {
                lightboxImg.style.cursor = 'grab';
            } else {
                lightboxImg.style.cursor = 'zoom-in';
            }
        }
    }

    // Обработчик колесика мыши с учетом позиции
    lightboxImg.addEventListener('wheel', function(e) {
        e.preventDefault();
        e.stopPropagation();

        const delta = e.deltaY < 0 ? zoomStep : -zoomStep;
        zoomAtPoint(delta, e.clientX, e.clientY);
    });

    // Увеличение/уменьшение по клику на изображение (простой вариант)
    lightboxImg.addEventListener('click', function(e) {
        e.stopPropagation();
        if (scale === 1) {
            // Увеличиваем в центре
            zoomAtPoint(zoomStep, window.innerWidth / 2, window.innerHeight / 2);
        } else {
            // Сбрасываем масштаб
            resetTransform();
        }
    });

    // Начало панорамирования (перетаскивание)
    lightboxImg.addEventListener('mousedown', function(e) {
        if (scale > 1) {
            e.preventDefault();
            isPanning = true;
            startX = e.clientX - translateX;
            startY = e.clientY - translateY;
            lightboxImg.style.cursor = 'grabbing';
            lightboxImg.style.transition = 'none';
        }
    });

    // Панорамирование
    window.addEventListener('mousemove', function(e) {
        if (isPanning && scale > 1) {
            e.preventDefault();
            translateX = e.clientX - startX;
            translateY = e.clientY - startY;

            // Ограничиваем панорамирование, чтобы не выходило за края
            const rect = lightboxImg.getBoundingClientRect();
            const maxX = (rect.width * (scale - 1)) / 2;
            const maxY = (rect.height * (scale - 1)) / 2;

            translateX = Math.min(Math.max(translateX, -maxX), maxX);
            translateY = Math.min(Math.max(translateY, -maxY), maxY);

            updateTransform();
        }
    });

    // Окончание панорамирования
    window.addEventListener('mouseup', function() {
        if (isPanning) {
            isPanning = false;
            lightboxImg.style.transition = 'transform 0.2s ease';
            if (scale > 1) {
                lightboxImg.style.cursor = 'grab';
            }
        }
    });

    const zoomInBtn = document.querySelector('.lightbox-zoom-in');
    const zoomOutBtn = document.querySelector('.lightbox-zoom-out');
    const zoomResetBtn = document.querySelector('.lightbox-zoom-reset');

    if (zoomInBtn) {
        zoomInBtn.addEventListener('click', () => zoomAtPoint(zoomStep, window.innerWidth/2, window.innerHeight/2));
    }
    if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', () => zoomAtPoint(-zoomStep, window.innerWidth/2, window.innerHeight/2));
    }
    if (zoomResetBtn) {
        zoomResetBtn.addEventListener('click', resetTransform);
    }

    // Запуск
    initLightbox();
});