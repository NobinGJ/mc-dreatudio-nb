const daysData = {
    1: { type: "text", content: "DÍA 1<br>NO HAY CAMBIOS" },
    2: { type: "images", images: ["Cambios Dia 2.png"] },
    3: { type: "images", images: ["Cambios dia 3 1-2 .png", "cambios dia 3 2-2.png"] },
    4: { type: "images", images: ["cambios dia 4 1-2.png", "cambios dia 4 2-2.png"] },
    5: { type: "images", images: ["cambios dia 5 1-2.png", "cambios dia 5 2-2.png"] },
    6: { type: "images", images: ["cambios dia 6 1-3.png", "cambios dia 6 2-3.png", "cambios dia 6 3-3.png"] },
    7: { type: "images", images: ["cambios dia 7.png"] },
    8: { type: "images", images: ["cambios dia 8 1-4.png", "cambios dia 8 2-4.png", "cambios dia 8 3-4.png", "cambios dia 8 4-4.png"] },
    9: { type: "images", images: ["cambios dia 9 1-2.png", "cambios dia 9 2-2.png"] },
    10: { type: "images", images: ["cambios dia 10.png"] }
};

// FECHA DE INICIO DEL EVENTO (Día 1)
// El evento empieza el 6 de abril (Día 1: sin cambios).
// El 7 de abril a medianoche pasará automáticamente al Día 2.
const eventStartDateStr = "2026-04-06"; 

// Modo prueba para la consola
let forcedDay = null;
let allSlides = []; // Almacena todos los slides acumulados
let currentImageIndex = 0;

function getAllSlides(uptoDay) {
    const slides = [];
    for (let d = 1; d <= uptoDay; d++) {
        const data = daysData[d];
        if (!data) continue;
        if (data.type === "text") {
            slides.push({ isText: true, content: data.content, day: d, originalIndex: 0 });
        } else if (data.type === "images") {
            data.images.forEach((img, idx) => {
                slides.push({ isText: false, src: img, day: d, originalIndex: idx });
            });
        }
    }
    return slides;
}

function focusOnDay(dayNumber) {
    // Busca el primer slide perteneciente al nuevo día mostrado
    const index = allSlides.findIndex(s => s.day === dayNumber);
    if (index !== -1) {
        currentImageIndex = index;
    } else {
        currentImageIndex = 0;
    }
}

// Funciones expuestas en la consola para testear sin alterar la vista del usuario
window.timeDia = function(dia) {
    if(dia >= 1 && dia <= 10) {
        forcedDay = dia;
        currentDayIndex = dia;
        
        allSlides = getAllSlides(currentDayIndex);
        focusOnDay(currentDayIndex);
        
        console.log(`[TEST MODE] Cambiando forzosamente al Día ${dia}...`);
        
        const dayInd = document.getElementById("day-indicator");
        dayInd.classList.add("pulse");
        setTimeout(() => {
            dayInd.classList.remove("pulse");
        }, 500);
        
        renderDay();
        return `✅ Día forzado al Día ${dia} de forma exitosa. Para volver a la normalidad usa resetTime()`;
    }
    return "❌ Error: Usa un número del 1 al 10. Ejemplo: timeDia(2)";
};

window.resetTime = function() {
    forcedDay = null;
    currentDayIndex = getCurrentDayNumber();
    
    allSlides = getAllSlides(currentDayIndex);
    focusOnDay(currentDayIndex);
    
    renderDay();
    return "✅ Modo prueba apagado. Restaurando el tiempo real...";
};

