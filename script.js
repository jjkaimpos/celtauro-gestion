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
const ADD_MEMBER_BTN = document.getElementById('add-member-btn');
const REMOVE_MEMBER_BTN = document.getElementById('remove-member-btn');
const ADD_MEMBER_MODAL = document.getElementById('add-member-modal');
const REMOVE_MEMBER_MODAL = document.getElementById('remove-member-modal');
const CLOSE_BUTTONS = document.querySelectorAll('.modal .close-btn');

// Array local para simular la base de datos de miembros
let miembros = [
    { nombre: 'Juanjo', instrumento: 'Batería' },
    { nombre: 'Laura', instrumento: 'Violín' },
    { nombre: 'David', instrumento: 'Guitarra' },
    { nombre: 'María', instrumento: 'Flauta' },
];

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

// Cierra modal al hacer clic fuera
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
        // Añadir el nuevo miembro al array (simulación de base de datos)
        miembros.push({ nombre: name, instrumento: instrument });
        
        // Renderizar la lista actualizada
        renderMiembros();
        
        // Limpiar formulario y cerrar modal
        this.reset();
        closeModal(ADD_MEMBER_MODAL);
    }
});

// --- Lógica de Eliminar Miembro ---
document.getElementById('remove-member-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const select = document.getElementById('member-select');
    const confirmationText = document.getElementById('confirmation-text');
    const memberName = select.value;
    
    if (!memberName) return; 

    // Buscar el índice del miembro a eliminar por su nombre
    const index = miembros.findIndex(m => m.nombre === memberName);

    if (index > -1) {
        // Mostrar la confirmación antes de eliminar
        if (confirmationText.classList.contains('hidden')) {
            confirmationText.classList.remove('hidden');
            confirmationText.textContent = `¿Estás seguro de que quieres eliminar a ${memberName}?`;
            
            // Opcional: cambiar el texto del botón a "Confirmar"
            e.target.querySelector('.delete-btn').textContent = 'Confirmar Eliminación';
        } else {
            // Confirmación recibida: eliminar
            miembros.splice(index, 1);
            
            // Renderizar la lista actualizada
            renderMiembros();
            
            // Restablecer el modal y cerrarlo
            confirmationText.classList.add('hidden');
            e.target.querySelector('.delete-btn').textContent = 'Confirmar Eliminación';
            closeModal(REMOVE_MEMBER_MODAL);
        }
    }
});

// Resetear confirmación al cambiar la selección en el modal de eliminar
document.getElementById('member-select').addEventListener('change', () => {
    document.getElementById('confirmation-text').classList.add('hidden');
    document.getElementById('remove-member-form').querySelector('.delete-btn').textContent = 'Confirmar Eliminación';
});