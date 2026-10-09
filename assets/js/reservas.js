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
    const cupones = JSON.parse(localStorage.getItem('cupones')) || [];
    let clientes = JSON.parse(localStorage.getItem('clientes')) || [];

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

    // Configurar fecha mínima (hoy) y Flatpickr
    const hoy = new Date();
    const hoyStr = hoy.toISOString().split('T')[0];
    
    flatpickr("#input-fecha", {
        locale: "es",
        inline: true,
        minDate: "today",
        disable: [
            function(date) {
                // Deshabilitar domingos (0)
                return (date.getDay() === 0);
            }
        ],
        onChange: function(selectedDates, dateStr, instance) {
            inputFecha.dispatchEvent(new Event('change'));
        }
    });

    // --- LÓGICA DE PRECIOS Y DESCUENTOS ---
    let precioBase = 0;
    let porcentajeDescuento = 0;
    let usandoPuntos = false;

    const actualizarTotal = () => {
        const total = usandoPuntos ? 0 : (precioBase - (precioBase * porcentajeDescuento));
        document.getElementById('total-pagar').textContent = `${Math.max(0, Math.round(total))} Bs`;
    };

    selectServicio.addEventListener('change', (e) => {
        const id = parseInt(e.target.value);
        const servicio = servicios.find(s => s.id === id);
        if (servicio) {
            precioBase = servicio.precio;
            actualizarTotal();
        }
    });

    const btnAplicarCupon = document.getElementById('btn-aplicar-cupon');
    if(btnAplicarCupon) {
        btnAplicarCupon.addEventListener('click', () => {
            const cupon = document.getElementById('codigo-cupon').value.toUpperCase().trim();
            const mensaje = document.getElementById('mensaje-cupon');
            
            const cuponEncontrado = cupones.find(c => c.codigo === cupon && c.activo);

            if (cuponEncontrado) {
                porcentajeDescuento = cuponEncontrado.descuento;
                mensaje.textContent = `¡Cupón ${cuponEncontrado.codigo} aplicado! (-${cuponEncontrado.descuento * 100}%)`;
                mensaje.className = "text-success d-block mt-1";
            } else if (cupon !== '') {
                porcentajeDescuento = 0;
                mensaje.textContent = "Cupón inválido o inactivo";
                mensaje.className = "text-danger d-block mt-1";
            } else {
                porcentajeDescuento = 0;
                mensaje.className = "d-none";
            }
            actualizarTotal();
        });
    }

    // --- LÓGICA DE PUNTOS DE FIDELIDAD ---
    const inputTelefono = document.getElementById('input-telefono');
    const inputNombre = document.getElementById('input-nombre');
    const puntosContainer = document.getElementById('puntos-container');
    const puntosMensaje = document.getElementById('puntos-mensaje');
    const btnUsarPuntos = document.getElementById('btn-usar-puntos');
    let clienteActual = null;

    if (inputTelefono) {
        inputTelefono.addEventListener('input', (e) => {
            const telefono = e.target.value.trim();
            if(telefono.length >= 8) {
                clienteActual = clientes.find(c => c.telefono === telefono);
                
                puntosContainer.classList.remove('d-none');
                
                if (clienteActual) {
                    inputNombre.value = clienteActual.nombre;
                    puntosMensaje.textContent = `Tienes ${clienteActual.puntos} puntos acumulados.`;
                    
                    if (clienteActual.puntos >= 100) {
                        btnUsarPuntos.classList.remove('d-none');
                    } else {
                        btnUsarPuntos.classList.add('d-none');
                    }
                } else {
                    puntosMensaje.textContent = "Aún no tienes puntos. ¡Ganarás 10 puntos con esta reserva!";
                    btnUsarPuntos.classList.add('d-none');
                }
            } else {
                puntosContainer.classList.add('d-none');
                btnUsarPuntos.classList.add('d-none');
                clienteActual = null;
            }
        });
    }

    if (btnUsarPuntos) {
        btnUsarPuntos.addEventListener('click', () => {
            if (usandoPuntos) {
                usandoPuntos = false;
                btnUsarPuntos.textContent = "Usar 100 pts para corte GRATIS";
                btnUsarPuntos.classList.remove('btn-success');
                btnUsarPuntos.classList.add('btn-gold');
            } else {
                usandoPuntos = true;
                btnUsarPuntos.textContent = "Puntos Aplicados (Cancelar)";
                btnUsarPuntos.classList.remove('btn-gold');
                btnUsarPuntos.classList.add('btn-success');
            }
            actualizarTotal();
        });
    }
    // ---------------------------------------

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

        const precioFinal = usandoPuntos ? 0 : (precioBase - (precioBase * porcentajeDescuento));

        // Actualizar o crear cliente y sus puntos
        let clienteIdx = clientes.findIndex(c => c.telefono === telefonoCliente);
        if (clienteIdx >= 0) {
            clientes[clienteIdx].nombre = nombreCliente;
            if (usandoPuntos) {
                clientes[clienteIdx].puntos -= 100;
            } else {
                clientes[clienteIdx].puntos += 10;
            }
        } else {
            clientes.push({
                telefono: telefonoCliente,
                nombre: nombreCliente,
                puntos: usandoPuntos ? 0 : 10
            });
        }
        localStorage.setItem('clientes', JSON.stringify(clientes));

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
            estado: 'pendiente',
            precioFinal: precioFinal,
            fechaCreacion: new Date().toISOString()
        };

        // Guardar
        citas.push(nuevaCita);
        localStorage.setItem('citas', JSON.stringify(citas));

        // Mostrar éxito y resetear form
        formReserva.reset();
        horariosContainer.innerHTML = '<p class="text-muted mb-0 small">Selecciona una fecha y un barbero para ver la disponibilidad.</p>';
        inputHora.value = '';
        if (puntosContainer) puntosContainer.classList.add('d-none');
        usandoPuntos = false;
        if (btnUsarPuntos) {
            btnUsarPuntos.classList.remove('btn-success');
            btnUsarPuntos.classList.add('btn-gold');
            btnUsarPuntos.textContent = "Usar 100 pts para corte GRATIS";
        }
        precioBase = 0;
        porcentajeDescuento = 0;
        actualizarTotal();

        mensajeReserva.className = 'mt-4 text-center alert alert-success border-gold text-bg-dark';
        mensajeReserva.innerHTML = `
            <h4 class="alert-heading text-gold"><i class="fa-solid fa-circle-check me-2"></i>¡Reserva Confirmada!</h4>
            <p>Hola ${nombreCliente}, tu cita ha sido agendada con éxito.</p>
            <p class="small text-muted">¡Has ${usandoPuntos ? 'usado 100 puntos' : 'ganado 10 puntos'} con esta reserva!</p>
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
