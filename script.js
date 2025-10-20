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

// Se utiliza para almacenar los datos de cuotas leídos de Google Sheets
let cuotasData = []; 

function initSectionLoad(targetId) {
    if (targetId === 'cuotas') {
        // Carga los datos solo si no se han cargado antes
        if (cuotasData.length === 0) {
            loadCuotasData();
        } else {
            // Si ya están cargados, solo muestra el resumen (lista de pendientes)
            renderCuotasSummary(cuotasData);
        }
    }
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
        
        mainNav.classList.add('nav-hidden');
    });
});


// ======================================
// 3. GESTIÓN DE CUOTAS (CONEXIÓN Y RENDERIZADO)
// ======================================

// URL DEL CSV: Usa la URL pública de tu hoja de Google Sheets
const CUOTAS_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTf6SEVJ_oWyi5qxO9oy6AXKzyJqv5SwIJIIN1U7ggO-yI2Pbzk4TfVlsTG0Z2ruzGOhnTquavVossX/pub?gid=0&single=true&output=csv';

// --- Constantes de Cobro para Filtro Inteligente (Sep 2025) ---
const BILLING_START_MONTH = 'Septiembre';
const BILLING_START_YEAR = 2025;
const BILLING_MONTHS_ORDER = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

// --- Elementos DOM de Cuotas ---
const CUOTAS_CONTAINER = document.getElementById('cuotas-full-data-container');
const PENDING_LIST = document.getElementById('pending-list');
const VIEW_PAID_BTN = document.getElementById('view-paid-btn');
const VIEW_PENDING_BTN = document.getElementById('view-pending-btn');
const INGRESAR_CUOTA_BTN = document.getElementById('ingresar-cuota-btn');


/**
 * Determina qué meses son relevantes para el cobro (desde el inicio hasta el mes actual).
 */
function getRelevantMonths() {
    // Obtenemos la fecha actual para el cálculo
    const now = new Date();
    const CURRENT_MONTH = BILLING_MONTHS_ORDER[now.getMonth()];
    const CURRENT_YEAR = now.getFullYear();

    // Si el año actual es anterior al inicio, no hay meses relevantes.
    if (CURRENT_YEAR < BILLING_START_YEAR) {
        return [];
    }

    const startIdx = BILLING_MONTHS_ORDER.indexOf(BILLING_START_MONTH);
    const currentIdx = BILLING_MONTHS_ORDER.indexOf(CURRENT_MONTH); 
    
    // Si el año actual es el de inicio (2025), empezamos desde Sep hasta el actual.
    if (CURRENT_YEAR === BILLING_START_YEAR) {
        // Si el mes actual es anterior al de inicio (ej. Agosto 2025), no hay nada que cobrar.
        if (currentIdx < startIdx) {
            return [];
        }
        // Devuelve [Septiembre, Octubre]
        return BILLING_MONTHS_ORDER.slice(startIdx, currentIdx + 1);
    }
    
    // Si el año actual es posterior al de inicio, devolvemos los 12 meses
    if (CURRENT_YEAR > BILLING_START_YEAR) {
        return BILLING_MONTHS_ORDER;
    }
    
    return []; // Caso de seguridad
}


