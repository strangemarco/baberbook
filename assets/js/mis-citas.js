// mis-citas.js - Gestión de citas del cliente

document.addEventListener('DOMContentLoaded', () => {
    const citasContainer = document.getElementById('citas-container');
    const modalCancelar = new bootstrap.Modal(document.getElementById('cancelarModal'));
    const btnConfirmarCancelar = document.getElementById('btn-confirmar-cancelar');
    const inputCitaId = document.getElementById('cita-id-cancelar');

    const renderCitas = () => {
        const citas = JSON.parse(localStorage.getItem('citas')) || [];
        const servicios = JSON.parse(localStorage.getItem('servicios')) || [];
        const barberos = JSON.parse(localStorage.getItem('barberos')) || [];

        if (citas.length === 0) {
            citasContainer.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fa-regular fa-calendar-xmark fs-1 text-muted mb-3"></i>
                    <h3 class="text-white brand-font">No tienes citas agendadas</h3>
                    <p class="text-muted mb-4">Aún no has realizado ninguna reserva con nosotros.</p>
                    <a href="reservar.html" class="btn btn-gold px-4 py-2">Agendar una Cita</a>
                </div>
            `;
            return;
        }

        // Ordenar citas por fecha descendente
        citas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        let html = '';
        citas.forEach(cita => {
            const servicio = servicios.find(s => s.id === cita.servicioId);
            const barbero = barberos.find(b => b.id === cita.barberoId);
            
            // Determinar color del estado
            let badgeClass = 'bg-secondary';
            if (cita.estado === 'pendiente') badgeClass = 'bg-warning text-dark';
            if (cita.estado === 'completada') badgeClass = 'bg-success';
            if (cita.estado === 'cancelada') badgeClass = 'bg-danger';

            const esPasada = new Date(cita.fecha) < new Date(new Date().toISOString().split('T')[0]);
            
            // Si es pasada y sigue pendiente, mostrar como completada (simulación básica)
            let estadoMostrar = cita.estado.toUpperCase();
            if (cita.estado === 'pendiente' && esPasada) {
                estadoMostrar = 'COMPLETADA';
                badgeClass = 'bg-success';
            }

            html += `
                <div class="col-lg-6 mb-4">
                    <div class="card bg-black border-gold h-100 shadow-sm" style="border-width: 1px;">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start mb-3">
                                <div>
                                    <h5 class="card-title brand-font text-gold mb-0">${servicio ? servicio.nombre : 'Servicio Desconocido'}</h5>
                                    <small class="text-muted">A nombre de: ${cita.cliente}</small>
                                </div>
                                <span class="badge ${badgeClass}">${estadoMostrar}</span>
                            </div>
                            
                            <hr class="border-secondary opacity-25">
                            
                            <div class="row text-muted small">
                                <div class="col-6 mb-2">
                                    <i class="fa-regular fa-calendar text-gold me-2"></i>${cita.fecha}
                                </div>
                                <div class="col-6 mb-2">
                                    <i class="fa-regular fa-clock text-gold me-2"></i>${cita.hora}
                                </div>
                                <div class="col-12 mt-2">
                                    <i class="fa-solid fa-user-tie text-gold me-2"></i>Barbero: ${barbero ? barbero.nombre : 'No asignado'}
                                </div>
                            </div>
                        </div>
                        
                        <div class="card-footer bg-transparent border-top border-secondary d-flex flex-wrap justify-content-between align-items-center gap-2">
                            <div>
                                <button class="btn btn-outline-success btn-sm btn-whatsapp" data-id="${cita.id}" title="Confirmar por WhatsApp">
                                    <i class="fa-brands fa-whatsapp"></i>
                                </button>
                                <button class="btn btn-outline-light btn-sm btn-pdf" data-id="${cita.id}" title="Descargar PDF y QR">
                                    <i class="fa-solid fa-file-pdf"></i>
                                </button>
                            </div>
                            ${cita.estado === 'pendiente' && !esPasada ? `
                            <button class="btn btn-outline-danger btn-sm btn-cancelar" data-id="${cita.id}">
                                <i class="fa-solid fa-xmark me-1"></i> Cancelar Cita
                            </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        });

        citasContainer.innerHTML = html;

        // Añadir listeners a los botones de cancelar
        document.querySelectorAll('.btn-cancelar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.closest('button').dataset.id;
                inputCitaId.value = id;
                modalCancelar.show();
            });
        });

        // Evento WhatsApp
        document.querySelectorAll('.btn-whatsapp').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.closest('button').dataset.id;
                const cita = citas.find(c => c.id === id);
                const servicio = servicios.find(s => s.id === cita.servicioId);
                const barbero = barberos.find(b => b.id === cita.barberoId);
                
                const texto = `Hola, soy ${cita.cliente}. Quiero confirmar mi cita para *${servicio.nombre}* con *${barbero.nombre}* el día ${cita.fecha} a las ${cita.hora}. (ID: #${cita.id.substring(0,5).toUpperCase()})`;
                
                // Usar el número real de la barbería
                const numeroBarberia = "59176029573"; 
                window.open(`https://wa.me/${numeroBarberia}?text=${encodeURIComponent(texto)}`, '_blank');
            });
        });

        // Evento PDF y QR
        document.querySelectorAll('.btn-pdf').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.closest('button').dataset.id;
                const cita = citas.find(c => c.id === id);
                const servicio = servicios.find(s => s.id === cita.servicioId);
                const barbero = barberos.find(b => b.id === cita.barberoId);
                
                // Validar que jsPDF esté disponible
                if (!window.jspdf) {
                    alert("Cargando librerías, intenta de nuevo en unos segundos.");
                    return;
                }
                
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF();
                
                // Diseño PDF Estilo Premium
                doc.setFillColor(21, 21, 21); // Background oscuro
                doc.rect(0, 0, 210, 297, 'F');
                
                doc.setTextColor(201, 163, 91); // Dorado
                doc.setFont("helvetica", "bold");
                doc.setFontSize(28);
                doc.text("BARBERBOOK", 105, 30, null, null, "center");
                
                doc.setFontSize(16);
                doc.setTextColor(255, 255, 255);
                doc.text("COMPROBANTE DE RESERVA", 105, 45, null, null, "center");
                
                doc.setDrawColor(201, 163, 91);
                doc.line(20, 55, 190, 55);
                
                doc.setFontSize(12);
                doc.setFont("helvetica", "normal");
                doc.text(`ID de Reserva: #${cita.id.substring(0,5).toUpperCase()}`, 20, 75);
                doc.text(`Cliente: ${cita.cliente}`, 20, 85);
                doc.text(`Teléfono: ${cita.telefono}`, 20, 95);
                doc.text(`Estado: ${cita.estado.toUpperCase()}`, 20, 105);
                
                doc.text(`Servicio: ${servicio.nombre}`, 20, 130);
                doc.text(`Precio: ${servicio.precio} Bs`, 20, 140);
                
                doc.text(`Barbero: ${barbero.nombre}`, 20, 165);
                doc.text(`Fecha: ${cita.fecha}`, 20, 175);
                doc.text(`Hora: ${cita.hora}`, 20, 185);
                
                // Generar QR
                const tempDiv = document.createElement('div');
                new QRCode(tempDiv, {
                    text: `https://barberbook.com/cita/${cita.id}`,
                    width: 120,
                    height: 120,
                    colorDark : "#000000",
                    colorLight : "#ffffff"
                });
                
                // Renderizar QR en PDF
                setTimeout(() => {
                    const canvas = tempDiv.querySelector('canvas');
                    if(canvas) {
                        const imgData = canvas.toDataURL("image/png");
                        doc.addImage(imgData, 'PNG', 130, 75, 50, 50);
                    }
                    doc.save(`Reserva_${cita.id.substring(0,5).toUpperCase()}.pdf`);
                }, 200);
            });
        });
    };

    renderCitas();

    // Confirmar cancelación
    btnConfirmarCancelar.addEventListener('click', () => {
        const id = inputCitaId.value;
        const citas = JSON.parse(localStorage.getItem('citas')) || [];
        
        const citaIndex = citas.findIndex(c => c.id === id);
        if (citaIndex !== -1) {
            citas[citaIndex].estado = 'cancelada';
            localStorage.setItem('citas', JSON.stringify(citas));
            renderCitas();
        }
        
        modalCancelar.hide();
    });
});
