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
// 3. GESTIÓN DE CUOTAS (CONEXIÓN CON GOOGLE SHEETS)
// ======================================

const CUOTAS_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTf6SEVJ_oWyi5qxO9oy6AXKzyJqv5SwIJIIN1U7ggO-yI2Pbzk4TfVlsTG0Z2ruzGOhnTquavVossX/pub?gid=0&single=true&output=csv';
const CUOTAS_CONTAINER = document.getElementById('cuotas-full-data-container');
const PENDING_LIST = document.getElementById('pending-list');


/**
 * Convierte el texto CSV plano en un array de objetos JavaScript para un manejo fácil.
 * @param {string} csvText - El contenido del archivo CSV.
 * @returns {Array<Object>} Un array de objetos con los datos.
 */
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    if (lines.length === 0) return [];
    
    // Obtiene los encabezados de la primera línea
    // Utilizamos el mismo método de regex para manejar comas internas si fuera necesario
    const headerCells = lines[0].match(/(?:[^,"]+|"(?:\\.|[^"])*")+/g);
    const headers = headerCells.map(h => h.replace(/"/g, '').trim());

    const data = [];
    
    // Itera sobre el resto de las líneas (filas de datos)
    for (let i = 1; i < lines.length; i++) {
        const cells = lines[i].match(/(?:[^,"]+|"(?:\\.|[^"])*")+/g);
        if (!cells) continue;
        
        const row = {};
        cells.forEach((cell, j) => {
            const cleanCell = cell.replace(/"/g, '').trim();
            // Asigna el valor de la celda al encabezado correspondiente
            if (headers[j]) {
                row[headers[j]] = cleanCell;
            }
        });
        data.push(row);
    }
    return data;
}


/**
 * Filtra los datos y renderiza un resumen de los pagos pendientes.
 * @param {Array<Object>} data - El array de datos de cuotas.
 */
function renderCuotasSummary(data) {
    // Meses a considerar (simplificado)
    const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    let pendingHTML = '';
    let foundPending = false;

    data.forEach(member => {
        // Recorremos los meses en la fila del miembro
        for (const month of MONTHS) {
            // Comprobamos si la columna del mes existe y es "PENDIENTE"
            if (member[month] && member[month].toUpperCase() === 'PENDIENTE') {
                pendingHTML += `<li>${member['Miembro']} - ${month}</li>`;
                foundPending = true;
                // Encontrado el primer pendiente, pasamos al siguiente miembro para el resumen
                break; 
            }
        }
    });

    if (foundPending) {
        PENDING_LIST.innerHTML = pendingHTML;
    } else {
        PENDING_LIST.innerHTML = '<li style="background-color: #2ECC71;">¡Al día! No hay cuotas pendientes.</li>';
    }
}


// La función que se llama después de leer el CSV
function renderCuotasTable(csvText) {
    // 1. Convertir el CSV en datos utilizables (Array de objetos)
    cuotasData = parseCSV(csvText); 
    
    // 2. Mostrar el resumen (lista de pendientes)
    renderCuotasSummary(cuotasData); 
    
    // 3. Renderizar la tabla completa de fondo (oculta al inicio)
    // Usaremos una función aparte para la tabla completa más adelante
    CUOTAS_CONTAINER.innerHTML = '<p>Tabla de datos completa cargada y lista para filtrar.</p>';
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