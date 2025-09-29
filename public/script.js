// Configuración de la API
const API_BASE_URL = 'http://localhost:3000/api';

// Estado global de la aplicación
let currentTab = 'usuarios';
let editMode = false;
let currentEditId = null;

// Inicialización cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadInitialData();
});

// Inicializar la aplicación
function initializeApp() {
    initializeShippingForm();
    loadShippingHistory();
}

// Configurar event listeners
function setupEventListeners() {
    // Form submissions
    document.getElementById('shippingForm').addEventListener('submit', handleShippingSubmit);
    document.getElementById('editForm').addEventListener('submit', handleEditSubmit);

    // Modal close
    document.querySelector('.close').addEventListener('click', closeModal);
    document.getElementById('editModal').addEventListener('click', (e) => {
        if (e.target.id === 'editModal') closeModal();
    });
}

// Inicializar el formulario de envío
function initializeShippingForm() {
    // Establecer fecha actual
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('fecha').value = today;
    
    // Agregar primera fila de pieza
    addPartRow();
}

// Cargar todos los datos
async function loadAllData() {
    showLoading();
    try {
        await Promise.all([
            loadData('usuarios'),
            loadData('proyectos'),
            loadData('piezas'),
            loadData('pases'),
            loadData('detalles')
        ]);
    } catch (error) {
        console.error('Error loading all data:', error);
        showToast('Error cargando datos', 'error');
    } finally {
        hideLoading();
    }
}

// Cargar datos iniciales
async function loadInitialData() {
    try {
        // Cargar usuarios y proyectos para los selects
        await loadSelectOptions();
    } catch (error) {
        console.error('Error loading initial data:', error);
        showToast('Error cargando datos iniciales', 'error');
    }
}

// Cargar opciones para los selects
async function loadSelectOptions() {
    try {
        // Cargar usuarios
        const usuarios = await fetchData('usuarios');
        const usuarioSelect = document.getElementById('paseUsuario');
        const detalleUsuarioSelect = document.getElementById('detalleUsuario');
        
        if (usuarioSelect) {
            usuarioSelect.innerHTML = '<option value="">Seleccionar usuario</option>';
            usuarios.forEach(usuario => {
                const option = document.createElement('option');
                option.value = usuario.id;
                option.textContent = `${usuario.Nombre} (${usuario.Rol})`;
                usuarioSelect.appendChild(option);
            });
        }

        // Cargar proyectos
        const proyectos = await fetchData('proyectos');
        const proyectoSelect = document.getElementById('paseProyecto');
        
        if (proyectoSelect) {
            proyectoSelect.innerHTML = '<option value="">Seleccionar proyecto</option>';
            proyectos.forEach(proyecto => {
                const option = document.createElement('option');
                option.value = proyecto.id;
                option.textContent = `${proyecto.Nombre} (OV: ${proyecto['Orden de Venta']})`;
                proyectoSelect.appendChild(option);
            });
        }

        // Cargar pases de salida para detalles
        const pases = await fetchData('pase-salida');
        const paseSelect = document.getElementById('detallePase');
        
        if (paseSelect) {
            paseSelect.innerHTML = '<option value="">Seleccionar pase de salida</option>';
            pases.forEach(pase => {
                const option = document.createElement('option');
                option.value = pase.id;
                option.textContent = `Pase #${pase.id} - ${pase.proyecto_nombre}`;
                paseSelect.appendChild(option);
            });
        }

        // Cargar piezas para detalles
        const piezas = await fetchData('detalle-pieza');
        const piezaSelect = document.getElementById('detallePieza');
        
        if (piezaSelect) {
            piezaSelect.innerHTML = '<option value="">Seleccionar pieza</option>';
            piezas.forEach(pieza => {
                const option = document.createElement('option');
                option.value = pieza.id;
                option.textContent = `${pieza.Tipo} - ${pieza.Marca} (Stock: ${pieza.cantidad})`;
                piezaSelect.appendChild(option);
            });
        }

    } catch (error) {
        console.error('Error loading select options:', error);
    }
}

// Cargar datos según el tipo
async function loadData(type) {
    try {
        let endpoint = '';
        let listId = '';
        
        switch(type) {
            case 'usuarios':
                endpoint = 'usuarios';
                listId = 'usuariosList';
                break;
            case 'proyectos':
                endpoint = 'proyectos';
                listId = 'proyectosList';
                break;
            case 'piezas':
                endpoint = 'detalle-pieza';
                listId = 'piezasList';
                break;
            case 'pases':
                endpoint = 'pase-salida';
                listId = 'pasesList';
                break;
            case 'detalles':
                endpoint = 'pase-salida-detalle';
                listId = 'detallesList';
                break;
        }
        
        const data = await fetchData(endpoint);
        renderDataList(data, listId, type);
        
    } catch (error) {
        console.error(`Error loading ${type}:`, error);
        showToast(`Error cargando ${type}`, 'error');
    }
}

// Fetch data from API
async function fetchData(endpoint) {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    return result.data || result;
}

