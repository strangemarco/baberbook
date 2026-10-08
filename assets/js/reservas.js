// reservas.js - Lógica del formulario de reservas

document.addEventListener('DOMContentLoaded', () => {
    const selectServicio = document.getElementById('select-servicio');
    const selectBarbero = document.getElementById('select-barbero');
    const inputFecha = document.getElementById('input-fecha');
    const inputHora = document.getElementById('input-hora');
    const horariosContainer = document.getElementById('horarios-container');
    const formReserva = document.getElementById('form-reserva');
    const mensajeReserva = document.getElementById('mensaje-reserva');

    // Cargar datos
    const servicios = JSON.parse(localStorage.getItem('servicios')) || [];
    const barberos = JSON.parse(localStorage.getItem('barberos')) || [];
    const citas = JSON.parse(localStorage.getItem('citas')) || [];

    // Rellenar select de servicios
    servicios.forEach(s => {
        const option = document.createElement('option');
        option.value = s.id;
        option.textContent = `${s.nombre} (${s.precio} Bs - ${s.duracion} min)`;
        selectServicio.appendChild(option);
    });

    // Rellenar select de barberos
    barberos.forEach(b => {
        const option = document.createElement('option');
        option.value = b.id;
        option.textContent = `${b.nombre} (${b.especialidad})`;
        selectBarbero.appendChild(option);
    });

    // Leer parámetros de la URL (si viene de la página de servicios o barberos)
    const urlParams = new URLSearchParams(window.location.search);
    const servicioParam = urlParams.get('servicio');
    const barberoParam = urlParams.get('barbero');
    
    if (servicioParam) selectServicio.value = servicioParam;
    if (barberoParam) selectBarbero.value = barberoParam;

    // Configurar fecha mínima (hoy)
    const hoy = new Date();
    const hoyStr = hoy.toISOString().split('T')[0];
    inputFecha.min = hoyStr;

    // Función para actualizar los horarios disponibles
    const actualizarHorarios = () => {
        const barberoId = selectBarbero.value;
        const fechaSeleccionada = inputFecha.value;

        // Limpiar selección de hora
        inputHora.value = '';

        if (!barberoId || !fechaSeleccionada) {
            horariosContainer.innerHTML = '<p class="text-muted mb-0 small">Selecciona una fecha y un barbero para ver la disponibilidad.</p>';
            return;
        }

        const barbero = barberos.find(b => b.id == barberoId);
        if (!barbero) return;

        // Filtrar citas existentes para ese barbero en esa fecha
        const citasBarberoFecha = citas.filter(c => 
            c.barberoId == barberoId && 
            c.fecha === fechaSeleccionada &&
            c.estado !== 'cancelada'
        );

        horariosContainer.innerHTML = '';
        
        if (barbero.horarios.length === 0) {
            horariosContainer.innerHTML = '<p class="text-danger mb-0">No hay horarios definidos para este barbero.</p>';
            return;
        }

        barbero.horarios.forEach(hora => {
            // Verificar si la hora está ocupada
            const estaOcupada = citasBarberoFecha.some(c => c.hora === hora);
            
            // Verificar si es un horario pasado (si es hoy)
            let esPasado = false;
            if (fechaSeleccionada === hoyStr) {
                const horaActual = hoy.getHours();
                const minActual = hoy.getMinutes();
                const [horaHorario, minHorario] = hora.split(':').map(Number);
                if (horaHorario < horaActual || (horaHorario === horaActual && minHorario <= minActual)) {
                    esPasado = true;
                }
            }

            const div = document.createElement('div');
            div.className = `time-slot ${estaOcupada || esPasado ? 'disabled' : ''}`;
            div.textContent = hora;
            div.dataset.hora = hora;

            if (!estaOcupada && !esPasado) {
                div.addEventListener('click', function() {
                    // Remover clase selected de todos
                    document.querySelectorAll('.time-slot').forEach(el => el.classList.remove('selected'));
                    // Añadir clase selected al clickeado
                    this.classList.add('selected');
                    // Actualizar input hidden
                    inputHora.value = this.dataset.hora;
                });
            }

            horariosContainer.appendChild(div);
        });

        if (horariosContainer.innerHTML === '') {
            horariosContainer.innerHTML = '<p class="text-warning mb-0">No hay horarios disponibles para esta fecha.</p>';
        }
    };

    // Listeners
    selectBarbero.addEventListener('change', actualizarHorarios);
    inputFecha.addEventListener('change', actualizarHorarios);

    // Manejar envío del formulario
    formReserva.addEventListener('submit', (e) => {
        e.preventDefault();

        const servicioId = selectServicio.value;
        const barberoId = selectBarbero.value;
        const fecha = inputFecha.value;
        const hora = inputHora.value;
        const nombreCliente = document.getElementById('input-nombre').value.trim();
        const telefonoCliente = document.getElementById('input-telefono').value.trim();

        if (!hora) {
            alert('Por favor, selecciona una hora para tu cita.');
            return;
        }

        // Generar un ID único simple para la cita
        const citaId = Date.now().toString(36) + Math.random().toString(36).substr(2);

        const nuevaCita = {
            id: citaId,
            servicioId: parseInt(servicioId),
            barberoId: parseInt(barberoId),
            fecha: fecha,
            hora: hora,
            cliente: nombreCliente,
            telefono: telefonoCliente,
            estado: 'pendiente', // pendiente, completada, cancelada
            fechaCreacion: new Date().toISOString()
        };

        // Guardar
        citas.push(nuevaCita);
        localStorage.setItem('citas', JSON.stringify(citas));

        // Mostrar éxito
        formReserva.reset();
        horariosContainer.innerHTML = '<p class="text-muted mb-0 small">Selecciona una fecha y un barbero para ver la disponibilidad.</p>';
        inputHora.value = '';

        mensajeReserva.className = 'mt-4 text-center alert alert-success border-gold text-bg-dark';
        mensajeReserva.innerHTML = `
            <h4 class="alert-heading text-gold"><i class="fa-solid fa-circle-check me-2"></i>¡Reserva Confirmada!</h4>
            <p>Hola ${nombreCliente}, tu cita ha sido agendada con éxito.</p>
            <hr class="border-secondary">
            <p class="mb-0">Te esperamos el <strong>${fecha}</strong> a las <strong>${hora}</strong>.</p>
            <div class="mt-3">
                <a href="mis-citas.html" class="btn btn-outline-light btn-sm">Ver mis citas</a>
            </div>
        `;
        mensajeReserva.classList.remove('d-none');
        
        // Scroll hacia el mensaje
        mensajeReserva.scrollIntoView({ behavior: 'smooth' });
    });
});
