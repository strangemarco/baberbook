// servicios.js - Generación dinámica de servicios

document.addEventListener('DOMContentLoaded', () => {
    const serviciosContainer = document.getElementById('servicios-container');
    
    // Obtener servicios de localStorage
    const servicios = JSON.parse(localStorage.getItem('servicios')) || [];
    
    if (servicios.length === 0) {
        serviciosContainer.innerHTML = '<div class="col-12 text-center"><p class="text-muted">No hay servicios disponibles en este momento.</p></div>';
        return;
    }

    // Generar HTML
    const renderServicios = () => {
        let html = '';
        servicios.forEach(servicio => {
            html += `
                <div class="col-md-6 col-lg-4">
                    <div class="card h-100 bg-darker border-gold text-white" style="border-width: 1px; transition: transform 0.3s ease;">
                        <img src="${servicio.imagen}" class="card-img-top" alt="${servicio.nombre}" style="height: 200px; object-fit: cover;">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title brand-font text-gold">${servicio.nombre}</h5>
                            <p class="card-text text-muted mb-4">${servicio.descripcion}</p>
                            
                            <div class="mt-auto">
                                <div class="d-flex justify-content-between align-items-center mb-3">
                                    <span class="fs-5 fw-bold">${servicio.precio} Bs</span>
                                    <span class="text-muted small"><i class="fa-regular fa-clock me-1 text-gold"></i>${servicio.duracion} min</span>
                                </div>
                                <a href="reservar.html?servicio=${servicio.id}" class="btn btn-outline-light w-100">Reservar Ahora</a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        serviciosContainer.innerHTML = html;
        
        // Agregar hover efects al card
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-10px)';
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
            });
        });
    };

    renderServicios();
});