function getCurrentDayNumber() {
    if (forcedDay !== null) return forcedDay;
    // Calculamos el comienzo del evento a medianoche en hora local
    const startMatches = eventStartDateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
    let startMidnight;
    if (startMatches) {
        startMidnight = new Date(startMatches[1], startMatches[2] - 1, startMatches[3], 0, 0, 0);
    } else {
        startMidnight = new Date(eventStartDateStr + "T00:00:00");
    }

    const now = new Date();
    // Hoy a medianoche para evitar desajustes por las horas del día actual
    const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    
    let diffDays = Math.floor((nowMidnight.getTime() - startMidnight.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    // Limitar al rango de días configurados (1 a 10)
    if (diffDays < 1) diffDays = 1;
    if (diffDays > 10) diffDays = 10;
    
    return diffDays;
}

let currentDayIndex = getCurrentDayNumber();
allSlides = getAllSlides(currentDayIndex);
focusOnDay(currentDayIndex);

function renderDay() {
    const dayLabel = document.getElementById("day-indicator");
    dayLabel.textContent = `Día ${currentDayIndex}`;
    
    const carousel = document.getElementById("carousel");
    carousel.innerHTML = ""; // Limpiar el contenido previo
    
    // Control de límite por seguridad
    if (currentImageIndex >= allSlides.length) {
        currentImageIndex = allSlides.length > 0 ? allSlides.length - 1 : 0;
    }
    
    allSlides.forEach((slide, index) => {
        const item = document.createElement("div");
        
        // Asignamos las clases iniciales dependiendo el índice global de las fotos
        if (index === currentImageIndex) {
            item.className = "carousel-item active";
        } else if (index === currentImageIndex - 1) {
            item.className = "carousel-item prev";
        } else if (index === currentImageIndex + 1) {
            item.className = "carousel-item next";
        } else if (index < currentImageIndex - 1) {
            item.className = "carousel-item hidden-left";
        } else {
            item.className = "carousel-item hidden-right";
        }
        
        if (slide.isText) {
            const txt = document.createElement("div");
            txt.className = "no-changes-text";
            txt.innerHTML = slide.content;
            item.appendChild(txt);
        } else {
            const img = document.createElement("img");
            img.src = slide.src;
            img.alt = `Cambio ${slide.originalIndex + 1} del Día ${slide.day}`;
            item.appendChild(img);
        }
        
        // Navegación con click en las imágenes laterales (para PC)
        item.addEventListener('click', () => {
            if (index === currentImageIndex - 1) {
                prevSlide();
            } else if (index === currentImageIndex + 1) {
                nextSlide();
            }
        });
        
        carousel.appendChild(item);
    });
}

function updateClasses() {
    if (allSlides.length === 0) return;
    
    const items = document.querySelectorAll(".carousel-item");
    items.forEach((item, index) => {
        if (index === currentImageIndex) {
            item.className = "carousel-item active";
        } else if (index === currentImageIndex - 1) {
            item.className = "carousel-item prev";
        } else if (index === currentImageIndex + 1) {
            item.className = "carousel-item next";
        } else if (index < currentImageIndex - 1) {
            item.className = "carousel-item hidden-left";
        } else {
            item.className = "carousel-item hidden-right";
        }
    });
}

function nextSlide() {
    if (currentImageIndex < allSlides.length - 1) {
        playSound();
        currentImageIndex++;
        updateClasses();
        flashBlood();
    }
}

function prevSlide() {
    if (currentImageIndex > 0) {
        playSound();
        currentImageIndex--;
        updateClasses();
        flashBlood();
    }
}

function flashBlood() {
    const flash = document.getElementById("blood-flash");
    flash.classList.add("active");
    setTimeout(() => {
        flash.classList.remove("active");
    }, 50);
}

function playSound() {
    const audio = new Audio("minecraft_hit_soundmp3converter.mp3");
    // Al ser activado tras interacción de usuario funcionará correctamente
    audio.play().catch(e => console.log("Audio play prevented by browser", e));
}

// --- Controles Táctiles (Responsivo / Celular) ---
let touchstartX = 0;
let touchendX = 0;

document.addEventListener('touchstart', e => {
    touchstartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', e => {
    touchendX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    // Si se desliza a la izquierda, avanzar a foto siguiente (next)
    if (touchendX < touchstartX - 50) nextSlide();
    // Si se desliza a la derecha, regresar a foto anterior (prev)
    if (touchendX > touchstartX + 50) prevSlide();
}

// --- Soporte también para Teclas de flecha ---
document.addEventListener('keydown', e => {
    if (e.key === "ArrowRight") nextSlide();
    if (e.key === "ArrowLeft") prevSlide();
});

// Inicialización de la aplicación
document.addEventListener("DOMContentLoaded", () => {
    renderDay();
    
    // El sistema verificará cada minuto (60000ms) si ya pasamos la medianoche y es el siguiente día
    setInterval(() => {
        const newDay = getCurrentDayNumber();
        if (newDay !== currentDayIndex) {
            currentDayIndex = newDay;
            
            allSlides = getAllSlides(currentDayIndex);
            focusOnDay(currentDayIndex);
            
            // Animación llamativa en el indicador cuando cambia
            const dayInd = document.getElementById("day-indicator");
            dayInd.classList.add("pulse");
            setTimeout(() => {
                dayInd.classList.remove("pulse");
            }, 500);
            
            renderDay();
        }
    }, 60000); // Revisar cada 1 minuto
});

// --- CONFIGURACIÓN DE AUDIO DE FONDO ---
const bgMusic = document.getElementById('bg-music');
const muteBtn = document.getElementById('mute-btn');
const muteIcon = document.getElementById('mute-icon');

// Volumen bajo (15%) para que sea música ambiental de fondo
bgMusic.volume = 0.15;

let isMuted = false;

// Estado del botón mute
muteBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevenir que el clic dispare otros eventos
    isMuted = !isMuted;
    bgMusic.muted = isMuted;
    
    if (isMuted) {
        // Icono de mute
        muteIcon.innerHTML = `<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>`;
    } else {
        // Icono de volumen alto
        muteIcon.innerHTML = `<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>`;
        // Intentar reproducir si está pausado
        bgMusic.play().catch(() => {});
    }
});

// Iniciar música automáticamente con cualquier interacción del usuario en la pantalla
// (Los navegadores bloquean el autoplay automático sin interacción previa)
document.body.addEventListener('click', () => {
    if (!isMuted && bgMusic.paused) {
        bgMusic.play().catch(e => console.log("Autoplay prevenido por navegador:", e));
    }
}, { once: true });

