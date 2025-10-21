// ======================================
// 1. GESTIÓN DEL MENÚ HAMBURGUESA
// ======================================

const menuToggle = document.getElementById('menu-toggle'); 
const mainNav = document.getElementById('main-nav'); 
const navLinks = document.querySelectorAll('#main-nav a'); 


menuToggle.addEventListener('click', function() {
    mainNav.classList.toggle('nav-hidden');
});


// ======================================
// 2. GESTIÓN DE CAMBIO DE SECCIONES (SPA Feel)
// ======================================

function initSectionLoad(targetId) {
    if (targetId === 'miembros') {
        loadMiembrosData(); // Llamamos a la función para cargar los miembros
    }
    // Si hubieran otras secciones, irían aquí (ej: if (targetId === 'cuotas'))
}


function showSection(targetId) {
    // 1. Ocultar la sección activa actual
    const activeSection = document.querySelector('.content-section.active');
    if (activeSection) {
        activeSection.classList.remove('active');
    }

    // 2. Mostrar la nueva sección
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // 3. Ejecutar funciones específicas para la sección
    initSectionLoad(targetId);
}


navLinks.forEach(link => {
    link.addEventListener('click', function(event) {
        event.preventDefault(); 
        const targetId = this.getAttribute('href').substring(1); 
        
        showSection(targetId);
        
        // Ocultar el menú después de hacer clic (solo móvil)
        mainNav.classList.add('nav-hidden');
    });
});


// ======================================
// 3. GESTIÓN DE MIEMBROS
// ======================================

const MIEMBROS_LIST_ELEMENT = document.getElementById('miembros-list');

// Array local para simular la base de datos de miembros
let miembros = [
    { nombre: 'Juanjo', instrumento: 'Batería' },
    { nombre: 'Laura', instrumento: 'Violín' },
    { nombre: 'David', instrumento: 'Guitarra' },
    { nombre: 'María', instrumento: 'Flauta' },
];

function renderMiembros() {
    let html = '';
    miembros.forEach(miembro => {
        html += `<li>${miembro.nombre} (${miembro.instrumento})</li>`;
    });
    MIEMBROS_LIST_ELEMENT.innerHTML = html;
}

function loadMiembrosData() {
    // Por ahora, solo usamos los datos locales.
    // Aquí es donde se conectaría a un CSV/JSON si fuera necesario.
    renderMiembros();
}


// Inicializar la primera sección
document.addEventListener('DOMContentLoaded', function() {
    showSection('inicio');
});