// Renderizar lista de datos
function renderDataList(data, listId, type) {
    const container = document.getElementById(listId);
    
    if (!data || data.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div>📝</div>
                <h3>No hay datos</h3>
                <p>No se encontraron registros para mostrar</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = data.map(item => createDataItem(item, type)).join('');
    
    // Si es la lista de pases, cargar los detalles de cada pase
    if (type === 'pases') {
        data.forEach(pase => {
            loadPaseDetalles(pase.id);
        });
    }
}

// Crear elemento de datos
function createDataItem(item, type) {
    let content = '';
    let title = '';
    
    switch(type) {
        case 'usuarios':
            title = item.Nombre;
            content = `
                <div class="data-item-field">
                    <span class="field-label">Rol:</span>
                    <span class="field-value">${item.Rol}</span>
                </div>
                <div class="data-item-field">
                    <span class="field-label">Creado:</span>
                    <span class="field-value">${formatDate(item.created_at)}</span>
                </div>
            `;
            break;
            
        case 'proyectos':
            title = item.Nombre;
            content = `
                <div class="data-item-field">
                    <span class="field-label">Orden de Venta:</span>
                    <span class="field-value">${item['Orden de Venta']}</span>
                </div>
                <div class="data-item-field">
                    <span class="field-label">SEC:</span>
                    <span class="field-value">${item.SEC}</span>
                </div>
                <div class="data-item-field">
                    <span class="field-label">Creado:</span>
                    <span class="field-value">${formatDate(item.created_at)}</span>
                </div>
            `;
            break;
            
        case 'piezas':
            title = `${item.Tipo} - ${item.Marca}`;
            content = `
                <div class="data-item-field">
                    <span class="field-label">Cantidad:</span>
                    <span class="field-value">${item.cantidad}</span>
                </div>
                <div class="data-item-field">
                    <span class="field-label">Tipo:</span>
                    <span class="field-value">${item.Tipo}</span>
                </div>
                <div class="data-item-field">
                    <span class="field-label">Marca:</span>
                    <span class="field-value">${item.Marca}</span>
                </div>
            `;
            break;
            
        case 'pases':
            title = `Pase #${item.id}`;
            content = `
                <div class="data-item-field">
                    <span class="field-label">Proyecto:</span>
                    <span class="field-value">${item.proyecto_nombre || 'N/A'}</span>
                </div>
                <div class="data-item-field">
                    <span class="field-label">Usuario:</span>
                    <span class="field-value">${item.usuario_nombre || 'N/A'}</span>
                </div>
                <div class="data-item-field">
                    <span class="field-label">Rol:</span>
                    <span class="field-value">${item.usuario_rol || 'N/A'}</span>
                </div>
                <div class="pase-details" id="pase-details-${item.id}">
                    <h4>📋 Detalles del Pase</h4>
                    <div id="detalles-pase-${item.id}">
                        <div class="no-details">Cargando detalles...</div>
                    </div>
                </div>
            `;
            break;
            
        case 'detalles':
            title = `Detalle #${item.id}`;
            content = `
                <div class="data-item-field">
                    <span class="field-label">Pase de Salida:</span>
                    <span class="field-value">#${item.pase_salida_id || item.idPaseSalida}</span>
                </div>
                <div class="data-item-field">
                    <span class="field-label">Proyecto:</span>
                    <span class="field-value">${item.proyecto_nombre || 'N/A'}</span>
                </div>
                <div class="data-item-field">
                    <span class="field-label">Pieza:</span>
                    <span class="field-value">${item.pieza_tipo || 'N/A'} - ${item.pieza_marca || 'N/A'}</span>
                </div>
                <div class="data-item-field">
                    <span class="field-label">Cantidad:</span>
                    <span class="field-value">${item.Cantidad}</span>
                </div>
            `;
            break;
    }
    
    return `
        <div class="data-item">
            <div class="data-item-header">
                <div class="data-item-title">${title}</div>
                <div class="data-item-actions">
                    <button class="btn btn-warning" onclick="editItem(${item.id}, '${type}')">Editar</button>
                    <button class="btn btn-danger" onclick="deleteItem(${item.id}, '${type}')">Eliminar</button>
                </div>
            </div>
            <div class="data-item-content">
                ${content}
            </div>
        </div>
    `;
}

// Handlers de formularios
async function handleUsuarioSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    try {
        showLoading();
        await submitData('usuarios', data);
        clearForm('usuarioForm');
        showToast('Usuario creado exitosamente', 'success');
        loadData('usuarios');
    } catch (error) {
        showToast('Error creando usuario', 'error');
    } finally {
        hideLoading();
    }
}

async function handleProyectoSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    // Convertir números
    data['Orden de Venta'] = parseInt(data['Orden de Venta']);
    data.SEC = parseInt(data.SEC);
    
    try {
        showLoading();
        await submitData('proyectos', data);
        clearForm('proyectoForm');
        showToast('Proyecto creado exitosamente', 'success');
        loadData('proyectos');
        loadSelectOptions(); // Recargar opciones para selects
    } catch (error) {
        showToast('Error creando proyecto', 'error');
    } finally {
        hideLoading();
    }
}

async function handlePiezaSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    // Convertir números
    data.cantidad = parseInt(data.cantidad);
    
    try {
        showLoading();
        await submitData('detalle-pieza', data);
        clearForm('piezaForm');
        showToast('Pieza creada exitosamente', 'success');
        loadData('piezas');
        loadSelectOptions(); // Recargar opciones para selects
    } catch (error) {
        showToast('Error creando pieza', 'error');
    } finally {
        hideLoading();
    }
}