// --- PARSEAR CSV ---
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    if (lines.length === 0) return [];
    
    const headerCells = lines[0].match(/(?:[^,"]+|"(?:\\.|[^"])*")+/g);
    const headers = headerCells.map(h => h.replace(/"/g, '').trim());

    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
        const cells = lines[i].match(/(?:[^,"]+|"(?:\\.|[^"])*")+/g);
        if (!cells) continue;
        
        const row = {};
        cells.forEach((cell, j) => {
            const cleanCell = cell.replace(/"/g, '').trim();
            if (headers[j]) {
                row[headers[j]] = cleanCell;
            }
        });
        data.push(row);
    }
    return data;
}


// --- RENDERIZAR RESUMEN DE PENDIENTES (Inteligente) ---
function renderCuotasSummary(data) {
    // Usamos la función utilitaria para obtener solo los meses cobrables (Sep 2025 en adelante)
    const RELEVANT_MONTHS = getRelevantMonths(); 
    
    let pendingHTML = '';
    let foundPending = false;
    
    if (RELEVANT_MONTHS.length === 0) {
        PENDING_LIST.innerHTML = '<li style="background-color: #2ECC71;">¡El periodo de cobro aún no ha comenzado!</li>';
        return;
    }

    data.forEach(member => {
        const memberName = member['Miembro'] || 'Miembro Desconocido'; 
        
        // Solo iteramos sobre los meses relevantes: Septiembre y Octubre (en este caso)
        for (const month of RELEVANT_MONTHS) { 
            // Comprobamos si la columna del mes existe y es "PENDIENTE"
            if (member[month] && member[month].toUpperCase() === 'PENDIENTE') {
                pendingHTML += `<li>${memberName} - ${month} ${BILLING_START_YEAR}</li>`;
                foundPending = true;
                break; // Muestra solo el primer mes pendiente por miembro
            }
        }
    });

    if (foundPending) {
        PENDING_LIST.innerHTML = pendingHTML;
    } else {
        PENDING_LIST.innerHTML = '<li style="background-color: #2ECC71;">¡Al día! No hay cuotas pendientes.</li>';
    }
    
    // Asegurarse de que se muestre el resumen y la tabla completa se oculte al inicio
    document.getElementById('cuotas-summary-container').classList.remove('hidden');
    CUOTAS_CONTAINER.classList.add('hidden');
}


// --- RENDERIZAR TABLA COMPLETA (CON FILTRO) ---
function renderFullTable(data, filterType = null) {
    if (data.length === 0) {
        CUOTAS_CONTAINER.innerHTML = '<p>No hay datos disponibles para mostrar.</p>';
        return;
    }

    const tableHTML = document.createElement('table');
    tableHTML.className = 'cuotas-table';

    const headers = Object.keys(data[0]);
    const thead = tableHTML.createTHead();
    const tbody = tableHTML.createTBody();

    // Crear Encabezados (TH)
    const headerRow = thead.insertRow();
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });

    // Rellenar Filas de Datos (TD)
    data.forEach(rowData => {
        const rowElement = tbody.insertRow();
        
        headers.forEach(header => {
            const cellElement = rowElement.insertCell();
            const cellText = rowData[header];
            cellElement.textContent = cellText;

            // Aplicar estilos de estado
            if (cellText && cellText.toUpperCase() === 'PENDIENTE') {
                cellElement.classList.add('status-pendiente');
            } else if (cellText && cellText.toUpperCase() === 'PAGADO') {
                cellElement.classList.add('status-pagado');
            }
        });
    });

    // Insertar la tabla en el contenedor y aplicar el filtro de CSS
    CUOTAS_CONTAINER.innerHTML = ''; 
    CUOTAS_CONTAINER.appendChild(tableHTML);
    
    // Aplicar el filtro de CSS al contenedor
    if (filterType) {
        CUOTAS_CONTAINER.setAttribute('data-filter', filterType);
    } else {
        CUOTAS_CONTAINER.removeAttribute('data-filter');
    }
}


// --- FUNCIÓN DE CARGA PRINCIPAL ---
function renderCuotasTable(csvText) {
    cuotasData = parseCSV(csvText); 
    
    // 1. Mostrar el resumen de pendientes (lo que el usuario ve primero)
    renderCuotasSummary(cuotasData); 
    
    // 2. Renderizar la tabla completa en el contenedor oculto, lista para filtrar
    renderFullTable(cuotasData, null); 
}


async function loadCuotasData() {
    try {
        PENDING_LIST.innerHTML = '<p>Conectando con Google Sheets...</p>';
        
        const response = await fetch(CUOTAS_CSV_URL);
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const csvText = await response.text();
        
        renderCuotasTable(csvText);

    } catch (error) {
        console.error("Fallo al cargar las cuotas:", error);
        PENDING_LIST.innerHTML = '<p style="color: #F94D4D;">❌ Error al cargar los datos. Revisa la URL pública del CSV.</p>';
        CUOTAS_CONTAINER.innerHTML = '<p class="hidden">No se pudo cargar la tabla.</p>';
    }
}


// ======================================
// 4. LÓGICA DE BOTONES DE CUOTAS
// ======================================

// URL del Formulario de Google proporcionada por el usuario
const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLScqxg20O5Lm409muzwF8xASn2KzNmIlcOEQHJC6j6O_LX9OCg/viewform?usp=header'; 

INGRESAR_CUOTA_BTN.addEventListener('click', function() {
    // Abre el formulario en una nueva pestaña
    window.open(GOOGLE_FORM_URL, '_blank');
});


// --- Lógica de los botones de Filtrado de la Tabla ---

VIEW_PAID_BTN.addEventListener('click', function() {
    // 1. Ocultar el resumen y mostrar el contenedor de la tabla
    document.getElementById('cuotas-summary-container').classList.add('hidden');
    CUOTAS_CONTAINER.classList.remove('hidden'); 
    
    // 2. Renderizar la tabla, FILTRANDO a solo PAGADO (atenúa pendientes)
    renderFullTable(cuotasData, 'PAGADO'); 
});

VIEW_PENDING_BTN.addEventListener('click', function() {
    // 1. Ocultar el resumen y mostrar el contenedor de la tabla
    document.getElementById('cuotas-summary-container').classList.add('hidden');
    CUOTAS_CONTAINER.classList.remove('hidden'); 
    
    // 2. Renderizar la tabla, FILTRANDO a solo PENDIENTE (atenúa pagados)
    renderFullTable(cuotasData, 'PENDIENTE'); 
});

// Inicializar la primera sección
document.addEventListener('DOMContentLoaded', function() {
    // Nos aseguramos de que empiece en la sección de inicio
    showSection('inicio');
});