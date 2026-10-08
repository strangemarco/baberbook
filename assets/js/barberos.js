// barberos.js - Generación dinámica de barberos

document.addEventListener('DOMContentLoaded', () => {
    const barberosContainer = document.getElementById('barberos-container');
    
    // Obtener barberos de localStorage
    const barberos = JSON.parse(localStorage.getItem('barberos')) || [];
    
    if (barberos.length === 0) {
        barberosContainer.innerHTML = '<div class="col-12 text-center"><p class="text-muted">No hay barberos disponibles en este momento.</p></div>';
        return;
    }

    // Generar HTML
    const renderBarberos = () => {
        let html = '';
        barberos.forEach(barbero => {
            html += `
                <div class="col-md-6 col-lg-4">
                    <div class="card h-100 bg-black border-0 shadow-lg text-center p-3" style="transition: transform 0.3s ease;">
                        <div class="rounded-circle overflow-hidden mx-auto mt-3 border border-2 border-gold" style="width: 150px; height: 150px;">
                            <img src="${barbero.foto}" class="w-100 h-100 object-fit-cover" alt="${barbero.nombre}">
                        </div>
                        <div class="card-body">
                            <h4 class="card-title brand-font text-white mb-1">${barbero.nombre}</h4>
                            <p class="text-gold mb-3">${barbero.especialidad}</p>
                            
                            <hr class="border-secondary opacity-25 mx-auto" style="width: 50%;">
                            
                            <p class="text-muted small mb-4">
                                <i class="fa-regular fa-calendar-check me-2 text-gold"></i>
                                Horarios disponibles desde las ${barbero.horarios[0]}
                            </p>
                            
                            <a href="reservar.html?barbero=${barbero.id}" class="btn btn-gold w-100 rounded-pill">Agendar con ${barbero.nombre.split(' ')[0]}</a>
                        </div>
                    </div>
                </div>
            `;
        });
        barberosContainer.innerHTML = html;
        
        // Agregar hover efects
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

    renderBarberos();
});