async function handlePaseSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    // Convertir números
    data.idProyecto = parseInt(data.idProyecto);
    data.idUsuarios = parseInt(data.idUsuarios);
    
    try {
        showLoading();
        await submitData('pase-salida', data);
        clearForm('paseForm');
        showToast('Pase de salida creado exitosamente', 'success');
        loadData('pases');
        loadSelectOptions(); // Recargar opciones para selects
    } catch (error) {
        showToast('Error creando pase de salida', 'error');
    } finally {
        hideLoading();
    }
}

async function handleDetalleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    // Convertir números
    data.idPaseSalida = parseInt(data.idPaseSalida);
    data.idDetallePieza = parseInt(data.idDetallePieza);
    data.Cantidad = parseInt(data.Cantidad);
    
    try {
        showLoading();
        await submitData('pase-salida-detalle', data);
        clearForm('detalleForm');
        showToast('Detalle creado exitosamente', 'success');
        loadData('detalles');
        loadData('pases'); // Recargar pases para mostrar los nuevos detalles
    } catch (error) {
        showToast('Error creando detalle', 'error');
    } finally {
        hideLoading();
    }
}

// Handler para crear nueva pieza desde la sección de detalles
async function handleNuevaPiezaSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    // Convertir números
    data.cantidad = parseInt(data.cantidad);
    
    try {
        showLoading();
        await submitData('detalle-pieza', data);
        clearForm('nuevaPiezaForm');
        showToast('Pieza creada exitosamente', 'success');
        loadSelectOptions(); // Recargar opciones para selects
        loadData('piezas'); // Recargar lista de piezas
    } catch (error) {
        showToast('Error creando pieza', 'error');
    } finally {
        hideLoading();
    }
}

// Submit data to API
async function submitData(endpoint, data) {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error en la petición');
    }
    
    return await response.json();
}

