// app.js - Funcionalidades generales compartidas

document.addEventListener('DOMContentLoaded', () => {
    // Efecto de scroll en la barra de navegación
    const navbar = document.querySelector('.premium-navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.backgroundColor = 'rgba(15, 15, 15, 0.98)';
            navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.5)';
        } else {
            navbar.style.backgroundColor = 'rgba(21, 21, 21, 0.95)';
            navbar.style.boxShadow = 'none';
        }
    });
});
