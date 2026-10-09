// storage.js - Manejo de datos con localStorage

// Inicializar tema de inmediato para evitar parpadeos
const currentTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', currentTheme);

const toggleTheme = () => {
    const theme = document.documentElement.getAttribute('data-theme');
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Update toggle icon if exists
    const icon = document.querySelector('#theme-toggle i');
    if (icon) {
        if (newTheme === 'light') {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    }
};

const inicializarDatos = () => {
    // Servicios iniciales
    if (!localStorage.getItem('servicios')) {
        const servicios = [
            { id: 1, nombre: 'Corte Clásico', descripcion: 'Corte tradicional con tijera o máquina, lavado y peinado.', precio: 15, duracion: 30, imagen: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=500&q=80' },
            { id: 2, nombre: 'Arreglo de Barba', descripcion: 'Recorte, perfilado y cuidado de la barba con toalla caliente.', precio: 10, duracion: 20, imagen: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=500&q=80' },
            { id: 3, nombre: 'Corte + Barba', descripcion: 'El paquete completo para un look impecable. Incluye lavado.', precio: 22, duracion: 50, imagen: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=500&q=80' },
            { id: 4, nombre: 'Afeitado Clásico', descripcion: 'Afeitado tradicional a navaja con espuma y toalla caliente.', precio: 12, duracion: 30, imagen: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&w=500&q=80' }
        ];
        localStorage.setItem('servicios', JSON.stringify(servicios));
    }

    // Barberos iniciales
    if (!localStorage.getItem('barberos')) {
        const barberos = [
            { id: 1, nombre: 'Marco Justiniano', especialidad: 'Cortes Fade y Barba', foto: 'https://images.unsplash.com/photo-1583766395091-2eb9994ed094?auto=format&fit=crop&w=500&q=80', horarios: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'] },
            { id: 2, nombre: 'Alejandro Gómez', especialidad: 'Estilos Clásicos', foto: 'https://images.unsplash.com/photo-1618077360395-f3068be8e001?auto=format&fit=crop&w=500&q=80', horarios: ['10:00', '11:00', '12:00', '15:00', '16:00', '18:00', '19:00'] },
            { id: 3, nombre: 'Carlos Ruiz', especialidad: 'Afeitado a Navaja', foto: 'https://images.unsplash.com/photo-1593085512084-e409f562d41c?auto=format&fit=crop&w=500&q=80', horarios: ['09:00', '12:00', '13:00', '16:00', '17:00', '18:00'] }
        ];
        localStorage.setItem('barberos', JSON.stringify(barberos));
    }

    // Citas iniciales (vacío)
    if (!localStorage.getItem('citas')) {
        localStorage.setItem('citas', JSON.stringify([]));
    }

    // Cupones de descuento iniciales
    if (!localStorage.getItem('cupones')) {
        const cupones = [
            { codigo: 'BARBER10', descuento: 0.10, activo: true },
            { codigo: 'VIP20', descuento: 0.20, activo: true },
            { codigo: 'VERANO15', descuento: 0.15, activo: true }
        ];
        localStorage.setItem('cupones', JSON.stringify(cupones));
    }

    // Clientes (para sistema de fidelización por puntos)
    if (!localStorage.getItem('clientes')) {
        localStorage.setItem('clientes', JSON.stringify([]));
    }
};

// Inicializar al cargar
document.addEventListener('DOMContentLoaded', inicializarDatos);
