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

// Función que se llamaría si una sección necesita cargar datos (ahora vacía)
function initSectionLoad(targetId) {
    // Por ahora, no hacemos nada.
    // Aquí es donde añadiremos la carga de Miembros, Cuotas, etc., más adelante.
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
// 3. INICIALIZACIÓN
// ======================================

document.addEventListener('DOMContentLoaded', function() {
    // Asegura que la sección de inicio es visible al cargar la página
    showSection('inicio'); 
});