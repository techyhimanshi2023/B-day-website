window.addEventListener('DOMContentLoaded', function () {
    const intro = document.getElementById('intro-overlay');
    const main = document.getElementById('main-content');
    const stripWrapper = document.getElementById('film-strip-wrapper');
    const strip = document.getElementById('photo-strip');
    const enlargedArea = document.getElementById('enlarged-photo-area');
    const enlargedPhoto = document.getElementById('enlarged-photo');
    const photoCaption = document.getElementById('photo-caption');
    const closeBtn = document.getElementById('close-enlarged-photo');
    const confettiCanvas = document.getElementById('confetti-canvas');

    const starContainer = document.createElement('div');
    starContainer.innerHTML = '<div id="stars"></div><div id="stars2"></div><div id="stars3"></div>';
    document.body.prepend(starContainer);

    if (strip && stripWrapper) {
        const prevBtn = stripWrapper.querySelector('.prev-arrow');
        const nextBtn = stripWrapper.querySelector('.next-arrow');
        const originalItems = Array.from(strip.children);
        let itemWidth = 0;
        let currentIndex = 0;
        let mainAutoScroll;
        let hoverScrollInterval;

        // Clone items multiple times for long continuous scroll
        let clonedSet = [];
        for (let i = 0; i < 6; i++) {
            clonedSet = clonedSet.concat(originalItems.map(item => item.cloneNode(true)));
        }
        clonedSet.slice(0, 3 * originalItems.length).forEach(clone => strip.prepend(clone));
        clonedSet.slice(3 * originalItems.length).forEach(clone => strip.appendChild(clone));

        const totalItems = strip.children.length;
        const originalStartIndex = originalItems.length * 3;

        function calculateItemWidth() {
            const gap = parseInt(window.getComputedStyle(strip).gap) || 24;
            if (strip.children.length > 0) {
                itemWidth = strip.children[0].offsetWidth + gap;
                updatePosition(true);
                startMainAutoScroll();
            }
        }

        function updatePosition(instant = false) {
            strip.style.transition = instant ? 'none' : 'transform 0.3s ease';
            strip.style.transform = `translateX(-${currentIndex * itemWidth}px)`;
        }

        function moveNext() {
            if (!itemWidth) return;
            currentIndex++;
            updatePosition();
        }

        function movePrev() {
            if (!itemWidth) return;
            currentIndex--;
            updatePosition();
        }

        function startMainAutoScroll() {
            stopMainAutoScroll();
            mainAutoScroll = setInterval(() => {
                moveNext();
            }, 800); // faster scroll speed
        }

        function stopMainAutoScroll() {
            clearInterval(mainAutoScroll);
        }

        nextBtn.addEventListener('click', () => {
            stopMainAutoScroll();
            moveNext();
        });

        prevBtn.addEventListener('click', () => {
            stopMainAutoScroll();
            movePrev();
        });

        const startHoverScroll = (directionFunc) => {
            stopMainAutoScroll();
            directionFunc();
            hoverScrollInterval = setInterval(directionFunc, 200);
        };

        const stopHoverScroll = () => {
            clearInterval(hoverScrollInterval);
            hoverScrollInterval = null;
        };

        nextBtn.addEventListener('mousedown', () => startHoverScroll(moveNext));
        prevBtn.addEventListener('mousedown', () => startHoverScroll(movePrev));
        document.addEventListener('mouseup', stopHoverScroll);
        stripWrapper.addEventListener('mouseleave', stopHoverScroll);

        stripWrapper.addEventListener('mouseenter', stopMainAutoScroll);
        stripWrapper.addEventListener('mouseleave', () => {
            if (!hoverScrollInterval) {
                startMainAutoScroll();
            }
        });

        strip.addEventListener('click', (e) => {
            if (e.target.classList.contains('enlarge-btn')) {
                stopMainAutoScroll();
            }
        });

        closeBtn.addEventListener('click', startMainAutoScroll);

        window.addEventListener('load', () => {
            requestAnimationFrame(() => {
                calculateItemWidth();
                currentIndex = originalStartIndex;
                updatePosition(true);
            });
        });
    }

    if (intro && main && confettiCanvas) {
        setTimeout(() => {
            showConfettiIntro();
            intro.style.opacity = 0;
            setTimeout(() => {
                main.style.display = '';
                setTimeout(() => main.style.opacity = 1, 50);
            }, 500);
            setTimeout(() => intro.style.display = 'none', 2000);
        }, 2000);
    }

    if (strip && enlargedArea) {
        strip.addEventListener('click', function (e) {
            if (e.target.classList.contains('enlarge-btn')) {
                const img = e.target.parentElement.querySelector('img');
                enlargedPhoto.src = img.src;
                enlargedPhoto.alt = img.alt;
                photoCaption.textContent = img.getAttribute('data-caption') || '';
                enlargedArea.style.display = 'flex';
                showConfettiOnClick();
            }
        });

        const closeEnlarged = () => {
            enlargedArea.style.display = 'none';
        };

        closeBtn.addEventListener('click', closeEnlarged);
        enlargedArea.addEventListener('click', function (e) {
            if (e.target === enlargedArea) closeEnlarged();
        });
    }

    function showConfettiIntro() {
        if (!confettiCanvas) return;
        confettiCanvas.style.display = 'block';
        const ctx = confettiCanvas.getContext('2d');
        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;
        let confetti = [];
        const confettiCount = 150;
        const dreamyColors = ['#FFFFFF', '#F0E68C', '#E6E6FA', '#D8BFD8'];

        for (let i = 0; i < confettiCount; i++) {
            confetti.push({
                x: Math.random() * confettiCanvas.width,
                y: Math.random() * confettiCanvas.height - confettiCanvas.height,
                r: 6 + Math.random() * 8,
                d: 2 + Math.random() * 2,
                color: dreamyColors[Math.floor(Math.random() * dreamyColors.length)],
                tilt: Math.random() * 10 - 5
            });
        }

        let frame = 0;
        const animationFrames = 360;

        function draw() {
            if (!ctx) return;
            ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
            for (let i = 0; i < confetti.length; i++) {
                let c = confetti[i];
                ctx.beginPath();
                ctx.ellipse(c.x, c.y, c.r, c.r / 2, c.tilt, 0, 2 * Math.PI);
                ctx.fillStyle = c.color;
                ctx.fill();
                c.y += c.d + Math.sin(frame / 10 + i);
                c.x += Math.sin(frame / 20 + i) * 1.5;
                c.tilt += Math.random() * 0.2 - 0.1;
                if (c.y > confettiCanvas.height) {
                    c.x = Math.random() * confettiCanvas.width;
                    c.y = -20;
                }
            }
            frame++;
            if (frame < animationFrames) {
                requestAnimationFrame(draw);
            } else {
                confettiCanvas.style.display = 'none';
            }
        }

        draw();
    }

    function showConfettiOnClick() {
        if (!confettiCanvas) return;
        confettiCanvas.style.display = 'block';
        const ctx = confettiCanvas.getContext('2d');
        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;
        let confetti = [];
        const confettiCount = 80;

        for (let i = 0; i < confettiCount; i++) {
            confetti.push({
                x: Math.random() * confettiCanvas.width,
                y: Math.random() * -confettiCanvas.height,
                r: 6 + Math.random() * 8,
                d: 2 + Math.random() * 2,
                color: `hsl(${Math.random() * 360},80%,80%)`,
                tilt: Math.random() * 10 - 5
            });
        }

        let frame = 0;
        const animationFrames = 120;

        function draw() {
            if (!ctx) return;
            ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
            for (let i = 0; i < confetti.length; i++) {
                let c = confetti[i];
                ctx.beginPath();
                ctx.ellipse(c.x, c.y, c.r, c.r / 2, c.tilt, 0, 2 * Math.PI);
                ctx.fillStyle = c.color;
                ctx.fill();
                c.y += c.d + Math.sin(frame / 10 + i);
                c.x += Math.sin(frame / 20 + i) * 1.5;
                if (c.y > confettiCanvas.height) {
                    c.y = -10;
                    c.x = Math.random() * confettiCanvas.width;
                }
            }
            frame++;
            if (frame < animationFrames) {
                requestAnimationFrame(draw);
            } else {
                confettiCanvas.style.display = 'none';
            }
        }

        draw();
    }
});
