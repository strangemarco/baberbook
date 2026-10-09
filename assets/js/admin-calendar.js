document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');
    
    // Fetch data from localStorage
    const citas = JSON.parse(localStorage.getItem('citas')) || [];
    const barberos = JSON.parse(localStorage.getItem('barberos')) || [];
    const servicios = JSON.parse(localStorage.getItem('servicios')) || [];

    // Helper to generate distinct colors for different barbers
    const barberColors = ['#C9A35B', '#8338ec', '#ff006e', '#3a86ff', '#06d6a0'];
    const getBarberColor = (barberoId) => {
        return barberColors[(barberoId - 1) % barberColors.length];
    };

    // Format events for FullCalendar
    const events = citas.map(cita => {
        const barbero = barberos.find(b => b.id == cita.barberoId);
        const servicio = servicios.find(s => s.id == cita.servicioId);
        
        // FullCalendar expects date in YYYY-MM-DDTHH:mm:ss format
        const startDateTime = `${cita.fecha}T${cita.hora}:00`;
        
        // Estimate end time based on service duration
        let endDateTime = null;
        if (servicio && servicio.duracion) {
            const startDate = new Date(startDateTime);
            const endDate = new Date(startDate.getTime() + servicio.duracion * 60000);
            endDateTime = endDate.toISOString().slice(0, 19);
        }

        return {
            id: cita.id,
            title: `${cita.cliente} - ${servicio ? servicio.nombre : 'Cita'}`,
            start: startDateTime,
            end: endDateTime,
            backgroundColor: getBarberColor(cita.barberoId),
            extendedProps: {
                barbero: barbero ? barbero.nombre : 'Desconocido',
                estado: cita.estado,
                telefono: cita.telefono
            }
        };
    });

    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'timeGridWeek',
        locale: 'es',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        slotMinTime: '08:00:00',
        slotMaxTime: '21:00:00',
        allDaySlot: false,
        events: events,
        eventClick: function(info) {
            const props = info.event.extendedProps;
            alert(`Cliente: ${info.event.title.split(' - ')[0]}\nServicio: ${info.event.title.split(' - ')[1]}\nBarbero: ${props.barbero}\nTeléfono: ${props.telefono}\nEstado: ${props.estado}`);
        }
    });

    calendar.render();
});
