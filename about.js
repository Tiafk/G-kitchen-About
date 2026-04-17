document.addEventListener('DOMContentLoaded', function() {

            // --- Инициализация всех слайдеров Swiper ---
            // Основное меню
            const mainMenuSwiper = new Swiper(".mySwiper_main-menu", {
                lazy: true,
                preloadImages: false,
                pagination: { el: '.swiper-pagination', clickable: true, dynamicBullets: true },
                slidesPerView: 'auto',
                spaceBetween: 30,
                loop: false,
                effect: "slide",
                speed: 800,
                breakpoints: {
                    0: {
                        spaceBetween: 15,   // от 0px до 499px
                    },
                    500: {
                        spaceBetween: 30,   // от 500px и выше
                    }
                },
            });

            // Барное меню
            const barSwiper = new Swiper(".mySwiper_zavtrak", {
                lazy: true,
                preloadImages: false,
                pagination: { el: '.swiper-pagination', clickable: true, dynamicBullets: true },
                slidesPerView: 'auto',
                spaceBetween: 30,
                loop: false,
                effect: "slide",
                speed: 800,
                breakpoints: {
                    0: {
                        spaceBetween: 15,   // от 0px до 499px
                    },
                    500: {
                        spaceBetween: 30,   // от 500px и выше
                    }
                },
            });

            // Десертное меню
            const desertSwiper = new Swiper(".mySwiper_desert", {
                pagination: { el: '.swiper-pagination', clickable: true, dynamicBullets: true },
                slidesPerView: 'auto',
                spaceBetween: 30,
                loop: false,
                speed: 800,
                breakpoints: {
                    0: {
                        spaceBetween: 15,   // от 0px до 499px
                    },
                    500: {
                        spaceBetween: 30,   // от 500px и выше
                    }
                },
            });

            // Детское меню
            const childSwiper = new Swiper(".mySwiper_banket", {
                pagination: { el: '.swiper-pagination', clickable: true, dynamicBullets: true },
                slidesPerView: 'auto',
                spaceBetween: 30,
                loop: false,
                speed: 800,
                breakpoints: {
                    0: {
                        spaceBetween: 15,   // от 0px до 499px
                    },
                    500: {
                        spaceBetween: 30,   // от 500px и выше
                    }
                },
            });

            // --- Логика Lightbox ---
            const lightbox = document.getElementById('lightbox');
            const lightboxImg = document.getElementById('lightbox-img');
            const closeBtn = document.querySelector('.close-lightbox');
            const prevBtn = document.querySelector('.lightbox-prev');
            const nextBtn = document.querySelector('.lightbox-next');

            let allSlides = [];      
            let currentIndex = 0;    

            function updateAllSlidesList() {
                allSlides = [];
                const allSwiperContainers = document.querySelectorAll('.mySwiper_menu');
                allSwiperContainers.forEach(container => {
                    const slides = container.querySelectorAll('.swiper-slide');
                    slides.forEach(slide => {
                        const img = slide.querySelector('img');
                        if (img) {
                            let imgSrc = img.getAttribute('src');
                            if (!imgSrc || imgSrc === '') {
                                imgSrc = img.getAttribute('data-src');
                            }
                            if (imgSrc && imgSrc !== '') {
                                allSlides.push(imgSrc);
                            }
                        }
                    });
                });
                console.log('Собрано изображений:', allSlides.length);
            }

            function openLightbox(index) {
                if (!allSlides.length || index < 0 || index >= allSlides.length) return;
                currentIndex = index;
                lightboxImg.src = allSlides[currentIndex];
                lightbox.style.display = 'block';
                document.body.style.overflow = 'hidden';
                resetTransform(); 
            }

            function closeLightbox() {
                lightbox.style.display = 'none';
                document.body.style.overflow = '';
                resetTransform();
            }

            function showPrev() {
                let newIndex = currentIndex - 1;
                if (newIndex < 0) newIndex = allSlides.length - 1;
                openLightbox(newIndex);
            }

            function showNext() {
                let newIndex = currentIndex + 1;
                if (newIndex >= allSlides.length) newIndex = 0;
                openLightbox(newIndex);
            }

            function bindClickOnAllSlides() {
                const allSwiperContainers = document.querySelectorAll('.mySwiper_menu');
                allSwiperContainers.forEach(container => {
                    const slides = container.querySelectorAll('.swiper-slide');
                    slides.forEach((slide, idx) => {
                        slide.style.cursor = 'pointer';
                        slide.removeEventListener('click', slideClickHandler);
                        slide.addEventListener('click', function(e) {
                            e.stopPropagation();
                            const img = this.querySelector('img');
                            if (img) {
                                let imgSrc = img.getAttribute('src') || img.getAttribute('data-src');
                                if (imgSrc) {
                                    const globalIndex = allSlides.findIndex(src => src === imgSrc);
                                    if (globalIndex !== -1) {
                                        openLightbox(globalIndex);
                                    } else {
                                        updateAllSlidesList();
                                        const newIndex = allSlides.findIndex(src => src === imgSrc);
                                        if (newIndex !== -1) openLightbox(newIndex);
                                    }
                                }
                            }
                        });
                    });
                });
            }

            function slideClickHandler(event) {
            }

            function initLightbox() {
                updateAllSlidesList();
                bindClickOnAllSlides();

                const observer = new MutationObserver(() => {
                    updateAllSlidesList();
                    bindClickOnAllSlides();
                });
                const allSwiperContainers = document.querySelectorAll('.mySwiper_menu');
                allSwiperContainers.forEach(container => {
                    observer.observe(container, { childList: true, subtree: true });
                });
            }

            // --- lightbox ---
            if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
            if (prevBtn) prevBtn.addEventListener('click', showPrev);
            if (nextBtn) nextBtn.addEventListener('click', showNext);

            lightbox.addEventListener('click', function(e) {
                if (e.target === lightbox || e.target === lightbox.querySelector('.lightbox-content')) {
                    closeLightbox();
                }
            });

            document.addEventListener('keydown', function(e) {
                if (lightbox.style.display !== 'block') return;
                if (e.key === 'Escape') closeLightbox();
                if (e.key === 'ArrowLeft') showPrev();
                if (e.key === 'ArrowRight') showNext();
            });

            // ---  зум ---
            let scale = 1;
            let isPanning = false;
            let startX = 0;
            let startY = 0;
            let translateX = 0;
            let translateY = 0;
            const zoomStep = 0.3;
            const minScale = 1;
            const maxScale = 3;

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
                    const rect = lightboxImg.getBoundingClientRect();
                    const mouseXRel = mouseX - rect.left;
                    const mouseYRel = mouseY - rect.top;
                    const scaleDiff = newScale / oldScale;
                    translateX = mouseXRel - (mouseXRel - translateX) * scaleDiff;
                    translateY = mouseYRel - (mouseYRel - translateY) * scaleDiff;
                    scale = newScale;
                    updateTransform();
                    lightboxImg.style.cursor = scale > 1 ? 'grab' : 'zoom-in';
                }
            }

            lightboxImg.addEventListener('wheel', function(e) {
                e.preventDefault();
                e.stopPropagation();
                const delta = e.deltaY < 0 ? zoomStep : -zoomStep;
                zoomAtPoint(delta, e.clientX, e.clientY);
            });

            lightboxImg.addEventListener('click', function(e) {
                e.stopPropagation();
                if (scale === 1) {
                    zoomAtPoint(zoomStep, window.innerWidth / 2, window.innerHeight / 2);
                } else {
                    resetTransform();
                }
            });

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

            window.addEventListener('mousemove', function(e) {
                if (isPanning && scale > 1) {
                    e.preventDefault();
                    translateX = e.clientX - startX;
                    translateY = e.clientY - startY;
                    const rect = lightboxImg.getBoundingClientRect();
                    const maxX = (rect.width * (scale - 1)) / 2;
                    const maxY = (rect.height * (scale - 1)) / 2;
                    translateX = Math.min(Math.max(translateX, -maxX), maxX);
                    translateY = Math.min(Math.max(translateY, -maxY), maxY);
                    updateTransform();
                }
            });

            window.addEventListener('mouseup', function() {
                if (isPanning) {
                    isPanning = false;
                    lightboxImg.style.transition = 'transform 0.2s ease';
                    if (scale > 1) lightboxImg.style.cursor = 'grab';
                }
            });

            const zoomInBtn = document.querySelector('.lightbox-zoom-in');
            const zoomOutBtn = document.querySelector('.lightbox-zoom-out');
            const zoomResetBtn = document.querySelector('.lightbox-zoom-reset');

            if (zoomInBtn) zoomInBtn.addEventListener('click', () => zoomAtPoint(zoomStep, window.innerWidth/2, window.innerHeight/2));
            if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => zoomAtPoint(-zoomStep, window.innerWidth/2, window.innerHeight/2));
            if (zoomResetBtn) zoomResetBtn.addEventListener('click', resetTransform);

            initLightbox();
        });