// Update (PUT) data to API
async function updateData(endpoint, id, data) {
    const response = await fetch(`${API_BASE_URL}/${endpoint}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error en la petición PUT');
    }

    return await response.json();
}

// Editar item
async function editItem(id, type) {
    try {
        showLoading();
        let endpoint = '';
        
        switch(type) {
            case 'usuarios': endpoint = 'usuarios'; break;
            case 'proyectos': endpoint = 'proyectos'; break;
            case 'piezas': endpoint = 'detalle-pieza'; break;
            case 'pases': endpoint = 'pase-salida'; break;
            case 'detalles': endpoint = 'pase-salida-detalle'; break;
        }
        
        const item = await fetchData(`${endpoint}/${id}`);
        showEditModal(item, type);
        
    } catch (error) {
        showToast('Error cargando datos para editar', 'error');
    } finally {
        hideLoading();
    }
}

// Mostrar modal de edición
function showEditModal(item, type) {
    const modal = document.getElementById('editModal');
    const title = document.getElementById('modalTitle');
    const fields = document.getElementById('editFormFields');
    
    title.textContent = `Editar ${type}`;
    currentEditId = item.id;
    editMode = true;
    
    let fieldsHTML = '';
    
    switch(type) {
        case 'usuarios':
            fieldsHTML = `
                <div class="form-group">
                    <label for="editNombre">Nombre:</label>
                    <input type="text" id="editNombre" name="Nombre" value="${item.Nombre}" required>
                </div>
                <div class="form-group">
                    <label for="editRol">Rol:</label>
                    <select id="editRol" name="Rol" required>
                        <option value="Administrador" ${item.Rol === 'Administrador' ? 'selected' : ''}>Administrador</option>
                        <option value="Supervisor" ${item.Rol === 'Supervisor' ? 'selected' : ''}>Supervisor</option>
                        <option value="Operador" ${item.Rol === 'Operador' ? 'selected' : ''}>Operador</option>
                        <option value="Gerente" ${item.Rol === 'Gerente' ? 'selected' : ''}>Gerente</option>
                    </select>
                </div>
            `;
            break;
            
        case 'proyectos':
            fieldsHTML = `
                <div class="form-group">
                    <label for="editOrdenVenta">Orden de Venta:</label>
                    <input type="number" id="editOrdenVenta" name="Orden de Venta" value="${item['Orden de Venta']}" required>
                </div>
                <div class="form-group">
                    <label for="editProyectoNombre">Nombre:</label>
                    <input type="text" id="editProyectoNombre" name="Nombre" value="${item.Nombre}" required>
                </div>
                <div class="form-group">
                    <label for="editSEC">SEC:</label>
                    <input type="number" id="editSEC" name="SEC" value="${item.SEC}" required>
                </div>
            `;
            break;
            
        case 'piezas':
            fieldsHTML = `
                <div class="form-group">
                    <label for="editCantidad">Cantidad:</label>
                    <input type="number" id="editCantidad" name="cantidad" value="${item.cantidad}" min="1" required>
                </div>
                <div class="form-group">
                    <label for="editTipo">Tipo:</label>
                    <input type="text" id="editTipo" name="Tipo" value="${item.Tipo}" required>
                </div>
                <div class="form-group">
                    <label for="editMarca">Marca:</label>
                    <input type="text" id="editMarca" name="Marca" value="${item.Marca}" required>
                </div>
            `;
            break;
            
        case 'pases':
            fieldsHTML = `
                <div class="form-group">
                    <label for="editPaseProyecto">Proyecto:</label>
                    <select id="editPaseProyecto" name="idProyecto" required>
                        <option value="">Seleccionar proyecto</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="editPaseUsuario">Usuario:</label>
                    <select id="editPaseUsuario" name="idUsuarios" required>
                        <option value="">Seleccionar usuario</option>
                    </select>
                </div>
            `;
            break;
            
        case 'detalles':
            fieldsHTML = `
                <div class="form-group">
                    <label for="editDetallePase">Pase de Salida:</label>
                    <select id="editDetallePase" name="idPaseSalida" required>
                        <option value="">Seleccionar pase de salida</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="editDetallePieza">Pieza:</label>
                    <select id="editDetallePieza" name="idDetallePieza" required>
                        <option value="">Seleccionar pieza</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="editDetalleCantidad">Cantidad:</label>
                    <input type="number" id="editDetalleCantidad" name="Cantidad" value="${item.Cantidad}" min="1" required>
                </div>
            `;
            break;
    }
    
    fields.innerHTML = fieldsHTML;
    
    // Cargar opciones para selects en el modal
    if (type === 'pases' || type === 'detalles') {
        loadSelectOptionsForModal();
    }
    
    modal.style.display = 'block';
}

// Cargar opciones para selects en el modal
async function loadSelectOptionsForModal() {
    try {
        // Cargar usuarios
        const usuarios = await fetchData('usuarios');
        const editUsuarioSelect = document.getElementById('editPaseUsuario');
        if (editUsuarioSelect) {
            editUsuarioSelect.innerHTML = '<option value="">Seleccionar usuario</option>';
            usuarios.forEach(usuario => {
                const option = document.createElement('option');
                option.value = usuario.id;
                option.textContent = `${usuario.Nombre} (${usuario.Rol})`;
                editUsuarioSelect.appendChild(option);
            });
        }

        // Cargar proyectos
        const proyectos = await fetchData('proyectos');
        const editProyectoSelect = document.getElementById('editPaseProyecto');
        if (editProyectoSelect) {
            editProyectoSelect.innerHTML = '<option value="">Seleccionar proyecto</option>';
            proyectos.forEach(proyecto => {
                const option = document.createElement('option');
                option.value = proyecto.id;
                option.textContent = `${proyecto.Nombre} (OV: ${proyecto['Orden de Venta']})`;
                editProyectoSelect.appendChild(option);
            });
        }

        // Cargar pases de salida
        const pases = await fetchData('pase-salida');
        const editPaseSelect = document.getElementById('editDetallePase');
        if (editPaseSelect) {
            editPaseSelect.innerHTML = '<option value="">Seleccionar pase de salida</option>';
            pases.forEach(pase => {
                const option = document.createElement('option');
                option.value = pase.id;
                option.textContent = `Pase #${pase.id} - ${pase.proyecto_nombre}`;
                editPaseSelect.appendChild(option);
            });
        }

        // Cargar piezas
        const piezas = await fetchData('detalle-pieza');
        const editPiezaSelect = document.getElementById('editDetallePieza');
        if (editPiezaSelect) {
            editPiezaSelect.innerHTML = '<option value="">Seleccionar pieza</option>';
            piezas.forEach(pieza => {
                const option = document.createElement('option');
                option.value = pieza.id;
                option.textContent = `${pieza.Tipo} - ${pieza.Marca} (Stock: ${pieza.cantidad})`;
                editPiezaSelect.appendChild(option);
            });
        }

    } catch (error) {
        console.error('Error loading select options for modal:', error);
    }
}

// Handle edit form submission
async function handleEditSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    // Convertir números según el tipo
    if (currentTab === 'proyectos') {
        data['Orden de Venta'] = parseInt(data['Orden de Venta']);
        data.SEC = parseInt(data.SEC);
    } else if (currentTab === 'piezas') {
        data.cantidad = parseInt(data.cantidad);
    } else if (currentTab === 'pases') {
        data.idProyecto = parseInt(data.idProyecto);
        data.idUsuarios = parseInt(data.idUsuarios);
    } else if (currentTab === 'detalles') {
        data.idPaseSalida = parseInt(data.idPaseSalida);
        data.idDetallePieza = parseInt(data.idDetallePieza);
        data.Cantidad = parseInt(data.Cantidad);
    }
    
    try {
        showLoading();
        let endpoint = '';
        
        switch(currentTab) {
            case 'usuarios': endpoint = 'usuarios'; break;
            case 'proyectos': endpoint = 'proyectos'; break;
            case 'piezas': endpoint = 'detalle-pieza'; break;
            case 'pases': endpoint = 'pase-salida'; break;
            case 'detalles': endpoint = 'pase-salida-detalle'; break;
        }
        
        await updateData(`${endpoint}/${currentEditId}`, data);
        closeModal();
        showToast('Registro actualizado exitosamente', 'success');
        loadData(currentTab);
        loadSelectOptions(); // Recargar opciones para selects
        
    } catch (error) {
        showToast('Error actualizando registro', 'error');
    } finally {
        hideLoading();
    }
}

// Update data in API
async function updateData(endpoint, data) {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error en la petición');
    }
    
    return await response.json();
}

