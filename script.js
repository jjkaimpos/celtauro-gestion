// ======================================
// 1. GESTIÓN DEL MENÚ HAMBURGUESA
// ======================================

const menuToggle = document.getElementById('menu-toggle'); // El botón ☰
const mainNav = document.getElementById('main-nav'); // El menú completo
const navLinks = document.querySelectorAll('#main-nav a'); // Todos los enlaces del menú

// Al hacer clic en el icono ☰, muestra u oculta el menú.
menuToggle.addEventListener('click', function() {
    mainNav.classList.toggle('nav-hidden');
});

// ======================================
// 2. GESTIÓN DE CAMBIO DE SECCIONES (SPA Feel)
// ======================================

// Función para inicializar la carga de datos (se llama al cambiar de sección)
function initSectionLoad(targetId) {
    if (targetId === 'cuotas') {
        loadCuotasData();
    }
    // Añadiremos más lógica de carga aquí (ej: 'miembros', 'ensayo') más adelante
}


// Función principal que oculta la sección actual, muestra la nueva y llama a initSectionLoad
function showSection(targetId) {
    // 1. Ocultar la sección activa actual (quita la clase 'active')
    const activeSection = document.querySelector('.content-section.active');
    if (activeSection) {
        activeSection.classList.remove('active');
    }

    // 2. Mostrar la nueva sección (añade la clase 'active')
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // 3. Ejecutar funciones específicas para la sección
    initSectionLoad(targetId);
}


// 4. Añadir el evento de click a todos los enlaces del menú
navLinks.forEach(link => {
    link.addEventListener('click', function(event) {
        event.preventDefault(); 
        const targetId = this.getAttribute('href').substring(1); 
        
        showSection(targetId);
        
        // Oculta el menú hamburguesa después de seleccionar en móvil
        mainNav.classList.add('nav-hidden');
    });
});


// ======================================
// 3. GESTIÓN DE CUOTAS (CONEXIÓN CON GOOGLE SHEETS)
// ======================================

// 1. URL CSV DE TU HOJA DE GOOGLE
const CUOTAS_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTf6SEVJ_oWyi5qxO9oy6AXKzyJqv5SwIJIIN1U7ggO-yI2Pbzk4TfVlsTG0Z2ruzGOhnTquavVossX/pub?gid=0&single=true&output=csv';

const CUOTAS_CONTAINER = document.getElementById('cuotas-table-container');

// Función que toma el texto CSV y lo renderiza como una tabla HTML
function renderCuotasTable(csvText) {
    // 1. Divide el texto en filas y columnas
    const rows = csvText.trim().split('\n');
    const tableHTML = document.createElement('table');
    tableHTML.className = 'cuotas-table'; // Clase para aplicar el estilo CSS

    // Usamos una cabecera separada para aplicar estilos
    const thead = tableHTML.createTHead();
    const tbody = tableHTML.createTBody();

    rows.forEach((row, index) => {
        // Expresión regular para separar por comas, manejando celdas con comas internas si fuera necesario
        const cells = row.match(/(?:[^,"]+|"(?:\\.|[^"])*")+/g);

        if (!cells) return; // Salta filas vacías

        const target = (index === 0) ? thead.insertRow() : tbody.insertRow();
        
        cells.forEach(cellText => {
            // Limpia las comillas si existen y los espacios al principio/final
            const cleanText = cellText.replace(/"/g, '').trim();

            let cellElement;
            if (index === 0) {
                // Primera fila: Encabezados (<th>)
                cellElement = document.createElement('th');
            } else {
                // Resto de filas: Celdas de datos (<td>)
                cellElement = target.insertCell();
                
                // LÓGICA DE ESTADO (PENDIENTE/PAGADO) para aplicar color
                if (cleanText.toUpperCase() === 'PENDIENTE') {
                    cellElement.classList.add('status-pendiente');
                } else if (cleanText.toUpperCase() === 'PAGADO') {
                    cellElement.classList.add('status-pagado');
                }
            }
            cellElement.textContent = cleanText;
        });
    });

    // 2. Insertar la tabla en el contenedor
    CUOTAS_CONTAINER.innerHTML = ''; // Limpia el mensaje de "Cargando..."
    CUOTAS_CONTAINER.appendChild(tableHTML);
}

// Función principal para cargar y mostrar los datos
async function loadCuotasData() {
    try {
        CUOTAS_CONTAINER.innerHTML = '<p>Conectando con Google Sheets...</p>';

        // 2. Lee el archivo CSV
        const response = await fetch(CUOTAS_CSV_URL);
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const csvText = await response.text();
        
        // Llama a la función para convertir el texto en tabla
        renderCuotasTable(csvText);

    } catch (error) {
        console.error("Fallo al cargar las cuotas:", error);
        CUOTAS_CONTAINER.innerHTML = '<p style="color: #F94D4D;">❌ Error al cargar los datos. Revisa la URL pública del CSV.</p>';
    }
}