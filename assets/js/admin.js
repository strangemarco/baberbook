// admin.js - Lógica del Panel Administrativo

document.addEventListener('DOMContentLoaded', () => {
    // Configurar fecha actual en dashboard
    const fechaActualEl = document.getElementById('fecha-actual');
    if (fechaActualEl) {
        const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        fechaActualEl.textContent = new Date().toLocaleDateString('es-ES', opciones);
    }

    // Sidebar Toggler para Responsive
    const btnToggleSidebar = document.getElementById('btnToggleSidebar');
    const btnCloseSidebar = document.getElementById('btnCloseSidebar');
    const adminSidebar = document.getElementById('adminSidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    if (btnToggleSidebar && adminSidebar && sidebarOverlay) {
        const toggleSidebar = () => {
            adminSidebar.classList.toggle('show');
            sidebarOverlay.classList.toggle('show');
        };

        btnToggleSidebar.addEventListener('click', toggleSidebar);
        btnCloseSidebar.addEventListener('click', toggleSidebar);
        sidebarOverlay.addEventListener('click', toggleSidebar);
    }

    // Cargar Datos
    const citas = JSON.parse(localStorage.getItem('citas')) || [];
    const servicios = JSON.parse(localStorage.getItem('servicios')) || [];
    const barberos = JSON.parse(localStorage.getItem('barberos')) || [];

    // Helper: Obtener nombre servicio y precio
    const getServicioInfo = (id) => servicios.find(s => s.id === id) || { nombre: 'Desconocido', precio: 0 };
    // Helper: Obtener nombre barbero
    const getBarberoNombre = (id) => {
        const b = barberos.find(b => b.id === id);
        return b ? b.nombre : 'Desconocido';
    };

    // Helper: Renderizar Badge de estado
    const renderBadge = (estado) => {
        if (estado === 'pendiente') return '<span class="badge-admin bg-warning text-dark">Pendiente</span>';
        if (estado === 'completada') return '<span class="badge-admin bg-success text-white">Completada</span>';
        if (estado === 'cancelada') return '<span class="badge-admin bg-danger text-white">Cancelada</span>';
        return `<span class="badge-admin bg-secondary">${estado}</span>`;
    };

    // === LÓGICA DEL DASHBOARD ===
    const tablaProximas = document.getElementById('tabla-proximas-citas');
    if (tablaProximas) {
        const hoy = new Date().toISOString().split('T')[0];
        
        let citasHoyCount = 0;
        let pendientesCount = 0;
        let completadasCount = 0;
        let ingresosProyectados = 0;

        // Ordenar citas para tabla recientes (las más próximas primero)
        const citasOrdenadas = [...citas].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
        
        let html = '';
        let mostradas = 0;

        citasOrdenadas.forEach(cita => {
            // Stats
            if (cita.fecha === hoy && cita.estado !== 'cancelada') citasHoyCount++;
            if (cita.estado === 'pendiente') pendientesCount++;
            if (cita.estado === 'completada') completadasCount++;
            
            const sInfo = getServicioInfo(cita.servicioId);
            if (cita.estado !== 'cancelada') {
                ingresosProyectados += sInfo.precio;
            }

            // Renderizar solo 5 próximas pendientes
            if (cita.estado === 'pendiente' && new Date(cita.fecha) >= new Date(hoy) && mostradas < 5) {
                html += `
                    <tr>
                        <td>
                            <div class="fw-bold">${cita.cliente}</div>
                            <small class="text-muted">${cita.telefono}</small>
                        </td>
                        <td>${sInfo.nombre}</td>
                        <td>${getBarberoNombre(cita.barberoId)}</td>
                        <td>${cita.fecha}</td>
                        <td>${cita.hora}</td>
                        <td>${renderBadge(cita.estado)}</td>
                    </tr>
                `;
                mostradas++;
            }
        });

        if (html === '') {
            html = '<tr><td colspan="6" class="text-center py-4" style="color: #F5F0E8;">No hay citas próximas pendientes.</td></tr>';
        }
        
        tablaProximas.innerHTML = html;

        // Actualizar números
        document.getElementById('stat-hoy').textContent = citasHoyCount;
        document.getElementById('stat-pendientes').textContent = pendientesCount;
        document.getElementById('stat-completadas').textContent = completadasCount;
        document.getElementById('stat-ingresos').textContent = `${ingresosProyectados} Bs`;
    }


    // === LÓGICA DE GESTIÓN DE CITAS ===
    const tablaTodas = document.getElementById('tabla-todas-citas');
    const filtroEstado = document.getElementById('filtro-estado');
    
    if (tablaTodas) {
        // Función para renderizar
        const renderTodasCitas = (filtro = 'todas') => {
            let html = '';
            
            // Ordenar por fecha descendente
            const citasDesc = [...citas].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

            citasDesc.forEach(cita => {
                if (filtro !== 'todas' && cita.estado !== filtro) return;

                html += `
                    <tr>
                        <td style="color: var(--gold); font-weight: 700; letter-spacing: 1px;">#${cita.id.substring(0,5).toUpperCase()}</td>
                        <td>
                            <div class="fw-bold text-white">${cita.cliente}</div>
                            <small>${cita.telefono}</small>
                        </td>
                        <td>${getServicioInfo(cita.servicioId).nombre}</td>
                        <td>${getBarberoNombre(cita.barberoId)}</td>
                        <td>${cita.fecha}</td>
                        <td>${cita.hora}</td>
                        <td>${renderBadge(cita.estado)}</td>
                        <td class="text-end">
                            ${cita.estado === 'pendiente' ? `
                                <button class="btn btn-sm btn-success me-1 btn-accion" data-id="${cita.id}" data-accion="completada" title="Marcar como Completada">
                                    <i class="fa-solid fa-check"></i>
                                </button>
                                <button class="btn btn-sm btn-danger btn-accion" data-id="${cita.id}" data-accion="cancelada" title="Cancelar Cita">
                                    <i class="fa-solid fa-xmark"></i>
                                </button>
                            ` : '-'}
                        </td>
                    </tr>
                `;
            });

            if (html === '') {
                html = '<tr><td colspan="8" class="text-center py-5" style="color: #F5F0E8;">No se encontraron citas con este filtro.</td></tr>';
            }

            tablaTodas.innerHTML = html;

            // Añadir eventos a los botones de acción
            document.querySelectorAll('.btn-accion').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const button = e.target.closest('button');
                    const id = button.dataset.id;
                    const accion = button.dataset.accion;
                    
                    document.getElementById('input-accion-id').value = id;
                    document.getElementById('input-accion-tipo').value = accion;
                    
                    const titulo = accion === 'completada' ? 'Marcar como Completada' : 'Cancelar Cita';
                    const mensaje = `¿Estás seguro de marcar esta cita como <strong>${accion.toUpperCase()}</strong>?`;
                    
                    document.getElementById('modalAccionTitulo').textContent = titulo;
                    document.getElementById('modalAccionMensaje').innerHTML = mensaje;
                    
                    const modal = new bootstrap.Modal(document.getElementById('confirmarAccionModal'));
                    modal.show();
                });
            });
        };

        // Render inicial
        renderTodasCitas();

        // Evento filtro
        filtroEstado.addEventListener('change', (e) => {
            renderTodasCitas(e.target.value);
        });

        // Evento confirmar modal
        const btnConfirmar = document.getElementById('btn-confirmar-accion');
        if (btnConfirmar) {
            btnConfirmar.addEventListener('click', () => {
                const id = document.getElementById('input-accion-id').value;
                const accion = document.getElementById('input-accion-tipo').value;
                
                const citaIndex = citas.findIndex(c => c.id === id);
                if (citaIndex !== -1) {
                    citas[citaIndex].estado = accion;
                    localStorage.setItem('citas', JSON.stringify(citas));
                    renderTodasCitas(filtroEstado.value);
                }
                
                bootstrap.Modal.getInstance(document.getElementById('confirmarAccionModal')).hide();
            });
        }
    }
});