// Eliminar item
async function deleteItem(id, type) {
    if (!confirm('¿Estás seguro de que quieres eliminar este registro?')) {
        return;
    }
    
    try {
        showLoading();
        let endpoint = '';
        
        switch(type) {
            case 'usuarios': endpoint = 'usuarios'; break;
            case 'proyectos': endpoint = 'proyectos'; break;
            case 'piezas': endpoint = 'detalle-pieza'; break;
            case 'pases': endpoint = 'pase-salida'; break;
            case 'detalles': endpoint = 'pase-salida-detalle'; break;
        }
        
        await deleteData(`${endpoint}/${id}`);
        showToast('Registro eliminado exitosamente', 'success');
        loadData(currentTab);
        loadSelectOptions(); // Recargar opciones para selects
        
    } catch (error) {
        showToast('Error eliminando registro', 'error');
    } finally {
        hideLoading();
    }
}

// Delete data from API
async function deleteData(endpoint) {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: 'DELETE'
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error en la petición');
    }
    
    return await response.json();
}

// Cerrar modal
function closeModal() {
    document.getElementById('editModal').style.display = 'none';
    editMode = false;
    currentEditId = null;
}

// Limpiar formulario
function clearForm(formId) {
    document.getElementById(formId).reset();
}

// Mostrar loading
function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
}

// Ocultar loading
function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
}

// Mostrar toast
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.remove('hidden');
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 300);
    }, 3000);
}

