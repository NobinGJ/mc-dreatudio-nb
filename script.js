const slides = [
    { src: 'Cambios Dia 2.png', label: 'Día 2' },
    { src: 'Cambios dia 3 1-2 .png', label: 'Día 3 1/2' },
    { src: 'cambios dia 3 2-2.png', label: 'Día 3 2/2' },
    { src: 'cambios dia 4 1-2.png', label: 'Día 4 1/2' },
    { src: 'cambios dia 4 2-2.png', label: 'Día 4 2/2' },
    { src: 'cambios dia 5 1-2.png', label: 'Día 5 1/2' },
    { src: 'cambios dia 5 2-2.png', label: 'Día 5 2/2' },
    { src: 'cambios dia 6 1-3.png', label: 'Día 6 1/3' },
    { src: 'cambios dia 6 2-3.png', label: 'Día 6 2/3' },
    { src: 'cambios dia 6 3-3.png', label: 'Día 6 3/3' },
    { src: 'cambios dia 7.png', label: 'Día 7' },
    { src: 'cambios dia 8 1-4.png', label: 'Día 8 1/4' },
    { src: 'cambios dia 8 2-4.png', label: 'Día 8 2/4' },
    { src: 'cambios dia 8 3-4.png', label: 'Día 8 3/4' },
    { src: 'cambios dia 8 4-4.png', label: 'Día 8 4/4' },
    { src: 'cambios dia 9 1-2.png', label: 'Día 9 1/2' },
    { src: 'cambios dia 9 2-2.png', label: 'Día 9 2/2' },
    { src: 'cambios dia 10.png', label: 'Día 10' }
];

let currentIndex = 0;
const carousel = document.getElementById('carousel');
const items = [];
const dayIndicator = document.getElementById('day-indicator');
const bloodFlash = document.getElementById('blood-flash');

// Audio de golpe
const hitSound = new Audio('minecraft_hit_soundmp3converter.mp3');
hitSound.volume = 0.7; /* Volumen al 70% para no saturar si están en reunión */

function init() {
    // Generar todas las imagenes en el DOM
    slides.forEach((slideData, index) => {
        const item = document.createElement('div');
        item.className = 'carousel-item';
        
        const img = document.createElement('img');
        img.src = encodeURI(slideData.src);
        
        item.appendChild(img);
        carousel.appendChild(item);
        items.push(item);
        
        // Al darle clic a una imagen prev/next, mueve el carousel
        item.addEventListener('click', () => {
            if (index === currentIndex - 1) navigate(-1);
            if (index === currentIndex + 1) navigate(1);
        });
    });
    
    // Controles de teclado robustos
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') navigate(-1);
        if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd' || e.key === ' ' || e.key === 'Enter') navigate(1);
    });
    
    // Controles de scroll o rueda del ratón (opcional pero muy útil sin interfaz)
    document.addEventListener('wheel', (e) => {
        if (e.deltaY > 0) {
            navigate(1);
        } else if (e.deltaY < 0) {
            navigate(-1);
        }
    });

    updateCarousel();
}

function navigate(dir) {
    const nextIndex = currentIndex + dir;
    if (nextIndex >= 0 && nextIndex < items.length) {
        currentIndex = nextIndex;
        triggerBloodFlash();
        updateCarousel();
    }
}

function triggerBloodFlash() {
    // Reproducir sonido de golpe
    hitSound.currentTime = 0; // Lo resetea por si cambias muy rápido
    hitSound.play().catch(e => console.log('Audio bloqueado temporalmente por el navegador:', e));

    // Retirar clase instantaneamente y aplicarla con timeout para asegurar re-animacion
    bloodFlash.classList.remove('active');
    
    // Animar texto de indicador
    dayIndicator.classList.remove('pulse');
    
    // Forzamos un reflow rapido
    void bloodFlash.offsetWidth;
    
    bloodFlash.classList.add('active');
    dayIndicator.classList.add('pulse');
    
    setTimeout(() => {
        bloodFlash.classList.remove('active');
        dayIndicator.classList.remove('pulse');
    }, 150); // Mantenemos el frame pico de sangre activo un breve momento
}

function updateCarousel() {
    // Actualizar titulo
    dayIndicator.textContent = slides[currentIndex].label;

    items.forEach((item, i) => {
        item.className = 'carousel-item'; // resetear clases
        if (i === currentIndex) {
            item.classList.add('active');
        } else if (i === currentIndex - 1) {
            item.classList.add('prev');
        } else if (i === currentIndex + 1) {
            item.classList.add('next');
        } else if (i < currentIndex - 1) {
            item.classList.add('hidden-left');
        } else {
            item.classList.add('hidden-right');
        }
    });
}

document.addEventListener('DOMContentLoaded', init);
