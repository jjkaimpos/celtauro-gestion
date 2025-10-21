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
        loadMiembrosData(); 
    }
    // Aquí añadiremos la carga de datos para 'cuotas', 'letras', etc., en el futuro.
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
// 3. GESTIÓN DE MIEMBROS (AÑADIR/ELIMINAR)
// ======================================

// --- Declaración de Elementos DOM ---
const MIEMBROS_LIST_ELEMENT = document.getElementById('miembros-list');
const ADD_MEMBER_BTN = document.getElementById('add-member-btn');
const REMOVE_MEMBER_BTN = document.getElementById('remove-member-btn');
const ADD_MEMBER_MODAL = document.getElementById('add-member-modal');
const REMOVE_MEMBER_MODAL = document.getElementById('remove-member-modal');
const CLOSE_BUTTONS = document.querySelectorAll('.modal .close-btn');

// --- Base de Datos Simulación (Inicialización) ---
let miembros = [
    { nombre: 'Juanjo', instrumento: 'Batería' },
    { nombre: 'Laura', instrumento: 'Violín' },
    { nombre: 'David', instrumento: 'Guitarra' },
    { nombre: 'María', instrumento: 'Flauta' },
];

/**
 * Renderiza la lista de miembros en la sección y actualiza el desplegable de eliminación.
 */
function renderMiembros() {
    let html = '';
    let selectOptions = '';
    
    miembros.forEach(miembro => {
        const fullName = `${miembro.nombre} (${miembro.instrumento})`;
        html += `<li>${fullName}</li>`;
        selectOptions += `<option value="${miembro.nombre}">${fullName}</option>`;
    });
    
    MIEMBROS_LIST_ELEMENT.innerHTML = html;
    
    // Rellenar el desplegable del modal de eliminación
    document.getElementById('member-select').innerHTML = selectOptions;
}

function loadMiembrosData() {
    // Esta función es llamada al entrar en la sección 'miembros'
    renderMiembros();
}

// --- Lógica de Apertura/Cierre de Modales ---
function closeModal(modalElement) {
    modalElement.classList.add('hidden');
}

function openModal(modalElement) {
    modalElement.classList.remove('hidden');
}

// Evento para abrir el modal de añadir
ADD_MEMBER_BTN.addEventListener('click', () => openModal(ADD_MEMBER_MODAL));

// Evento para abrir el modal de eliminar (y refrescar lista)
REMOVE_MEMBER_BTN.addEventListener('click', () => {
    renderMiembros(); // Asegura que la lista desplegable esté actualizada
    openModal(REMOVE_MEMBER_MODAL);
});

// Eventos para cerrar los modales
CLOSE_BUTTONS.forEach(btn => {
    btn.addEventListener('click', (e) => closeModal(e.target.closest('.modal')));
});

// Cierra modal al hacer clic fuera de la ventana
window.addEventListener('click', (event) => {
    if (event.target === ADD_MEMBER_MODAL) {
        closeModal(ADD_MEMBER_MODAL);
    }
    if (event.target === REMOVE_MEMBER_MODAL) {
        closeModal(REMOVE_MEMBER_MODAL);
    }
});


// --- Lógica de Añadir Miembro ---
document.getElementById('add-member-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('new-member-name').value.trim();
    const instrument = document.getElementById('new-member-instrument').value.trim();
    
    if (name && instrument) {
        miembros.push({ nombre: name, instrumento: instrument });
        renderMiembros();
        this.reset();
        closeModal(ADD_MEMBER_MODAL);
    }
});

// --- Lógica de Eliminar Miembro con Confirmación ---
document.getElementById('remove-member-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const select = document.getElementById('member-select');
    const confirmationText = document.getElementById('confirmation-text');
    const deleteButton = e.target.querySelector('.delete-btn');
    const memberName = select.value;
    
    if (!memberName) return; 

    const index = miembros.findIndex(m => m.nombre === memberName);

    if (index > -1) {
        // Primera pulsación: Mostrar la confirmación
        if (confirmationText.classList.contains('hidden')) {
            confirmationText.classList.remove('hidden');
            confirmationText.textContent = `¿Estás seguro de que quieres eliminar a ${memberName}?`;
            deleteButton.textContent = '¡SÍ, ELIMINAR!';
        } else {
            // Segunda pulsación: Confirmación recibida, eliminar
            miembros.splice(index, 1);
            
            renderMiembros();
            
            // Restablecer el modal y cerrarlo
            confirmationText.classList.add('hidden');
            deleteButton.textContent = 'Confirmar Eliminación';
            closeModal(REMOVE_MEMBER_MODAL);
        }
    }
});

// Resetear confirmación al cambiar la selección en el modal de eliminar
document.getElementById('member-select').addEventListener('change', () => {
    document.getElementById('confirmation-text').classList.add('hidden');
    document.getElementById('remove-member-form').querySelector('.delete-btn').textContent = 'Confirmar Eliminación';
});


// ======================================
// 4. INICIALIZACIÓN
// ======================================

document.addEventListener('DOMContentLoaded', function() {
    // Asegura que la sección de inicio es visible al cargar la página
    showSection('inicio'); 
});