// Cargar detalles de un pase de salida específico
async function loadPaseDetalles(paseId) {
    try {
        const detalles = await fetchData(`pase-salida/${paseId}/detalles`);
        const container = document.getElementById(`detalles-pase-${paseId}`);
        
        if (!container) return;
        
        if (!detalles || detalles.length === 0) {
            container.innerHTML = '<div class="no-details">No hay detalles para este pase de salida</div>';
            return;
        }
        
        container.innerHTML = detalles.map(detalle => `
            <div class="detalle-item">
                <div class="detalle-info">
                    <strong>${detalle.Tipo || detalle.pieza_tipo || 'N/A'} - ${detalle.Marca || detalle.pieza_marca || 'N/A'}</strong>
                    <br>
                    <small>Cantidad: ${detalle.Cantidad} | Stock disponible: ${detalle.stock_cantidad || 'N/A'}</small>
                </div>
                <div class="detalle-actions">
                    <button class="btn btn-warning" onclick="editItem(${detalle.id}, 'detalles')">Editar</button>
                    <button class="btn btn-danger" onclick="deleteItem(${detalle.id}, 'detalles')">Eliminar</button>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error(`Error loading detalles for pase ${paseId}:`, error);
        const container = document.getElementById(`detalles-pase-${paseId}`);
        if (container) {
            container.innerHTML = '<div class="no-details">Error cargando detalles</div>';
        }
    }
}

// Agregar fila de pieza
function addPartRow() {
    const container = document.getElementById('partsContainer');
    const partRow = document.createElement('div');
    partRow.className = 'part-row';
    partRow.innerHTML = `
        <div class="part-cell">
            <input type="number" name="cantidad" min="1" required>
        </div>
        <div class="part-cell">
            <select name="unidad" required>
                <option value="">Seleccione...</option>
                <option value="unidades">Unidades</option>
                <option value="kg">Kilogramos</option>
                <option value="m">Metros</option>
                <option value="m2">Metros cuadrados</option>
                <option value="m3">Metros cúbicos</option>
                <option value="litros">Litros</option>
            </select>
        </div>
        <div class="part-cell">
            <input type="text" name="descripcion" required>
        </div>
        <div class="part-cell">
            <input type="text" name="marca" required>
        </div>
        <div class="part-cell">
            <button type="button" class="btn-delete" onclick="removePartRow(this)">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
                Eliminar
            </button>
        </div>
    `;
    container.appendChild(partRow);
}

// Eliminar fila de pieza
function removePartRow(button) {
    const partRow = button.closest('.part-row');
    const container = document.getElementById('partsContainer');
    
    // Solo permitir eliminar si hay más de una fila
    if (container.children.length > 1) {
        partRow.remove();
    } else {
        showToast('Debe haber al menos una pieza en el envío', 'warning');
    }
}

// Manejar envío del formulario
async function handleShippingSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const shippingData = {
        proyecto: {
            nombre: formData.get('proyectoNombre'),
            ordenVenta: formData.get('ordenVenta'),
            ovSec: formData.get('ovSec'),
            fecha: formData.get('fecha')
        },
        piezas: []
    };
    
    // Recopilar datos de las piezas
    const partRows = document.querySelectorAll('.part-row');
    partRows.forEach(row => {
        const cantidad = row.querySelector('input[name="cantidad"]').value;
        const unidad = row.querySelector('select[name="unidad"]').value;
        const descripcion = row.querySelector('input[name="descripcion"]').value;
        const marca = row.querySelector('input[name="marca"]').value;
        
        if (cantidad && unidad && descripcion && marca) {
            shippingData.piezas.push({
                cantidad: parseInt(cantidad),
                unidad,
                descripcion,
                marca
            });
        }
    });
    
    // Validar que haya al menos una pieza
    if (shippingData.piezas.length === 0) {
        showToast('Debe agregar al menos una pieza', 'error');
        return;
    }
    
    try {
        showLoading();
        
        // Crear proyecto si no existe
        let proyectoId = await findOrCreateProject(shippingData.proyecto);
        
        // Crear pase de salida
        let paseId = await createPaseSalida(proyectoId);
        
        // Crear piezas y detalles
        for (const pieza of shippingData.piezas) {
            let piezaId = await findOrCreatePieza(pieza);
            await createPaseDetalle(paseId, piezaId, pieza.cantidad);
        }
        
        showToast('Envío registrado exitosamente', 'success');
        clearForm();
        loadShippingHistory();
        
    } catch (error) {
        console.error('Error creating shipping:', error);
        showToast('Error registrando envío', 'error');
    } finally {
        hideLoading();
    }
}

// Buscar o crear proyecto
async function findOrCreateProject(proyectoData) {
    try {
        // Buscar proyecto existente
        const proyectos = await fetchData('proyectos');
        const proyectoExistente = proyectos.find(p => 
            p.Nombre === proyectoData.nombre && 
            p['Orden de Venta'] == proyectoData.ordenVenta
        );
        
        if (proyectoExistente) {
            return proyectoExistente.id;
        }
        
        // Crear nuevo proyecto
        const response = await submitData('proyectos', {
            'Orden de Venta': parseInt(proyectoData.ordenVenta),
            'Nombre': proyectoData.nombre,
            'SEC': parseInt(proyectoData.ovSec)
        });
        
        return response.data.id;
    } catch (error) {
        throw new Error('Error creating project: ' + error.message);
    }
}

// Crear pase de salida
async function createPaseSalida(proyectoId) {
    try {
        // Usar el primer usuario disponible o crear uno por defecto
        const usuarios = await fetchData('usuarios');
        let usuarioId = usuarios.length > 0 ? usuarios[0].id : 1;
        
        const response = await submitData('pase-salida', {
            idProyecto: proyectoId,
            idUsuarios: usuarioId
        });
        
        return response.data.id;
    } catch (error) {
        throw new Error('Error creating pase de salida: ' + error.message);
    }
}

// Buscar o crear pieza
async function findOrCreatePieza(piezaData) {
    try {
        // Buscar pieza existente
        const piezas = await fetchData('detalle-pieza');
        const piezaExistente = piezas.find(p => 
            p.Tipo === piezaData.descripcion && 
            p.Marca === piezaData.marca
        );
        
        if (piezaExistente) {
            return piezaExistente.id;
        }
        
        // Crear nueva pieza
        const response = await submitData('detalle-pieza', {
            cantidad: piezaData.cantidad,
            Tipo: piezaData.descripcion,
            Marca: piezaData.marca
        });
        
        return response.data.id;
    } catch (error) {
        throw new Error('Error creating pieza: ' + error.message);
    }
}

// Crear detalle de pase de salida
async function createPaseDetalle(paseId, piezaId, cantidad) {
    try {
        const response = await submitData('pase-salida-detalle', {
            idPaseSalida: paseId,
            idDetallePieza: piezaId,
            Cantidad: cantidad
        });
        
        return response.data.id;
    } catch (error) {
        throw new Error('Error creating detalle: ' + error.message);
    }
}

// Cargar historial de envíos
async function loadShippingHistory() {
    try {
        const pases = await fetchData('pase-salida');
        const container = document.getElementById('shippingHistory');
        if (!pases || pases.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div>📦</div>
                    <h3>No hay envíos registrados</h3>
                    <p>Los envíos aparecerán aquí una vez que sean registrados</p>
                </div>
            `;
            return;
        }
        container.innerHTML = pases.map(pase => `
            <div class="historial-item" data-id="${pase.id}">
                <h3>Pase #${pase.id} - ${pase.proyecto_nombre}</h3>
                <div class="fecha">${formatDate(pase.created_at)}</div>
                <div class="detalle"><strong>Usuario:</strong> ${pase.usuario_nombre} (${pase.usuario_rol})</div>
                <div class="detalle"><strong>Orden de Venta:</strong> ${pase.orden_venta || 'N/A'}</div>
                <button class="btn-modificar" onclick="toggleEditarEnvio(${pase.id})">Modificar</button>
                <form class="form-editar-envio" id="form-editar-envio-${pase.id}" style="display:none; margin-top:18px;">
                    <div class="form-group">
                        <label>Proyecto</label>
                        <input type="text" name="editProyecto" value="${pase.proyecto_nombre || ''}" required>
                    </div>
                    <div class="form-group">
                        <label>Orden de Venta</label>
                        <input type="text" name="editOrdenVenta" value="${pase.orden_venta || ''}" required>
                    </div>
                    <div class="form-group">
                        <label>Usuario</label>
                        <input type="text" name="editUsuario" value="${pase.usuario_nombre || ''}" required>
                    </div>
                    <div class="form-group">
                        <label>Fecha</label>
                        <input type="date" name="editFecha" value="${pase.created_at ? (new Date(pase.created_at)).toISOString().split('T')[0] : ''}" required>
                    </div>
                        <div class="detalles-area" id="detalles-area-${pase.id}" style="display:none; margin-top:12px;"></div>
                        <div style="text-align:center; margin-top:12px;">
                            <button type="submit" class="btn-modificar">Guardar Cambios</button>
                            <button type="button" class="btn-modificar" style="background:#aaa; margin-left:10px;" onclick="toggleEditarEnvio(${pase.id},true)">Cancelar</button>
                        </div>
                    </form>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading shipping history:', error);
    }
// Función para modificar un envío (básica: solo muestra alerta, puedes expandirla)
// Mostrar/ocultar formulario de edición en el card
let cardEditandoId = null;
function toggleEditarEnvio(id, cancelar = false) {
    // Ocultar cualquier otro formulario abierto
    document.querySelectorAll('.form-editar-envio').forEach(f => f.style.display = 'none');
    if (cardEditandoId === id || cancelar) {
        cardEditandoId = null;
        return;
    }
    const form = document.getElementById('form-editar-envio-' + id);
    if (form) {
        form.style.display = 'block';
        cardEditandoId = id;
        // cargar detalles al abrir
        loadDetallesForCard(id);
        form.onsubmit = async function(e) {
            e.preventDefault();
            try {
                showLoading();
                // Leer valores del formulario
                const proyectoNombre = form.querySelector('input[name="editProyecto"]').value.trim();
                const ordenVenta = form.querySelector('input[name="editOrdenVenta"]').value.trim();
                const usuarioNombre = form.querySelector('input[name="editUsuario"]').value.trim();
                const fechaVal = form.querySelector('input[name="editFecha"]').value;

                if (!proyectoNombre || !usuarioNombre) {
                    showToast('Proyecto y Usuario son obligatorios', 'warning');
                    return;
                }

                // Buscar o crear proyecto
                let proyectos = await fetchData('proyectos');
                let proyecto = proyectos.find(p => p.Nombre === proyectoNombre || p['Orden de Venta'] == ordenVenta);
                let proyectoId;
                if (proyecto) {
                    proyectoId = proyecto.id;
                } else {
                    // Crear proyecto mínimo requerido por API
                    const ordenNum = ordenVenta ? parseInt(ordenVenta) : 0;
                    const resp = await submitData('proyectos', { 'Orden de Venta': ordenNum, Nombre: proyectoNombre, SEC: 0 });
                    proyectoId = resp.data.id || resp.data; // manejar posible estructura
                }

                // Buscar o crear usuario
                let usuarios = await fetchData('usuarios');
                let usuario = usuarios.find(u => u.Nombre === usuarioNombre);
                let usuarioId;
                if (usuario) {
                    usuarioId = usuario.id;
                } else {
                    const respU = await submitData('usuarios', { Nombre: usuarioNombre, Rol: 'Usuario' });
                    usuarioId = respU.data.id || respU.data;
                }

                // Hacer PUT para actualizar pase de salida
                await updateData('pase-salida', id, { idProyecto: proyectoId, idUsuarios: usuarioId });
                // Actualizar cantidades modificadas en detalles del card
                await updateDetallesOnSaveCard(id);
                showToast('Envío actualizado correctamente', 'success');
                cardEditandoId = null;
                loadShippingHistory();
            } catch (error) {
                console.error('Error updating pase:', error);
                showToast('Error actualizando envío: ' + (error.message || ''), 'error');
            } finally {
                hideLoading();
            }
        };
    }
}

// Cargar detalles para el card dentro del formulario (se muestran cuando se abre editar)
async function loadDetallesForCard(paseId) {
    const cont = document.getElementById('detalles-area-' + paseId);
    if (!cont) return;
    cont.innerHTML = 'Cargando piezas...';
    cont.style.display = 'block';
    try {
        const res = await fetch(`${API_BASE_URL}/pase-salida/${paseId}/detalles`);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const json = await res.json();
        const detalles = json.data || json;
        renderDetallesForCard(cont, paseId, detalles);
    } catch (err) {
        console.error(err);
        cont.innerHTML = '<div>Error cargando piezas: '+err.message+'</div>';
    }
}

function renderDetallesForCard(container, paseId, detalles) {
    container.innerHTML = '';
    const list = document.createElement('div');
    list.className = 'detalles-list';
    if (!detalles || detalles.length === 0) list.innerHTML = '<div class="no-details">No hay piezas en este pase</div>';
    else {
        detalles.forEach(d => {
            const row = document.createElement('div');
            row.className = 'detalle-row';

            const info = document.createElement('div'); info.className = 'detalle-info';
            info.textContent = `${d.pieza_tipo || d.Tipo || 'Pieza'} - ${d.pieza_marca || d.Marca || ''}`;

            const qtyInput = document.createElement('input');
            qtyInput.type = 'number'; qtyInput.min = '1'; qtyInput.value = (d.Cantidad != null ? d.Cantidad : 1);
            qtyInput.dataset.original = String(d.Cantidad != null ? d.Cantidad : 1);
            qtyInput.dataset.detalleId = String(d.id);

            const actions = document.createElement('div'); actions.className = 'detalle-actions';
            const del = document.createElement('button'); del.className = 'btn btn-danger'; del.textContent = 'Eliminar';
            del.onclick = async () => {
                if (!confirm('Eliminar esta pieza del pase?')) return;
                try {
                    const r = await fetch(`${API_BASE_URL}/pase-salida-detalle/${d.id}`, { method: 'DELETE' });
                    if (!r.ok) throw new Error('HTTP ' + r.status);
                    showToast('Pieza eliminada', 'success');
                    // recargar detalles
                    loadDetallesForCard(paseId);
                } catch (e) { showToast('Error: '+e.message, 'error'); }
            };

            actions.appendChild(del);
            row.appendChild(info);
            row.appendChild(qtyInput);
            row.appendChild(actions);
            list.appendChild(row);
        });
    }

    // agregar form para nueva pieza (simple)
    const addForm = document.createElement('form'); addForm.className = 'add-piece-form';
    const inTipo = document.createElement('input'); inTipo.placeholder = 'Tipo de pieza'; inTipo.required = true;
    const inMarca = document.createElement('input'); inMarca.placeholder = 'Marca'; inMarca.required = true;
    const inCant = document.createElement('input'); inCant.type = 'number'; inCant.min='1'; inCant.placeholder='Cantidad'; inCant.required = true;
    const addBtn = document.createElement('button'); addBtn.type='submit'; addBtn.className='btn btn-primary'; addBtn.textContent='Agregar pieza';
    addForm.appendChild(inTipo); addForm.appendChild(inMarca); addForm.appendChild(inCant); addForm.appendChild(addBtn);
    addForm.onsubmit = async (e) => {
        e.preventDefault(); addBtn.disabled = true;
        try {
            // buscar o crear detalle-pieza
            const piezasRes = await fetch(`${API_BASE_URL}/detalle-pieza`);
            if (!piezasRes.ok) throw new Error('HTTP ' + piezasRes.status);
            const piezasJson = await piezasRes.json();
            const piezas = piezasJson.data || piezasJson;
            let pieza = piezas.find(p=> p.Tipo === inTipo.value && p.Marca === inMarca.value);
            let piezaId;
            if (pieza) piezaId = pieza.id; else {
                const createResp = await fetch(`${API_BASE_URL}/detalle-pieza`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ cantidad: parseInt(inCant.value), Tipo: inTipo.value, Marca: inMarca.value }) });
                if (!createResp.ok) throw new Error('HTTP ' + createResp.status);
                const createJson = await createResp.json(); piezaId = createJson.data ? createJson.data.id : createJson.data;
            }
            // crear pase-salida-detalle
            const createDetalle = await fetch(`${API_BASE_URL}/pase-salida-detalle`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ idPaseSalida: paseId, idDetallePieza: piezaId, Cantidad: parseInt(inCant.value) }) });
            if (!createDetalle.ok) throw new Error('HTTP ' + createDetalle.status);
            showToast('Pieza añadida', 'success');
            inTipo.value=''; inMarca.value=''; inCant.value='';
            loadDetallesForCard(paseId);
        } catch (err) { showToast('Error: '+err.message, 'error'); } finally { addBtn.disabled = false; }
    };

    container.appendChild(list);
    container.appendChild(addForm);
}

// Actualiza todas las cantidades modificadas en un card (usa inputs con data-detalle-id)
async function updateDetallesOnSaveCard(paseId) {
    const cont = document.getElementById('detalles-area-' + paseId);
    if (!cont) return;
    const inputs = Array.from(cont.querySelectorAll('input[type="number"][data-detalle-id]'));
    const updates = [];
    for (const inp of inputs) {
        const orig = parseInt(inp.dataset.original || '0');
        const now = parseInt(inp.value) || 0;
        if (now !== orig) updates.push({ id: inp.dataset.detalleId, Cantidad: now });
    }
    if (updates.length === 0) return;
    // ejecutar secuencialmente para compatibilidad
    if (updates.length === 0) return;
    showToast(`Actualizando ${updates.length} detalle(s)...`, 'success');
    for (const u of updates) {
        const inp = cont.querySelector(`input[data-detalle-id="${u.id}"]`);
        const idDetallePieza = inp ? parseInt(inp.dataset.detallePiezaId || '0') : 0;
        const payload = { idPaseSalida: parseInt(paseId), idDetallePieza: idDetallePieza, Cantidad: parseInt(u.Cantidad) };
        console.log('PUT detalle (card)', u.id, payload);
        try {
            const r = await fetch(`${API_BASE_URL}/pase-salida-detalle/${u.id}`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });
            const text = await r.text().catch(()=>null);
            let body = null; try { body = text ? JSON.parse(text) : null; } catch(e) { body = text; }
            if (!r.ok) { showToast('Error actualizando detalle: ' + r.status + ' ' + (body && body.message ? body.message : JSON.stringify(body)), 'error'); console.error('PUT detalle fallo', u.id, payload, body); throw new Error('HTTP ' + r.status); }
            if (inp) inp.dataset.original = String(u.Cantidad);
        } catch (err) {
            console.error('Error updating detalle (card):', err);
            throw err;
        }
    }
    await loadDetallesForCard(paseId);
    showToast('Detalles actualizados correctamente', 'success');
    // recargar detalles
    await loadDetallesForCard(paseId);
}
}

// Limpiar formulario
function clearForm() {
    document.getElementById('shippingForm').reset();
    
    // Establecer fecha actual
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('fecha').value = today;
    
    // Limpiar piezas y agregar una nueva fila
    const container = document.getElementById('partsContainer');
    container.innerHTML = '';
    addPartRow();
}

// Formatear fecha
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}
